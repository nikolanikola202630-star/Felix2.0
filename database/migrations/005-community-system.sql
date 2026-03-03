-- Felix Academy - Community System
-- EGOIST ECOSYSTEM Edition
-- Discussions, comments, likes

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  category VARCHAR(50) DEFAULT 'general',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussions_user ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_course ON discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussions_created ON discussions(created_at DESC);

-- Discussion comments
CREATE TABLE IF NOT EXISTS discussion_comments (
  id SERIAL PRIMARY KEY,
  discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussion_comments_discussion ON discussion_comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_user ON discussion_comments(user_id);

-- Discussion likes
CREATE TABLE IF NOT EXISTS discussion_likes (
  id SERIAL PRIMARY KEY,
  discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_discussion_likes_discussion ON discussion_likes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_likes_user ON discussion_likes(user_id);

-- Add preferences column to user_settings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Insert sample discussions for courses
INSERT INTO discussions (user_id, course_id, category, title, content) VALUES
  (123456789, 1, 'trading', 'Лучшие стратегии для начинающих', 'Поделитесь своими любимыми стратегиями для новичков в трейдинге. Что работает лучше всего?'),
  (123456789, 1, 'trading', 'Управление рисками - ваш опыт', 'Как вы управляете рисками? Какой процент капитала используете на сделку?'),
  (123456789, 2, 'crypto', 'Технический анализ криптовалют', 'Обсуждаем индикаторы и паттерны для крипторынка'),
  (123456789, 3, 'psychology', 'Как справиться со стрессом при торговле', 'Делитесь методами борьбы с эмоциями во время трейдинга'),
  (123456789, NULL, 'general', 'Знакомство с сообществом', 'Привет всем! Расскажите о себе и своих целях в обучении 👋')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE discussions IS 'Community discussions by course topics';
COMMENT ON TABLE discussion_comments IS 'Comments on discussions';
COMMENT ON TABLE discussion_likes IS 'User likes on discussions';
