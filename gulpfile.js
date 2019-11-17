var gulp = require('gulp');
var tape = require('gulp-tape');
var tapSpec = require('tap-spec');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

function spec() {
  return gulp.src(['tests/*.spec.js'])
    .pipe(tape({
      reporter: tapSpec()
    }));
};

function jscs() {
  return gulp.src(['tests/*.spec.js', 'tests/helpers/*.js', 'avrgirl-arduino.js', 'lib/*.js'], { base: "./" })
    .pipe(jscs({fix: true}))
    .pipe(gulp.dest('.'))
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
};

function lint() {
  return gulp.src(['tests/*.spec.js', 'tests/helpers/*.js', 'avrgirl-arduino.js', 'lib/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
};

exports.spec = spec;
exports.jscs = jscs;
exports.lint = lint;

var test = gulp.series(spec);

gulp.task('test', test);
