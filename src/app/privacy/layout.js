const siteUrl = 'https://shelf.realpg.net';

export const metadata = {
  title: 'プライバシーポリシー',
  description: 'The Shelfのプライバシーポリシーです。個人情報の取り扱いについてご確認いただけます。',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'プライバシーポリシー | The Shelf',
    description: 'The Shelfのプライバシーポリシーです。個人情報の取り扱いについてご確認いただけます。',
  },
}

export default function PrivacyLayout({ children }) {
  return children;
}
