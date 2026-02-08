import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://the-shelf.jp';
const siteName = 'The Shelf';
const siteDescription = '起業前のクリエイターを展示するショーケースサイト。3D・映像・デザイン・Web制作・AI作品など、挑戦する工房と出会える場所。';

export const metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName,
    title: `${siteName}`,
    description: siteDescription,
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName}`,
    description: siteDescription,
    images: ['/images/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/images/logo.png',
  },
  applicationName: siteName,
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      inLanguage: 'ja',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`,
      },
      description: siteDescription,
      sameAs: [],
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: `${siteName}`,
      description: siteDescription,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'ja',
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
