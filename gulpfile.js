'use strict';

const gulp         = require('gulp'),
      sass         = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      browserify   = require('browserify'),
      source       = require('vinyl-source-stream'),
      babel        = require('babelify'),
      browserSync  = require('browser-sync').create(),
      cleanCSS     = require('gulp-clean-css'),
      uglify       = require('gulp-uglify'),
      del          = require('del'),
      runSequence  = require('run-sequence'),
      svgSprite    = require('gulp-svg-sprite'),
      replace      = require('gulp-replace'),
      rename       = require('gulp-rename');



//// PRODUCTION

gulp.task('build:sass', () => {
  return gulp.src('./src/styles/index.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename('scpr-style.css'))
    .pipe(gulp.dest('./dist/styles'))
    .pipe(browserSync.stream());
});

gulp.task('compile:css', () => {
  return gulp.src('./dist/styles/scpr-style.css')
    .pipe(cleanCSS({compatibility: 'ie11'}))
    .pipe(rename('scpr-style-min.css'))
    .pipe(gulp.dest('./dist/styles'))
});

gulp.task('build:js', () => {
  return browserify('./src/scripts/index.js', {debug: true, extensions: ['.js']})
    // .transform('browserify-shim')
    .transform('brfs')
    .transform('babelify', {presets: ['es2015']})
    .bundle()
    .pipe(source('index.js'))
    .pipe(rename('scpr-style.js'))
    .pipe(gulp.dest('./dist/scripts'))
});

gulp.task('compile:js', () => {
  return gulp.src('./dist/scripts/scpr-style.js')
    .pipe(uglify())
    .pipe(rename('scpr-style-min.js'))
    .pipe(gulp.dest('./dist/scripts'));
});

gulp.task('copy:images', () => {
  return gulp.src('./src/images/*')
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('build:sprite', () => {
  return gulp.src('./src/images/**/*.svg')
    .pipe(svgSprite({
      mode: {
        symbol: {
          dest: '',
          sprite: 'scpr-sprite.svg'
        }
      }
    }))
    .pipe(replace('<?xml version="1.0" encoding="utf-8"?>', '')) // this was causing problems in some browsers
    .pipe(gulp.dest('./dist/images'))
});

gulp.task('clean', () => {
  return del(['./dist/**/*']);
});


//// MASTER TASKS

gulp.task('compile', (cb) => {
  return runSequence('clean', 'build:sass', 'compile:css', 'build:js', 'compile:js', 'copy:images', 'build:sprite', cb);
});


//// SERVE DOCUMENTATION
gulp.task('serve', ['build:sass', 'build:js', 'build:sprite'], () => {
  browserSync.init({
    server: "./"
  });
  gulp.watch(['./src/styles/**/*.sass', './src/styles/**/*.scss'], ['build:sass']);
  gulp.watch('./src/scripts/*.js', ['build:js']);
  gulp.watch('./src/images/*.svg').on('change', browserSync.reload);
  gulp.watch('./documentation/*').on('change', browserSync.reload);
  gulp.watch('./index.html').on('change', browserSync.reload);
});

gulp.task('default', ['serve']);

