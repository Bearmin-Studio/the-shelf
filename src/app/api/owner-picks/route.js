import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FACTORY_NESTED_SELECT } from '@/lib/supabase/queries';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const genreSlug = searchParams.get('genre');

  const supabase = createClient();

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

  let query = supabase
    .from('owner_picks')
    .select(`
      id,
      comment,
      order_num,
      factory:factories!inner(${FACTORY_NESTED_SELECT})
    `)
    .eq('is_active', true)
    .order('order_num', { ascending: true });

  if (genreId) {
    query = query.eq('factory.genre_id', genreId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}
