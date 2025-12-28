/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignore Expo/Metro config files that aren't needed for Next.js
  webpack: (config, { isServer }) => {
    // Ignore metro.config.js and other Expo files during build
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    return config;
  },
}

module.exports = nextConfig


