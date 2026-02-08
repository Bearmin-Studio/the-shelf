'use client';

export default function FactoryCard({ factory, index, onSelect }) {
  return (
    <div onClick={() => onSelect(factory)}
      className="text-left bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer group opacity-0"
      style={{ animation: `fadeInUp 0.5s ease ${index * 80}ms forwards` }}>
      <div className="relative h-[180px] overflow-hidden"
        style={{
          background: !factory.coverImage ? `linear-gradient(135deg, ${factory.color}12, ${factory.color}06)` : '#f9fafb'
        }}>
        {factory.coverImage ? (
          <img
            src={factory.coverImage}
            alt={factory.name}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-black opacity-[0.12]" style={{ color: factory.color, fontFamily: "'DM Sans',sans-serif" }}>{factory.name[0]}</span>
            <div className="absolute rounded-full opacity-[0.08]" style={{ width: 60, height: 60, background: factory.color, top: '20%', right: '15%' }} />
            <div className="absolute rounded-full opacity-[0.08]" style={{ width: 40, height: 40, background: factory.accent, bottom: '20%', left: '20%' }} />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 複数ジャンル対応 - 最大2つまで表示 */}
            {Array.isArray(factory.genreNames) && factory.genreNames.length > 0 ? (
              <>
                {factory.genreNames.slice(0, 2).map((name, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-[var(--text-secondary)] shadow-sm">
                    {name}
                  </span>
                ))}
                {factory.genreNames.length > 2 && (
                  <span className="px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-[var(--text-tertiary)] shadow-sm">
                    +{factory.genreNames.length - 2}
                  </span>
                )}
              </>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-[var(--text-secondary)] shadow-sm">
                {factory.genre}
              </span>
            )}
            {factory.is_priority && (
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold shadow-sm flex items-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                優先
              </span>
            )}
            {factory.likeCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-pink-50/95 backdrop-blur-sm text-[11px] font-semibold text-pink-600 shadow-sm flex items-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {factory.likeCount}
              </span>
            )}
          </div>
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-sm bg-white/90 ${factory.status === 'available' ? 'text-[var(--success)]' : 'text-[var(--busy)]'}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${factory.status === 'available' ? 'bg-[var(--success)]' : 'bg-[var(--busy)]'}`} />
            {factory.status === 'available' ? '受付中' : '多忙'}
          </span>
        </div>
      </div>
      <div className="p-4 pt-3.5">
        <div className="flex items-center gap-2.5 mb-2">
          {factory.creatorAvatar ? (
            <img
              src={factory.creatorAvatar}
              alt={factory.creator}
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-[var(--border)]"
            />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: factory.color }}>{factory.creator[0]}</div>
          )}
          <div>
            <div className="text-[15px] font-bold leading-tight group-hover:text-[var(--accent)] transition-colors" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>{factory.name}</div>
            <div className="text-xs text-[var(--text-tertiary)]">{factory.creator}</div>
          </div>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">{factory.tagline}</p>
      </div>
    </div>
  );
}
