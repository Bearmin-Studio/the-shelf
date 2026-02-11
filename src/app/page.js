'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchFactories, fetchFeatured, fetchOwnerPicks, fetchGenres } from '@/lib/api/factories';
import { normalizeFactory, shuffle, buildGenresMap } from '@/lib/utils/factory';
import { useAuth } from '@/hooks/useAuth';
import { migrateLocalStorageSaves } from '@/lib/migration/migrateLocalStorageLikes';
import {
  Header,
  GenreBar,
  FeaturedCard,
  OwnerPicks,
  FactoryCard,
  DetailModal,
  AuthModal,
  FactoryFormModal,
  LoadingSkeleton,
  ErrorDisplay,
  LikedFactoriesModal,
} from '@/components';

export default function Home() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [showFactoryForm, setShowFactoryForm] = useState(false);
  const [editingFactory, setEditingFactory] = useState(null);
  const [genre, setGenre] = useState(null);
  const [sort, setSort] = useState('new');
  const [shuffledList, setShuffledList] = useState(null);
  const [myFactory, setMyFactory] = useState(null);
  const [displayCount, setDisplayCount] = useState(9); // 初期表示数
  const ITEMS_PER_PAGE = 9; // 1ページあたりの表示数
  const [likedFactories, setLikedFactories] = useState([]);
  const [showLikedModal, setShowLikedModal] = useState(false);

  // Supabaseデータ用のstate
  const [dbFactories, setDbFactories] = useState([]);
  const [dbFeatured, setDbFeatured] = useState(null);
  const [dbOwnerPicks, setDbOwnerPicks] = useState([]);
  const [dbGenres, setDbGenres] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ジャンルマップをrefで保持（全てのnormalizeFactory呼び出しで統一的に使用）
  const genresMapRef = useRef({});

  // ログインユーザーの工房を取得
  const fetchMyFactory = async () => {
    if (!user) {
      setMyFactory(null);
      return;
    }

    try {
      const res = await fetch('/api/my-factory');
      const data = await res.json();
      console.log('fetchMyFactory response:', data);
      if (data.data) {
        setMyFactory(normalizeFactory(data.data, genresMapRef.current));
      } else {
        setMyFactory(null);
      }
    } catch (err) {
      console.error('fetchMyFactory error:', err);
      setMyFactory(null);
    }
  };

  // いいね済み工房を取得
  const fetchLikedFactories = async () => {
    if (!user) {
      setLikedFactories([]);
      return;
    }

    try {
      const res = await fetch('/api/factories/liked');
      const data = await res.json();
      if (data.data) {
        setLikedFactories(data.data.map(f => normalizeFactory(f, genresMapRef.current)));
      } else {
        setLikedFactories([]);
      }
    } catch (err) {
      console.error('fetchLikedFactories error:', err);
      setLikedFactories([]);
    }
  };

  useEffect(() => {
    fetchMyFactory();
    fetchLikedFactories();
    // ログイン時に一度だけ localStorage から移行
    if (user) {
      migrateLocalStorageSaves().then(() => {
        // マイグレーション後、いいね済み工房を再取得
        fetchLikedFactories();
      });
    }
  }, [user]);

  // 「工房を出す」ボタンのハンドラー
  const handleRegisterClick = () => {
    if (!user) {
      setAuthMode('login');
    } else if (myFactory) {
      // 既に工房がある場合はマイ工房を表示
      setSelected(myFactory);
    } else {
      setShowFactoryForm(true);
    }
  };

  // サイト設定を取得
  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.data) {
        setSiteSettings(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    }
  };

  // データ取得関数
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [factoriesRes, featuredRes, picksRes, genresRes] = await Promise.all([
        fetchFactories({ sort: 'newest' }),
        fetchFeatured(),
        fetchOwnerPicks(),
        fetchGenres()
      ]);

      // ジャンルマップを作成・保持（全normalizeFactoryで統一使用）
      if (genresRes.data) {
        setDbGenres(genresRes.data);
        genresMapRef.current = buildGenresMap(genresRes.data);
      }

      if (factoriesRes.data) {
        setDbFactories(factoriesRes.data.map(f => normalizeFactory(f, genresMapRef.current)));
      }
      if (featuredRes.data?.factory) {
        setDbFeatured(normalizeFactory(featuredRes.data.factory, genresMapRef.current));
      }
      if (picksRes.data) {
        setDbOwnerPicks(picksRes.data.map(pick => ({
          ...pick,
          factory: pick.factory ? normalizeFactory(pick.factory, genresMapRef.current) : null
        })));
      }

      // サイト設定も取得
      await fetchSiteSettings();
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回データ取得
  useEffect(() => {
    loadData();
  }, []);

  // ジャンルフィルタ・ソート変更時にデータ再取得
  useEffect(() => {
    if (loading) return;

    // 表示数をリセット
    setDisplayCount(ITEMS_PER_PAGE);

    async function refetch() {
      try {
        const genreParam = genre || undefined;

        const [factoriesRes, featuredRes, picksRes] = await Promise.all([
          fetchFactories({
            genre: genreParam,
            sort: sort === 'new' ? 'newest' : sort,
          }),
          fetchFeatured({ genre: genreParam }),
          fetchOwnerPicks({ genre: genreParam }),
        ]);

        if (factoriesRes.data) {
          setDbFactories(factoriesRes.data.map(f => normalizeFactory(f, genresMapRef.current)));
        }
        if (featuredRes.data?.factory) {
          setDbFeatured(normalizeFactory(featuredRes.data.factory, genresMapRef.current));
        } else {
          setDbFeatured(null);
        }
        if (picksRes.data) {
          setDbOwnerPicks(picksRes.data.map(pick => ({
            ...pick,
            factory: pick.factory ? normalizeFactory(pick.factory, genresMapRef.current) : null
          })));
        } else {
          setDbOwnerPicks([]);
        }
      } catch (err) {
        console.error('Failed to refetch:', err);
      }
    }

    refetch();
  }, [genre, sort]);

  // ランダムソート（クライアント側でのみ実行）
  useEffect(() => {
    if (sort === 'random' && dbFactories.length > 0) {
      setShuffledList(shuffle([...dbFactories]));
    } else {
      setShuffledList(null);
    }
  }, [sort, dbFactories]);

  // 表示するfactoriesリストを決定
  const allFactories = useMemo(() => {
    if (sort === 'random' && shuffledList) return shuffledList;
    return dbFactories;
  }, [sort, shuffledList, dbFactories]);

  // 表示数を制限したリスト
  const factories = useMemo(() => {
    return allFactories.slice(0, displayCount);
  }, [allFactories, displayCount]);

  // もっと見るボタンを表示するかどうか
  const hasMore = allFactories.length > displayCount;

  // もっと見るハンドラー
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  if (error) {
    return (
      <>
        <Header
        onRegister={handleRegisterClick}
        onSearch={setSelected}
        myFactory={myFactory}
        onShowLiked={() => setShowLikedModal(true)}
        likedCount={likedFactories.length}
        genresMap={genresMapRef.current}
      />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20">
          <ErrorDisplay message={error} onRetry={loadData} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        onRegister={handleRegisterClick}
        onSearch={setSelected}
        myFactory={myFactory}
        onShowLiked={() => setShowLikedModal(true)}
        likedCount={likedFactories.length}
        genresMap={genresMapRef.current}
      />
      <GenreBar active={genre} onChange={setGenre} genres={dbGenres} />

      {/* Featured */}
      {(loading || dbFeatured) && (
        <section className="py-6 sm:py-8 max-w-[1200px] mx-auto px-4 sm:px-6" id="featured">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2.5" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" /> 今月の注目工房
            </h2>
          </div>
          {loading ? (
            <div className="h-[340px] bg-gray-100 rounded-3xl animate-pulse" />
          ) : (
            <FeaturedCard factory={dbFeatured} onSelect={setSelected} />
          )}
        </section>
      )}

      {/* Owner */}
      <OwnerPicks
        onSelect={setSelected}
        picks={dbOwnerPicks}
        ownerIcon={siteSettings.owner_icon}
        ownerName={siteSettings.owner_name}
      />

      {/* Factory List */}
      <section className="py-8 sm:py-10 max-w-[1200px] mx-auto px-4 sm:px-6" id="factories">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2.5" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" /> 工房一覧
          </h2>
        </div>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex gap-1">
            {['random','new','popular'].map(s => (
              <button key={s} onClick={() => setSort(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${sort === s ? 'text-[var(--text-primary)] bg-white border-[var(--border)] shadow-sm' : 'text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-primary)]'}`}>
                {s === 'random' ? 'おすすめ' : s === 'new' ? '新着順' : '人気順'}
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">
            {hasMore ? `${factories.length}件 / 全${allFactories.length}件` : `${allFactories.length}件の工房`}
          </span>
        </div>

        {/* The Shelf */}
        <div className="relative">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {factories.map((f, i) => <FactoryCard key={f.id} factory={f} index={i} onSelect={setSelected} />)}
            </div>
          )}
          {/* The Shelf board */}
          <div className="h-1.5 mt-4 rounded-b bg-gradient-to-b from-[#D4CBBC] via-[#BFB5A3] to-[#C8BFB0] shadow-[0_4px_8px_rgba(0,0,0,0.06)]" />
          {!loading && factories.length === 0 && (
            <div className="text-center py-16 text-[var(--text-tertiary)]">
              <p className="text-base mb-1">このジャンルの工房はまだありません</p>
              <p className="text-[13px]">最初の掲載者になりませんか？</p>
            </div>
          )}
        </div>

        {/* もっと見るボタン */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 rounded-full border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
            >
              もっと見る（残り{allFactories.length - displayCount}件）
            </button>
          </div>
        )}
      </section>

      {/* CTA */}
      {!myFactory && (
        <section className="py-8 sm:py-10 max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center py-8 px-5 sm:px-6 bg-white border border-[var(--border)] rounded-3xl relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(232,97,58,0.06)_0%,transparent_70%)] pointer-events-none" />
            <h2 className="text-lg sm:text-[1.5rem] font-bold leading-relaxed mb-3 sm:mb-4 relative" style={{ fontFamily: "'Shippori Mincho',serif" }}>
              あなたの作品を、<br />棚に並べませんか？
            </h2>
            <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] mb-5 sm:mb-6 relative">登録は無料、花を咲かせる準備をしよう。</p>
            <button onClick={handleRegisterClick}
              className="px-8 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 transition-all shadow-md relative">
              工房を出す
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 sm:py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="The Shelf" className="h-6 w-auto" />
            <span className="text-[13px] font-bold">The Shelf</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 sm:gap-5 text-[11px] sm:text-xs text-[var(--text-tertiary)]">
            <Link href="/pricing" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">料金プラン</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">利用規約</Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">お問い合わせ</Link>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)]/60">© 2026 The Shelf</p>
        </div>
      </footer>

      {/* Modals */}
      {selected && (
        <DetailModal
          factory={selected}
          onClose={() => setSelected(null)}
          isOwner={myFactory?.id === selected?.id}
          onEdit={() => {
            setEditingFactory(myFactory);
            setSelected(null);
          }}
          onLikeChange={(factoryId, newLikeCount) => {
            // 工房一覧のいいね数を即座に更新
            setDbFactories(prev => prev.map(f =>
              f.id === factoryId ? { ...f, likeCount: newLikeCount } : f
            ));
            // Featured工房のいいね数も更新
            if (dbFeatured?.id === factoryId) {
              setDbFeatured(prev => ({ ...prev, likeCount: newLikeCount }));
            }
            // Owner Picksのいいね数も更新
            setDbOwnerPicks(prev => prev.map(pick =>
              pick.factory?.id === factoryId
                ? { ...pick, factory: { ...pick.factory, likeCount: newLikeCount } }
                : pick
            ));
            // いいね済みリストを再取得
            fetchLikedFactories();
          }}
        />
      )}
      {authMode && <AuthModal onClose={() => setAuthMode(null)} />}
      {(showFactoryForm || editingFactory) && (
        <FactoryFormModal
          factory={editingFactory}
          onClose={() => {
            setShowFactoryForm(false);
            setEditingFactory(null);
          }}
          onSuccess={() => {
            loadData();
            fetchMyFactory();
          }}
        />
      )}
      {showLikedModal && (
        <LikedFactoriesModal
          factories={likedFactories}
          onClose={() => setShowLikedModal(false)}
          onSelect={setSelected}
        />
      )}
    </>
  );
}
