/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['*']
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