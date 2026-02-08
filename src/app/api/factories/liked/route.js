import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FACTORY_SELECT_FIELDS } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

// ログインユーザーがいいねした工房一覧を取得
export async function GET(request) {
  const supabase = createClient();

  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // ユーザーがいいねした工房のIDを取得
  const { data: likes, error: likesError } = await supabase
    .from('factory_likes')
    .select('factory_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (likesError) {
    return NextResponse.json({ error: likesError.message }, { status: 500 });
  }

  if (!likes || likes.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const factoryIds = likes.map(like => like.factory_id);

  // 工房の詳細情報を取得
  const { data: factories, error: factoriesError } = await supabase
    .from('factories')
    .select(FACTORY_SELECT_FIELDS)
    .in('id', factoryIds)
    .neq('status', 'inactive');

  if (factoriesError) {
    return NextResponse.json({ error: factoriesError.message }, { status: 500 });
  }

  // いいねした順番に並び替え（likes配列の順序を保持）
  const sortedFactories = factoryIds
    .map(id => factories.find(f => f.id === id))
    .filter(Boolean);

  return NextResponse.json({ data: sortedFactories });
}
