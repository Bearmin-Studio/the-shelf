'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { normalizeFactory } from '@/lib/utils/factory';

export default function Header({ onRegister, onSearch, myFactory, onShowLiked, likedCount = 0, genresMap = {} }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // クリック外で検索結果・ユーザーメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 検索実行（デバウンス）
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.data) {
          setResults(data.data.map(f => normalizeFactory(f, genresMap)));
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (factory) => {
    onSearch?.(factory);
    setQuery('');
    setShowResults(false);
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-shadow ${scrolled ? 'shadow-sm' : ''}`}
      style={{ background: 'rgba(250,250,247,0.92)', borderColor: 'var(--border)' }}>
      <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="The Shelf" className="h-8 w-auto" />
          <span className="font-bold text-base tracking-tight" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>The Shelf</span>
        </a>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div ref={searchRef} className="relative hidden sm:block">
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full px-3.5 py-1.5 focus-within:border-[var(--accent)] focus-within:bg-white focus-within:shadow-[0_0_0_3px_var(--accent-subtle)] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="工房を探す"
                className="border-none bg-transparent outline-none text-[13px] w-[140px]"
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[var(--accent)] rounded-full animate-spin" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && query.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--border)] rounded-2xl shadow-lg overflow-hidden z-50 min-w-[280px]">
                {results.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {results.map((factory) => (
                      <button
                        key={factory.id}
                        onClick={() => handleResultClick(factory)}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-3"
                      >
                        {factory.creatorAvatar ? (
                          <img
                            src={factory.creatorAvatar}
                            alt={factory.creator}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-[var(--border)]"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: factory.color }}
                          >
                            {factory.name[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{factory.name}</div>
                          <div className="text-xs text-[var(--text-tertiary)] truncate">{factory.creator}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
                    「{query}」に一致する工房はありません
                  </div>
                )}
              </div>
            )}
          </div>

          {authLoading ? (
            <div className="w-24 h-9 bg-gray-100 rounded-full animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* いいね済みボタン */}
              <button
                onClick={onShowLiked}
                className="px-4 py-2 rounded-full border border-[var(--border)] text-[13px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likedCount > 0 && <span className="text-[11px] font-bold text-pink-500">{likedCount}</span>}
              </button>
              {myFactory ? (
                <button
                  onClick={() => onSearch?.(myFactory)}
                  className="px-4 py-2 rounded-full border border-[var(--border)] text-[13px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                >
                  マイ工房
                </button>
              ) : (
                <button onClick={onRegister} className="px-5 py-2 rounded-full bg-[var(--accent)] text-white text-[13px] font-semibold hover:bg-[var(--accent-hover)] hover:-translate-y-px transition-all shadow-md">
                  工房を出す
                </button>
              )}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border border-[var(--border)]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{user.email}</p>
                    </div>
                    {myFactory && (
                      <button
                        onClick={() => { onSearch?.(myFactory); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        マイ工房を見る
                      </button>
                    )}
                    {!myFactory && (
                      <button
                        onClick={() => { onRegister?.(); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        工房を登録する
                      </button>
                    )}
                    <a
                      href="/pricing"
                      className="block w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      料金プラン
                    </a>
                    <button
                      onClick={() => { signOut(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={onRegister} className="px-5 py-2 rounded-full bg-[var(--accent)] text-white text-[13px] font-semibold hover:bg-[var(--accent-hover)] hover:-translate-y-px transition-all shadow-md">
              工房を出す
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
