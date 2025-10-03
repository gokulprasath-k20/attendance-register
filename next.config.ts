import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Essential optimizations only
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', '@supabase/supabase-js'],
  },
  
  // Basic image optimization
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
