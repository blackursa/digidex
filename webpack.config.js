const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@react-navigation']
    }
  }, argv);

  // Force the extension to be .js for all files
  config.output.filename = 'static/js/[name].js';
  config.output.chunkFilename = 'static/js/[name].js';

  return config;
};
