'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var minifycss = require('gulp-minify-css');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var PATH_DIST = 'dist/',
    PATH_BUILD = 'build/',
    PATH_SAMPLE = 'samples/',
    FNAME_JS = 'grid.js',
    FNAME_CSS = 'grid.css';

gulp.task('build-js', function() {
    return browserify('src/js/grid.js', {debug: true})
        .bundle()
        .pipe(source(FNAME_JS))
        .pipe(gulp.dest(PATH_BUILD));
});

gulp.task('watch', ['build-js'], function() {
    gulp.watch('src/js/**/*', ['build-js']);
    console.log('watching for changes...');
});

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
    return gulp.src(['src/css/common.css', 'src/css/Grid.css'])
        .pipe(concat(FNAME_CSS))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLE + 'css'))
        .pipe(minifycss())
        .pipe(rename({extname: '.min.css'}))
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
           'lib/ne-code-snippet/code-snippet.min.js',
           'lib/ne-component-pagination/pagination.min.js'
       ])
       .pipe(gulp.dest(PATH_SAMPLE + 'js/lib'));
});

gulp.task('build', ['build-js']);

gulp.task('deploy', ['deploy-js', 'deploy-css', 'deploy-image', 'copy-sample-lib']);
