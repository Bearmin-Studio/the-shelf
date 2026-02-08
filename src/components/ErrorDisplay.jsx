'use client';

export default function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="text-center py-16">
      <p className="text-[var(--text-secondary)] mb-4">{message}</p>
      <button onClick={onRetry} className="px-6 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium">
        再読み込み
      </button>
    </div>
  );
}
