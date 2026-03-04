-- Migration 008: Voice AI Assistant with Memory
-- Голосовой AI-помощник с долговременной памятью

-- Включаем расширение для векторного поиска
CREATE EXTENSION IF NOT EXISTS vector;

-- Таблица папок для AI чатов (расширение существующей)
CREATE TABLE IF NOT EXISTS ai_folders (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id INTEGER REFERENCES ai_folders(id) ON DELETE CASCADE,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для папок
CREATE INDEX IF NOT EXISTS idx_ai_folders_user_id ON ai_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_folders_parent_id ON ai_folders(parent_id);

-- Таблица сообщений AI чата (расширение существующей)
ALTER TABLE ai_chat_history 
ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES ai_folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice')),
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ru';

-- Таблица векторной памяти для AI
CREATE TABLE IF NOT EXISTS ai_memory (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  message_id INTEGER REFERENCES ai_chat_history(id) ON DELETE CASCADE,
  embedding vector(1536), -- OpenAI embeddings размер 1536
  text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для векторного поиска
CREATE INDEX IF NOT EXISTS idx_ai_memory_user_id ON ai_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_embedding ON ai_memory USING ivfflat (embedding vector_cosine_ops);

-- Таблица фактов о пользователе (долговременная память)
CREATE TABLE IF NOT EXISTS ai_user_facts (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  fact_type TEXT NOT NULL, -- 'preference', 'goal', 'interest', 'personal', 'business'
  fact TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 1.0, -- 0.0 - 1.0
  source TEXT, -- откуда получен факт
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_mentioned_at TIMESTAMPTZ
);

-- Индексы для фактов
CREATE INDEX IF NOT EXISTS idx_ai_user_facts_user_id ON ai_user_facts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_user_facts_type ON ai_user_facts(fact_type);
CREATE INDEX IF NOT EXISTS idx_ai_user_facts_embedding ON ai_user_facts USING ivfflat (embedding vector_cosine_ops);

-- Таблица настроек AI ассистента для пользователя
CREATE TABLE IF NOT EXISTS ai_assistant_settings (
  user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id) ON DELETE CASCADE,
  voice_enabled BOOLEAN DEFAULT true,
  voice_gender TEXT DEFAULT 'alloy' CHECK (voice_gender IN ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')),
  language TEXT DEFAULT 'ru',
  personality TEXT DEFAULT 'friendly', -- 'friendly', 'professional', 'casual', 'mentor'
  response_length TEXT DEFAULT 'medium', -- 'brief', 'medium', 'detailed'
  use_memory BOOLEAN DEFAULT true,
  auto_save_facts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица для партнёрского ассистента
CREATE TABLE IF NOT EXISTS partner_assistant_context (
  user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id) ON DELETE CASCADE,
  last_stats_check TIMESTAMPTZ,
  goals JSONB DEFAULT '[]', -- цели партнёра
  achievements JSONB DEFAULT '[]', -- достижения
  notes TEXT, -- заметки ассистента о партнёре
  motivation_level INTEGER DEFAULT 5 CHECK (motivation_level BETWEEN 1 AND 10),
  last_motivation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Функция для поиска похожих воспоминаний
CREATE OR REPLACE FUNCTION match_memory(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id bigint
)
RETURNS TABLE (
  id integer,
  text text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_memory.id,
    ai_memory.text,
    ai_memory.metadata,
    1 - (ai_memory.embedding <=> query_embedding) as similarity
  FROM ai_memory
  WHERE ai_memory.user_id = p_user_id
    AND 1 - (ai_memory.embedding <=> query_embedding) > match_threshold
  ORDER BY ai_memory.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Функция для поиска фактов о пользователе
CREATE OR REPLACE FUNCTION match_user_facts(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id bigint
)
RETURNS TABLE (
  id integer,
  fact_type text,
  fact text,
  confidence decimal,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_user_facts.id,
    ai_user_facts.fact_type,
    ai_user_facts.fact,
    ai_user_facts.confidence,
    1 - (ai_user_facts.embedding <=> query_embedding) as similarity
  FROM ai_user_facts
  WHERE ai_user_facts.user_id = p_user_id
    AND 1 - (ai_user_facts.embedding <=> query_embedding) > match_threshold
  ORDER BY ai_user_facts.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Создаём дефолтную папку для каждого пользователя
CREATE OR REPLACE FUNCTION create_default_ai_folder()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_folders (user_id, name, icon, color)
  VALUES (NEW.telegram_id, 'Основные', '💬', '#6366f1');
  
  INSERT INTO ai_folders (user_id, name, icon, color)
  VALUES (NEW.telegram_id, 'Голосовые беседы', '🎤', '#8b5cf6');
  
  INSERT INTO ai_assistant_settings (user_id)
  VALUES (NEW.telegram_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания дефолтных папок
DROP TRIGGER IF EXISTS trigger_create_default_ai_folder ON users;
CREATE TRIGGER trigger_create_default_ai_folder
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_ai_folder();

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
DROP TRIGGER IF EXISTS update_ai_folders_updated_at ON ai_folders;
CREATE TRIGGER update_ai_folders_updated_at
  BEFORE UPDATE ON ai_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_user_facts_updated_at ON ai_user_facts;
CREATE TRIGGER update_ai_user_facts_updated_at
  BEFORE UPDATE ON ai_user_facts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_assistant_settings_updated_at ON ai_assistant_settings;
CREATE TRIGGER update_ai_assistant_settings_updated_at
  BEFORE UPDATE ON ai_assistant_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_assistant_context_updated_at ON partner_assistant_context;
CREATE TRIGGER update_partner_assistant_context_updated_at
  BEFORE UPDATE ON partner_assistant_context
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE ai_folders IS 'Папки для организации AI чатов';
COMMENT ON TABLE ai_memory IS 'Векторная память AI ассистента';
COMMENT ON TABLE ai_user_facts IS 'Факты о пользователе для долговременной памяти';
COMMENT ON TABLE ai_assistant_settings IS 'Настройки AI ассистента для каждого пользователя';
COMMENT ON TABLE partner_assistant_context IS 'Контекст партнёрского ассистента';

-- Гранты (если нужно)
-- GRANT ALL ON ai_folders TO authenticated;
-- GRANT ALL ON ai_memory TO authenticated;
-- GRANT ALL ON ai_user_facts TO authenticated;
-- GRANT ALL ON ai_assistant_settings TO authenticated;
-- GRANT ALL ON partner_assistant_context TO authenticated;
