import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FACTORY_SELECT_FIELDS } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

// 自分の工房を取得
export async function GET() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('my-factory API - user:', user?.id, 'authError:', authError?.message);

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized', debug: { authError: authError?.message } }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('factories')
    .select(FACTORY_SELECT_FIELDS)
    .eq('user_id', user.id)
    .maybeSingle();

  console.log('my-factory API - factory query result:', { data, error: error?.message, userId: user.id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, debug: { userId: user.id } });
}

// 自分の工房を更新
export async function PATCH(request) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, creator_name, tagline, story, genre_id, genre_ids, work_types, color, accent, sns_links, cover_image, status } = body;

  // 更新データを構築
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (creator_name !== undefined) updateData.creator_name = creator_name;
  if (tagline !== undefined) updateData.tagline = tagline;
  if (story !== undefined) updateData.story = story;

  // 複数ジャンル対応：genre_idsが指定されている場合はそれを使用
  if (genre_ids !== undefined && Array.isArray(genre_ids)) {
    updateData.genre_ids = genre_ids;
    // 最初のジャンルをgenre_idとして保存（後方互換性のため）
    if (genre_ids.length > 0) {
      updateData.genre_id = genre_ids[0];
    }
    console.log('📝 工房更新 - ジャンル更新:', { genre_ids, genre_id: genre_ids[0] });
  } else if (genre_id !== undefined) {
    // 単一ジャンルの場合（後方互換性）
    updateData.genre_id = genre_id;
    updateData.genre_ids = [genre_id];
    console.log('📝 工房更新 - 単一ジャンル:', { genre_id });
  }

  if (work_types !== undefined) updateData.work_types = work_types;
  if (color !== undefined) updateData.color = color;
  if (accent !== undefined) updateData.accent = accent;
  if (sns_links !== undefined) updateData.sns_links = sns_links;
  if (cover_image !== undefined) updateData.cover_image = cover_image;
  if (status !== undefined && ['available', 'busy'].includes(status)) {
    updateData.status = status;
  }

  console.log('💾 工房更新データ:', updateData);

  const { data, error } = await supabase
    .from('factories')
    .update(updateData)
    .eq('user_id', user.id)
    .select(FACTORY_SELECT_FIELDS)
    .single();

  if (error) {
    console.error('❌ 工房更新エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('✅ 工房更新成功:', data);
  return NextResponse.json({ data });
}

// 自分の工房を削除
export async function DELETE() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 関連する購読を削除
  await supabase
    .from('subscriptions')
    .delete()
    .eq('user_id', user.id);

  // 関連する作品を削除
  const { data: factory } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (factory) {
    await supabase
      .from('works')
      .delete()
      .eq('factory_id', factory.id);
  }

  // 工房を削除
  const { error } = await supabase
    .from('factories')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
