import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FACTORY_SELECT_FIELDS } from '@/lib/supabase/queries';

// 工房作成
export async function POST(request) {
  const supabase = createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('🔐 認証状態:', { user: user?.id, authError: authError?.message });

  if (authError || !user) {
    console.error('❌ 認証エラー:', authError?.message || 'ユーザーなし');
    return NextResponse.json({
      error: 'Unauthorized',
      debug: { authError: authError?.message, hasUser: !!user }
    }, { status: 401 });
  }

  // 既存の工房があるかチェック
  const { data: existing } = await supabase
    .from('factories')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: '既に工房を登録済みです' }, { status: 400 });
  }

  const body = await request.json();
  const { name, tagline, story, genre_id, genre_ids, work_types, color, accent, sns_links, cover_image } = body;

  // 複数ジャンル対応：genre_idsが指定されている場合はそれを使用、なければgenre_idを配列化
  const genreIdsToUse = genre_ids && genre_ids.length > 0
    ? genre_ids
    : (genre_id ? [genre_id] : []);

  console.log('📝 工房作成 - 受信データ:', { name, genre_id, genre_ids, genreIdsToUse });

  // バリデーション
  if (!name || !tagline || genreIdsToUse.length === 0) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 });
  }

  // 最初のジャンルをgenre_idとして保存（後方互換性のため）
  const primaryGenreId = genreIdsToUse[0];

  // 工房を作成
  const insertData = {
    user_id: user.id,
    name,
    creator_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
    tagline,
    story: story || '',
    genre_id: primaryGenreId,
    work_types: work_types || [],
    color: color || '#6366f1',
    accent: accent || '#818cf8',
    sns_links: sns_links || [],
    cover_image: cover_image || null,
    status: 'available',
  };

  // genre_idsカラムが存在する場合のみ追加（マイグレーション前後の互換性）
  try {
    insertData.genre_ids = genreIdsToUse;
  } catch (e) {
    console.warn('genre_idsカラムが存在しない可能性があります:', e);
  }

  console.log('💾 データベース挿入データ:', insertData);

  const { data, error } = await supabase
    .from('factories')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('❌ データベースエラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('✅ 工房作成成功:', data);
  return NextResponse.json({ data });
}

// 工房一覧取得
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre');
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') || 'newest';
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = createClient();

  // Build query
  let query = supabase
    .from('factories')
    .select(FACTORY_SELECT_FIELDS, { count: 'exact' })
    .neq('status', 'inactive');

  // Apply genre filter
  if (genre) {
    const { data: genreData } = await supabase
      .from('genres')
      .select('id')
      .eq('slug', genre)
      .single();
    if (genreData) {
      query = query.eq('genre_id', genreData.id);
    }
  }

  // Apply status filter
  if (status) {
    query = query.eq('status', status);
  }

  // Apply sorting (優先表示プランの工房を常に上位に)
  query = query.order('is_priority', { ascending: false, nullsFirst: true });

  switch (sort) {
    case 'popular':
      // Sort by like_count first, then view_count (equal weight)
      query = query
        .order('like_count', { ascending: false, nullsFirst: false })
        .order('view_count', { ascending: false, nullsFirst: false });
      break;
    case 'random':
      // Random ordering - use created_at for now (true random requires raw SQL)
      query = query.order('created_at', { ascending: false });
      break;
    default: // 'newest'
      query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    meta: { total: count, limit, offset }
  });
}
