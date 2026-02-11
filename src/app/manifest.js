export default function manifest() {
  return {
    name: 'The Shelf',
    short_name: 'The Shelf',
    description:
      '起業前のクリエイターを展示するショーケースサイト。3D・映像・デザイン・Web制作・AI作品など、挑戦する工房と出会える場所。',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF7',
    theme_color: '#E891A3',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
