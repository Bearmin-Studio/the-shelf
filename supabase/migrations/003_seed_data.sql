-- ============================================
-- Seed Data Migration
-- Migration: 003_seed_data.sql
-- ============================================

-- ============================================
-- 1. SEED GENRES
-- ============================================
INSERT INTO genres (name, slug, icon, display_order) VALUES
    ('3D', '3d', NULL, 1),
    ('映像', 'video', NULL, 2),
    ('デザイン', 'design', NULL, 3),
    ('Web制作', 'web', NULL, 4),
    ('AI作品', 'ai', NULL, 5),
    ('ゲーム', 'game', NULL, 6),
    ('XR', 'xr', NULL, 7);

-- ============================================
-- 2. SEED SYSTEM USER
-- ============================================
INSERT INTO users (id, email, name, avatar_url) VALUES
    ('00000000-0000-0000-0000-000000000001', 'system@challenger-showcase.local', 'System', NULL);

-- ============================================
-- 3. SEED FACTORIES
-- ============================================

-- Factory 1: Studio Prism
INSERT INTO factories (id, user_id, name, creator_name, tagline, story, genre_id, status, work_types, color, accent, sns_links)
VALUES (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Studio Prism',
    '田中 美咲',
    '光と色で世界を再構築する3Dアーティスト。リアルタイムレンダリングとプロダクトビジュアライゼーションを得意としています。',
    '元広告制作会社でのCGアーティストを経て独立。「光」をテーマに作品を制作し続けています。',
    (SELECT id FROM genres WHERE slug = '3d'),
    'available',
    ARRAY['3Dモデリング', '環境デザイン', 'プロダクトViz'],
    '#6366f1',
    '#818cf8',
    '[{"platform": "X", "url": ""}, {"platform": "Instagram", "url": ""}]'::jsonb
);

-- Factory 2: MotionLab
INSERT INTO factories (id, user_id, name, creator_name, tagline, story, genre_id, status, work_types, color, accent, sns_links)
VALUES (
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'MotionLab',
    '佐藤 健太',
    '動きで感情を伝えるモーショングラフィッカー。MV制作からブランドムービーまで幅広く対応。',
    '音楽と映像の関係性に魅せられ、独学で映像制作を開始。年間30本以上のMVを制作中。',
    (SELECT id FROM genres WHERE slug = 'video'),
    'available',
    ARRAY['MV制作', 'モーショングラフィックス', 'タイトルアニメーション'],
    '#ec4899',
    '#f472b6',
    '[{"platform": "X", "url": ""}, {"platform": "YouTube", "url": ""}]'::jsonb
);

-- Factory 3: CRAFT BUREAU
INSERT INTO factories (id, user_id, name, creator_name, tagline, story, genre_id, status, work_types, color, accent, sns_links)
VALUES (
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'CRAFT BUREAU',
    '山本 陽介',
    'ブランドの核を形にするデザインスタジオ。ロゴからパッケージまで一貫したブランド体験を設計。',
    '「良いデザインは、言葉にできない価値を形にすること」をモットーに制作しています。',
    (SELECT id FROM genres WHERE slug = 'design'),
    'busy',
    ARRAY['ロゴデザイン', 'ブランディング', 'パッケージ'],
    '#d97706',
    '#fbbf24',
    '[{"platform": "X", "url": ""}, {"platform": "Behance", "url": ""}]'::jsonb
);

-- Factory 4: NeuralCanvas
INSERT INTO factories (id, user_id, name, creator_name, tagline, story, genre_id, status, work_types, color, accent, sns_links)
VALUES (
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'NeuralCanvas',
    '李 ウェイ',
    'AIと人間の境界を溶かすジェネラティブアート。テクノロジーと芸術の交差点で作品を生み出す。',
    'AI技術の美的可能性を追求。人間とAIの共創をテーマに国内外で展示活動中。',
    (SELECT id FROM genres WHERE slug = 'ai'),
    'available',
    ARRAY['ジェネラティブアート', 'AIイラスト', 'インスタレーション'],
    '#059669',
    '#34d399',
    '[{"platform": "X", "url": ""}, {"platform": "Instagram", "url": ""}]'::jsonb
);

