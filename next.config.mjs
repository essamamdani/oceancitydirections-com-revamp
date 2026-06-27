import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  output: 'standalone',
  images: {
    localPatterns: [
      // Allow /api/og with any query string (dynamic OG placeholder images for businesses)
      { pathname: '/api/og' },
      // Allow all other local static assets (no query string needed)
      { pathname: '/**', search: '' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdnlogos.realtydirections.com' },
      { protocol: 'https', hostname: 'cdn.realtydirections.com' },
      { protocol: 'https', hostname: 'www.realtydirections.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      // MLS listing photos come from various provider CDNs (http and https)
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    formats: ['image/webp'],
    qualities: [75],
    minimumCacheTTL: 2678400, // 31 days
  },
  // Fix workspace root detection
  outputFileTracingRoot: __dirname,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  async redirects() {
    return [
      {
        source: '/businesses',
        destination: '/business',
        permanent: true,
      },
      {
        source: '/businesses/:path*',
        destination: '/business/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Vary',
            value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
