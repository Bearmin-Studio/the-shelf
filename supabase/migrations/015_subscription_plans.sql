-- ============================================
-- Subscription Plans Migration
-- Migration: 015_subscription_plans.sql
-- プラン機能の追加（Stripe連携対応）
-- ============================================

-- プランマスタ
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- 円単位
  stripe_price_id TEXT, -- Stripe Price ID
  features JSONB DEFAULT '[]',
  is_priority BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 購読情報
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プレミアムプランのWebサイト申込
CREATE TABLE website_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
  requirements TEXT, -- ユーザーの要望
  notes TEXT, -- 管理者メモ
  website_url TEXT, -- 完成後のURL

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- factoriesテーブルにプラン情報を追加
ALTER TABLE factories ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);
ALTER TABLE factories ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false;
ALTER TABLE factories ADD COLUMN IF NOT EXISTS priority_until TIMESTAMPTZ;

-- usersテーブルにStripe顧客ID追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- インデックス
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_factory_id ON subscriptions(factory_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_factories_is_priority ON factories(is_priority);

-- 初期プランデータ
INSERT INTO subscription_plans (name, slug, description, price, is_priority, is_premium, features, display_order) VALUES
('無料プラン', 'free', '基本機能をすべて利用可能', 0, false, false, '["工房登録・公開", "作品ギャラリー", "SNSリンク", "お問い合わせ受付"]', 0),
('優先表示プラン', 'priority', '一覧で上位に表示され、注目されやすくなります', 980, true, false, '["一覧上位表示", "注目工房枠への掲載権", "優先バッジ表示", "無料プランの全機能"]', 1),
('プレミアムプラン', 'premium', '専用Webサイトで本格的な起業をサポート', 4980, true, true, '["優先表示の全機能", "専用Webサイト制作", "導線設計サポート", "起業相談（月1回）"]', 2);

-- RLSポリシー
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_requests ENABLE ROW LEVEL SECURITY;

-- プランは誰でも閲覧可能
CREATE POLICY "Plans are viewable by everyone"
  ON subscription_plans FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- 購読情報は本人と管理者のみ
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- Webサイト申込は本人と管理者のみ
CREATE POLICY "Users can view own website requests"
  ON website_requests FOR SELECT
  TO authenticated
  USING (
    factory_id IN (SELECT id FROM factories WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can insert website requests"
  ON website_requests FOR INSERT
  TO authenticated
  WITH CHECK (factory_id IN (SELECT id FROM factories WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update website requests"
  ON website_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
