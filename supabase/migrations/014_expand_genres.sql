-- ============================================
-- Expand Genres Migration
-- Migration: 014_expand_genres.sql
-- XRを削除し、新しいジャンルを追加
-- ============================================

-- XRジャンルを使用している工房を一時的にデザインに移動
UPDATE factories
SET genre_id = (SELECT id FROM genres WHERE slug = 'design')
WHERE genre_id = (SELECT id FROM genres WHERE slug = 'xr');

-- XRジャンルを削除
DELETE FROM genres WHERE slug = 'xr';

-- 新しいジャンルを追加
INSERT INTO genres (name, slug, icon, display_order) VALUES
    ('イラスト', 'illustration', NULL, 7),
    ('写真', 'photo', NULL, 8),
    ('音楽・サウンド', 'music', NULL, 9),
    ('アニメーション', 'animation', NULL, 10),
    ('漫画・コミック', 'manga', NULL, 11),
    ('ハンドメイド', 'handmade', NULL, 12),
    ('ファッション', 'fashion', NULL, 13),
    ('建築・空間', 'architecture', NULL, 14),
    ('執筆・ライティング', 'writing', NULL, 15),
    ('マーケティング', 'marketing', NULL, 16),
    ('教育・コンサル', 'education', NULL, 17),
    ('フード・料理', 'food', NULL, 18),
    ('アクセサリー', 'accessory', NULL, 19),
    ('雑貨・インテリア', 'goods', NULL, 20),
    ('キャラクターデザイン', 'character', NULL, 21),
    ('UI/UX', 'uiux', NULL, 22),
    ('VTuber関連', 'vtuber', NULL, 23),
    ('Live2D', 'live2d', NULL, 24),
    ('NFT・デジタルアート', 'nft', NULL, 25),
    ('その他', 'other', NULL, 99);

-- 表示順を整理（既存ジャンルも含めて）
UPDATE genres SET display_order = 1 WHERE slug = 'illustration';
UPDATE genres SET display_order = 2 WHERE slug = 'design';
UPDATE genres SET display_order = 3 WHERE slug = '3d';
UPDATE genres SET display_order = 4 WHERE slug = 'video';
UPDATE genres SET display_order = 5 WHERE slug = 'animation';
UPDATE genres SET display_order = 6 WHERE slug = 'photo';
UPDATE genres SET display_order = 7 WHERE slug = 'music';
UPDATE genres SET display_order = 8 WHERE slug = 'game';
UPDATE genres SET display_order = 9 WHERE slug = 'web';
UPDATE genres SET display_order = 10 WHERE slug = 'uiux';
UPDATE genres SET display_order = 11 WHERE slug = 'ai';
UPDATE genres SET display_order = 12 WHERE slug = 'manga';
UPDATE genres SET display_order = 13 WHERE slug = 'character';
UPDATE genres SET display_order = 14 WHERE slug = 'vtuber';
UPDATE genres SET display_order = 15 WHERE slug = 'live2d';
UPDATE genres SET display_order = 16 WHERE slug = 'nft';
UPDATE genres SET display_order = 17 WHERE slug = 'handmade';
UPDATE genres SET display_order = 18 WHERE slug = 'accessory';
UPDATE genres SET display_order = 19 WHERE slug = 'fashion';
UPDATE genres SET display_order = 20 WHERE slug = 'goods';
UPDATE genres SET display_order = 21 WHERE slug = 'architecture';
UPDATE genres SET display_order = 22 WHERE slug = 'food';
UPDATE genres SET display_order = 23 WHERE slug = 'writing';
UPDATE genres SET display_order = 24 WHERE slug = 'marketing';
UPDATE genres SET display_order = 25 WHERE slug = 'education';
UPDATE genres SET display_order = 99 WHERE slug = 'other';
