-- ============================================
-- Felix Academy - Полная настройка базы данных
-- Создает все недостающие таблицы и функции
-- ============================================

-- ============================================
-- АКАДЕМИЯ: Уроки и прогресс
-- ============================================

-- Таблица уроков
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration INTEGER DEFAULT 0,
  order_num INTEGER NOT NULL,
  content TEXT,
  homework TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица прогресса уроков
CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  watch_time INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- ПОКУПКИ И ПЛАТЕЖИ
-- ============================================

-- Таблица покупок
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  course_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'XTR',
  status TEXT DEFAULT 'pending',
  telegram_payment_charge_id TEXT,
  provider_payment_charge_id TEXT,
  referrer_id BIGINT,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  refunded_by BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица транзакций бонусов
CREATE TABLE IF NOT EXISTS bonus_transactions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  related_user_id BIGINT,
  related_course_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица выплат партнерам
CREATE TABLE IF NOT EXISTS partner_payouts (
  id SERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  method TEXT,
  details JSONB,
  transaction_id TEXT,
  approved_by BIGINT,
  approved_at TIMESTAMPTZ,
  rejected_by BIGINT,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ПАРТНЕРСКАЯ СИСТЕМА
-- ============================================

-- Таблица связи курсов и партнеров
CREATE TABLE IF NOT EXISTS course_partners (
  id SERIAL PRIMARY KEY,
  course_id TEXT NOT NULL,
  partner_id BIGINT NOT NULL,
  commission_rate INTEGER DEFAULT 20,
  can_edit BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, partner_id)
);

-- Таблица студентов курсов
CREATE TABLE IF NOT EXISTS course_students (
  id SERIAL PRIMARY KEY,
  course_id TEXT NOT NULL,
  student_id BIGINT NOT NULL,
  partner_id BIGINT,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  UNIQUE(course_id, student_id)
);

-- Таблица чатов партнеров
CREATE TABLE IF NOT EXISTS partner_chats (
  id SERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  course_id TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, student_id)
);

-- Таблица сообщений партнеров
CREATE TABLE IF NOT EXISTS partner_messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES partner_chats(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица уведомлений партнеров
CREATE TABLE IF NOT EXISTS partner_notifications (
  id SERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================

-- Индексы для lessons
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_num);

-- Индексы для lesson_progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(user_id, completed);

-- Индексы для purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_course_id ON purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_user_course ON purchases(user_id, course_id);

-- Индексы для bonus_transactions
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user_id ON bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_type ON bonus_transactions(type);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_created_at ON bonus_transactions(created_at DESC);

-- Индексы для partner_payouts
CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner_id ON partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_status ON partner_payouts(status);

-- Индексы для course_partners
CREATE INDEX IF NOT EXISTS idx_course_partners_course_id ON course_partners(course_id);
CREATE INDEX IF NOT EXISTS idx_course_partners_partner_id ON course_partners(partner_id);

-- Индексы для course_students
CREATE INDEX IF NOT EXISTS idx_course_students_course_id ON course_students(course_id);
CREATE INDEX IF NOT EXISTS idx_course_students_student_id ON course_students(student_id);
CREATE INDEX IF NOT EXISTS idx_course_students_partner_id ON course_students(partner_id);

-- Индексы для partner_chats
CREATE INDEX IF NOT EXISTS idx_partner_chats_partner_id ON partner_chats(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_chats_student_id ON partner_chats(student_id);

-- Индексы для partner_messages
CREATE INDEX IF NOT EXISTS idx_partner_messages_chat_id ON partner_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_partner_messages_created_at ON partner_messages(created_at DESC);

-- Индексы для partner_notifications
CREATE INDEX IF NOT EXISTS idx_partner_notifications_partner_id ON partner_notifications(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_read ON partner_notifications(partner_id, read);

-- ============================================
-- SQL ФУНКЦИИ
-- ============================================

-- Функция для обновления баланса бонусов
CREATE OR REPLACE FUNCTION update_bonus_balance(
  p_user_id BIGINT,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Обновить баланс пользователя
  UPDATE users
  SET 
    bonus_balance = COALESCE(bonus_balance, 0) + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Если пользователь не найден, создать запись
  IF NOT FOUND THEN
    INSERT INTO users (id, bonus_balance, created_at, updated_at)
    VALUES (p_user_id, p_amount, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET 
      bonus_balance = COALESCE(users.bonus_balance, 0) + p_amount,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Комментарий к функции
COMMENT ON FUNCTION update_bonus_balance IS 'Обновляет баланс бонусов пользователя при начислении комиссий';

-- ============================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- ============================================

COMMENT ON TABLE lessons IS 'Уроки курсов';
COMMENT ON TABLE lesson_progress IS 'Прогресс прохождения уроков пользователями';
COMMENT ON TABLE purchases IS 'Покупки курсов';
COMMENT ON TABLE bonus_transactions IS 'Транзакции бонусов (комиссии, начисления)';
COMMENT ON TABLE partner_payouts IS 'Выплаты партнерам';
COMMENT ON TABLE course_partners IS 'Связь курсов и партнеров';
COMMENT ON TABLE course_students IS 'Студенты курсов';
COMMENT ON TABLE partner_chats IS 'Чаты партнеров со студентами';
COMMENT ON TABLE partner_messages IS 'Сообщения в чатах';
COMMENT ON TABLE partner_notifications IS 'Уведомления для партнеров';

-- ============================================
-- ГОТОВО!
-- ============================================

-- Проверить созданные таблицы
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Проверить созданные функции
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_bonus_balance';
