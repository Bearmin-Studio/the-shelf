import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { id } = await params;
  const supabase = createClient();

  // Increment view count using the database function
  const { error } = await supabase.rpc('increment_view_count', {
    factory_id: id
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
