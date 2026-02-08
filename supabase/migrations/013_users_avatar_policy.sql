-- ============================================
-- Migration: 013_users_avatar_policy.sql
-- Allow everyone to view user avatars
-- ============================================

-- 全員がユーザーのアバターを閲覧できるようにする
CREATE POLICY "User avatars are viewable by everyone"
    ON users FOR SELECT
    TO anon, authenticated
    USING (true);

-- 既存のポリシーが競合する場合は、古いポリシーを削除
-- DROP POLICY IF EXISTS "Users can view own profile" ON users;
