/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' を削除 - SSRとAPIルートを有効化
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}
module.exports = nextConfig
