'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthModal({ onClose }) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('ログインに失敗しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-[440px] bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl" onClick={e => e.stopPropagation()} style={{ animation: 'fadeInUp 0.35s ease' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-lg">✕</button>
        <h2 className="text-[20px] sm:text-[22px] font-bold mb-1.5" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
          ログイン
        </h2>
        <p className="text-[13px] sm:text-sm text-[var(--text-tertiary)] mb-5 sm:mb-6">
          工房を出すにはログインが必要です
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-white border border-[var(--border)] flex items-center justify-center gap-2.5 text-sm font-semibold hover:border-[var(--border-hover)] hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[var(--accent)] rounded-full animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Googleでログイン
            </>
          )}
        </button>
        <p className="text-xs text-[var(--text-tertiary)] text-center mt-4">
          アカウントをお持ちでない方も自動で登録されます
        </p>
      </div>
    </div>
  );
}
