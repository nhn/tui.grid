// Karma configuration
// Generated on Mon Aug 25 2014 20:26:51 GMT+0900 (KST)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // dependencies
            {pattern: 'libs/jquery-1.11.1.js', watched: false, served: true, included: true},
            {pattern: 'libs/underscore.js', watched: false, served: true, included: true},
            {pattern: 'libs/backbone.js', watched: false, served: true, included: true},

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

            'src/View/Renderer/*',
            'src/View/Renderer/Cell/Base.js',
            'src/View/Renderer/Cell/*',
            'src/View/Layout/*.js',
            'src/View/*.js',

            'src/AddOn/*.js',

            'src/Grid.js',
            'src/Public.js',

            // fixtures
            {pattern: 'test/fixtures/*.html', watched: true, served: true, included: false},
            {pattern: 'css/*.css', watched: true, served: true, included: false},
            {pattern: 'images/**/*', watched: true, served: true, included: false},

            // files to test
            {pattern: 'test/js/*test.js', watched: true, served: true, included: true}
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
//        reporters: ['progress', 'coverage'],
        reporters: ['dots', 'coverage'],

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
//            'PhantomJS',
            'Firefox',
            'IE',
            'Chrome'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
