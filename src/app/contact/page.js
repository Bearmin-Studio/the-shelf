'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('https://ssgform.com/s/C42OlTZW4cAJ', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('送信に失敗しました');
      }

      setSubmitted(true);
    } catch (err) {
      setError('送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b"
          style={{ background: 'rgba(250,250,247,0.92)', borderColor: 'var(--border)' }}>
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[60px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/images/logo.png" alt="The Shelf" className="h-8 w-auto" />
              <span className="font-bold text-base tracking-tight" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>The Shelf</span>
            </Link>
          </div>
        </header>

        <main className="max-w-[600px] mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
            送信完了
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            お問い合わせいただきありがとうございます。<br />
            内容を確認の上、ご連絡させていただきます。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
          >
            トップページに戻る
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ background: 'rgba(250,250,247,0.92)', borderColor: 'var(--border)' }}>
        <div className="max-w-[800px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="The Shelf" className="h-8 w-auto" />
            <span className="font-bold text-base tracking-tight" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>The Shelf</span>
          </Link>
          <Link href="/" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            ← トップに戻る
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[600px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
          お問い合わせ
        </h1>
        <p className="text-[13px] sm:text-base text-[var(--text-secondary)] mb-6 sm:mb-8">
          ご質問・ご要望がございましたら、<br className="sm:hidden" />下記フォームよりお気軽にお問い合わせください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="山田 太郎"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              お問い合わせ種別 <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm bg-white"
            >
              <option value="">選択してください</option>
              <option value="general">一般的なお問い合わせ</option>
              <option value="bug">不具合の報告</option>
              <option value="feature">機能の要望</option>
              <option value="factory">工房に関するお問い合わせ</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
              お問い合わせ内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="お問い合わせ内容をご記入ください"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] outline-none transition-all text-sm resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-all"
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
          </div>

          <p className="text-xs text-[var(--text-tertiary)] text-center">
            送信することで、
            <Link href="/privacy" className="text-[var(--accent)] hover:underline">プライバシーポリシー</Link>
            に同意したものとみなします。
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 mt-12">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <p className="text-[11px] text-[var(--text-tertiary)]/60">© 2026 The Shelf</p>
        </div>
      </footer>
    </div>
  );
}
