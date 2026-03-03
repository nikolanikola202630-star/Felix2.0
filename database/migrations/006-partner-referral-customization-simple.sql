-- Partner Referral Bot Customization System - SIMPLE VERSION
-- EGOIST ECOSYSTEM Edition
-- Allows partners to customize their referral bot experience

-- Partner referral bot settings
CREATE TABLE IF NOT EXISTS partner_referral_settings (
  partner_user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Bot customization
  welcome_message TEXT DEFAULT 'Привет! 👋 Добро пожаловать в Felix Academy!',
  bot_name VARCHAR(255) DEFAULT 'Felix Academy',
  bot_avatar_emoji VARCHAR(10) DEFAULT '🎓',
  
  -- Access conditions (JSON array of conditions)
  access_conditions JSONB DEFAULT '[]'::jsonb,
  
  -- Branding
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#8B5CF6',
  logo_url TEXT,
  
  -- Buttons and links
  custom_buttons JSONB DEFAULT '[]'::jsonb,
  
  -- Auto-messages
  auto_messages JSONB DEFAULT '[]'::jsonb,
  
  -- Restrictions
  max_referrals_per_day INTEGER DEFAULT 100,
  require_phone BOOLEAN DEFAULT false,
  require_username BOOLEAN DEFAULT false,
  min_account_age_days INTEGER DEFAULT 0,
  
  -- Analytics
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

-- Комментарии к таблицам
COMMENT ON TABLE partner_referral_settings IS 'Partner referral bot customization settings';
COMMENT ON TABLE partner_access_log IS 'Log of access condition completions';
COMMENT ON TABLE partner_quiz_questions IS 'Quiz questions for partner referral bot';
COMMENT ON TABLE partner_quiz_results IS 'Quiz results for referred users';
COMMENT ON TABLE partner_form_fields IS 'Custom form fields for partner referral bot';
COMMENT ON TABLE partner_form_responses IS 'Form responses from referred users';
