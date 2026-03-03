-- Добавить колонку bonus_balance в таблицу users

-- Проверить, существует ли колонка
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'bonus_balance'
    ) THEN
        -- Добавить колонку
        ALTER TABLE users ADD COLUMN bonus_balance INTEGER DEFAULT 0;
        
        -- Добавить комментарий
        COMMENT ON COLUMN users.bonus_balance IS 'Баланс бонусов пользователя (в рублях)';
        
        RAISE NOTICE 'Колонка bonus_balance добавлена';
    ELSE
        RAISE NOTICE 'Колонка bonus_balance уже существует';
    END IF;
END $$;

-- Проверить результат
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'bonus_balance';
