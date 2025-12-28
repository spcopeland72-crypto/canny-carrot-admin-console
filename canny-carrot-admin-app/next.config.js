/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude React Native components from build (they're Expo leftovers, not used in Next.js app)
  webpack: (config, { webpack }) => {
    // Ignore react-native imports - these components aren't used by Next.js app
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': false,
    };
    
    // Use IgnorePlugin to prevent webpack from processing react-native
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^react-native$/,
      })
    );
    
    return config;
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

module.exports = nextConfig


