const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
  entry: './src/index.js',
  output: {
    filename: 'toastui-react-grid.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'toastui',
    libraryTarget: 'umd'
  },
  // externals: {
  //   'tui-grid': {
  //     commonjs: 'tui-grid',
  //     commonjs2: 'tui-grid',
  //     amd: 'tui-grid',
  //     root: ['tui', 'Grid']
  //   }
  // },
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
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};

module.exports = (env, options = {}) => {
  if (options.mode === 'development') {
    config.plugins = [
      new HtmlWebpackPlugin({
        template: 'public/index.html'
      })
    ];
  }

  return config;
};
