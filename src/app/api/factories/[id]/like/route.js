import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Like a factory
export async function POST(request, { params }) {
  const { id } = await params;
  const supabase = createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Insert like (unique constraint prevents duplicates)
  const { data, error } = await supabase
    .from('factory_likes')
    .insert({ factory_id: id, user_id: user.id })
    .select()
    .single();

  if (error) {
    // Check if duplicate
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get updated like count
  const { data: factory } = await supabase
    .from('factories')
    .select('like_count')
    .eq('id', id)
    .single();

  return NextResponse.json({
    data,
    like_count: factory?.like_count || 0
  });
}

// Unlike a factory
export async function DELETE(request, { params }) {
  const { id } = await params;
  const supabase = createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Delete like
  const { error } = await supabase
    .from('factory_likes')
    .delete()
    .eq('factory_id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get updated like count
  const { data: factory } = await supabase
    .from('factories')
    .select('like_count')
    .eq('id', id)
    .single();

  return NextResponse.json({
    success: true,
    like_count: factory?.like_count || 0
  });
}

// Check if user has liked
export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ liked: false });
  }

  const { data } = await supabase
    .from('factory_likes')
    .select('id')
    .eq('factory_id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({ liked: !!data });
}
