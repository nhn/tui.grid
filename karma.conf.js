'use strict';

// var istanbul = require('browserify-istanbul');
var path = require('path');

module.exports = function(config) {
    var webdriverConfig = {
        hostname: 'fe.nhnent.com',
        port: 4444,
        remoteHost: true
    };

    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        captureTimeout: 100000,
        browserDisconnectTimeout: 60000,
        browserNoActivityTimeout: 60000,

        plugins: [
            'karma-jasmine',
            'karma-webpack',
            'karma-sourcemap-loader',
            'karma-chrome-launcher',
            'karma-webdriver-launcher'
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
            {pattern: 'lib/tui-component-pagination/pagination.js', watched: false},
            {pattern: 'lib/tui-component-date-picker/date-picker.js', watched: false},
            {pattern: 'lib/tui-component-calendar/calendar.js', watched: false},

            {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false},
            {pattern: 'node_modules/jasmine-ajax/lib/mock-ajax.js', watched: false},

            {pattern: 'test/fixtures/*.html', included: false},
            {pattern: 'build/grid.css', included: false},
            {pattern: 'images/*', included: false},

            'src/js/grid.js',
            'test/js/index.js'
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/js/grid.js': ['webpack', 'sourcemap'],
            'test/js/index.js': ['webpack', 'sourcemap']
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

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'dots'
            // 'coverage',
            // 'junit'
        ],

        // optionally, configure the reporter
        coverageReporter: {
            dir: 'report/coverage/',
            reporters: [
                {
                    type: 'html',
                    subdir: function(browser) {
                        return 'report-html/' + browser;
                    }
                },
                {
                    type: 'cobertura',
                    subdir: function(browser) {
                        return 'report-cobertura/' + browser;
                    },
                    file: 'cobertura.txt'
                }
            ]
        },

        junitReporter: {
            outputDir: 'report/junit',
            suite: ''
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN ||
        // config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        autoWatchBatchDelay: 500,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'IE9',
            'IE10',
            'IE11',
            'Chrome-WebDriver'
        ],

        customLaunchers: {
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 8
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 9
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 10
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 11
            },
            'Chrome-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'chrome'
            }
        },
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
