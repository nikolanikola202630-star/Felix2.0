-- ============================================
-- FELIX BOT - PRODUCTION DATABASE SCHEMA
-- PostgreSQL 14+
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'ru',
    is_bot BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_last_active ON users(last_active_at DESC);
CREATE INDEX idx_users_blocked ON users(is_blocked) WHERE is_blocked = TRUE;

COMMENT ON TABLE users IS 'Telegram users';
COMMENT ON COLUMN users.is_blocked IS 'User blocked the bot';

-- ============================================
-- 2. CONVERSATIONS TABLE
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_active ON conversations(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_conversations_started ON conversations(started_at DESC);

COMMENT ON TABLE conversations IS 'Conversation sessions';

-- ============================================
-- 3. MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens INTEGER,
    model VARCHAR(100),
    temperature DECIMAL(3,2),
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_user ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('russian', content));

COMMENT ON TABLE messages IS 'Chat messages with full context';
COMMENT ON COLUMN messages.response_time_ms IS 'AI response time in milliseconds';

-- ============================================
-- 4. VOICE MESSAGES TABLE
-- ============================================
CREATE TABLE voice_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    file_id VARCHAR(255) NOT NULL,
    file_unique_id VARCHAR(255) UNIQUE,
    transcription TEXT,
    duration INTEGER NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    processing_time_ms INTEGER,
    model VARCHAR(100) DEFAULT 'whisper-large-v3',
    language VARCHAR(10),
    confidence DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_voice_user ON voice_messages(user_id, created_at DESC);
CREATE INDEX idx_voice_conversation ON voice_messages(conversation_id);
CREATE INDEX idx_voice_file_id ON voice_messages(file_id);
CREATE INDEX idx_voice_transcription_search ON voice_messages USING gin(to_tsvector('russian', transcription));

COMMENT ON TABLE voice_messages IS 'Voice messages and transcriptions';
COMMENT ON COLUMN voice_messages.confidence IS 'Transcription confidence score';

-- ============================================
-- 5. SUMMARIES TABLE
-- ============================================
CREATE TABLE summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    message_count INTEGER NOT NULL,
    tokens_used INTEGER,
    model VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_summaries_conversation ON summaries(conversation_id);
CREATE INDEX idx_summaries_user ON summaries(user_id, created_at DESC);

COMMENT ON TABLE summaries IS 'Conversation summaries';

