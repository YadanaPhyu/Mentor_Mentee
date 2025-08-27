const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo 49 web support
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  minifierPath: 'metro-minify-terser',
  // Enable web platform support
  unstable_transformProfile: 'hermes-stable',
  // Enable experimental features for web
  experimentalImportSupport: true,
};

config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'db'],
  sourceExts: [...config.resolver.sourceExts, 'mjs', 'web.js', 'web.ts', 'web.tsx'],
  platforms: [...config.resolver.platforms, 'web'],
};

// Configure the server to set proper MIME types for bundles
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Handle bundle files
      if (req.url.includes('.bundle')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      // Handle source map files
      else if (req.url.endsWith('.map')) {
        res.setHeader('Content-Type', 'application/json');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
