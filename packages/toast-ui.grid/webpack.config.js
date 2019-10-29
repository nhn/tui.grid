/* eslint-disable */
const path = require('path');
const package = require('./package');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const minify = process.argv.indexOf('--minify') >= 0;

const commonConfig = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    library: ['tui', 'Grid'],
    libraryTarget: 'umd',
    filename: package.name + (minify ? '.min' : '') + '.js',
    publicPath: '/dist',
    path: path.resolve(__dirname, 'dist')
  }
};
module.exports = (env, { mode = 'development' }) => {
  if (mode === 'production') {
    const { version, author, license } = package;
    const banner = [
      `TOAST UI Grid`,
      `@version ${version} | ${new Date().toDateString()}`,
      `@author ${author}`,
      `@license ${license}`
    ].join('\n');
    const productionConfig = {
      mode,
      plugins: [
        new MiniCssExtractPlugin({
          filename: package.name + (minify ? '.min' : '') + '.css'
        }),
        new webpack.BannerPlugin({ banner, entryOnly: true })
      ],
      module: {
        rules: [
          {
            test: /\.css$/,
            exclude: /node_modules/,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
          }
        ]
      },
      externals: {
        'tui-pagination': {
          commonjs: 'tui-pagination',
          commonjs2: 'tui-pagination',
          amd: 'tui-pagination',
          root: ['tui', 'Pagination']
        },
        'tui-date-picker': {
          commonjs: 'tui-date-picker',
          commonjs2: 'tui-date-picker',
          amd: 'tui-date-picker',
          root: ['tui', 'DatePicker']
        }
      },
      optimization: {
        minimize: false
      }
    };

    if (minify) {
      productionConfig.optimization = {
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // eslint-disable-line camelcase
                warnings: true
              },
              output: {
                comments: /TOAST UI Grid/i
              }
            }
          }),
          new OptimizeCSSAssetsPlugin({})
        ]
      };
    }

    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, {
    mode,
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'dist/index.html',
        template: 'index.html'
      })
    ],
    devServer: {
      inline: true,
      host: '0.0.0.0',
      port: 8000,
      disableHostCheck: true
    }
  });
};
