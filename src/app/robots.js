export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://shelf.realpg.net/sitemap.xml',
  };
}
