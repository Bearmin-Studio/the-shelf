-- ============================================
-- Multiple Genres Support
-- Migration: 017_multiple_genres.sql
-- ============================================

-- factoriesテーブルにgenre_idsカラムを追加
ALTER TABLE factories
ADD COLUMN IF NOT EXISTS genre_ids INTEGER[] DEFAULT '{}';

-- 既存のgenre_idデータをgenre_idsに移行
UPDATE factories
SET genre_ids = ARRAY[genre_id]
WHERE genre_id IS NOT NULL AND (genre_ids IS NULL OR genre_ids = '{}');

-- インデックスを追加（配列検索のパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_factories_genre_ids ON factories USING GIN(genre_ids);

-- コメント追加
COMMENT ON COLUMN factories.genre_ids IS '工房が属する複数のジャンルID（配列）';
COMMENT ON COLUMN factories.genre_id IS '主要ジャンルID（後方互換性のため保持）';
