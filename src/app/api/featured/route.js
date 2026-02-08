import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FACTORY_NESTED_SELECT } from '@/lib/supabase/queries';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const genreSlug = searchParams.get('genre');

  const supabase = createClient();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // ジャンルIDを取得
  let genreId = null;
  if (genreSlug) {
    const { data: genreData } = await supabase
      .from('genres')
      .select('id')
      .eq('slug', genreSlug)
      .single();
    if (genreData) {
      genreId = genreData.id;
    }
  }

  // まずジャンル専用の注目工房を探す
  let data = null;
  let error = null;

  if (genreId) {
    const result = await supabase
      .from('featured_factories')
      .select(`
        month,
        priority,
        genre_id,
        factory:factories!inner(${FACTORY_NESTED_SELECT})
      `)
      .eq('month', currentMonth)
      .eq('genre_id', genreId)
      .limit(1)
      .maybeSingle();

    data = result.data;
    error = result.error;
  }

  // ジャンル専用がない場合はグローバルを取得
  if (!data && !error) {
    const result = await supabase
      .from('featured_factories')
      .select(`
        month,
        priority,
        genre_id,
        factory:factories!inner(${FACTORY_NESTED_SELECT})
      `)
      .eq('month', currentMonth)
      .is('genre_id', null)
      .order('priority', { ascending: true })
      .limit(1)
      .maybeSingle();

    data = result.data;
    error = result.error;
  }

  if (error || !data) {
    // 注目工房が未設定の場合は何も表示しない
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data });
}
