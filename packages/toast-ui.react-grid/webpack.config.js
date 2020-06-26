const path = require('path');

const config = {
  entry: './src/index.js',
  output: {
    filename: 'toastui-react-grid.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  externals: {
    'tui-grid': {
      commonjs: 'tui-grid',
      commonjs2: 'tui-grid',
    },
    react: {
      commonjs: 'react',
      commonjs2: 'react',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};

module.exports = () => config;
