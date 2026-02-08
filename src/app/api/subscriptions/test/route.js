import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// テスト用: 手動で購読を作成（開発環境のみ）
export async function POST(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planSlug } = await request.json();
    console.log('Creating test subscription for plan:', planSlug);

    // プランを取得
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('slug', planSlug)
      .single();

    console.log('Found plan:', plan, 'Error:', planError);

    if (!plan) {
      // 全プランを確認
      const { data: allPlans } = await supabase.from('subscription_plans').select('*');
      console.log('All plans in DB:', allPlans);
      return NextResponse.json({ error: 'Plan not found', planSlug, allPlans }, { status: 404 });
    }

    // ユーザーの工房を取得
    const { data: factory } = await supabase
      .from('factories')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // 既存の購読があれば削除
    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id);

    // 購読を作成
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        factory_id: factory?.id || null,
        plan_id: plan.id,
        status: 'active',
        stripe_subscription_id: 'test_' + Date.now(),
        stripe_customer_id: 'test_customer_' + user.id,
        current_period_start: now.toISOString(),
        current_period_end: endDate.toISOString(),
      })
      .select(`*, plan:subscription_plans(*)`)
      .single();

    // 工房情報を追加
    if (factory?.id) {
      subscription.factory = { id: factory.id };
    }

    if (error) {
      console.error('Subscription insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 工房の優先表示フラグを更新
    if (factory?.id && plan.is_priority) {
      await supabase
        .from('factories')
        .update({
          subscription_id: subscription.id,
          is_priority: true,
          priority_until: endDate.toISOString(),
        })
        .eq('id', factory.id);
    }

    return NextResponse.json({ data: subscription });
  } catch (error) {
    console.error('Test subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// テスト購読を削除
export async function DELETE(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 工房の優先表示フラグをリセット
    await supabase
      .from('factories')
      .update({
        subscription_id: null,
        is_priority: false,
        priority_until: null,
      })
      .eq('user_id', user.id);

    // 購読を削除
    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
