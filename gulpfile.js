'use strict';

var gulp = require('gulp');
var path = require('path');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var minifycss = require('gulp-minify-css');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var karma = require('karma').server;

var PATH_DIST = 'dist/',
    PATH_BUILD = 'build/',
    PATH_SAMPLE = 'samples/',
    FNAME_JS = 'grid.js',
    FNAME_CSS = 'grid.css';

// build
gulp.task('build-js', function() {
    return browserify('src/js/grid.js', {debug: true})
        .bundle()
        .pipe(source(FNAME_JS))
        .pipe(gulp.dest(PATH_BUILD));
});

gulp.task('build-css', function() {
    return gulp.src('src/css/index.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(sourcemaps.write())
        .pipe(rename({basename: 'grid'}))
        .pipe(gulp.dest(PATH_BUILD));
});

gulp.task('build', ['build-js', 'build-css']);

// watch - build
gulp.task('watch', ['build-js', 'build-css'], function() {
    gulp.watch('src/js/**/*', ['build-js']);
    gulp.watch('src/css/*.styl', ['build-css']);
});

// test
gulp.task('default', function() {
    karma.start({
        configFile: path.join(__dirname, 'karma.conf.local.js')
    });
});

gulp.task('test-all', function() {
    karma.start({
        configFile: path.join(__dirname, 'karma.conf.js')
    });
});

// deploy
gulp.task('deploy-js', function() {
    return browserify('src/js/grid.js')
        .bundle()
        .pipe(source(FNAME_JS))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLE + 'js'))
        .pipe(streamify(uglify()))
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLE + 'js'));
});

gulp.task('deploy-css', function() {
    return gulp.src(['src/css/index.styl'])
        .pipe(stylus())
        .pipe(sourcemaps.write())
        .pipe(rename({basename: 'grid'}))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(minifycss())
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest(PATH_DIST));
});

gulp.task('deploy-image', function() {
    return gulp.src('images/*.gif')
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLE + 'images'));
});

gulp.task('copy-sample-lib', function() {
    return gulp.src([
           'lib/jquery/jquery.min.js',
           'lib/jquery-json/src/jquery.json.js',
           'lib/underscore/underscore.js',
           'lib/backbone/backbone.js',
           'lib/ne-code-snippet/code-snippet.min.js',
           'lib/ne-component-pagination/pagination.min.js'
       ])
       .pipe(gulp.dest(PATH_SAMPLE + 'js/lib'));
});

gulp.task('deploy', ['deploy-js', 'deploy-css', 'deploy-image', 'copy-sample-lib']);
