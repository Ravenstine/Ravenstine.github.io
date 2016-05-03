
var gulp = require('gulp');
var svgSprite = require('gulp-svg-sprite');

var base = '../';

var config = {
  mode: {
    symbol: {
      dest: '',
      sprite: 'scpr-sprite.svg'
    }
  }
};

// Build an svg-sprite with svg <symbol>s out of all the svg images.
gulp.task('svg-sprite', function() {
  return gulp.src(base + './src/img/**/*.svg')
    .pipe(svgSprite(config))
    .pipe(gulp.dest(base + './public/img'))
    .pipe(gulp.dest(base + './documentation/img'));
});

gulp.task('default', function() {
  // Will perform any build tasks that require the gulp build system.
  gulp.start('svg-sprite');
});
