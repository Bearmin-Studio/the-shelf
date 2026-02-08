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

// 今月の注目工房を取得（全ジャンル分）
export async function GET() {
  const supabase = createClient();

  const currentMonth = new Date().toISOString().slice(0, 7);

  // 全ジャンル + グローバルの注目工房を取得
  const { data, error } = await supabase
    .from('featured_factories')
    .select('id, factory_id, month, genre_id, priority')
    .eq('month', currentMonth)
    .order('priority', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // グローバル（genre_id = null）を取得
  const globalFeatured = data?.find(f => f.genre_id === null);

  // ジャンルごとのマップを作成
  const byGenre = {};
  data?.forEach(f => {
    if (f.genre_id !== null) {
      byGenre[f.genre_id] = f.factory_id;
    }
  });

  return NextResponse.json({
    data: globalFeatured || null,
    byGenre
  });
}

// 今月の注目工房を設定
export async function POST(request) {
  const supabase = createClient();

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { factory_id, genre_id = null } = body;

  if (!factory_id) {
    return NextResponse.json({ error: 'factory_id is required' }, { status: 400 });
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  // 既存のエントリを削除（同じ月・ジャンル）
  if (genre_id === null) {
    await supabase
      .from('featured_factories')
      .delete()
      .eq('month', currentMonth)
      .is('genre_id', null);
  } else {
    await supabase
      .from('featured_factories')
      .delete()
      .eq('month', currentMonth)
      .eq('genre_id', genre_id);
  }

  // 新しいエントリを作成
  const { data, error } = await supabase
    .from('featured_factories')
    .insert({
      factory_id,
      month: currentMonth,
      genre_id,
      priority: 1,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 今月の注目工房を削除
export async function DELETE(request) {
  const supabase = createClient();

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get('genre_id');

  const currentMonth = new Date().toISOString().slice(0, 7);

  let query = supabase
    .from('featured_factories')
    .delete()
    .eq('month', currentMonth);

  if (genreId === null || genreId === 'null' || genreId === undefined || genreId === '') {
    query = query.is('genre_id', null);
  } else {
    query = query.eq('genre_id', parseInt(genreId));
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
