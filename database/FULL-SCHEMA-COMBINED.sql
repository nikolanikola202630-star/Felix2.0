CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  language VARCHAR(10) DEFAULT 'ru',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

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
CREATE INDEX IF NOT EXISTS idx_messages_content_fts ON messages USING GIN (to_tsvector('russian', content));
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON messages USING GIN (content gin_trgm_ops);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

CREATE TABLE IF NOT EXISTS message_tags (
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  is_auto_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (message_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_message_tags_message ON message_tags(message_id);
CREATE INDEX IF NOT EXISTS idx_message_tags_tag ON message_tags(tag_id);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ai_temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (ai_temperature >= 0 AND ai_temperature <= 2),
  ai_model VARCHAR(100) DEFAULT 'llama-3.3-70b-versatile',
  theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO tags (name) VALUES 
  ('programming'),
  ('question'),
  ('help'),
  ('tutorial'),
  ('bug'),
  ('feature')
ON CONFLICT (name) DO NOTHING;

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

CREATE TABLE IF NOT EXISTS user_learning_data (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_type VARCHAR(50) NOT NULL,
  pattern_data JSONB NOT NULL,
  learned_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_learning_user ON user_learning_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_type ON user_learning_data(pattern_type);

CREATE TABLE IF NOT EXISTS system_patterns (
  id SERIAL PRIMARY KEY,
  pattern_type VARCHAR(50) NOT NULL UNIQUE,
  pattern_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_patterns_type ON system_patterns(pattern_type);

CREATE TABLE IF NOT EXISTS system_insights (
  id BIGSERIAL PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL,
  insight_text TEXT NOT NULL,
  insight_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_insights_type ON system_insights(insight_type);

CREATE TABLE IF NOT EXISTS system_logs (
  id BIGSERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);

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
CREATE INDEX IF NOT EXISTS idx_lecture_notes_tags ON lecture_notes USING GIN(tags);

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

CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

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
CREATE INDEX IF NOT EXISTS idx_library_items_tags ON library_items USING GIN(tags);

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

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lecture_notes_updated_at ON lecture_notes;
CREATE TRIGGER update_lecture_notes_updated_at 
  BEFORE UPDATE ON lecture_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at 
  BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_library_items_updated_at ON library_items;
CREATE TRIGGER update_library_items_updated_at 
  BEFORE UPDATE ON library_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

INSERT INTO courses (title, description, category, difficulty, duration, lessons_count, rating) VALUES
  ('Основы Python', 'Изучи основы программирования на Python', 'programming', 'beginner', 300, 10, 4.8),
  ('JavaScript для начинающих', 'Веб-разработка с нуля', 'programming', 'beginner', 400, 12, 4.7),
  ('Машинное обучение', 'Введение в ML и AI', 'ai', 'intermediate', 600, 20, 4.9),
  ('Дизайн интерфейсов', 'UI/UX дизайн', 'design', 'intermediate', 350, 15, 4.6),
  ('Маркетинг в соцсетях', 'SMM стратегии', 'marketing', 'beginner', 250, 8, 4.5)
ON CONFLICT DO NOTHING;

SELECT 'SUCCESS: All tables created!' as status,
       COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
