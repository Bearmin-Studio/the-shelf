const siteUrl = 'https://shelf.realpg.net';

export const metadata = {
  title: '利用規約',
  description: 'The Shelfの利用規約です。サービスのご利用前にご確認ください。',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: '利用規約 | The Shelf',
    description: 'The Shelfの利用規約です。サービスのご利用前にご確認ください。',
  },
}

export default function TermsLayout({ children }) {
  return children;
}