-- Factory 5: PixelForge
INSERT INTO factories (id, user_id, name, creator_name, tagline, story, genre_id, status, work_types, color, accent, sns_links)
VALUES (
    '00000000-0000-0000-0001-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'PixelForge',
    '鈴木 龍一',
    '1ピクセルに魂を込めるインディゲーム開発者。レトロと現代の融合をテーマに制作。',
    'ファミコン世代のゲーム体験を現代に再解釈。現在Steam向け新作を開発中。',
    (SELECT id FROM genres WHERE slug = 'game'),
    'available',
    ARRAY['2Dゲーム開発', 'ピクセルアート', 'ゲームUI'],
    '#7c3aed',
    '#a78bfa',
    '[{"platform": "X", "url": ""}, {"platform": "itch.io", "url": ""}]'::jsonb
);

-- Factory 6: WebCraft Studio
INSERT INTO factories (id, user_id, name, creator_name, tagline, story, genre_id, status, work_types, color, accent, sns_links)
VALUES (
    '00000000-0000-0000-0001-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'WebCraft Studio',
    '高橋 実',
    '体験を設計するフルスタックエンジニア。技術と体験設計の両面からプロダクトを構築。',
    '「使いやすさ」だけでなく「使いたくなる」プロダクト設計を目指しています。',
    (SELECT id FROM genres WHERE slug = 'web'),
    'busy',
    ARRAY['Webアプリ', 'LP制作', 'ECサイト'],
    '#0891b2',
    '#22d3ee',
    '[{"platform": "X", "url": ""}, {"platform": "GitHub", "url": ""}]'::jsonb
);

-- Factory 7: Dimension X
INSERT INTO factories (id, user_id, name, creator_name, tagline, story, genre_id, status, work_types, color, accent, sns_links)
VALUES (
    '00000000-0000-0000-0001-000000000007',
    '00000000-0000-0000-0000-000000000001',
    'Dimension X',
    '渡辺 あかり',
    '現実を拡張する空間デザイナー。VR/AR技術を使った新しい空間体験を設計。',
    '建築学科出身。「空間は体験である」という信念のもと、デジタル空間の設計に挑戦中。',
    (SELECT id FROM genres WHERE slug = 'xr'),
    'available',
    ARRAY['VR体験設計', 'AR展示', '空間インスタレーション'],
    '#e11d48',
    '#fb7185',
    '[{"platform": "X", "url": ""}, {"platform": "LinkedIn", "url": ""}]'::jsonb
);

-- Factory 8: TypeForge
INSERT INTO factories (id, user_id, name, creator_name, tagline, story, genre_id, status, work_types, color, accent, sns_links)
VALUES (
    '00000000-0000-0000-0001-000000000008',
    '00000000-0000-0000-0000-000000000001',
    'TypeForge',
    '中村 翔',
    '文字に命を吹き込むタイポグラフィスト。フォントデザインからポスター制作まで。',
    '文字の形が持つ力に惹かれ、オリジナルフォントの制作を開始。日本語書体のデザインに注力。',
    (SELECT id FROM genres WHERE slug = 'design'),
    'available',
    ARRAY['タイポグラフィ', 'フォント制作', 'ポスター'],
    '#9333ea',
    '#c084fc',
    '[{"platform": "X", "url": ""}, {"platform": "Behance", "url": ""}]'::jsonb
);

-- ============================================
-- 4. SEED FEATURED FACTORY
-- ============================================
INSERT INTO featured_factories (factory_id, month, priority, notes)
VALUES (
    '00000000-0000-0000-0001-000000000001',
    TO_CHAR(NOW(), 'YYYY-MM'),
    1,
    '3D表現の完成度が高く、今月の注目工房として選出'
);

-- ============================================
-- 5. SEED OWNER PICKS
-- ============================================
INSERT INTO owner_picks (factory_id, comment, order_num, is_active)
VALUES
    (
        '00000000-0000-0000-0001-000000000001',
        '3D表現の完成度が際立っている。プロダクトビジュアルの案件にも十分対応できる実力。',
        1,
        true
    ),
    (
        '00000000-0000-0000-0001-000000000004',
        'AI×アートの最前線を走るクリエイター。他にない唯一無二の作品群が魅力。',
        2,
        true
    ),
    (
        '00000000-0000-0000-0001-000000000007',
        'XR空間設計の新星。企業展示やイベントでの活用実績も。将来性に注目。',
        3,
        true
    );
