const path = require('path');
const package = require('./package');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const commonConfig = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }

    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: package.name + '.js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist')
  }
}

module.exports = (env, { mode = 'development' }) => {
  if (mode === 'production') {
    return merge(commonConfig, {
      mode,
      optimization: {
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // eslint-disable-line camelcase
                warnings: true
              }
            }
          })
        ]
      }
    });
  }

  return merge(commonConfig, {
    mode,
    devtool: 'inline-source-map',
    devServer: {
      inline: true,
      host: '0.0.0.0',
      port: 8000,
      disableHostCheck: true
    }
  });
};
