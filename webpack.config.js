/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview webpack 설정파일
 */
'use strict';

var webpack = require('webpack');
var version = require('./package.json').version;
var readableTimestamp = (new Date()).toString();
var bannerText = 'bundle created at "' + readableTimestamp + '"\nversion: ' + version;

module.exports = {
    entry: './src/js/grid.js',
    output: {
        filename: 'bundle.js'
    },
    module: {
        preLoaders: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            configFile: './.eslintrc',
            loader: 'eslint'
        }]
    },
    externals: {
        'jquery': '$',
        'backbone': 'Backbone',
        'underscore': '_'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            }
        }),
        new webpack.BannerPlugin(
            bannerText,
            {
                entryOnly: true
            }
        )
    ],
    // devtool: '#inline-source-map',
    devServer: {
        host: '0.0.0.0',
        port: 8000
    }
};
