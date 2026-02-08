'use client';
import Link from 'next/link';

export default function PrivacyPage() {
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
      <main className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'DM Sans','Zen Kaku Gothic New',sans-serif" }}>
          プライバシーポリシー
        </h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            The Shelf（以下「本サービス」）は、ユーザーの個人情報の取扱いについて、
            以下のとおりプライバシーポリシーを定めます。
          </p>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">1. 収集する情報</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              本サービスでは、以下の情報を収集することがあります。
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>メールアドレス</li>
              <li>氏名またはニックネーム</li>
              <li>プロフィール画像</li>
              <li>工房に関する情報（工房名、説明文、作品画像等）</li>
              <li>アクセスログ情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">2. 情報の利用目的</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              収集した情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>本サービスの提供・運営</li>
              <li>ユーザーからのお問い合わせへの対応</li>
              <li>本サービスの改善・新機能開発</li>
              <li>利用状況の分析</li>
              <li>不正利用の防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">3. 情報の第三者提供</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              本サービスは、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 mt-3">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">4. Cookieの使用</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              本サービスでは、ユーザー体験の向上のためにCookieを使用しています。
              Cookieはブラウザの設定により無効にすることができますが、
              一部の機能が利用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">5. セキュリティ</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              本サービスは、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために
              必要かつ適切な措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">6. 外部サービスとの連携</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              本サービスでは、Googleアカウントによるログイン機能を提供しています。
              この機能を利用する場合、Googleのプライバシーポリシーが適用されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">7. プライバシーポリシーの変更</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              本ポリシーは、必要に応じて変更されることがあります。
              変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">8. お問い合わせ</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              本ポリシーに関するお問い合わせは、
              <Link href="/contact" className="text-[var(--accent)] hover:underline">お問い合わせフォーム</Link>
              よりご連絡ください。
            </p>
          </section>

          <p className="text-sm text-[var(--text-tertiary)] pt-8 border-t border-[var(--border)]">
            制定日：2026年1月1日
          </p>
        </div>
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
