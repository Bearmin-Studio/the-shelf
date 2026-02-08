-- ============================================
-- Site Settings Update Policy
-- Migration: 010_site_settings_update_policy.sql
-- ============================================

-- 認証済みユーザーによる更新を許可（管理者チェックはアプリ側で実施）
CREATE POLICY "Authenticated users can update site settings"
    ON site_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- INSERT/UPSERTにも対応
CREATE POLICY "Authenticated users can insert site settings"
    ON site_settings FOR INSERT
    TO authenticated
    WITH CHECK (true);
