import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Vercel deployment optimizations
  output: 'standalone',
  poweredByHeader: false,
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', '@supabase/supabase-js'],
  },
  
  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimize images for Vercel
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [],
    unoptimized: false,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000',
  },
  
  // API routes configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
