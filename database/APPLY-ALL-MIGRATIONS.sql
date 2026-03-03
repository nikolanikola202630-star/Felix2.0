-- ============================================
-- Felix Academy - Все Миграции БД
-- ⟁ EGOIST ECOSYSTEM v10.3
-- Дата: 3 марта 2026
-- ============================================
-- 
-- ИНСТРУКЦИЯ:
-- 1. Откройте Supabase Dashboard
-- 2. Перейдите в SQL Editor
-- 3. Скопируйте и вставьте весь этот файл
-- 4. Нажмите RUN
-- 
-- Этот файл содержит ВСЕ 7 миграций в правильном порядке
-- ============================================

-- Начало транзакции
BEGIN;

-- ============================================
-- МИГРАЦИЯ 1: ML Tables (001-add-ml-tables-safe.sql)
-- ============================================

-- Создать функцию update_updated_at_column если не существует
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User profiles
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

-- System patterns
CREATE TABLE IF NOT EXISTS system_patterns (
  id SERIAL PRIMARY KEY,
  pattern_type VARCHAR(50) NOT NULL UNIQUE,
  pattern_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_patterns_type ON system_patterns(pattern_type);

-- System insights
CREATE TABLE IF NOT EXISTS system_insights (
  id BIGSERIAL PRIMARY KEY,
  insight_type VARCHAR(50) NOT NULL,
  insight_text TEXT NOT NULL,
  insight_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_insights_type ON system_insights(insight_type);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
  id BIGSERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);

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
  price DECIMAL(10,2) DEFAULT 0,
  author VARCHAR(255),
  image_url TEXT,
  video_preview_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
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

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

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

-- ============================================
-- МИГРАЦИЯ 2: Academy Tables (002-academy-tables.sql)
-- ============================================

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL DEFAULT 'video',
  content_url TEXT,
  content_text TEXT,
  duration INTEGER DEFAULT 0,
  order_num INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

-- Lesson progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  watch_time INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  payment_method VARCHAR(50) NOT NULL,
  payment_id VARCHAR(255),
  telegram_payment_charge_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  referrer_partner_id BIGINT REFERENCES users(id),
  referrer_user_id BIGINT REFERENCES users(id),
  partner_commission DECIMAL(10,2) DEFAULT 0,
  user_bonus DECIMAL(10,2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);

-- Partner payouts
CREATE TABLE IF NOT EXISTS partner_payouts (
  id SERIAL PRIMARY KEY,
  partner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  details JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  rejection_reason TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by BIGINT REFERENCES users(id),
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON partner_payouts(partner_id);

-- Bonus transactions
CREATE TABLE IF NOT EXISTS bonus_transactions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  related_purchase_id INTEGER REFERENCES purchases(id),
  balance_after DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user ON bonus_transactions(user_id);

-- Добавить поля в users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_balance DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- ============================================
-- МИГРАЦИЯ 3: Partner Courses (003-partner-courses.sql)
-- ============================================

-- Course partners
CREATE TABLE IF NOT EXISTS course_partners (
  id BIGSERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  partner_id BIGINT NOT NULL,
  role TEXT DEFAULT 'owner',
  can_edit BOOLEAN DEFAULT true,
  can_view_students BOOLEAN DEFAULT true,
  can_chat BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_course_partners_partner ON course_partners(partner_id);

-- Course students
CREATE TABLE IF NOT EXISTS course_students (
  id BIGSERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  user_id BIGINT NOT NULL,
  partner_id BIGINT,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_students_partner ON course_students(partner_id);

-- Partner chats
CREATE TABLE IF NOT EXISTS partner_chats (
  id BIGSERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  course_id INTEGER,
  status TEXT DEFAULT 'open',
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partner_id, student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_chats_partner ON partner_chats(partner_id);

-- Partner messages
CREATE TABLE IF NOT EXISTS partner_messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL REFERENCES partner_chats(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL,
  sender_type TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_messages_chat ON partner_messages(chat_id);

-- Partner notifications
CREATE TABLE IF NOT EXISTS partner_notifications (
  id BIGSERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_notifications_partner ON partner_notifications(partner_id);

-- ============================================
-- МИГРАЦИЯ 4: Referral System V2 (004-referral-system-v2.sql)
-- ============================================

-- ENUM для методов доступа
DO $$ BEGIN
  CREATE TYPE access_method AS ENUM ('direct', 'code');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Таблица partners (партнеры реферальной системы)
CREATE TABLE IF NOT EXISTS partners_referral (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partners_referral_telegram_id ON partners_referral(telegram_id);

-- Таблица referral_campaigns (кампании)
CREATE TABLE IF NOT EXISTS referral_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners_referral(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  access_method access_method NOT NULL DEFAULT 'direct',
  target_url TEXT NOT NULL,
  instructions TEXT,
  utm_source TEXT DEFAULT 'felix_academy',
  utm_medium TEXT DEFAULT 'referral',
  expires_at TIMESTAMPTZ,
  max_clicks INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_partner ON referral_campaigns(partner_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_expires ON referral_campaigns(expires_at);

-- Таблица referral_links (реферальные ссылки)
CREATE TABLE IF NOT EXISTS referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES referral_campaigns(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_links_campaign ON referral_links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_links_code ON referral_links(code);
CREATE INDEX IF NOT EXISTS idx_links_user ON referral_links(user_id);

-- Таблица referral_clicks (клики)
CREATE TABLE IF NOT EXISTS referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES referral_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  ip_hash TEXT,
  user_agent TEXT,
  country_code TEXT,
  converted BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_clicks_link ON referral_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_status ON referral_clicks(status);
CREATE INDEX IF NOT EXISTS idx_clicks_converted ON referral_clicks(converted);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON referral_clicks(clicked_at);

-- ============================================
-- МИГРАЦИЯ 5: Community System (005-community-system.sql)
-- ============================================

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

-- ============================================
-- МИГРАЦИЯ 6: Partner Referral Customization (006-partner-referral-customization-simple.sql)
-- ============================================

-- Partner referral bot settings
CREATE TABLE IF NOT EXISTS partner_referral_settings (
  partner_user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  welcome_message TEXT DEFAULT 'Привет! 👋 Добро пожаловать в Felix Academy!',
  bot_name VARCHAR(255) DEFAULT 'Felix Academy',
  bot_avatar_emoji VARCHAR(10) DEFAULT '🎓',
  access_conditions JSONB DEFAULT '[]'::jsonb,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#8B5CF6',
  logo_url TEXT,
  custom_buttons JSONB DEFAULT '[]'::jsonb,
  auto_messages JSONB DEFAULT '[]'::jsonb,
  max_referrals_per_day INTEGER DEFAULT 100,
  require_phone BOOLEAN DEFAULT false,
  require_username BOOLEAN DEFAULT false,
  min_account_age_days INTEGER DEFAULT 0,
  track_utm_params BOOLEAN DEFAULT true,
  custom_utm_source VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_referral_settings_partner ON partner_referral_settings(partner_user_id);

-- Partner access conditions log
CREATE TABLE IF NOT EXISTS partner_access_log (
  id SERIAL PRIMARY KEY,
  partner_user_id BIGINT NOT NULL REFERENCES users(id),
  referred_user_id BIGINT NOT NULL REFERENCES users(id),
  condition_type VARCHAR(50) NOT NULL,
  condition_data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partner_user_id, referred_user_id, condition_type)
);

CREATE INDEX IF NOT EXISTS idx_partner_access_log_partner ON partner_access_log(partner_user_id);
CREATE INDEX IF NOT EXISTS idx_partner_access_log_referred ON partner_access_log(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_partner_access_log_status ON partner_access_log(status);

-- Partner quiz questions
CREATE TABLE IF NOT EXISTS partner_quiz_questions (
  id SERIAL PRIMARY KEY,
  partner_user_id BIGINT NOT NULL REFERENCES users(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_quiz_questions_partner ON partner_quiz_questions(partner_user_id);

-- Partner quiz results
CREATE TABLE IF NOT EXISTS partner_quiz_results (
  id SERIAL PRIMARY KEY,
  partner_user_id BIGINT NOT NULL REFERENCES users(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partner_user_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_quiz_results_partner ON partner_quiz_results(partner_user_id);
CREATE INDEX IF NOT EXISTS idx_partner_quiz_results_user ON partner_quiz_results(user_id);

-- Partner form fields
CREATE TABLE IF NOT EXISTS partner_form_fields (
  id SERIAL PRIMARY KEY,
  partner_user_id BIGINT NOT NULL REFERENCES users(id),
  field_name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'email', 'phone', 'select', 'multiselect', 'textarea')),
  field_label TEXT NOT NULL,
  field_options JSONB,
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_form_fields_partner ON partner_form_fields(partner_user_id);

-- Partner form responses
CREATE TABLE IF NOT EXISTS partner_form_responses (
  id SERIAL PRIMARY KEY,
  partner_user_id BIGINT NOT NULL REFERENCES users(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  responses JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partner_user_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_form_responses_partner ON partner_form_responses(partner_user_id);
CREATE INDEX IF NOT EXISTS idx_partner_form_responses_user ON partner_form_responses(user_id);

-- ============================================
-- МИГРАЦИЯ 7: AI Chat Folders (007-ai-chat-folders.sql)
-- ============================================

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
  duration INTEGER,
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

-- Коммит транзакции
COMMIT;

-- ============================================
-- ПРОВЕРКА
-- ============================================

-- Показать все созданные таблицы
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Итог
SELECT '✅ ВСЕ 7 МИГРАЦИЙ УСПЕШНО ПРИМЕНЕНЫ!' as status,
       COUNT(*) as tables_created
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- ============================================
-- ГОТОВО! 🎉
-- ============================================
-- 
-- Теперь ваша база данных полностью готова для Felix Academy!
-- 
-- Следующие шаги:
-- 1. Проверьте таблицы выше
-- 2. Установите переменные окружения в Vercel
-- 3. Выполните деплой: git push origin main
-- 4. Установите webhook'и: node scripts/sync-bots.js
-- 
-- ============================================
