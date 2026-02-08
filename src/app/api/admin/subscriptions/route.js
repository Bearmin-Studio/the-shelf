import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 管理者: 全購読一覧取得
export async function GET(request) {
  const supabase = createClient();

  // 認証・管理者チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 購読一覧を取得
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(*),
      user:users(id, email, name)
    `)
    .order('created_at', { ascending: false });

  // 工房情報を別途取得（双方向FKの曖昧さを回避）
  if (data) {
    for (const sub of data) {
      if (sub.factory_id) {
        const { data: factory } = await supabase
          .from('factories')
          .select('id, name')
          .eq('id', sub.factory_id)
          .single();
        sub.factory = factory || null;
      }
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 管理者: 購読ステータス更新
export async function PATCH(request) {
  const supabase = createClient();

  // 認証・管理者チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 工房の優先表示フラグを更新
  if (data.factory_id) {
    const isPriority = status === 'active';
    await supabase
      .from('factories')
      .update({
        is_priority: isPriority,
        priority_until: isPriority ? data.current_period_end : null,
      })
      .eq('id', data.factory_id);
  }

  return NextResponse.json({ data });
}
