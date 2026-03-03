-- AI Chat Folders System
-- EGOIST ECOSYSTEM Edition
-- Организация диалогов в папки как в DeepSeek

-- Папки для диалогов
CREATE TABLE IF NOT EXISTS ai_chat_folders (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) DEFAULT '📁',
  color VARCHAR(7) DEFAULT '#3B82F6',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_folders_user ON ai_chat_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_folders_order ON ai_chat_folders(user_id, order_index);

-- Диалоги (чаты)
CREATE TABLE IF NOT EXISTS ai_chats (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id INTEGER REFERENCES ai_chat_folders(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Новый чат',
  model VARCHAR(50) DEFAULT 'llama-3.3-70b',
  system_prompt TEXT,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chats_user ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_folder ON ai_chats(folder_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_pinned ON ai_chats(user_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_ai_chats_archived ON ai_chats(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_ai_chats_last_message ON ai_chats(user_id, last_message_at DESC);

-- Сообщения в диалогах
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_chat ON ai_chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created ON ai_chat_messages(chat_id, created_at);

-- Голосовые сообщения
CREATE TABLE IF NOT EXISTS ai_voice_messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
  message_id INTEGER REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
  audio_url TEXT,
  duration INTEGER, -- секунды
  transcription TEXT,
  language VARCHAR(10) DEFAULT 'ru',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_voice_messages_chat ON ai_voice_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_ai_voice_messages_message ON ai_voice_messages(message_id);

-- Избранные сообщения
CREATE TABLE IF NOT EXISTS ai_chat_favorites (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id INTEGER NOT NULL REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_favorites_user ON ai_chat_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_favorites_message ON ai_chat_favorites(message_id);

-- Шаблоны промптов
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_user ON ai_prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_public ON ai_prompt_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_category ON ai_prompt_templates(category);

-- Функция обновления счетчика сообщений
CREATE OR REPLACE FUNCTION update_chat_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ai_chats 
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.chat_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ai_chats 
    SET message_count = GREATEST(message_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.chat_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления счетчика
DROP TRIGGER IF EXISTS trigger_update_chat_message_count ON ai_chat_messages;
CREATE TRIGGER trigger_update_chat_message_count
AFTER INSERT OR DELETE ON ai_chat_messages
FOR EACH ROW EXECUTE FUNCTION update_chat_message_count();

-- Функция автоматического названия чата
CREATE OR REPLACE FUNCTION auto_title_chat()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.title = 'Новый чат' AND NEW.message_count >= 1 THEN
    -- Взять первые 50 символов первого сообщения пользователя
    UPDATE ai_chats
    SET title = COALESCE(
      (SELECT LEFT(content, 50) || CASE WHEN LENGTH(content) > 50 THEN '...' ELSE '' END
       FROM ai_chat_messages
       WHERE chat_id = NEW.id AND role = 'user'
       ORDER BY created_at ASC
       LIMIT 1),
      'Новый чат'
    )
    WHERE id = NEW.id AND title = 'Новый чат';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического названия
DROP TRIGGER IF EXISTS trigger_auto_title_chat ON ai_chats;
CREATE TRIGGER trigger_auto_title_chat
AFTER UPDATE OF message_count ON ai_chats
FOR EACH ROW EXECUTE FUNCTION auto_title_chat();

-- Дефолтные папки для всех пользователей (создаются при первом использовании)
-- Будут создаваться через API при первом обращении

COMMENT ON TABLE ai_chat_folders IS 'Folders for organizing AI chats';
COMMENT ON TABLE ai_chats IS 'AI chat sessions with history';
COMMENT ON TABLE ai_chat_messages IS 'Messages in AI chats';
COMMENT ON TABLE ai_voice_messages IS 'Voice messages in AI chats';
COMMENT ON TABLE ai_chat_favorites IS 'Favorite messages bookmarked by users';
COMMENT ON TABLE ai_prompt_templates IS 'Reusable prompt templates';
