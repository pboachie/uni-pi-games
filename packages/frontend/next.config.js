const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Configure webpack to handle tsx files in plugins directory
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add aliases for directories
      'plugins': path.resolve(__dirname, '../../plugins'),
      'shared': path.resolve(__dirname, '../shared'),
    };

    // Configure module resolution for external directories
    config.module.rules.push({
      test: /\.(tsx|ts|js|jsx)$/,
      include: [
        path.resolve(__dirname, '../../plugins'),
      ],
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            'next/babel',
            '@babel/preset-typescript',
            '@babel/preset-react',
          ],
        }
      },
    });

    return config;
  },
};

module.exports = nextConfig;