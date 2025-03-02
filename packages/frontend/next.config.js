const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Configure webpack to handle tsx files in plugins directory
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add an alias for the plugins directory
      'plugins': path.resolve(__dirname, '../../plugins'),
    };

    // Make webpack handle tsx files outside of the Next.js directory
    config.module.rules.push({
      test: /\.(tsx|ts|js|jsx)$/,
      include: [
        path.resolve(__dirname, '../../plugins'),
      ],
      use: 'babel-loader',
    });

    return config;
  },
};

module.exports = nextConfig;