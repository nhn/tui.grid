// Karma configuration
// Generated on Mon Aug 25 2014 20:26:51 GMT+0900 (KST)
function setConfig(configDefault, isDev) {
    var webdriverConfig = {
        hostname: 'fe.nhnent.com',
        port: 4444,
        remoteHost: true
    };

    if (isDev) {
        //configDefault.browsers = [
        //    'Chrome'
        //];
        configDefault.browsers = [
            'IE8'
        ];
        configDefault.customLaunchers = {
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE8'
            }
        };

        //configDefault.browsers = [
        //    'Chrome-WebDriver'
        //];
        //configDefault.customLaunchers = {
        //
        //    'Chrome-WebDriver': {
        //        base: 'WebDriver',
        //        config: webdriverConfig,
        //        browserName: 'chrome'
        //    }
        //};
    } else {
        configDefault.browsers = [
            'IE8',
            'IE9',
            'IE10',
            'IE11',
            'Chrome-WebDriver',
            'Firefox-WebDriver'
        ];
        configDefault.customLaunchers = {
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE8'
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE9'
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE10'
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE11'
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
        };
    }
}
module.exports = function(config) {

    var configDefault = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        //captureTimeout: 300000,
        //browserDisconnectTimeout: 60000,
        //browserNoActivityTimeout: 60000,

        // list of files / patterns to load in the browser
        files: [
            // dependencies
            {pattern: 'lib/jquery/jquery.min.js', watched: false, served: true, included: true},
            {pattern: 'lib/jquery-json/src/jquery.json.js', watched: false, served: true, included: true},
            {pattern: 'lib/underscore/underscore.js', watched: false, served: true, included: true},
            {pattern: 'lib/backbone/backbone.js', watched: false, served: true, included: true},

            {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false, served: true, included: true},
            {pattern: 'node_modules/jasmine-ajax/lib/mock-ajax.js', watched: false, served: true, included: true},

            {pattern: 'test/js/data/*.json', watched: false, served: true, included: true},

            'src/External/*.js',

            'src/Core/*.js',
            'src/Data/*.js',

            'src/Model/Renderer.js',
            'src/Model/*',

            'src/View/Layer/Base.js',
            'src/View/Layer/*.js',

            'src/View/Layout/Frame.js',
            'src/View/Layout/*',

            'src/View/Painter/*',
            'src/View/Painter/Cell/Base.js',
            'src/View/Painter/Cell/*',
            'src/View/Layout/*.js',
            'src/View/*.js',

            'src/AddOn/*.js',

            'src/Core.js',
            'src/Grid.js',

            // fixtures
            {pattern: 'test/fixtures/*.html', watched: true, served: true, included: false},
            {pattern: 'css/*.css', watched: true, served: true, included: false},
            {pattern: 'images/**/*', watched: true, served: true, included: false},

            // files to test
            {pattern: 'test/js/*.test.js', watched: true, served: true, included: true}
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '{src,src/!(External)/**}/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
//        reporters: ['progress', 'coverage'],
        reporters: ['dots', 'coverage', 'junit'],
        junitReporter: {
            outputFile: 'report/junit-result.xml',
            suite: ''
        },
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
        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    };
    setConfig(configDefault, false);
    config.set(configDefault);
};
