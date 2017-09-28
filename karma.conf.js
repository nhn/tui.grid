/**
 * Config file for testing
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var path = require('path');
var webdriverConfig = {
    hostname: 'fe.nhnent.com',
    port: 4444,
    remoteHost: true
};

/**
 * Set config by environment
 * @param {object} defaultConfig - default config
 * @param {string} server - server type ('ne' or local)
 */
function setConfig(defaultConfig, server) {
    if (server === 'ne') {
        defaultConfig.captureTimeout = 100000;

        defaultConfig.customLaunchers = {
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '8'
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '9'
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '10'
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '11'
            },
            'Edge': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'MicrosoftEdge'
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
            },
            'Safari-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'safari'
            }
        };

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        defaultConfig.browsers = [
            'IE8',
            'IE9',
            'IE10',
            'IE11',
            'Edge',
            'Chrome-WebDriver',
            'Firefox-WebDriver'
            // 'Safari-WebDriver' // active only when safari test is needed
        ];

        defaultConfig.webpack.module.preLoaders = [{
            test: /\.js$/,
            include: path.resolve('./src/js'),
            loader: 'istanbul-instrumenter'
        }];

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        defaultConfig.reporters = [
            'dots',
            'coverage',
            'junit'
        ];

        // optionally, configure the reporter
        defaultConfig.coverageReporter = {
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
        };

        defaultConfig.junitReporter = {
            outputDir: 'report/junit',
            suite: ''
        };
    } else {
        defaultConfig.captureTimeout = 60000;

        defaultConfig.reporters = [
            'karmaSimpleReporter'
        ];

        defaultConfig.specReporter = {
            suppressPassed: true,
            suppressSkipped: true,
            suppressErrorSummary: true
        };

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        defaultConfig.browsers = [
            'ChromeHeadless'
        ];
    }
}

module.exports = function(config) {
    var defaultConfig = {
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        browserDisconnectTimeout: 60000,
        browserNoActivityTimeout: 60000,

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'jquery-1.8.3',
            'jasmine-ajax',
            'jasmine',
            'es5-shim' // for ie8
        ],

        // list of files / patterns to load in the browser
        files: [
            // reason for not using karma-jasmine-jquery framework is that including older jasmine-karma file
            // included jasmine-karma version is 2.0.5 and this version don't support ie8
            {
                pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
                watched: false
            },
            {
                pattern: 'test/unit/fixtures/*.html',
                included: false
            },
            {
                pattern: 'images/*',
                included: false
            },

            'test/unit/js/index.js'
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
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
            }
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
        // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        autoWatchBatchDelay: 500,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    };

    /* eslint-disable */
    setConfig(defaultConfig, process.env.KARMA_SERVER);

    config.set(defaultConfig);
};
