const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Add any module that needs to be transpiled here
        ],
      },
    },
    argv
  );

  // Customize the config before returning it
  if (config.devServer) {
    // Configure the dev server to set proper MIME types
    config.devServer.headers = {
      ...(config.devServer.headers || {}),
      'Access-Control-Allow-Origin': '*',
    };
    
    // Add MIME type handling through static options
    config.devServer.static = {
      ...(config.devServer.static || {}),
      mime: {
        'application/javascript': ['js', 'jsx', 'ts', 'tsx', 'bundle'],
      }
    };
    
    // Add before setup hook for MIME type handling
    const originalBefore = config.devServer.onBeforeSetupMiddleware;
    config.devServer.onBeforeSetupMiddleware = (devServer) => {
      if (originalBefore) {
        originalBefore(devServer);
      }
      
      devServer.app.use((req, res, next) => {
        if (req.url.endsWith('.bundle') || req.url.includes('index.bundle')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        next();
      });
    };
  }

  return config;
};
