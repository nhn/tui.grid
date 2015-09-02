'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var minifycss = require('gulp-minify-css');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');

var PATH_DIST = 'dist',
    PATH_SAMPLE = 'samples',
    FNAME_JS = 'grid.js',
    FNAME_CSS = 'grid.css';

gulp.task('browserify', function() {
    return browserify('src/js/grid.js')
        .bundle()
        .pipe(source(FNAME_JS))
        .pipe(gulp.dest(PATH_DIST));
});

gulp.task('uglify-js', ['browserify'], function() {
    return gulp.src(PATH_DIST + '/' + FNAME_JS)
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(PATH_DIST));
});

gulp.task('concat-css', function() {
    return gulp.src(['src/css/common.css', 'src/css/Grid.css'])
        .pipe(concat(FNAME_CSS))
        .pipe(gulp.dest(PATH_DIST));
});

gulp.task('minify-css', ['concat-css'], function() {
    return gulp.src(PATH_DIST + '/' + FNAME_CSS)
        .pipe(minifycss())
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest(PATH_DIST));
});

gulp.task('copy-images', function () {
    return gulp.src('images/*.gif')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy-sample-files', function() {
    var js = gulp.src(PATH_DIST + '/*.js')
        .pipe(gulp.dest(PATH_SAMPLE + '/js'));

    var lib = gulp.src([
            'lib/jquery/jquery.min.js',
            'lib/jquery-json/src/jquery.json.js',
            'lib/underscore/underscore.js',
            'lib/backbone/backbone.js',
            'lib/ne-code-snippet/code-snippet.min.js',
            'lib/ne-component-pagination/pagination.min.js'
        ])
        .pipe(gulp.dest(PATH_SAMPLE + '/js/lib'));

    var css = gulp.src(PATH_DIST + '/*.css')
        .pipe(gulp.dest(PATH_SAMPLE + '/css'));

    var image = gulp.src('images/*.gif')
        .pipe(gulp.dest('samples/images'));

    return merge(js, lib, css, image);
});

gulp.task('default', ['browserify']);

gulp.task('deploy', ['uglify-js', 'minify-css', 'copy-images', 'copy-sample-files']);
