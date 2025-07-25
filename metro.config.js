const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add wasm asset support for expo-sqlite web
config.resolver.assetExts.push('wasm');

// Keep existing extraNodeModules configuration
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@react-native-community/masked-view': require.resolve('@react-native-community/masked-view'),
};

// Add COEP and COOP headers to support SharedArrayBuffer for expo-sqlite web
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Set headers before any other middleware
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = config;
