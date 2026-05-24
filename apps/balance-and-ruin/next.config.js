const config = require('@ff6wc/next-config')
/** @type {import('next').NextConfig} */

module.exports = {
  ...config,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...((config.watchOptions && config.watchOptions.ignored) || []),
          '**/users.json',
          '**/presets.json',
          '**/tags.json'
        ]
      }
    }
    return config;
  }
};
