const siteUrl = 'https://shelf.realpg.net';

export const metadata = {
  title: '料金プラン',
  description: 'The Shelfの料金プラン。無料プラン・優先表示プラン・プレミアム支援プランの詳細をご確認いただけます。',
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: '料金プラン | The Shelf',
    description: 'The Shelfの料金プラン。無料プラン・優先表示プラン・プレミアム支援プランの詳細をご確認いただけます。',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'いつでも解約できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、いつでも解約可能です。解約後も現在の請求期間の終了までサービスをご利用いただけます。',
      },
    },
    {
      '@type': 'Question',
      name: '支払い方法は何がありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'クレジットカード（Visa、Mastercard、JCB、American Express）に対応しています。',
      },
    },
    {
      '@type': 'Question',
      name: 'プレミアムプランのWebサイト制作はどのように進みますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '申し込み後、担当者からご連絡いたします。ヒアリングを行い、あなたの工房に合ったWebサイトを制作します。プレミアムプラン利用料とは別に、Webサイト制作費用が発生します。費用は制作内容確定後にお見積もりいたします。',
      },
    },
    {
      '@type': 'Question',
      name: 'プランのアップグレード・ダウングレードはできますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、可能です。「購読の管理」からいつでも変更いただけます。',
      },
    },
  ],
};

export default function PricingLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
