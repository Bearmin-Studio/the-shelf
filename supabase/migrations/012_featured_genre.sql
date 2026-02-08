-- ============================================
-- Migration: 012_featured_genre.sql
-- Add genre_id to featured_factories for genre-specific featured
-- ============================================

-- Add genre_id column (nullable - null means global/all genres)
ALTER TABLE featured_factories
ADD COLUMN genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE;

-- Drop old unique constraint
ALTER TABLE featured_factories
DROP CONSTRAINT IF EXISTS featured_factories_factory_id_month_key;

-- Add new unique constraint including genre_id
-- This allows one featured per genre per month (null genre = global)
ALTER TABLE featured_factories
ADD CONSTRAINT featured_factories_month_genre_key UNIQUE (month, genre_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_featured_factories_genre ON featured_factories(genre_id);
