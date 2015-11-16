var gulp = require('gulp');
var tape = require('gulp-tape');
var tapSpec = require('tap-spec');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('spec', function() {
  return gulp.src('tests/*.spec.js')
    .pipe(tape({
      reporter: tapSpec()
    }));
});

gulp.task('jscs', ['spec'], function() {
  return gulp.src(['tests/*.spec.js', 'tests/helpers/*.js', 'avrgirl-arduino.js'], { base: "./" })
    .pipe(jscs({fix: true}))
    .pipe(gulp.dest('.'))
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
});

gulp.task('lint', ['spec', 'jscs'], function() {
  return gulp.src(['tests/*.spec.js', 'tests/helpers/*.js', 'avrgirl-arduino.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['spec', 'jscs', 'lint']);
