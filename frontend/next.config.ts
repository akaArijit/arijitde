import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    const backendUrl =
      process.env.API_URL ||
      process.env.NEXT_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/+$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
