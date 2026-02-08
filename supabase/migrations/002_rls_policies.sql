-- ============================================
-- Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_picks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- GENRES POLICIES
-- ============================================
CREATE POLICY "Genres are viewable by everyone"
    ON genres FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================
-- FACTORIES POLICIES
-- ============================================
CREATE POLICY "Active factories are viewable by everyone"
    ON factories FOR SELECT
    TO anon, authenticated
    USING (status != 'inactive');

CREATE POLICY "Users can create own factory"
    ON factories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own factory"
    ON factories FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own factory"
    ON factories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- WORKS POLICIES
-- ============================================
CREATE POLICY "Works of active factories are viewable"
    ON works FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM factories
            WHERE factories.id = works.factory_id
            AND factories.status != 'inactive'
        )
    );

CREATE POLICY "Users can insert works for own factory"
    ON works FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM factories
            WHERE factories.id = works.factory_id
            AND factories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own factory works"
    ON works FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM factories
            WHERE factories.id = works.factory_id
            AND factories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own factory works"
    ON works FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM factories
            WHERE factories.id = works.factory_id
            AND factories.user_id = auth.uid()
        )
    );

-- ============================================
-- FEATURED_FACTORIES POLICIES
-- ============================================
CREATE POLICY "Featured factories are viewable by everyone"
    ON featured_factories FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================
-- OWNER_PICKS POLICIES
-- ============================================
CREATE POLICY "Active owner picks are viewable by everyone"
    ON owner_picks FOR SELECT
    TO anon, authenticated
    USING (is_active = true);
