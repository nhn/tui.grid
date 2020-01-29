const path = require('path');

module.exports = ({ config, mode }) => {
  config.module.rules.push(
    {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          enforce: 'pre',
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
        },
        {
          loader: require.resolve('ts-loader'),
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
