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
var header = require('gulp-header');

var PATH_DIST = 'dist/',
    PATH_BUILD = 'build/',
    PATH_SAMPLE = 'samples/',
    FNAME_JS = 'grid.js',
    FNAME_CSS = 'grid.css';

var pkg = require('./package.json');
var banner = [
    '/**',
    ' * @fileoverview ${name}',
    ' * @author ${author}',
    ' * @version ${version}',
    ' * @license ${license}',
    ' * @link ${repository.url}',
    ' */',
    ''
].join('\n');

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
gulp.task('default', ['build-js', 'build-css'], function() {
    gulp.watch('src/js/**/*.js', ['build-js']);
    gulp.watch('src/css/*.styl', ['build-css']);
});

// test
gulp.task('test', function() {
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
        .pipe(streamify(header(banner, pkg)))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLE + 'js'))
        .pipe(streamify(uglify()))
        .pipe(rename({extname: '.min.js'}))
        .pipe(streamify(header(banner, pkg)))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLE + 'js'));
});

gulp.task('deploy-css', function() {
    return gulp.src('src/css/index.styl')
        .pipe(stylus())
        .pipe(sourcemaps.write())
        .pipe(rename({basename: 'grid'}))
        .pipe(streamify(header(banner, pkg)))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLE + 'css'))
        .pipe(minifycss())
        .pipe(rename({extname: '.min.css'}))
        .pipe(streamify(header(banner, pkg)))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLE + 'css'));
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
           'lib/tui-code-snippet/code-snippet.min.js',
           'lib/tui-component-pagination/pagination.min.js'
       ])
       .pipe(gulp.dest(PATH_SAMPLE + 'js/lib'));
});

gulp.task('deploy', ['deploy-js', 'deploy-css', 'deploy-image', 'copy-sample-lib']);
