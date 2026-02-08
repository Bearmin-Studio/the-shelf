-- ============================================
-- Site Settings Table
-- Migration: 009_site_settings.sql
-- ============================================

CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期設定
INSERT INTO site_settings (key, value) VALUES
    ('owner_icon', NULL),
    ('owner_name', '店主')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能
CREATE POLICY "Site settings are viewable by everyone"
    ON site_settings FOR SELECT
    TO anon, authenticated
    USING (true);

-- 管理者のみ更新可能（アプリ側でチェック）
