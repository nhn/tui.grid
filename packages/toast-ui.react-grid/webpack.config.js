const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
  entry: './src/index.js',
  output: {
    filename: 'toastui-react-grid.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    'tui-grid': {
      commonjs: 'tui-grid',
      commonjs2: 'tui-grid',
      amd: 'tui-grid',
      root: ['tui', 'Grid']
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};

module.exports = () => {
  return config;
};
