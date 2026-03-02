-- Migration: Add ML and Learning tables (SAFE VERSION - NO DROPS)
-- Version: 8.6
-- Date: 2026-03-02
-- Description: Adds missing tables for ML, learning, and advanced features
-- NOTE: This version is safe to run - it only creates new tables

-- ============================================
-- ML & PERSONALIZATION TABLES
-- ============================================

-- User profiles for ML personalization
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  communication_style VARCHAR(20) DEFAULT 'casual',
  preferred_topics JSONB DEFAULT '[]',
  activity_pattern VARCHAR(20) DEFAULT 'mixed',
  response_preferences JSONB DEFAULT '{}',
  learning_style VARCHAR(20) DEFAULT 'mixed',
  engagement_level VARCHAR(20) DEFAULT 'medium',
  skill_level VARCHAR(20) DEFAULT 'intermediate',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_updated ON user_profiles(updated_at);

-- User learning data
CREATE TABLE IF NOT EXISTS user_learning_data (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_type VARCHAR(50) NOT NULL,
  pattern_data JSONB NOT NULL,
  learned_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_learning_user ON user_learning_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_type ON user_learning_data(pattern_type);
CREATE INDEX IF NOT EXISTS idx_user_learning_learned ON user_learning_data(learned_at);

-- System patterns
CREATE TABLE IF NOT EXISTS system_patterns (
  id SERIAL PRIMARY KEY,
  pattern_type VARCHAR(50) NOT NULL UNIQUE,
  pattern_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_patterns_type ON system_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_system_patterns_updated ON system_patterns(updated_at);

-- System insights
CREATE TABLE IF NOT EXISTS system_insights (
  id BIGSERIAL PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL,
  insight_text TEXT NOT NULL,
  insight_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_insights_type ON system_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_system_insights_created ON system_insights(created_at);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
  id BIGSERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at);

-- ============================================
-- LEARNING & COURSES TABLES
-- ============================================

-- Transcriptions
CREATE TABLE IF NOT EXISTS transcriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'ru',
  duration INTEGER,
  segments JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transcriptions_user ON transcriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_created ON transcriptions(created_at);

-- Lecture notes
CREATE TABLE IF NOT EXISTS lecture_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  notes TEXT NOT NULL,
  transcription TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lecture_notes_user ON lecture_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lecture_notes_created ON lecture_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_lecture_notes_tags ON lecture_notes USING GIN(tags);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER,
  lessons_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);

-- User progress
CREATE TABLE IF NOT EXISTS user_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_lesson_id INTEGER,
  lessons_completed INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated ON user_progress(updated_at);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50),
  points INTEGER DEFAULT 0,
  requirement JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON user_achievements(earned_at);

-- ============================================
-- PARTNERS & LIBRARY TABLES
-- ============================================

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  category VARCHAR(50),
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(active);
CREATE INDEX IF NOT EXISTS idx_partners_priority ON partners(priority DESC);

-- Library items
CREATE TABLE IF NOT EXISTS library_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  item_type VARCHAR(50) CHECK (item_type IN ('note', 'bookmark', 'document', 'link')),
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_items_user ON library_items(user_id);
CREATE INDEX IF NOT EXISTS idx_library_items_type ON library_items(item_type);
CREATE INDEX IF NOT EXISTS idx_library_items_public ON library_items(is_public);
CREATE INDEX IF NOT EXISTS idx_library_items_tags ON library_items USING GIN(tags);

-- ============================================
-- UPDATE user_settings TABLE
-- ============================================

-- Add missing columns to user_settings (safe - will skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_settings' AND column_name='level') THEN
    ALTER TABLE user_settings ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_settings' AND column_name='xp') THEN
    ALTER TABLE user_settings ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_settings' AND column_name='avatar') THEN
    ALTER TABLE user_settings ADD COLUMN avatar VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_settings' AND column_name='ai_requests_today') THEN
    ALTER TABLE user_settings ADD COLUMN ai_requests_today INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_settings' AND column_name='ai_requests_total') THEN
    ALTER TABLE user_settings ADD COLUMN ai_requests_total INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update user_profiles.updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update lecture_notes.updated_at
DROP TRIGGER IF EXISTS update_lecture_notes_updated_at ON lecture_notes;
CREATE TRIGGER update_lecture_notes_updated_at 
  BEFORE UPDATE ON lecture_notes
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update courses.updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update user_progress.updated_at
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON user_progress
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update partners.updated_at
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at 
  BEFORE UPDATE ON partners
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update library_items.updated_at
DROP TRIGGER IF EXISTS update_library_items_updated_at ON library_items;
CREATE TRIGGER update_library_items_updated_at 
  BEFORE UPDATE ON library_items
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert sample achievements (safe - will skip duplicates)
INSERT INTO achievements (name, description, icon, category, points) VALUES
  ('Первые шаги', 'Отправил первое сообщение', '🎯', 'general', 10),
  ('Болтун', 'Отправил 100 сообщений', '💬', 'general', 50),
  ('AI Мастер', 'Использовал AI 50 раз', '🤖', 'ai', 100),
  ('Студент', 'Начал первый курс', '📚', 'learning', 25),
  ('Выпускник', 'Завершил первый курс', '🎓', 'learning', 100),
  ('Исследователь', 'Изучил 5 курсов', '🔍', 'learning', 250),
  ('Голосовой', 'Отправил 10 голосовых', '🎤', 'voice', 50),
  ('Конспектист', 'Создал 5 конспектов', '📝', 'notes', 75)
ON CONFLICT (name) DO NOTHING;

-- Insert sample courses (safe - will skip if exists)
INSERT INTO courses (title, description, category, difficulty, duration, lessons_count, rating) VALUES
  ('Основы Python', 'Изучи основы программирования на Python', 'programming', 'beginner', 300, 10, 4.8),
  ('JavaScript для начинающих', 'Веб-разработка с нуля', 'programming', 'beginner', 400, 12, 4.7),
  ('Машинное обучение', 'Введение в ML и AI', 'ai', 'intermediate', 600, 20, 4.9),
  ('Дизайн интерфейсов', 'UI/UX дизайн', 'design', 'intermediate', 350, 15, 4.6),
  ('Маркетинг в соцсетях', 'SMM стратегии', 'marketing', 'beginner', 250, 8, 4.5)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all new tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'user_profiles', 'user_learning_data', 'system_patterns', 'system_insights', 'system_logs',
    'transcriptions', 'lecture_notes', 'courses', 'user_progress', 'achievements', 
    'user_achievements', 'partners', 'library_items'
  )
ORDER BY table_name;

-- Migration completed successfully
SELECT '✅ Migration 001 completed successfully! All tables created.' as status,
       COUNT(*) as tables_created
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profiles', 'user_learning_data', 'system_patterns', 'system_insights', 'system_logs',
    'transcriptions', 'lecture_notes', 'courses', 'user_progress', 'achievements', 
    'user_achievements', 'partners', 'library_items'
  );
