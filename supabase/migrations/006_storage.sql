-- ============================================
-- Storage Setup for Image Uploads
-- Migration: 006_storage.sql
-- ============================================

-- Add image columns to factories table
ALTER TABLE factories
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- Note: Storage bucket must be created via Supabase Dashboard or API
-- Bucket name: factory-images
-- Public access: true (for easy image display)

-- Storage policies are managed in dashboard, but here's the logic:
-- 1. Anyone can view images (public bucket)
-- 2. Authenticated users can upload to their own folder
-- 3. Users can only delete their own images
