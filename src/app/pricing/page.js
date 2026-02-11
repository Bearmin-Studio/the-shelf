'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SuccessIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

function PricingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [myFactory, setMyFactory] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isSuccess = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');
  const isCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchMyFactory();
      fetchSubscription();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // 決済成功時にセッションを検証して購読を作成
  useEffect(() => {
    if (isSuccess && sessionId && user) {
      verifyAndCreateSubscription(sessionId);
    }
  }, [isSuccess, sessionId, user]);

  const verifyAndCreateSubscription = async (sessionId) => {
    try {
      const res = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      console.log('Verify session result:', data);

      if (data.data) {
        setShowSuccess(true);
        setCurrentSubscription(data.data);
      }
    } catch (error) {
      console.error('Failed to verify session:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      if (data.data) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchMyFactory = async () => {
    try {
      const res = await fetch('/api/my-factory');
      const data = await res.json();
      if (data.data) {
        setMyFactory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch my factory:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      console.log('Subscription response:', data);
      setCurrentSubscription(data.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planSlug) => {
    if (!user) {
      // ログインページへリダイレクト（またはモーダルを開く）
      alert('プランに申し込むにはログインが必要です');
      return;
    }

    if (!myFactory) {
      alert('プランに申し込む前に、工房を登録してください。');
      return;
    }

    setIsCheckingOut(planSlug);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug,
          factoryId: myFactory.id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || '決済ページの作成に失敗しました');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsCheckingOut(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    }
  };

  const getCurrentPlanSlug = () => {
    if (currentSubscription?.plan?.slug) {
      return currentSubscription.plan.slug;
    }
    return 'free';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP').format(price);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ background: 'rgba(250,250,247,0.92)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
            <img src="/images/logo.png" alt="The Shelf" className="h-7 sm:h-8 w-auto" />
            <span className="font-bold text-[15px] sm:text-base tracking-tight" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>The Shelf</span>
          </Link>
          <Link href="/" className="text-[13px] sm:text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] whitespace-nowrap">
            ← トップに戻る
          </Link>
        </div>
      </header>

      {/* Success Message - 決済機能公開後に有効化 */}
      {/* {showSuccess && (
        <div className="max-w-[600px] mx-auto px-6 pt-12">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-green-500 flex justify-center mb-4">
              <SuccessIcon />
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">お申し込みありがとうございます！</h2>
            <p className="text-green-700 text-sm mb-4">
              プランの登録が完了しました。優先表示機能がすぐにご利用いただけます。
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-sm text-green-600 hover:underline"
            >
              閉じる
            </button>
          </div>
        </div>
      )} */}

      {/* Canceled Message - 決済機能公開後に有効化 */}
      {/* {isCanceled && (
        <div className="max-w-[600px] mx-auto px-6 pt-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 text-sm">
              お申し込みがキャンセルされました。いつでも再度お申し込みいただけます。
            </p>
          </div>
        </div>
      )} */}

      {/* Current Plan Status - 決済機能公開後に有効化 */}
      {/* {user && currentSubscription && (
        <div className="max-w-[600px] mx-auto px-6 pt-8">
          <div className="bg-gradient-to-r from-[var(--accent-light)] to-white border border-[var(--accent)]/20 rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs text-[var(--text-tertiary)] mb-1">現在のプラン</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{currentSubscription.plan?.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    currentSubscription.status === 'active'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {currentSubscription.status === 'active' ? '有効' : currentSubscription.status}
                  </span>
                </div>
                {currentSubscription.current_period_end && (
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    次回更新日: {new Date(currentSubscription.current_period_end).toLocaleDateString('ja-JP')}
                  </div>
                )}
              </div>
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 rounded-lg border border-[var(--accent)] text-[var(--accent)] text-sm font-medium hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                プランを管理
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Hero */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
          あなたの挑戦を、<br className="sm:hidden" />もっと多くの人に届けよう
        </h1>
        <p className="text-[13px] sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
          優先表示プランで注目度アップ。<br />プレミアムプランで本格的な起業をサポートします。
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = getCurrentPlanSlug() === plan.slug;
              const isPremium = plan.is_premium;
              const isPriority = plan.is_priority && !plan.is_premium;
              const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border p-6 flex flex-col ${
                    isPremium
                      ? 'border-[var(--accent)] ring-2 ring-[var(--accent-subtle)]'
                      : 'border-[var(--border)]'
                  }`}
                >
                  {/* Badge */}
                  {isPremium && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-semibold flex items-center gap-1">
                      <StarIcon />
                      おすすめ
                    </div>
                  )}
                  {isPriority && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                      人気
                    </div>
                  )}

                  {/* Plan Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">¥{formatPrice(plan.price)}</span>
                      {plan.price > 0 && <span className="text-[var(--text-tertiary)]">/月</span>}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-[var(--accent)] mt-0.5 flex-shrink-0">
                          <CheckIcon />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrentPlan ? (
                    <button
                      className="w-full py-3 rounded-xl bg-gray-100 text-[var(--text-secondary)] text-sm font-semibold cursor-default"
                      disabled
                    >
                      現在のプラン
                    </button>
                  ) : plan.slug === 'free' ? (
                    <button
                      className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-semibold hover:bg-gray-50 transition-colors"
                      disabled
                    >
                      無料で利用中
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
                    >
                      準備中
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            有料プランは近日公開予定です。公開時にお知らせいたします。
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[800px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
          よくある質問
        </h2>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[var(--border)] p-4 sm:p-5">
            <h3 className="font-semibold mb-2">いつでも解約できますか？</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              はい、いつでも解約可能です。解約後も現在の請求期間の終了までサービスをご利用いただけます。
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--border)] p-4 sm:p-5">
            <h3 className="font-semibold mb-2">支払い方法は何がありますか？</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              クレジットカード（Visa、Mastercard、JCB、American Express）に対応しています。
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--border)] p-4 sm:p-5">
            <h3 className="font-semibold mb-2">プレミアムプランのWebサイト制作はどのように進みますか？</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              申し込み後、担当者からご連絡いたします。ヒアリングを行い、あなたの工房に合ったWebサイトを制作します。<br/>
              <small>※プレミアムプラン利用料とは別に、Webサイト制作費用が発生します。費用は制作内容確定後にお見積もりいたします。</small>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--border)] p-4 sm:p-5">
            <h3 className="font-semibold mb-2">プランのアップグレード・ダウングレードはできますか？</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              はい、可能です。「購読の管理」からいつでも変更いただけます。
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <p className="text-[11px] text-[var(--text-tertiary)]/60">© 2026 The Shelf</p>
        </div>
      </footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
