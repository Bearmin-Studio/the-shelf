'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('factories');
  const [factories, setFactories] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ factories: 0, users: 0 });

  // Featured & Picks
  const [featuredFactoryId, setFeaturedFactoryId] = useState(null);
  const [featuredByGenre, setFeaturedByGenre] = useState({});
  const [genres, setGenres] = useState([]);
  const [ownerPicks, setOwnerPicks] = useState([]);
  const [newPickId, setNewPickId] = useState('');
  const [newPickComment, setNewPickComment] = useState('');

  // Site Settings
  const [ownerIcon, setOwnerIcon] = useState('');
  const [ownerName, setOwnerName] = useState('店主');

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState([]);

  // 管理者チェック
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/');
      return;
    }

    async function checkAdmin() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (!data.isAdmin) {
          router.push('/');
          return;
        }
        setIsAdmin(true);
        loadData();
      } catch {
        router.push('/');
      }
    }

    checkAdmin();
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [factoriesRes, usersRes, featuredRes, picksRes, settingsRes, genresRes] = await Promise.all([
        fetch('/api/admin/factories'),
        fetch('/api/admin/users'),
        fetch('/api/admin/featured'),
        fetch('/api/admin/owner-picks'),
        fetch('/api/admin/settings'),
        fetch('/api/genres'),
      ]);

      // Subscriptions APIを別途呼び出し（エラーがあっても他の機能に影響しない）
      let subscriptionsRes = { json: async () => ({ data: [] }) };
      try {
        subscriptionsRes = await fetch('/api/admin/subscriptions');
      } catch (e) {
        console.error('Failed to fetch subscriptions:', e);
      }

      const factoriesData = await factoriesRes.json();
      const usersData = await usersRes.json();
      const featuredData = await featuredRes.json();
      const picksData = await picksRes.json();
      const settingsData = await settingsRes.json();
      const genresData = await genresRes.json();
      let subscriptionsData = { data: [] };
      try {
        subscriptionsData = await subscriptionsRes.json();
      } catch (e) {
        console.error('Failed to parse subscriptions:', e);
      }

      if (factoriesData.data) {
        setFactories(factoriesData.data);
        setStats(prev => ({ ...prev, factories: factoriesData.meta?.total || 0 }));
      }
      if (usersData.data) {
        setUsers(usersData.data);
        setStats(prev => ({ ...prev, users: usersData.meta?.total || 0 }));
      }
      if (featuredData.data) {
        setFeaturedFactoryId(featuredData.data.factory_id);
      }
      if (featuredData.byGenre) {
        setFeaturedByGenre(featuredData.byGenre);
      }
      if (picksData.data) {
        setOwnerPicks(picksData.data);
      }
      if (settingsData.data) {
        setOwnerIcon(settingsData.data.owner_icon || '');
        setOwnerName(settingsData.data.owner_name || '店主');
      }
      if (genresData.data) {
        setGenres(genresData.data);
      }
      if (subscriptionsData.data) {
        setSubscriptions(subscriptionsData.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id, currentStatus) => {
    const newStatus = currentStatus === 'inactive' ? 'available' : 'inactive';
    try {
      await fetch('/api/admin/factories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const deleteFactory = async (id) => {
    if (!confirm('この工房を削除しますか？')) return;
    try {
      await fetch(`/api/admin/factories?id=${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const toggleAdmin = async (id, currentValue) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_admin: !currentValue }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const setFeatured = async (factoryId, genreId = null) => {
    try {
      if (factoryId) {
        await fetch('/api/admin/featured', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ factory_id: factoryId, genre_id: genreId }),
        });
      } else {
        const params = genreId !== null ? `?genre_id=${genreId}` : '';
        await fetch(`/api/admin/featured${params}`, { method: 'DELETE' });
      }

      if (genreId === null) {
        setFeaturedFactoryId(factoryId);
      } else {
        setFeaturedByGenre(prev => ({
          ...prev,
          [genreId]: factoryId || undefined
        }));
      }
    } catch (err) {
      console.error('Failed to set featured:', err);
    }
  };

  const addOwnerPick = async () => {
    if (!newPickId) return;
    try {
      await fetch('/api/admin/owner-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factory_id: newPickId, comment: newPickComment }),
      });
      setNewPickId('');
      setNewPickComment('');
      loadData();
    } catch (err) {
      console.error('Failed to add pick:', err);
    }
  };

  const removeOwnerPick = async (id) => {
    try {
      await fetch(`/api/admin/owner-picks?id=${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to remove pick:', err);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to update setting:', data.error);
        alert('設定の保存に失敗しました: ' + data.error);
      } else {
        console.log('Setting updated:', key, value);
      }
    } catch (err) {
      console.error('Failed to update setting:', err);
      alert('設定の保存に失敗しました');
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  const activeFactories = factories.filter(f => f.status !== 'inactive');

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="The Shelf" className="h-8 w-auto" />
              <span className="font-bold">The Shelf</span>
            </a>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-semibold">ADMIN</span>
          </div>
          <a href="/" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            ← サイトに戻る
          </a>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[var(--border)]">
            <div className="text-2xl font-bold text-[var(--accent)]">{stats.factories}</div>
            <div className="text-sm text-[var(--text-tertiary)]">総工房数</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[var(--border)]">
            <div className="text-2xl font-bold text-[var(--accent)]">{stats.users}</div>
            <div className="text-sm text-[var(--text-tertiary)]">総ユーザー数</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[var(--border)]">
            <div className="text-2xl font-bold text-green-500">{activeFactories.length}</div>
            <div className="text-sm text-[var(--text-tertiary)]">公開中</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[var(--border)]">
            <div className="text-2xl font-bold text-gray-400">
              {factories.filter(f => f.status === 'inactive').length}
            </div>
            <div className="text-sm text-[var(--text-tertiary)]">非公開</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'factories', label: '工房管理' },
            { id: 'featured', label: '注目工房・店主の発見' },
            { id: 'subscriptions', label: '購読管理' },
            { id: 'settings', label: '店主設定' },
            { id: 'users', label: 'ユーザー管理' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-white text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--accent)] rounded-full animate-spin mx-auto" />
          </div>
        ) : activeTab === 'factories' ? (
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">工房</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">ジャンル</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">閲覧数</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">公開</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">作成日</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">操作</th>
                </tr>
              </thead>
              <tbody>
                {factories.map(factory => (
                  <tr key={factory.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{factory.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{factory.creator_name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {factory.genre?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {factory.view_count || 0}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(factory.id, factory.status)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          factory.status !== 'inactive'
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {factory.status !== 'inactive' ? '公開中' : '非公開'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
                      {new Date(factory.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteFactory(factory.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'featured' ? (
          <div className="space-y-6">
            {/* 今月の注目工房（グローバル） */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
              <h3 className="text-lg font-bold mb-4">今月の注目工房</h3>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">
                全体の注目工房と、ジャンルごとの注目工房を設定できます。ジャンルが選択されている場合はそのジャンルの注目工房が優先されます。
              </p>

              {/* グローバル（全ジャンル共通） */}
              <div className="mb-6 pb-6 border-b border-[var(--border)]">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  全体の注目工房（デフォルト）
                </label>
                <select
                  value={featuredFactoryId || ''}
                  onChange={(e) => setFeatured(e.target.value || null, null)}
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                >
                  <option value="">選択なし</option>
                  {activeFactories.map(f => (
                    <option key={f.id} value={f.id}>{f.name} - {f.creator_name}</option>
                  ))}
                </select>
                {featuredFactoryId && (
                  <div className="mt-2 text-xs text-[var(--text-tertiary)]">
                    現在: <strong className="text-[var(--text-primary)]">{factories.find(f => f.id === featuredFactoryId)?.name}</strong>
                  </div>
                )}
              </div>

              {/* ジャンルごとの注目工房 */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-3">
                  ジャンルごとの注目工房
                </label>
                <div className="space-y-3">
                  {genres.map(genre => {
                    const genreFactories = activeFactories.filter(f => f.genre_id === genre.id);
                    const currentFeatured = featuredByGenre[genre.id];
                    return (
                      <div key={genre.id} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-[var(--text-secondary)] shrink-0">{genre.name}</span>
                        <select
                          value={currentFeatured || ''}
                          onChange={(e) => setFeatured(e.target.value || null, genre.id)}
                          className="flex-1 max-w-md px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
                        >
                          <option value="">未設定（全体の注目工房を使用）</option>
                          {genreFactories.map(f => (
                            <option key={f.id} value={f.id}>{f.name} - {f.creator_name}</option>
                          ))}
                        </select>
                        {currentFeatured && (
                          <span className="text-xs text-[var(--accent)] font-medium">設定済み</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 店主の今月の発見 */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
              <h3 className="text-lg font-bold mb-4">店主の今月の発見</h3>

              {/* 現在の選択 */}
              {ownerPicks.length > 0 && (
                <div className="mb-4 space-y-2">
                  {ownerPicks.map((pick, index) => {
                    const factory = factories.find(f => f.id === pick.factory_id);
                    return (
                      <div key={pick.id} className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl">
                        <span className="text-xs font-bold text-[var(--text-tertiary)] w-6">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{factory?.name || '不明'}</div>
                          {pick.comment && (
                            <div className="text-xs text-[var(--text-tertiary)]">{pick.comment}</div>
                          )}
                        </div>
                        <button
                          onClick={() => removeOwnerPick(pick.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          削除
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 追加フォーム */}
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    工房を追加
                  </label>
                  <select
                    value={newPickId}
                    onChange={(e) => setNewPickId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                  >
                    <option value="">選択してください</option>
                    {activeFactories
                      .filter(f => !ownerPicks.find(p => p.factory_id === f.id))
                      .map(f => (
                        <option key={f.id} value={f.id}>{f.name} - {f.creator_name}</option>
                      ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    コメント（任意）
                  </label>
                  <input
                    type="text"
                    value={newPickComment}
                    onChange={(e) => setNewPickComment(e.target.value)}
                    placeholder="例: 独自の世界観が素敵！"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                  />
                </div>
                <button
                  onClick={addOwnerPick}
                  disabled={!newPickId}
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'subscriptions' ? (
          <div className="space-y-6">
            {/* 購読統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[var(--border)]">
                <div className="text-2xl font-bold text-[var(--accent)]">
                  {subscriptions.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">アクティブな購読</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[var(--border)]">
                <div className="text-2xl font-bold text-amber-500">
                  {subscriptions.filter(s => s.plan?.slug === 'priority').length}
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">優先表示プラン</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[var(--border)]">
                <div className="text-2xl font-bold text-purple-500">
                  {subscriptions.filter(s => s.plan?.slug === 'premium').length}
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">プレミアムプラン</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[var(--border)]">
                <div className="text-2xl font-bold text-gray-400">
                  {subscriptions.filter(s => s.status === 'canceled').length}
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">解約済み</div>
              </div>
            </div>

            {/* 購読一覧 */}
            <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--border)]">
                <h3 className="font-bold">購読一覧</h3>
              </div>
              {subscriptions.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-tertiary)]">
                  まだ購読がありません
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">ユーザー</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">工房</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">プラン</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">ステータス</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">期間</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">開始日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(sub => (
                      <tr key={sub.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)]">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">{sub.user?.name || sub.user?.email}</div>
                          <div className="text-xs text-[var(--text-tertiary)]">{sub.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                          {sub.factory?.name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            sub.plan?.slug === 'premium'
                              ? 'bg-purple-100 text-purple-600'
                              : sub.plan?.slug === 'priority'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {sub.plan?.name || '不明'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            sub.status === 'active'
                              ? 'bg-green-100 text-green-600'
                              : sub.status === 'past_due'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {sub.status === 'active' ? '有効'
                              : sub.status === 'past_due' ? '支払い遅延'
                              : sub.status === 'canceled' ? '解約済み'
                              : sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
                          {sub.current_period_end
                            ? `〜${new Date(sub.current_period_end).toLocaleDateString('ja-JP')}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
                          {new Date(sub.created_at).toLocaleDateString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
            <h3 className="text-lg font-bold mb-4">店主設定</h3>

            <div className="space-y-6">
              {/* 店主名 */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  店主の名前
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  onBlur={() => updateSetting('owner_name', ownerName)}
                  placeholder="店主"
                  className="w-full max-w-md px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm"
                />
              </div>

              {/* 店主アイコン */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  店主のアイコン
                </label>
                <div className="flex items-start gap-4">
                  {ownerIcon && (
                    <img
                      src={ownerIcon}
                      alt="店主アイコン"
                      className="w-20 h-20 rounded-full object-cover border-2 border-[var(--border)]"
                    />
                  )}
                  <div className="flex-1 max-w-md">
                    <ImageUpload
                      value={ownerIcon}
                      onChange={(url) => {
                        setOwnerIcon(url);
                        updateSetting('owner_icon', url);
                      }}
                      type="owner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">ユーザー</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">メール</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">登録日</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)]">管理者</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">
                            {u.name?.[0] || u.email?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium">{u.name || 'No name'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{u.email}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
                      {new Date(u.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAdmin(u.id, u.is_admin)}
                        className={`text-xs px-3 py-1 rounded-full ${
                          u.is_admin
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {u.is_admin ? '管理者' : '一般'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
