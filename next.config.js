/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // API rewrites
  async rewrites() {
    return process.env.NODE_ENV === 'development' ? [] : [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/music/:path*',
        destination: 'http://localhost:3000/music/:path*',
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization security
  images: {
    domains: ['zed-legends.vercel.app'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Add voice-cache to public folder
  publicRuntimeConfig: {
    voiceCachePath: '/voice-cache',
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Experimental features
  experimental: {
    // Enable strict mode for better security
    strictNextHead: true,
  }
};

module.exports = nextConfig;