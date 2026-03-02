-- Migration 003: Partner referral program + internal support chat
-- Safe / idempotent

CREATE TABLE IF NOT EXISTS partner_accounts (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(32) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  notify_on_click BOOLEAN DEFAULT false,
  created_by BIGINT,
  updated_by BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_accounts_active ON partner_accounts(is_active);

CREATE TABLE IF NOT EXISTS referral_clicks (
  id BIGSERIAL PRIMARY KEY,
  partner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(32) NOT NULL,
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_hash VARCHAR(64),
  user_agent TEXT,
  referer TEXT,
  session_id VARCHAR(128),
  is_unique BOOLEAN DEFAULT true,
  blocked_reason VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_partner ON referral_clicks(partner_user_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_ip ON referral_clicks(ip_hash, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_session ON referral_clicks(session_id);

CREATE TABLE IF NOT EXISTS support_threads (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_threads_status ON support_threads(status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_threads_user ON support_threads(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS support_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES support_threads(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_support_messages_thread ON support_messages(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_support_messages_unread ON support_messages(thread_id, is_read);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_partner_accounts_updated_at ON partner_accounts;
CREATE TRIGGER update_partner_accounts_updated_at
  BEFORE UPDATE ON partner_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_threads_updated_at ON support_threads;
CREATE TRIGGER update_support_threads_updated_at
  BEFORE UPDATE ON support_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
