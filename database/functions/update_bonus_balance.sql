-- Функция для обновления баланса бонусов пользователя
-- Используется при начислении комиссий

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

-- Комментарий
COMMENT ON FUNCTION update_bonus_balance IS 'Обновляет баланс бонусов пользователя при начислении комиссий';

-- Пример использования:
-- SELECT update_bonus_balance(123456, 500);
