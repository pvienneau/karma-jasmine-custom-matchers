var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');

gulp.task('browserify', function () {
  browserify('./lib/boot.js')
    .bundle()
    .pipe(source('boot.js'))
    .pipe(rename('index.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', [
  'browserify'
]);
