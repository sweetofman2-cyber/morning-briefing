import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow fetching data from Supabase
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
