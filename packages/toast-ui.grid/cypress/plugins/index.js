// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/* eslint-disable @typescript-eslint/no-var-requires */
const wp = require('@cypress/webpack-preprocessor');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

// @TODO: should change the loader option
module.exports = (on) => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
          '@': path.resolve('./src'),
        },
      },
      // https://github.com/bahmutov/cypress-svelte-unit-test/issues/15
      devtool: 'cheap-module-eval-source-map',
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'toastui-select-box.css',
        }),
      ],
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
          {
            test: /\.css$/,
            exclude: /node_modules(?!\/@toast-ui\/select-box)/,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
          },
        ],
      },
    },
  };

  on('file:preprocessor', wp(options));
};
