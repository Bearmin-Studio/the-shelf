'use client';
import Link from 'next/link';

export default function TermsPage() {
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
          利用規約
        </h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">第1条（適用）</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              本規約は、The Shelf（以下「本サービス」）の利用に関する条件を定めるものです。
              登録ユーザーの皆様には、本規約に従って本サービスをご利用いただきます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">第2条（利用登録）</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              本サービスにおいては、登録希望者が本規約に同意の上、所定の方法によって利用登録を申請し、
              当方がこれを承認することによって、利用登録が完了するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">第3条（禁止事項）</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの他のユーザーまたは第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
              <li>本サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>不正な目的を持って本サービスを利用する行為</li>
              <li>その他、当方が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">第4条（本サービスの提供の停止等）</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
              本サービスの全部または一部の提供を停止または中断することができるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">第5条（著作権）</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、
              画像や映像等の情報のみ、本サービスを利用して投稿または編集することができるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">第6条（免責事項）</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              当方は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。
              ユーザー間または第三者との間で紛争が生じた場合、当事者間で解決するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-[var(--text-primary)]">第7条（規約の変更）</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              当方は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
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
