var istanbul = require('browserify-istanbul');

module.exports = function(config) {
    'use strict';

    var webdriverConfig = {
        hostname: 'fe.nhnent.com',
        port: 4444,
        remoteHost: true
    };

    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['source-map-support', 'browserify', 'jasmine-jquery', 'jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'lib/jquery/jquery.js',
            'lib/jquery-json/src/jquery.json.js',
            'lib/underscore/underscore.js',
            'lib/backbone/backbone.js',
            'lib/ne-code-snippet/code-snippet.js',
            'lib/ne-component-pagination/pagination.js',

            {pattern: 'src/js/**/*.js', watched: true, include: true, served: true},
            // {pattern: 'test/**/*.test.js', watched: false, include: true, served: true},
            'test/js/view.cellfactory.test.js',

            {pattern: 'test/fixtures/*.html', included: false},
            {pattern: 'src/css/*.css', included: false},
            {pattern: 'images/*', included: false}
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/js/**/*.js': ['browserify'],
            'test/**/*.test.js': ['browserify']
        },

        browserify: {
            debug: true
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'dots',
            'coverage',
            'junit'
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
            outputFile: 'report/junit-result.xml',
            suite: ''
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        autoWatchBatchDelay: 500,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            // 'IE7'
            // 'IE8'
            'IE9'
            // 'IE10',
            // 'IE11',
            // 'Chrome-WebDriver',
            // 'Firefox-WebDriver'
        ],

        client: {
            useIframe: true
        },

        customLaunchers: {
            'IE7': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 7
            },
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
            },
            'Firefox-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'firefox'
            }
        },
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
