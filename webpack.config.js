/**
 * Configs file for bundling
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/* eslint-disable vars-on-top, no-process-env, require-jsdoc */
var pkg = require('./package.json');
var webpack = require('webpack');
var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var SafeUmdPlugin = require('safe-umd-webpack-plugin');

var isProduction = process.argv.indexOf('--production') >= 0;
var isMinified = process.argv.indexOf('--minify') >= 0;
var isCombined = process.argv.indexOf('--combine') >= 0;
var isFull = process.argv.indexOf('--full') >= 0;

var FILENAME = pkg.name;
var VERSION = pkg.version;
var ENTRY_PATH = './src/js/index.js';

var eslintLoader = {
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    configFile: './.eslintrc',
    loader: 'eslint'
};
var urlLoader = {
    test: /\.(png|gif)$/,
    loader: 'url-loader'
};
var stylusLoader = {
    test: /\.styl$/,
    loader: ExtractTextPlugin.extract('css-loader?sourceMap!stylus-loader?paths=src/css/')
};

var externals = {
    'jquery': {
        'commonjs': 'jquery',
        'commonjs2': 'jquery',
        'amd': 'jquery',
        'root': '$'
    },
    'backbone': {
        'commonjs': 'backbone',
        'commonjs2': 'backbone',
        'amd': 'backbone',
        'root': 'Backbone'
    },
    'underscore': {
        'commonjs': 'underscore',
        'commonjs2': 'underscore',
        'amd': 'underscore',
        'root': '_'
    },
    'tui-code-snippet': {
        'commonjs': 'tui-code-snippet',
        'commonjs2': 'tui-code-snippet',
        'amd': 'tui-code-snippet',
        'root': ['tui', 'util']
    },
    'tui-pagination': {
        'commonjs': 'tui-pagination',
        'commonjs2': 'tui-pagination',
        'amd': 'tui-pagination',
        'root': ['tui', 'Pagination']
    },
    'tui-date-picker': {
        'commonjs': 'tui-date-picker',
        'commonjs2': 'tui-date-picker',
        'amd': 'tui-date-picker',
        'root': ['tui', 'DatePicker']
    }
};

function develop() {
    return {
        entry: ENTRY_PATH,
        output: {
            library: ['tui', 'Grid'],
            libraryTarget: 'umd',
            path: '/dist/',
            publicPath: '/dist/',
            filename: FILENAME + '.js'
        },
        plugins: [
            new ExtractTextPlugin('grid.css')
        ],
        module: {
            preLoaders: [eslintLoader],
            loaders: [urlLoader, stylusLoader]
        },
        eslint: {
            quiet: true
        },
        externals: externals,
        devtool: '#inline-source-map',
        devServer: {
            inline: true,
            host: '0.0.0.0',
            port: 8000,
            disableHostCheck: true
        }
    };
}

function production() {
    var readableTimestamp = (new Date()).toString();
    var bannerText = 'bundle created at "' + readableTimestamp + '"\nversion: ' + VERSION;
    var pluginConfig = [];
    var extraFilename = '';

    if (isCombined) {
        delete externals.backbone;
        delete externals.underscore;
    }

    if (isFull) {
        delete externals.backbone;
        delete externals.underscore;
        delete externals.jquery;
    }

    if (isMinified) {
        pluginConfig.push(new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false},
            output: {comments: false}
        }));
    }

    pluginConfig.push(
        new SafeUmdPlugin(),
        new webpack.BannerPlugin(bannerText, {entryOnly: true}),
        new ExtractTextPlugin(FILENAME + (isMinified ? '.min' : '') + '.css')
    );

    if (isCombined) {
        extraFilename = '.comb';
    } else if (isFull) {
        extraFilename = '.full';
    }

    return {
        entry: ENTRY_PATH,
        output: {
            library: ['tui', 'Grid'],
            libraryTarget: 'umd',
            path: path.join(__dirname, 'dist'),
            filename: FILENAME + extraFilename + (isMinified ? '.min' : '') + '.js'
        },
        module: {
            loaders: [urlLoader, stylusLoader]
        },
        externals: externals,
        plugins: pluginConfig
    };
}

module.exports = isProduction ? production() : develop();
