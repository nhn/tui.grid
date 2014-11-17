// Karma configuration
// Generated on Mon Aug 25 2014 20:26:51 GMT+0900 (KST)

module.exports = function(config) {
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
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // dependencies
            {pattern: 'lib/jquery/jquery.min.js', watched: false, served: true, included: true},
            {pattern: 'lib/jquery-json/src/jquery.json.js', watched: false, served: true, included: true},
            {pattern: 'lib/underscore/underscore.js', watched: false, served: true, included: true},
            {pattern: 'lib/backbone/backbone.js', watched: false, served: true, included: true},

            {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false, served: true, included: true},

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

            'src/Grid.js',
            'src/Grid.Public.js',

            // fixtures
            {pattern: 'test/fixtures/*.html', watched: true, served: true, included: false},
            {pattern: 'css/*.css', watched: true, served: true, included: false},
            {pattern: 'images/**/*', watched: true, served: true, included: false},

            // files to test
            {pattern: 'test/js/*.test.js', watched: true, served: true, included: true}
//            {pattern: 'test/js/model.renderer.test.js', watched: true, served: true, included: true}
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.js': ['coverage']

//            'src/**/*.js': ['coverage']
//            'src/Data/*.js': ['coverage'],
//            'src/Model/*.js': ['coverage'],
//            'src/View/*.js': ['coverage'],
//            'src/View/**/*.js': ['coverage'],
//            'src/View/**/**/*.js': ['coverage'],
//            'src/AddOn/*.js': ['coverage'],
//            'src/*.js': ['coverage']
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
            type: 'html',
            dir: 'report/coverage/'
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
        browsers: [
            'Chrome',
            'IE'
        ],
        _browsers: [
            'IE7',
            'IE8',
            'IE9',
            'IE10',
            'IE11',
            'Chrome-WebDriver',
            'Firefox-WebDriver'
        ],
        _customLaunchers: {
            'IE7': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'IE7'
            },
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
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
