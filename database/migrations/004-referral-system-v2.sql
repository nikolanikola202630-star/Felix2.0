-- Миграция 004: Обновленная реферальная система (без бота)
-- Дата: 2026-03-03
-- Описание: Система рефералов с методами direct и code

-- 1. Создание ENUM для методов доступа
CREATE TYPE access_method AS ENUM ('direct', 'code');

-- 2. Таблица partners (партнеры)
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partners_telegram_id ON partners(telegram_id);

-- 3. Таблица referral_campaigns (кампании)
CREATE TABLE IF NOT EXISTS referral_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
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

-- 4. Таблица referral_links (реферальные ссылки)
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

-- 5. Таблица referral_clicks (клики)
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

-- 6. Таблица partner_courses (курсы партнеров)
CREATE TABLE IF NOT EXISTS partner_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  content JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_partner ON partner_courses(partner_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON partner_courses(is_published);

-- 7. Таблица partner_webhooks (вебхуки)
CREATE TABLE IF NOT EXISTS partner_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY['click', 'confirm'],
  secret TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_partner ON partner_webhooks(partner_id);

-- 8. Row Level Security (RLS)

-- Включаем RLS на всех таблицах
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_webhooks ENABLE ROW LEVEL SECURITY;

-- Политики для partners
CREATE POLICY partners_select ON partners
  FOR SELECT USING (true); -- Все могут читать базовую информацию

CREATE POLICY partners_insert ON partners
  FOR INSERT WITH CHECK (
    telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
  );

CREATE POLICY partners_update ON partners
  FOR UPDATE USING (
    telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
  );

-- Политики для referral_campaigns
CREATE POLICY campaigns_select ON referral_campaigns
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM partners 
      WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
    )
  );

CREATE POLICY campaigns_insert ON referral_campaigns
  FOR INSERT WITH CHECK (
    partner_id IN (
      SELECT id FROM partners 
      WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
    )
  );

CREATE POLICY campaigns_update ON referral_campaigns
  FOR UPDATE USING (
    partner_id IN (
      SELECT id FROM partners 
      WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
    )
  );

CREATE POLICY campaigns_delete ON referral_campaigns
  FOR DELETE USING (
    partner_id IN (
      SELECT id FROM partners 
      WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
    )
  );

-- Политики для referral_links
CREATE POLICY links_select ON referral_links
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM referral_campaigns 
      WHERE partner_id IN (
        SELECT id FROM partners 
        WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
      )
    )
  );

-- Политики для referral_clicks
CREATE POLICY clicks_select ON referral_clicks
  FOR SELECT USING (
    link_id IN (
      SELECT id FROM referral_links 
      WHERE campaign_id IN (
        SELECT id FROM referral_campaigns 
        WHERE partner_id IN (
          SELECT id FROM partners 
          WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
        )
      )
    )
  );

CREATE POLICY clicks_update ON referral_clicks
  FOR UPDATE USING (
    link_id IN (
      SELECT id FROM referral_links 
      WHERE campaign_id IN (
        SELECT id FROM referral_campaigns 
        WHERE partner_id IN (
          SELECT id FROM partners 
          WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
        )
      )
    )
  );

-- Политики для partner_courses
CREATE POLICY courses_all ON partner_courses
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners 
      WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
    )
  );

-- Политики для partner_webhooks
CREATE POLICY webhooks_all ON partner_webhooks
  FOR ALL USING (
    partner_id IN (
      SELECT id FROM partners 
      WHERE telegram_id = current_setting('request.jwt.claims', true)::json->>'telegram_id'::bigint
    )
  );

-- 9. Функции для статистики

-- Функция для получения статистики кампании
CREATE OR REPLACE FUNCTION get_campaign_stats(campaign_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_links', COUNT(DISTINCT rl.id),
    'total_clicks', COUNT(rc.id),
    'pending_clicks', COUNT(rc.id) FILTER (WHERE rc.status = 'pending'),
    'confirmed_clicks', COUNT(rc.id) FILTER (WHERE rc.status = 'confirmed'),
    'rejected_clicks', COUNT(rc.id) FILTER (WHERE rc.status = 'rejected'),
    'conversion_rate', 
      CASE 
        WHEN COUNT(rc.id) > 0 
        THEN ROUND((COUNT(rc.id) FILTER (WHERE rc.status = 'confirmed')::NUMERIC / COUNT(rc.id)) * 100, 2)
        ELSE 0 
      END
  ) INTO result
  FROM referral_links rl
  LEFT JOIN referral_clicks rc ON rc.link_id = rl.id
  WHERE rl.campaign_id = campaign_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Триггеры для updated_at

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON referral_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON partner_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON partner_webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE partners IS 'Партнеры (владельцы сообществ)';
COMMENT ON TABLE referral_campaigns IS 'Реферальные кампании с методами доступа';
COMMENT ON TABLE referral_links IS 'Уникальные реферальные ссылки/коды';
COMMENT ON TABLE referral_clicks IS 'Клики по реферальным ссылкам';
COMMENT ON TABLE partner_courses IS 'Курсы, созданные партнерами';
COMMENT ON TABLE partner_webhooks IS 'Вебхуки для уведомлений партнеров';
