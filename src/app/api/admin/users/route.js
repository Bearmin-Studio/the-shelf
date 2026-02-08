import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

export async function GET(request) {
  const supabase = createClient();

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data, error, count } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, is_admin, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, meta: { total: count, limit, offset } });
}

export async function PATCH(request) {
  const supabase = createClient();

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { id, is_admin } = body;

  if (!id || typeof is_admin !== 'boolean') {
    return NextResponse.json({ error: '必須パラメータがありません' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ is_admin })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
