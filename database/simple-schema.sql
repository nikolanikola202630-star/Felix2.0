-- Felix Bot - Simple Database Schema
-- Только таблицы и индексы (без триггеров и функций)

-- 1. Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'ru',
    is_bot BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_last_active ON users(last_active_at DESC);

-- 2. Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- 3. Voice messages table
CREATE TABLE voice_messages (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id VARCHAR(255) NOT NULL,
    file_unique_id VARCHAR(255),
    transcription TEXT,
    duration INTEGER,
    file_size INTEGER,
    mime_type VARCHAR(100),
    processing_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voice_user_id ON voice_messages(user_id);
CREATE INDEX idx_voice_file_id ON voice_messages(file_id);
CREATE INDEX idx_voice_created_at ON voice_messages(created_at DESC);

-- 4. Sessions table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_active ON sessions(user_id, is_active) WHERE is_active = TRUE;

-- 5. User stats table
CREATE TABLE user_stats (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_messages INTEGER DEFAULT 0,
    user_messages INTEGER DEFAULT 0,
    bot_messages INTEGER DEFAULT 0,
    voice_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    first_message_at TIMESTAMP,
    last_message_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert system user
INSERT INTO users (id, username, first_name, is_bot)
VALUES (0, 'system', 'System', TRUE)
ON CONFLICT (id) DO NOTHING;
