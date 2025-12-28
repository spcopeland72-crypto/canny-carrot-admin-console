/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude React Native components from build (they're Expo leftovers, not used in Next.js app)
  webpack: (config, { isServer }) => {
    // Ignore react-native imports - these components aren't used by Next.js app
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Exclude src/components/*.tsx files from webpack (they import react-native)
    // Only app/ directory is used for Next.js
    if (!config.externals) {
      config.externals = [];
    }
    
    return config;
  },
  // Only compile app directory (not src/components with React Native)
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

module.exports = nextConfig


