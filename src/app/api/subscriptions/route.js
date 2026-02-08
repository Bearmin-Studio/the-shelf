import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 自分の購読情報を取得
export async function GET(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 最新の購読を取得（activeまたはcanceled）
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .in('status', ['active', 'canceled', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 工房情報を別途取得（双方向FKの曖昧さを回避）
    if (subscription?.factory_id) {
      const { data: factory } = await supabase
        .from('factories')
        .select('id, name')
        .eq('id', subscription.factory_id)
        .single();
      if (factory) {
        subscription.factory = factory;
      }
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Subscription query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: subscription || null });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
