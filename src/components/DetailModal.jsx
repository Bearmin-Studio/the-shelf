'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

// SVG Icons
const Icons = {
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  heart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  heartFilled: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  link: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

export default function DetailModal({ factory, onClose, isOwner, onEdit, onLikeChange }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(factory?.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // いいね状態の取得（マウント時）
  useEffect(() => {
    if (factory?.id && user) {
      fetch(`/api/factories/${factory.id}/like`)
        .then(res => res.json())
        .then(data => setLiked(data.liked))
        .catch(err => console.error('Failed to fetch like status:', err));
    }
  }, [factory?.id, user]);

  // いいね数の初期化
  useEffect(() => {
    if (factory?.likeCount !== undefined) {
      setLikeCount(factory.likeCount);
    }
  }, [factory?.likeCount]);

  // 閲覧数をインクリメント
  useEffect(() => {
    if (factory?.id) {
      fetch(`/api/factories/${factory.id}/view`, { method: 'POST' })
        .catch(err => console.error('Failed to track view:', err));
    }
  }, [factory?.id]);

  const handleToggleLike = async () => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    setIsLiking(true);
    try {
      const method = liked ? 'DELETE' : 'POST';
      const res = await fetch(`/api/factories/${factory.id}/like`, { method });
      const data = await res.json();

      if (res.ok) {
        setLiked(!liked);
        setLikeCount(data.like_count);
        // いいね状態が変わったことを親コンポーネントに通知
        onLikeChange?.(factory.id, data.like_count);
      } else {
        console.error('Like action failed:', data.error);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  if (!factory) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-2 sm:p-8 overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-[680px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-8"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.35s ease' }}>
        <div className="relative h-[200px] sm:h-[260px] overflow-hidden flex-shrink-0"
          style={!factory.coverImage ? { background: `linear-gradient(135deg, ${factory.color}15, ${factory.color}06)` } : undefined}>
          {factory.coverImage ? (
            <img src={factory.coverImage} alt={factory.name} className="block w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[80px] sm:text-[100px] font-black opacity-[0.08]" style={{ color: factory.color, fontFamily: "'DM Sans',sans-serif" }}>{factory.name[0]}</span>
              <div className="absolute top-[15%] left-[10%] w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] rounded-full opacity-[0.06]" style={{ background: factory.color }} />
              <div className="absolute bottom-[10%] right-[15%] w-[100px] sm:w-[140px] h-[100px] sm:h-[140px] rounded-full opacity-[0.04]" style={{ background: factory.accent }} />
            </div>
          )}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2">
            {isOwner && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] shadow-md transition-colors flex-shrink-0"
              >
                {Icons.edit}
              </button>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md transition-colors flex-shrink-0">
              {Icons.close}
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-8 lg:p-10">
          <div className="flex gap-1.5 sm:gap-2 mb-3 flex-wrap items-center">
            {/* 複数ジャンル対応 - normalizeFactoryで生成されたgenreNamesを使用 */}
            {Array.isArray(factory.genreNames) && factory.genreNames.length > 0 ? (
              factory.genreNames.map((name, idx) => (
                <span key={idx} className="px-2 sm:px-2.5 py-0.5 rounded-md bg-white border border-[var(--border)] text-[10px] sm:text-[11px] font-semibold text-[var(--text-secondary)] flex-shrink-0">
                  {name}
                </span>
              ))
            ) : (
              <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-white border border-[var(--border)] text-[10px] sm:text-[11px] font-semibold text-[var(--text-secondary)] flex-shrink-0">
                {factory.genre}
              </span>
            )}
            <span className={`px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold inline-flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ${factory.status === 'available' ? 'text-[var(--success)] bg-[rgba(45,159,111,0.08)]' : 'text-[var(--busy)] bg-[rgba(212,146,10,0.08)]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${factory.status === 'available' ? 'bg-[var(--success)]' : 'bg-[var(--busy)]'}`} />
              {factory.status === 'available' ? '受付中' : '多忙'}
            </span>
            <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-gray-50 text-[10px] sm:text-[11px] font-medium text-[var(--text-tertiary)] inline-flex items-center gap-1 flex-shrink-0">
              {Icons.eye}
              <span className="whitespace-nowrap">{factory.viewCount || 0} 回閲覧</span>
            </span>
            <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-gray-50 text-[10px] sm:text-[11px] font-medium text-[var(--text-tertiary)] inline-flex items-center gap-1 flex-shrink-0">
              {Icons.heart}
              <span className="whitespace-nowrap">{likeCount} いいね</span>
            </span>
          </div>
          <h2 className="text-[20px] sm:text-[26px] font-bold mb-1 break-words" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>{factory.name}</h2>
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            {factory.creatorAvatar ? (
              <img src={factory.creatorAvatar} alt={factory.creator} className="w-6 h-6 rounded-full object-cover border border-[var(--border)] flex-shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: factory.color }}>{factory.creator?.[0]}</div>
            )}
            <p className="text-sm text-[var(--text-tertiary)] truncate">{factory.creator}</p>
          </div>
          <p className="text-[13px] sm:text-[15px] text-[var(--text-secondary)] leading-relaxed mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[var(--border)] break-words">{factory.tagline}</p>

          {factory.gallery?.length > 0 ? (
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2.5 flex-shrink-0">作品ギャラリー</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {factory.gallery.map(work => (
                  <div
                    key={work.id}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group flex-shrink-0"
                    onClick={() => {
                      if (work.external_url) {
                        window.open(work.external_url, '_blank', 'noopener,noreferrer');
                      } else if (work.image_url) {
                        setLightboxImage(work);
                      }
                    }}
                  >
                    {work.image_url ? (
                      <img src={work.image_url} alt={work.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${factory.color}15, ${factory.accent}08)` }}>
                        <span className="text-xl font-bold opacity-15" style={{ color: factory.color }}>{work.title[0]}</span>
                      </div>
                    )}
                    {work.external_url && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white flex-shrink-0">
                        {Icons.link}
                      </div>
                    )}
                    {work.image_url && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {work.external_url ? 'リンクを開く' : '拡大'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2.5 flex-shrink-0">作品ギャラリー</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[1, 2, 3].map(n => (
                  <div key={n} className="aspect-square rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${factory.color}${10 + n * 5}, ${factory.accent}08)` }}>
                    <span className="text-xl font-bold opacity-15" style={{ color: factory.color }}>{factory.name[n % factory.name.length] || factory.name[0]}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-2 text-center">まだ作品が登録されていません</p>
            </div>
          )}

          {factory.works?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2.5 flex-shrink-0">依頼可能な制作</h4>
              <div className="flex flex-wrap gap-2">
                {factory.works.map((w, idx) => <span key={idx} className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[13px] text-[var(--text-secondary)] border border-[var(--border)] flex-shrink-0 break-words">{w}</span>)}
              </div>
            </div>
          )}

          {factory.story && (
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2.5 flex-shrink-0">制作ストーリー</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed p-4 bg-[var(--bg-secondary)] rounded-r-lg border-l-[3px] border-[var(--accent)] break-words whitespace-pre-wrap">{factory.story}</p>
            </div>
          )}

          {factory.sns?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.1em] mb-2.5 flex-shrink-0">SNS</h4>
              <div className="flex flex-wrap gap-2">
                {factory.sns.map((s, i) => {
                  const snsData = typeof s === 'string' ? { platform: s, url: '#' } : s;
                  return (
                    <a
                      key={i}
                      href={snsData.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
                    >
                      <span className="truncate max-w-[150px]">{snsData.platform}</span>
                      {snsData.url && snsData.url !== '#' && <span className="flex-shrink-0">{Icons.link}</span>}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 pt-4 sm:pt-5 border-t border-[var(--border)]">
            {isOwner ? (
              <button
                onClick={onEdit}
                className="flex-1 py-3.5 rounded-xl bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors inline-flex items-center justify-center gap-2 flex-shrink-0"
              >
                {Icons.edit}
                <span className="whitespace-nowrap">工房を編集</span>
              </button>
            ) : (
              <button
                onClick={() => setShowContactModal(true)}
                disabled={!factory.sns || factory.sns.length === 0}
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${!factory.sns || factory.sns.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                  }`}
              >
                連絡する{(!factory.sns || factory.sns.length === 0) && ' (未登録)'}
              </button>
            )}
            <button
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`sm:flex-shrink-0 px-6 py-3.5 rounded-xl text-sm font-medium border transition-colors inline-flex items-center justify-center gap-2 ${liked
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex-shrink-0">{liked ? Icons.heartFilled : Icons.heart}</span>
              <span className="whitespace-nowrap">{likeCount > 0 ? likeCount : (liked ? 'いいね済み' : 'いいね')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            {Icons.close}
          </button>
          <div className="max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxImage.image_url}
              alt={lightboxImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{lightboxImage.title}</p>
              {lightboxImage.external_url && (
                <a
                  href={lightboxImage.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  リンクを開く {Icons.link}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-8"
          onClick={() => setShowContactModal(false)}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <h3 className="text-lg font-bold break-words flex-1" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
                連絡先
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors flex-shrink-0"
              >
                {Icons.close}
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[var(--text-secondary)] mb-3 break-words">
                以下のSNSから <span className="font-medium">{factory.creator}</span> さんに連絡できます
              </p>
            </div>

            {factory.sns && factory.sns.length > 0 ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {factory.sns.map((s, i) => {
                  const snsData = typeof s === 'string' ? { platform: s, url: '#' } : s;
                  const hasUrl = snsData.url && snsData.url !== '#';

                  return hasUrl ? (
                    <a
                      key={i}
                      href={snsData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--accent-light)] hover:border-[var(--accent)] border border-[var(--border)] transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent)] transition-colors flex-shrink-0">
                          <span className="text-lg">{getSNSIcon(snsData.platform)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm group-hover:text-[var(--accent)] transition-colors truncate">
                            {snsData.platform}
                          </div>
                          <div className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                            外部リンクで開く
                          </div>
                        </div>
                      </div>
                      <div className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0 ml-2">
                        {Icons.link}
                      </div>
                    </a>
                  ) : (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 opacity-50"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">{getSNSIcon(snsData.platform)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-gray-500 truncate">
                            {snsData.platform}
                          </div>
                          <div className="text-xs text-gray-400 whitespace-nowrap">
                            リンク未設定
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--text-tertiary)] mb-2">
                  SNSリンクが登録されていません
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  工房オーナーに連絡先の登録をお願いしてみてください
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// SNSプラットフォームごとのアイコンを返すヘルパー関数
function getSNSIcon(platform) {
  const p = platform?.toLowerCase() || '';

  // Twitter/X
  if (p.includes('twitter') || p.includes('x')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  // Instagram
  if (p.includes('instagram')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }

  // YouTube
  if (p.includes('youtube')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  // GitHub
  if (p.includes('github')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }

  // Discord
  if (p.includes('discord')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }

  // Note
  if (p.includes('note')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }

  // Pixiv
  if (p.includes('pixiv')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.935 0A4.924 4.924 0 0 0 0 4.935v14.13A4.924 4.924 0 0 0 4.935 24h14.13A4.924 4.924 0 0 0 24 19.065V4.935A4.924 4.924 0 0 0 19.065 0zm7.81 4.547c2.181 0 4.058.676 5.399 1.847a6.118 6.118 0 0 1 2.116 4.66c.005 1.854-.88 3.476-2.257 4.563-1.375 1.092-3.225 1.697-5.258 1.697-2.314 0-4.46-.842-5.344-1.845v5.128h-2.45V4.547h2.45v1.365c.884-1.003 3.03-1.365 5.344-1.365z" />
      </svg>
    );
  }

  // Website/Portfolio
  if (p.includes('web') || p.includes('site') || p.includes('portfolio')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }

  // Default link icon
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
