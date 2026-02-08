import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 作品一覧を取得
export async function GET() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ユーザーの工房を取得
  const { data: factory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!factory) {
    return NextResponse.json({ data: [] });
  }

  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('factory_id', factory.id)
    .order('order_num', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// 作品を追加
export async function POST(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ユーザーの工房を取得
  const { data: factory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!factory) {
    return NextResponse.json({ error: 'Factory not found' }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, image_url, external_url } = body;

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  // 現在の最大order_numを取得
  const { data: maxData } = await supabase
    .from('works')
    .select('order_num')
    .eq('factory_id', factory.id)
    .order('order_num', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newOrderNum = (maxData?.order_num || 0) + 1;

  const { data, error } = await supabase
    .from('works')
    .insert({
      factory_id: factory.id,
      title,
      description: description || '',
      image_url: image_url || null,
      external_url: external_url || null,
      order_num: newOrderNum,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 作品を更新
export async function PATCH(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, title, description, image_url } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // 作品が自分の工房のものか確認
  const { data: work } = await supabase
    .from('works')
    .select('factory_id, factory:factories(user_id)')
    .eq('id', id)
    .single();

  if (!work || work.factory?.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (image_url !== undefined) updateData.image_url = image_url;

  const { data, error } = await supabase
    .from('works')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 作品を削除
export async function DELETE(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // 作品が自分の工房のものか確認
  const { data: work } = await supabase
    .from('works')
    .select('factory_id, factory:factories(user_id)')
    .eq('id', id)
    .single();

  if (!work || work.factory?.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('works')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
