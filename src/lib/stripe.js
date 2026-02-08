import Stripe from 'stripe';

// サーバーサイドのStripeクライアント（ビルド時はキーが未設定の場合があるため遅延初期化）
let _stripe;
export const stripe = new Proxy({}, {
  get(_, prop) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
    }
    return _stripe[prop];
  },
});

// プランのStripe Price IDマッピング（Stripeダッシュボードで作成後に設定）
export const PLAN_PRICE_IDS = {
  priority: process.env.STRIPE_PRIORITY_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};

// プラン情報
export const PLANS = {
  free: {
    name: '無料プラン',
    price: 0,
    features: ['工房登録・公開', '作品ギャラリー', 'SNSリンク', 'お問い合わせ受付'],
  },
  priority: {
    name: '優先表示プラン',
    price: 980,
    features: ['一覧上位表示', '注目工房枠への掲載権', '優先バッジ表示', '無料プランの全機能'],
  },
  premium: {
    name: 'プレミアムプラン',
    price: 4980,
    features: ['優先表示の全機能', '専用Webサイト制作', '導線設計サポート', '起業相談（月1回）'],
  },
};
