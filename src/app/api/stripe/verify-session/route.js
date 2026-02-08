import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Checkoutセッションを検証して購読を作成（Webhook代替）
export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Stripeセッションを取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // セッションが完了しているか確認
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // メタデータからプラン情報を取得
    const { user_id, factory_id, plan_id } = session.metadata;

    // ユーザーが一致するか確認
    if (user_id !== user.id) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
    }

    // 既存の購読があるか確認
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', session.subscription)
      .single();

    if (existingSubscription) {
      // 既に登録済み
      return NextResponse.json({ data: existingSubscription, message: 'Already exists' });
    }

    // Stripeのサブスクリプション情報を取得
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

    // 購読レコードを作成
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id,
        factory_id: factory_id || null,
        plan_id: parseInt(plan_id),
        status: 'active',
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      })
      .select(`*, plan:subscription_plans(*)`)
      .single();

    if (error) {
      console.error('Failed to create subscription:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 工房の優先表示フラグを更新
    if (factory_id) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('is_priority')
        .eq('id', parseInt(plan_id))
        .single();

      if (plan?.is_priority) {
        await supabase
          .from('factories')
          .update({
            subscription_id: subscription.id,
            is_priority: true,
            priority_until: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', factory_id);
      }
    }

    return NextResponse.json({ data: subscription });
  } catch (error) {
    console.error('Verify session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
