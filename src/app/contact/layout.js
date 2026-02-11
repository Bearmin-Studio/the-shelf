const siteUrl = 'https://shelf.realpg.net';

export const metadata = {
  title: 'お問い合わせ',
  description: 'The Shelfへのお問い合わせフォームです。ご質問・ご要望をお気軽にお寄せください。',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'お問い合わせ | The Shelf',
    description: 'The Shelfへのお問い合わせフォームです。ご質問・ご要望をお気軽にお寄せください。',
  },
}

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'お問い合わせ | The Shelf',
  description: 'The Shelfへのお問い合わせフォームです。ご質問・ご要望をお気軽にお寄せください。',
  url: `${siteUrl}/contact`,
  mainEntity: {
    '@type': 'Organization',
    name: 'The Shelf',
    url: siteUrl,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Japanese',
    },
  },
};

export default function ContactLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
