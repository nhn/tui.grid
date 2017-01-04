/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview webpack 설정파일
 */
'use strict';

/* eslint-disable vars-on-top, no-process-env, require-jsdoc */
var webpack = require('webpack');
var path = require('path');
var VERSION = require('./package.json').version;

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var isProduction = process.argv.indexOf('--production') >= 0;
var isMinified = process.argv.indexOf('--minify') >= 0;
var isCombined = process.argv.indexOf('--combine') >= 0;
var ENTRY_PATH = './src/js/grid.js';

var eslintLoader = {
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    configFile: './.eslintrc',
    loader: 'eslint'
};
var fileLoader = {
    test: /\.(png|gif)$/,
    loader: 'file-loader?name=images/[name].[ext]'
};
var stylusLoader = {
    test: /\.styl$/,
    loader: ExtractTextPlugin.extract('css-loader?sourceMap!stylus-loader?paths=src/css/')
};

var externals = {
    'jquery': '$',
    'backbone': 'Backbone',
    'underscore': '_'
};

function develop() {
    return {
        entry: ENTRY_PATH,
        output: {
            publicPath: '/dist/',
            filename: 'grid.js'
        },
        plugins: [
            new ExtractTextPlugin('grid.css')
        ],
        module: {
            preLoaders: [eslintLoader],
            loaders: [fileLoader, stylusLoader]
        },
        eslint: {
            quiet: true
        },
        externals: externals,
        devtool: '#inline-source-map',
        devServer: {
            inline: true,
            host: '0.0.0.0',
            port: 8000
        }
    };
}

function production() {
    var readableTimestamp = (new Date()).toString();
    var bannerText = 'bundle created at "' + readableTimestamp + '"\nversion: ' + VERSION;
    var pluginConfig = [];

    if (isCombined) {
        delete externals.backbone;
        delete externals.underscore;
    }
    if (isMinified) {
        pluginConfig.push(new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false},
            output: {comments: false}
        }));
    }
    pluginConfig.push(
        new webpack.BannerPlugin(bannerText, {entryOnly: true}),
        new ExtractTextPlugin('grid' + (isMinified ? '.min' : '') + '.css')
    );

    return {
        entry: ENTRY_PATH,
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'grid' + (isCombined ? '.comb' : '') + (isMinified ? '.min' : '') + '.js'
        },
        module: {
            loaders: [fileLoader, stylusLoader]
        },
        externals: externals,
        plugins: pluginConfig
    };
}

module.exports = isProduction ? production() : develop();
