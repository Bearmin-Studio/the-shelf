import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FACTORY_SELECT_FIELDS } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!query || query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const supabase = createClient();

  // 工房名、クリエイター名、タグラインで検索
  const { data, error } = await supabase
    .from('factories')
    .select(FACTORY_SELECT_FIELDS)
    .neq('status', 'inactive')
    .or(`name.ilike.%${query}%,creator_name.ilike.%${query}%,tagline.ilike.%${query}%`)
    .order('view_count', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
