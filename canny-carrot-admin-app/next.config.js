/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude React Native components from build (they're Expo leftovers, not used in Next.js app)
  webpack: (config) => {
    // Ignore react-native imports - these components aren't used by Next.js app
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': false,
    };
    
    // Ignore files in src/components (React Native components)
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /src\/components\/.*\.(tsx?|jsx?)$/,
      use: 'ignore-loader',
    });
    
    return config;
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

module.exports = nextConfig


