'use strict';

var path = require('path');

module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        captureTimeout: 60000,
        browserDisconnectTimeout: 60000,
        browserNoActivityTimeout: 60000,

        plugins: [
            'karma-jasmine',
            'karma-webpack',
            'karma-simple-reporter',
            'karma-sourcemap-loader',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher'
        ],

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'jasmine'
        ],

        // list of files / patterns to load in the browser
        files: [
            {pattern: 'lib/jquery/jquery.js', watched: false},
            {pattern: 'lib/underscore/underscore.js', watched: false},
            {pattern: 'lib/backbone/backbone.js', watched: false},
            {pattern: 'lib/tui-code-snippet/code-snippet.js', watched: false},
            {pattern: 'lib/tui-component-pagination/dist/tui-component-pagination.js', watched: false},
            {pattern: 'lib/tui-component-date-picker/dist/tui-component-datepicker.js', watched: false},

            {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false},
            {pattern: 'node_modules/jasmine-ajax/lib/mock-ajax.js', watched: false},

            {pattern: 'test/unit/fixtures/*.html', included: false},
            {pattern: 'images/*', included: false},

            'src/js/grid.js',
            'test/unit/js/index.js'
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/js/grid.js': ['webpack', 'sourcemap'],
            'test/unit/js/index.js': ['webpack', 'sourcemap']
        },

        webpack: {
            devtool: 'inline-source-map',
            resolve: {
                root: [path.resolve('./src/js')]
            },
            module: {
                loaders: [{
                    test: /\.(png|gif)$/,
                    loader: 'file-loader?name=images/[name].[ext]'
                }, {
                    test: /\.styl$/,
                    loader: 'css-loader!stylus-loader?paths=src/css/'
                }]
            },
            externals: {
                'jquery': '$',
                'backbone': 'Backbone',
                'underscore': '_'
            }
        },

        webpackMiddleware: {
            noInfo: true
        },

        reporters: [
            'karmaSimpleReporter'
        ],

        specReporter: {
            suppressPassed: true,
            suppressSkipped: true,
            suppressErrorSummary: true
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        autoWatchBatchDelay: 500,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'PhantomJS'
        ]

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        // singleRun: true
    });
};
