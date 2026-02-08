'use client';

export default function GenreBar({ active, onChange, genres }) {
  return (
    <nav className="sticky top-[60px] z-40 backdrop-blur-xl border-b py-2.5" style={{ background: 'rgba(250,250,247,0.95)', borderColor: 'var(--border)' }}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
        <span className="text-xs font-semibold text-[var(--text-tertiary)] whitespace-nowrap mr-1 flex-shrink-0">ジャンル</span>
        {[null, ...genres].map(g => {
          const genreName = typeof g === 'object' ? g?.name : g;
          const genreSlug = typeof g === 'object' ? g?.slug : g;
          return (
            <button key={genreSlug || 'all'} onClick={() => onChange(genreSlug)}
              className={`px-3 py-1 rounded-full text-[12px] font-medium border whitespace-nowrap transition-all flex-shrink-0 ${
                active === genreSlug
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]'
              }`}>
              {genreName || 'すべて'}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
