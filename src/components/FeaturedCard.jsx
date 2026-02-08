'use client';

export default function FeaturedCard({ factory, onSelect }) {
  if (!factory) return null;
  return (
    <button onClick={() => onSelect(factory)} className="w-full text-left grid grid-cols-1 md:grid-cols-2 bg-white border border-[var(--border)] rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 cursor-pointer min-h-[340px]">
      <div className="relative overflow-hidden flex items-center justify-center min-h-[220px] md:min-h-full"
        style={{ background: !factory.coverImage ? `linear-gradient(135deg, ${factory.color}18, ${factory.color}08)` : undefined }}>
        {factory.coverImage ? (
          <img
            src={factory.coverImage}
            alt={factory.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <span className="text-[80px] font-black opacity-10" style={{ color: factory.color, fontFamily: "'DM Sans',sans-serif" }}>{factory.name[0]}</span>
            <div className="absolute top-[12%] left-[10%] w-[100px] h-[100px] rounded-full opacity-[0.07]" style={{ background: factory.color }} />
            <div className="absolute bottom-[8%] right-[12%] w-[160px] h-[160px] rounded-full opacity-[0.05]" style={{ background: factory.accent }} />
            <div className="absolute top-[55%] left-[55%] w-[60px] h-[60px] rounded-xl opacity-[0.04] rotate-[20deg]" style={{ background: factory.color }} />
          </>
        )}
      </div>
      <div className="p-8 md:p-10 flex flex-col justify-center">
        <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5">✦ 今月の注目</span>
        <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>{factory.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          {factory.creatorAvatar ? (
            <img src={factory.creatorAvatar} alt={factory.creator} className="w-6 h-6 rounded-full object-cover border border-[var(--border)]" />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: factory.color }}>{factory.creator[0]}</div>
          )}
          <p className="text-[13px] text-[var(--text-tertiary)]">{factory.creator}</p>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{factory.tagline}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {/* 複数ジャンル対応 */}
          {Array.isArray(factory.genreNames) && factory.genreNames.length > 0 ? (
            factory.genreNames.map((name, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]">
                {name}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]">
              {factory.genre}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[var(--text-primary)] text-white text-[13px] font-semibold w-fit hover:bg-[var(--accent)] transition-colors">
          詳しく見る →
        </span>
      </div>
    </button>
  );
}
