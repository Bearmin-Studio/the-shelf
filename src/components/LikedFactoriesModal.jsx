'use client';

const Icons = {
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
};

export default function LikedFactoriesModal({ factories, onClose, onSelect }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-2 sm:p-8 overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-[680px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-8"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[var(--border)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            いいね済み工房
            <span className="text-sm font-normal text-[var(--text-tertiary)]">({factories.length}件)</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors">
            {Icons.close}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {factories.length === 0 ? (
            <div className="text-center py-12">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" className="mx-auto mb-4 opacity-40">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <p className="text-[var(--text-secondary)] text-sm mb-1">まだいいねした工房がありません</p>
              <p className="text-[var(--text-tertiary)] text-xs">気になる工房を見つけたらいいねしてみましょう</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {factories.map((factory) => (
                <button
                  key={factory.id}
                  onClick={() => {
                    onSelect(factory);
                    onClose();
                  }}
                  className="w-full text-left bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-hover)] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Cover Image / Placeholder */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0"
                      style={{
                        background: !factory.coverImage ? `linear-gradient(135deg, ${factory.color}12, ${factory.color}06)` : '#f9fafb'
                      }}>
                      {factory.coverImage ? (
                        <img
                          src={factory.coverImage}
                          alt={factory.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-black opacity-[0.12]" style={{ color: factory.color, fontFamily: "'DM Sans',sans-serif" }}>{factory.name[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Factory Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {factory.creatorAvatar ? (
                          <img
                            src={factory.creatorAvatar}
                            alt={factory.creator}
                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-[var(--border)]"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: factory.color }}>{factory.creator[0]}</div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold group-hover:text-[var(--accent)] transition-colors truncate" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>{factory.name}</span>
                          {Array.isArray(factory.genreNames) && factory.genreNames.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-gray-50 text-[10px] font-semibold text-[var(--text-tertiary)]">
                              {factory.genreNames[0]}{factory.genreNames.length > 1 ? ` +${factory.genreNames.length - 1}` : ''}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-gray-50 text-[10px] font-semibold text-[var(--text-tertiary)]">{factory.genre}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">{factory.tagline}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${factory.status === 'available' ? 'text-[var(--success)] bg-[rgba(45,159,111,0.08)]' : 'text-[var(--busy)] bg-[rgba(212,146,10,0.08)]'}`}>
                          <span className={`inline-block w-1 h-1 rounded-full mr-1 ${factory.status === 'available' ? 'bg-[var(--success)]' : 'bg-[var(--busy)]'}`} />
                          {factory.status === 'available' ? '受付中' : '多忙'}
                        </span>
                        {factory.likeCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-pink-50 text-[10px] font-semibold text-pink-600 flex items-center gap-0.5">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {factory.likeCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
