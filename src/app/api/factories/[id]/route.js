import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FACTORY_SELECT_FIELDS } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('factories')
    .select(FACTORY_SELECT_FIELDS)
    .eq('id', id)
    .neq('status', 'inactive')
    .order('order_num', { referencedTable: 'works', ascending: true })
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Factory not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
