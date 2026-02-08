-- ============================================
-- Likes Feature
-- Migration: 016_likes_feature.sql
-- Adds like functionality with popularity scoring
-- ============================================

-- ============================================
-- 1. CREATE FACTORY_LIKES TABLE
-- ============================================
CREATE TABLE factory_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Prevent duplicate likes
    UNIQUE(factory_id, user_id)
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_factory_likes_factory_id ON factory_likes(factory_id);
CREATE INDEX idx_factory_likes_user_id ON factory_likes(user_id);
CREATE INDEX idx_factory_likes_created_at ON factory_likes(created_at DESC);

-- ============================================
-- 3. ADD LIKE_COUNT COLUMN TO FACTORIES
-- ============================================
-- Denormalized for performance (avoids COUNT queries on every request)
ALTER TABLE factories
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

CREATE INDEX idx_factories_like_count ON factories(like_count DESC);

-- ============================================
-- 4. CREATE TRIGGER FUNCTION TO UPDATE LIKE COUNT
-- ============================================
CREATE OR REPLACE FUNCTION update_factory_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment like_count when a new like is added
        UPDATE factories
        SET like_count = like_count + 1
        WHERE id = NEW.factory_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement like_count when a like is removed (ensure non-negative)
        UPDATE factories
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.factory_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. CREATE TRIGGER
-- ============================================
CREATE TRIGGER trigger_update_like_count
    AFTER INSERT OR DELETE ON factory_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_factory_like_count();

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE factory_likes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE RLS POLICIES
-- ============================================

-- Anyone can view likes (including anonymous users)
CREATE POLICY "Likes are viewable by everyone"
    ON factory_likes FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Authenticated users can insert likes"
    ON factory_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
    ON factory_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON factory_likes TO anon, authenticated;
GRANT INSERT, DELETE ON factory_likes TO authenticated;