-- ============================================
-- 6. USER STATS TABLE
-- ============================================
CREATE TABLE user_stats (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_messages INTEGER DEFAULT 0,
    user_messages INTEGER DEFAULT 0,
    bot_messages INTEGER DEFAULT 0,
    voice_messages INTEGER DEFAULT 0,
    summaries_created INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    first_message_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_stats IS 'Aggregated user statistics';

-- ============================================
-- 7. API USAGE TABLE
-- ============================================
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    api_type VARCHAR(50) NOT NULL, -- 'groq_chat', 'groq_whisper'
    model VARCHAR(100) NOT NULL,
    tokens INTEGER,
    cost_usd DECIMAL(10,6),
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_api_usage_user ON api_usage(user_id, created_at DESC);
CREATE INDEX idx_api_usage_type ON api_usage(api_type, created_at DESC);
CREATE INDEX idx_api_usage_created ON api_usage(created_at DESC);

COMMENT ON TABLE api_usage IS 'API calls tracking and costs';

-- ============================================
-- 8. ERRORS LOG TABLE
-- ============================================
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_errors_user ON error_logs(user_id, created_at DESC);
CREATE INDEX idx_errors_type ON error_logs(error_type, created_at DESC);
CREATE INDEX idx_errors_created ON error_logs(created_at DESC);

COMMENT ON TABLE error_logs IS 'Application errors and exceptions';

-- ============================================
-- 9. RATE LIMITS TABLE
-- ============================================
CREATE TABLE rate_limits (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    is_limited BOOLEAN DEFAULT FALSE,
    limit_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_limited ON rate_limits(is_limited) WHERE is_limited = TRUE;

COMMENT ON TABLE rate_limits IS 'Rate limiting per user';

-- ============================================
-- 10. FEEDBACK TABLE
-- ============================================
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_user ON feedback(user_id, created_at DESC);
CREATE INDEX idx_feedback_rating ON feedback(rating, created_at DESC);

COMMENT ON TABLE feedback IS 'User feedback and ratings';

-- ============================================
-- VIEWS
-- ============================================

-- Active users view
CREATE OR REPLACE VIEW v_active_users AS
SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.is_premium,
    u.last_active_at,
    s.total_messages,
    s.total_conversations,
    EXTRACT(EPOCH FROM (NOW() - u.last_active_at))/3600 as hours_since_active
FROM users u
LEFT JOIN user_stats s ON u.id = s.user_id
WHERE u.is_blocked = FALSE
ORDER BY u.last_active_at DESC;

-- Daily statistics view
CREATE OR REPLACE VIEW v_daily_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) as total_messages,
    SUM(tokens) as total_tokens,
    AVG(response_time_ms) as avg_response_time
FROM messages
WHERE role = 'assistant'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update user stats on new message
CREATE OR REPLACE FUNCTION update_user_stats_on_message()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (
        user_id, 
        total_messages, 
        user_messages, 
        bot_messages,
        total_tokens,
        first_message_at,
        last_message_at
    )
    VALUES (
        NEW.user_id,
        1,
        CASE WHEN NEW.role = 'user' THEN 1 ELSE 0 END,
        CASE WHEN NEW.role = 'assistant' THEN 1 ELSE 0 END,
        COALESCE(NEW.tokens, 0),
        NEW.created_at,
        NEW.created_at
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_messages = user_stats.total_messages + 1,
        user_messages = user_stats.user_messages + CASE WHEN NEW.role = 'user' THEN 1 ELSE 0 END,
        bot_messages = user_stats.bot_messages + CASE WHEN NEW.role = 'assistant' THEN 1 ELSE 0 END,
        total_tokens = user_stats.total_tokens + COALESCE(NEW.tokens, 0),
        last_message_at = NEW.created_at,
        updated_at = NOW();
    
    -- Update user last_active_at
    UPDATE users SET last_active_at = NEW.created_at WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update conversation message count
CREATE OR REPLACE FUNCTION update_conversation_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET message_count = message_count + 1
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update voice stats
CREATE OR REPLACE FUNCTION update_voice_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_stats
    SET voice_messages = voice_messages + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get conversation history
CREATE OR REPLACE FUNCTION get_conversation_history(
    p_user_id BIGINT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    role VARCHAR(20),
    content TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.role, m.content, m.created_at
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE c.user_id = p_user_id AND c.is_active = TRUE
    ORDER BY m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 90)
RETURNS TABLE (
    messages_deleted INTEGER,
    errors_deleted INTEGER,
    api_logs_deleted INTEGER
) AS $$
DECLARE
    msg_count INTEGER;
    err_count INTEGER;
    api_count INTEGER;
BEGIN
    -- Delete old messages
    DELETE FROM messages WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS msg_count = ROW_COUNT;
    
    -- Delete old errors
    DELETE FROM error_logs WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS err_count = ROW_COUNT;
    
    -- Delete old API logs
    DELETE FROM api_usage WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS api_count = ROW_COUNT;
    
    RETURN QUERY SELECT msg_count, err_count, api_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Users updated_at trigger
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Messages stats trigger
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_message();

-- Conversation count trigger
CREATE TRIGGER trigger_update_conversation_count
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_count();

-- Voice stats trigger
CREATE TRIGGER trigger_update_voice_stats
    AFTER INSERT ON voice_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_voice_stats();

-- ============================================
-- INITIAL DATA
-- ============================================

-- System user
INSERT INTO users (id, username, first_name, is_bot)
VALUES (0, 'system', 'System', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (Optional)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies (users can only see their own data)
CREATE POLICY users_select_own ON users
    FOR SELECT USING (id = current_setting('app.user_id', TRUE)::BIGINT);

CREATE POLICY messages_select_own ON messages
    FOR SELECT USING (user_id = current_setting('app.user_id', TRUE)::BIGINT);

CREATE POLICY conversations_select_own ON conversations
    FOR SELECT USING (user_id = current_setting('app.user_id', TRUE)::BIGINT);

-- ============================================
-- GRANTS (for application user)
-- ============================================

-- Grant permissions to postgres role (adjust as needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;
