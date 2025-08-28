const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: {
      ...defaultConfig.resolver.extraNodeModules,
      '@react-native-community/masked-view': require.resolve('@react-native-community/masked-view'),
    },
  },
  // This is a simpler middleware approach compatible with Expo
  server: {
    ...defaultConfig.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Set proper Content-Type for JavaScript bundles
        if (req.url.endsWith('.bundle') || req.url.includes('index.bundle')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        return middleware(req, res, next);
      };
    },
  },
};
