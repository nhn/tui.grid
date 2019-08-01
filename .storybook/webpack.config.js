const path = require('path');

module.exports = ({ config, mode }) => {
  config.module.rules.push(
    {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('awesome-typescript-loader'),
          options: {
            transpileOnly: true
          }
        }
      ]
    },
    {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }
  );

  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};
