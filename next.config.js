/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure consistent hostname and port
  hostname: '172.20.10.2',
  port: 3003,
  images: {
    domains: [
      'localhost',
      'webcamrips.com',
      'www.webcamrips.com',
      's3.amazonaws.com',
      'placehold.co',
      'ucarecdn.com',
      'gofile.io',
      '172.20.10.2',  // Your actual local IP
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    path: '/_next/image',
    loader: 'default',
  },
  // Fix webpack caching issues
  webpack: (config, { dev, isServer }) => {
    // Only apply in development mode
    if (dev) {
      // Completely disable webpack caching in dev to prevent ENOENT errors
      config.cache = false;
    }

    return config;
  },
  // Increase timeout for production builds
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
    serverComponentsExternalPackages: [],
  },
  // Enhanced configuration to handle HTTP 431 errors
  poweredByHeader: false,
  compress: true,
  // Configure response headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Request-Timeout',
            value: '300',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
          {
            key: 'Keep-Alive',
            value: 'timeout=300',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=60',
          },
        ],
      },
    ];
  },
  // Configure cookies and session handling
  serverRuntimeConfig: {
    session: {
      cookieOptions: {
        maxAge: 30 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    },
  },
}

module.exports = nextConfig 