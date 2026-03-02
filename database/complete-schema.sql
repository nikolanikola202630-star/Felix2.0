-- Felix Bot Complete Database Schema
-- PostgreSQL 15+ (Supabase)
-- Version: 1.0
-- Last Updated: 2026-03-02

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- DROP EXISTING OBJECTS (Optional - uncomment if needed)
-- ============================================

-- DROP MATERIALIZED VIEW IF EXISTS user_stats CASCADE;
-- DROP TABLE IF EXISTS export_history CASCADE;
-- DROP TABLE IF EXISTS document_messages CASCADE;
-- DROP TABLE IF EXISTS image_messages CASCADE;
-- DROP TABLE IF EXISTS voice_messages CASCADE;
-- DROP TABLE IF EXISTS message_tags CASCADE;
-- DROP TABLE IF EXISTS tags CASCADE;
-- DROP TABLE IF EXISTS user_settings CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,  -- Telegram user ID
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  language VARCHAR(10) DEFAULT 'ru',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'document')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_messages_content_fts ON messages 
  USING GIN (to_tsvector('russian', content));

-- Trigram index for fuzzy search
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON messages 
  USING GIN (content gin_trgm_ops);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Message tags junction table
CREATE TABLE IF NOT EXISTS message_tags (
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  is_auto_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (message_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_message_tags_message ON message_tags(message_id);
CREATE INDEX IF NOT EXISTS idx_message_tags_tag ON message_tags(tag_id);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ai_temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (ai_temperature >= 0 AND ai_temperature <= 2),
  ai_model VARCHAR(100) DEFAULT 'llama-3.3-70b-versatile',
  theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Voice messages table (metadata)
CREATE TABLE IF NOT EXISTS voice_messages (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id VARCHAR(255) NOT NULL,
  file_url TEXT,
  duration INTEGER NOT NULL,
  file_size INTEGER,
  transcription TEXT NOT NULL,
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_messages_message ON voice_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_file_id ON voice_messages(file_id);

-- Image messages table (metadata)
CREATE TABLE IF NOT EXISTS image_messages (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  description TEXT,
  ocr_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_messages_message ON image_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_image_messages_file_id ON image_messages(file_id);

-- Document messages table (metadata)
CREATE TABLE IF NOT EXISTS document_messages (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  extracted_text TEXT,
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_messages_message ON document_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_document_messages_file_id ON document_messages(file_id);

-- Export history table
CREATE TABLE IF NOT EXISTS export_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  format VARCHAR(10) NOT NULL CHECK (format IN ('txt', 'json', 'pdf')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  filters JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_history_user ON export_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_history_expires ON export_history(expires_at);

-- ============================================
-- MATERIALIZED VIEWS
-- ============================================

-- User stats materialized view (for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
  COUNT(CASE WHEN role = 'assistant' THEN 1 END) as bot_messages,
  COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_messages,
  COUNT(CASE WHEN message_type = 'voice' THEN 1 END) as voice_messages,
  COUNT(CASE WHEN message_type = 'image' THEN 1 END) as image_messages,
  COUNT(CASE WHEN message_type = 'document' THEN 1 END) as document_messages,
  SUM((metadata->>'tokens')::int) FILTER (WHERE metadata->>'tokens' IS NOT NULL) as total_tokens,
  AVG((metadata->>'latency')::int) FILTER (WHERE metadata->>'latency' IS NOT NULL) as avg_latency,
  MIN(created_at) as first_message_at,
  MAX(created_at) as last_message_at
FROM messages
GROUP BY user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to refresh stats (call periodically)
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired exports
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS void AS $$
BEGIN
  DELETE FROM export_history WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user message count
CREATE OR REPLACE FUNCTION get_user_message_count(p_user_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
  msg_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO msg_count
  FROM messages
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(msg_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to search messages with ranking
CREATE OR REPLACE FUNCTION search_messages_ranked(
  p_user_id BIGINT,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  message_type VARCHAR(20),
  created_at TIMESTAMP,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.message_type,
    m.created_at,
    ts_rank(to_tsvector('russian', m.content), plainto_tsquery('russian', p_query)) as rank
  FROM messages m
  WHERE m.user_id = p_user_id
    AND to_tsvector('russian', m.content) @@ plainto_tsquery('russian', p_query)
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update users.updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update user_settings.updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert some common tags
INSERT INTO tags (name) VALUES 
  ('programming'),
  ('question'),
  ('help'),
  ('tutorial'),
  ('bug'),
  ('feature')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PERMISSIONS (Supabase RLS - Optional)
-- ============================================

-- Enable Row Level Security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
-- CREATE POLICY "Users can view own data" ON users
--   FOR SELECT USING (auth.uid()::bigint = id);

-- CREATE POLICY "Users can view own messages" ON messages
--   FOR SELECT USING (auth.uid()::bigint = user_id);

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Refresh stats view (run periodically via cron)
-- SELECT refresh_user_stats();

-- Clean up expired exports (run daily)
-- SELECT cleanup_expired_exports();

-- Vacuum and analyze (run weekly)
-- VACUUM ANALYZE;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check all indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check message_type column
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'messages' AND column_name = 'message_type';

-- Get table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
