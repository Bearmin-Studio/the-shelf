'use client';

export default function OwnerPicks({ onSelect, picks, ownerIcon, ownerName }) {
  if (!picks || picks.length === 0) return null;

  // picksをそのまま使用（いいね数の更新を反映）
  const picksData = picks;

  const displayName = ownerName || '店主';

  return (
    <section id="owner" className="bg-[var(--bg-secondary)] border-y border-[var(--border)] py-8 sm:py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          {ownerIcon ? (
            <img src={ownerIcon} alt={displayName} className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover" />
          ) : (
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-sm font-bold">
              {displayName[0]}
            </div>
          )}
          <div>
            <div className="text-[13px] sm:text-sm font-semibold">{displayName}の今月の発見</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">棚を見て回って、気になった工房をご紹介</div>
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {picksData.map(p => (
            <button key={p.factory?.id} onClick={() => onSelect(p.factory)}
              className="flex-shrink-0 w-[260px] sm:w-[300px] text-left bg-white border border-[var(--border)] rounded-2xl p-4 sm:p-5 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all cursor-pointer">
              <div className="flex items-center gap-2.5 mb-2.5">
                {p.factory?.creatorAvatar ? (
                  <img src={p.factory.creatorAvatar} alt={p.factory?.creator} className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: p.factory?.color }}>{p.factory?.name?.[0]}</div>
                )}
                <div>
                  <div className="text-sm font-bold">{p.factory?.name}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    {/* 複数ジャンル対応 - 最初の1つのみ表示 */}
                    {Array.isArray(p.factory?.genreNames) && p.factory.genreNames.length > 0
                      ? `${p.factory.genreNames[0]}${p.factory.genreNames.length > 1 ? ` +${p.factory.genreNames.length - 1}` : ''}`
                      : p.factory?.genre}
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed pl-3 border-l-2 border-[var(--accent-light)]">{p.comment}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
