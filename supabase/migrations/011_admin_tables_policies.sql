-- ============================================
-- Admin Tables RLS Policies
-- Migration: 011_admin_tables_policies.sql
-- 注意: is_admin()関数は007_admin_role.sqlで定義済み
-- ============================================

-- ============================================
-- FEATURED_FACTORIES POLICIES (管理者用)
-- ============================================
CREATE POLICY "Admins can insert featured factories"
    ON featured_factories FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update featured factories"
    ON featured_factories FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete featured factories"
    ON featured_factories FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================
-- OWNER_PICKS POLICIES (管理者用)
-- ============================================
CREATE POLICY "Admins can insert owner picks"
    ON owner_picks FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update owner picks"
    ON owner_picks FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete owner picks"
    ON owner_picks FOR DELETE
    TO authenticated
    USING (is_admin());

-- owner_picksのSELECTポリシーを更新（管理者は全件見れるように）
DROP POLICY IF EXISTS "Active owner picks are viewable by everyone" ON owner_picks;

CREATE POLICY "Owner picks are viewable by everyone"
    ON owner_picks FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================
-- SITE_SETTINGS POLICIES (管理者用に更新)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can insert site settings" ON site_settings;

CREATE POLICY "Admins can update site settings"
    ON site_settings FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can insert site settings"
    ON site_settings FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- ============================================
-- FACTORIES POLICIES (管理者用 - 追加)
-- ============================================
-- 管理者は全ての工房を閲覧可能（非公開含む）
DROP POLICY IF EXISTS "Active factories are viewable by everyone" ON factories;

CREATE POLICY "Factories are viewable"
    ON factories FOR SELECT
    TO anon, authenticated
    USING (status != 'inactive' OR is_admin());

-- 管理者は全ての工房を更新可能
CREATE POLICY "Admins can update any factory"
    ON factories FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- 管理者は全ての工房を削除可能
CREATE POLICY "Admins can delete any factory"
    ON factories FOR DELETE
    TO authenticated
    USING (is_admin());
