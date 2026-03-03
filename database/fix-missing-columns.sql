-- ============================================
-- Исправление недостающих колонок в БД
-- ============================================

-- ============================================
-- 1. Таблица COURSES - добавить price
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'price'
    ) THEN
        ALTER TABLE courses ADD COLUMN price INTEGER DEFAULT 0;
        COMMENT ON COLUMN courses.price IS 'Цена курса в рублях';
        RAISE NOTICE 'Колонка courses.price добавлена';
    ELSE
        RAISE NOTICE 'Колонка courses.price уже существует';
    END IF;
END $$;

-- ============================================
-- 2. Обновить цены для существующих курсов
-- ============================================

UPDATE courses SET price = 2990 WHERE id = 1 AND price = 0;
UPDATE courses SET price = 3990 WHERE id = 2 AND price = 0;
UPDATE courses SET price = 4990 WHERE id = 3 AND price = 0;
UPDATE courses SET price = 2990 WHERE id = 4 AND price = 0;
UPDATE courses SET price = 3490 WHERE id = 5 AND price = 0;
UPDATE courses SET price = 4490 WHERE id = 6 AND price = 0;
UPDATE courses SET price = 2490 WHERE id = 7 AND price = 0;
UPDATE courses SET price = 3990 WHERE id = 8 AND price = 0;
UPDATE courses SET price = 4990 WHERE id = 9 AND price = 0;
UPDATE courses SET price = 5990 WHERE id = 10 AND price = 0;

-- ============================================
-- 3. Проверить результат
-- ============================================

SELECT 
    'courses' as table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'courses'
AND column_name IN ('price', 'id', 'title')
ORDER BY column_name;

-- Показать курсы с ценами
SELECT id, title, price, category FROM courses ORDER BY id LIMIT 10;
