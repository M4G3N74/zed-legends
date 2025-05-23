/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  appDir: false, // Explicitly disable App Router
  // Add rewrites to proxy API requests to the Node.js server
  async rewrites() {
    return [
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
};

module.exports = nextConfig;
