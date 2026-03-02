-- Академия: Миграция для добавления таблиц уроков, покупок и выплат
-- Дата: 2 марта 2026
-- Версия: 2.0

-- ============================================
-- ТАБЛИЦА: lessons (Уроки курсов)
-- ============================================

CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL DEFAULT 'video', -- 'video', 'text', 'test'
  content_url TEXT, -- YouTube/Vimeo URL для видео
  content_text TEXT, -- Текстовый контент
  duration INTEGER DEFAULT 0, -- Длительность в секундах
  order_num INTEGER DEFAULT 0, -- Порядок урока в курсе
  is_free BOOLEAN DEFAULT false, -- Бесплатный урок (превью)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_num);

-- ============================================
-- ТАБЛИЦА: lesson_progress (Прогресс по урокам)
-- ============================================

CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  watch_time INTEGER DEFAULT 0, -- Время просмотра в секундах
  last_position INTEGER DEFAULT 0, -- Последняя позиция в видео
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- ============================================
-- ТАБЛИЦА: purchases (Покупки курсов)
-- ============================================

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  payment_method VARCHAR(50) NOT NULL, -- 'telegram_stars', 'card', 'bonus'
  payment_id VARCHAR(255), -- ID транзакции от платежной системы
  telegram_payment_charge_id VARCHAR(255), -- Telegram payment charge ID
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  referrer_partner_id BIGINT REFERENCES users(id), -- Партнер, приведший пользователя
  referrer_user_id BIGINT REFERENCES users(id), -- Пользователь, пригласивший
  partner_commission DECIMAL(10,2) DEFAULT 0, -- Комиссия партнера
  user_bonus DECIMAL(10,2) DEFAULT 0, -- Бонус пользователю-рефереру
  metadata JSONB, -- Дополнительные данные
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(user_id, course_id) -- Один пользователь может купить курс только раз
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_course ON purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_referrer_partner ON purchases(referrer_partner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created ON purchases(created_at DESC);

-- ============================================
-- ТАБЛИЦА: partner_payouts (Выплаты партнерам)
-- ============================================

CREATE TABLE IF NOT EXISTS partner_payouts (
  id SERIAL PRIMARY KEY,
  partner_id BIGINT REFERENCES partner_accounts(user_id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL, -- 'card', 'crypto_usdt_ton'
  details JSONB NOT NULL, -- Реквизиты для выплаты (номер карты, крипто-адрес)
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'processing', 'completed', 'rejected'
  rejection_reason TEXT, -- Причина отказа
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by BIGINT REFERENCES users(id), -- Админ, обработавший заявку
  transaction_id VARCHAR(255), -- ID транзакции выплаты
  notes TEXT, -- Заметки администратора
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_status ON partner_payouts(status);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_requested ON partner_payouts(requested_at DESC);

-- ============================================
-- ТАБЛИЦА: bonus_transactions (Бонусные баллы)
-- ============================================

CREATE TABLE IF NOT EXISTS bonus_transactions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL, -- Положительное = начисление, отрицательное = списание
  type VARCHAR(50) NOT NULL, -- 'earned_referral', 'spent_purchase', 'admin_adjustment'
  description TEXT,
  related_purchase_id INTEGER REFERENCES purchases(id), -- Связанная покупка
  balance_after DECIMAL(10,2) NOT NULL, -- Баланс после транзакции
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user ON bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_created ON bonus_transactions(created_at DESC);

-- ============================================
-- ОБНОВЛЕНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ============================================

-- Добавить поле bonus_balance в users (если еще нет)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_balance DECIMAL(10,2) DEFAULT 0;

-- Добавить поле referral_code в users (если еще нет)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;

-- Создать индекс для referral_code
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Обновить courses: добавить поля для Академии
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100); -- 'trading', 'it', 'psychology', 'self-development'
ALTER TABLE courses ADD COLUMN IF NOT EXISTS author VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_preview_url TEXT; -- Превью видео курса
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;

-- Создать индексы для courses
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);

-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_payouts_updated_at ON partner_payouts;
CREATE TRIGGER update_partner_payouts_updated_at
  BEFORE UPDATE ON partner_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Функция для генерации реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'user' || NEW.id || '_' || SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автогенерации referral_code
DROP TRIGGER IF EXISTS generate_user_referral_code ON users;
CREATE TRIGGER generate_user_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (для тестирования)
-- ============================================

-- Добавить тестовый курс "Основы трейдинга"
INSERT INTO courses (title, description, category, author, price, image_url, is_active)
VALUES (
  'Основы трейдинга',
  'Научись торговать на финансовых рынках с нуля. Узнай про анализ графиков, управление рисками и психологию трейдинга.',
  'trading',
  'Иван Петров',
  2990,
  'https://via.placeholder.com/400x300?text=Trading+Course',
  true
) ON CONFLICT DO NOTHING;

-- Добавить уроки к курсу
INSERT INTO lessons (course_id, title, description, content_type, content_url, duration, order_num, is_free)
SELECT 
  c.id,
  'Введение в трейдинг',
  'Что такое трейдинг и как начать зарабатывать на финансовых рынках',
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  600,
  1,
  true
FROM courses c WHERE c.title = 'Основы трейдинга'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, content_type, content_url, duration, order_num, is_free)
SELECT 
  c.id,
  'Технический анализ',
  'Основы чтения графиков и индикаторов',
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  900,
  2,
  false
FROM courses c WHERE c.title = 'Основы трейдинга'
ON CONFLICT DO NOTHING;

-- ============================================
-- КОММЕНТАРИИ
-- ============================================

COMMENT ON TABLE lessons IS 'Уроки курсов Академии';
COMMENT ON TABLE lesson_progress IS 'Прогресс пользователей по урокам';
COMMENT ON TABLE purchases IS 'Покупки курсов пользователями';
COMMENT ON TABLE partner_payouts IS 'Заявки на выплаты партнерам';
COMMENT ON TABLE bonus_transactions IS 'История бонусных транзакций';

-- ============================================
-- ЗАВЕРШЕНИЕ
-- ============================================

-- Вывести статистику
SELECT 
  'lessons' as table_name, 
  COUNT(*) as rows 
FROM lessons
UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases
UNION ALL
SELECT 'partner_payouts', COUNT(*) FROM partner_payouts
UNION ALL
SELECT 'bonus_transactions', COUNT(*) FROM bonus_transactions;

-- Готово!
SELECT '✅ Миграция 002-academy-tables.sql успешно применена!' as status;
