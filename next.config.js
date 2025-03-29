/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'vercel-blob.com',
      'bqbqcawlzjjtoiydkpdd.public.blob.vercel-storage.com',
      'public.blob.vercel-storage.com',
      'headcraft-images.s3.us-east-2.amazonaws.com'
    ],
    minimumCacheTTL: 60,
    formats: ['image/webp']
  },
  experimental: {
    scrollRestoration: true,
    // Disable CSS optimization due to issues with critters
    optimizeCss: false,
    optimizeServerReact: true
  },
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  },
  output: 'standalone',
  // Enforces trailing slashes for consistent URL structure
  trailingSlash: true,
  // Add more comprehensive runtime optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  }
};

module.exports = nextConfig; 