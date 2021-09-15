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
const path = require('path');
const package = require('../../package');

const minify = process.argv.indexOf('--minify') >= 0;

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
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    },
  };

  on('file:preprocessor', wp(options));
};
