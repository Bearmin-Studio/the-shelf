-- ============================================
-- View Count Feature
-- Migration: 005_view_count.sql
-- Adds view tracking for popularity sorting
-- ============================================

-- Add view_count column to factories
ALTER TABLE factories
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_factories_view_count ON factories(view_count DESC);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(factory_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE factories
  SET view_count = view_count + 1
  WHERE id = factory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon, authenticated;
