/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'vercel-blob.com',
      'bqbqcawlzjjtoiydkpdd.public.blob.vercel-storage.com',
      'public.blob.vercel-storage.com'
    ]
  },
  experimental: {
    scrollRestoration: true
  },
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  },
  output: 'standalone'
};

module.exports = nextConfig; 