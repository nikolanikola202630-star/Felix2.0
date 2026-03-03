-- Миграция 003: Партнерские курсы и чаты
-- Дата: 3 марта 2026

-- Таблица партнеров (расширение)
CREATE TABLE IF NOT EXISTS partners (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  status TEXT DEFAULT 'active', -- active, suspended, pending
  commission_rate DECIMAL(5,2) DEFAULT 20.00, -- Процент комиссии
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Связь курсов с партнерами
CREATE TABLE IF NOT EXISTS course_partners (
  id BIGSERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  partner_id BIGINT NOT NULL,
  role TEXT DEFAULT 'owner', -- owner, editor, viewer
  can_edit BOOLEAN DEFAULT true,
  can_view_students BOOLEAN DEFAULT true,
  can_chat BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, partner_id)
);

-- Студенты курсов (для отслеживания)
CREATE TABLE IF NOT EXISTS course_students (
  id BIGSERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  user_id BIGINT NOT NULL,
  partner_id BIGINT, -- Партнер, который привел студента
  status TEXT DEFAULT 'active', -- active, completed, dropped
  progress INTEGER DEFAULT 0, -- Процент прохождения
  started_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(course_id, user_id)
);

-- Чаты партнеров со студентами
CREATE TABLE IF NOT EXISTS partner_chats (
  id BIGSERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  course_id INTEGER,
  status TEXT DEFAULT 'open', -- open, closed, archived
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partner_id, student_id, course_id)
);

-- Сообщения в чатах
CREATE TABLE IF NOT EXISTS partner_messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL REFERENCES partner_chats(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL,
  sender_type TEXT NOT NULL, -- partner, student
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, image, file, voice
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Уведомления для партнеров
CREATE TABLE IF NOT EXISTS partner_notifications (
  id BIGSERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL,
  type TEXT NOT NULL, -- new_student, new_message, course_completed, payment
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_course_partners_partner ON course_partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_course_partners_course ON course_partners(course_id);
CREATE INDEX IF NOT EXISTS idx_course_students_partner ON course_students(partner_id);
CREATE INDEX IF NOT EXISTS idx_course_students_course ON course_students(course_id);
CREATE INDEX IF NOT EXISTS idx_partner_chats_partner ON partner_chats(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_chats_student ON partner_chats(student_id);
CREATE INDEX IF NOT EXISTS idx_partner_messages_chat ON partner_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_partner ON partner_notifications(partner_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для partners
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии
COMMENT ON TABLE partners IS 'Партнеры платформы';
COMMENT ON TABLE course_partners IS 'Связь курсов с партнерами';
COMMENT ON TABLE course_students IS 'Студенты курсов';
COMMENT ON TABLE partner_chats IS 'Чаты партнеров со студентами';
COMMENT ON TABLE partner_messages IS 'Сообщения в чатах';
COMMENT ON TABLE partner_notifications IS 'Уведомления для партнеров';
