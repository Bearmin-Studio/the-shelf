import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 管理者チェック
async function checkAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return data?.is_admin === true;
}

// 店主の今月の発見を取得
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('owner_picks')
    .select(`
      id,
      factory_id,
      comment,
      order_num,
      is_active
    `)
    .eq('is_active', true)
    .order('order_num', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// 店主の今月の発見を追加
export async function POST(request) {
  const supabase = createClient();

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { factory_id, comment } = body;

  if (!factory_id) {
    return NextResponse.json({ error: 'factory_id is required' }, { status: 400 });
  }

  // 現在の最大order_numを取得
  const { data: maxData } = await supabase
    .from('owner_picks')
    .select('order_num')
    .eq('is_active', true)
    .order('order_num', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newOrderNum = (maxData?.order_num || 0) + 1;

  const { data, error } = await supabase
    .from('owner_picks')
    .upsert({
      factory_id,
      comment: comment || '',
      order_num: newOrderNum,
      is_active: true,
    }, {
      onConflict: 'factory_id',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 店主の今月の発見を更新
export async function PATCH(request) {
  const supabase = createClient();

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { id, comment, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updateData = {};
  if (comment !== undefined) updateData.comment = comment;
  if (is_active !== undefined) updateData.is_active = is_active;

  const { data, error } = await supabase
    .from('owner_picks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 店主の今月の発見を削除
export async function DELETE(request) {
  const supabase = createClient();

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('owner_picks')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
