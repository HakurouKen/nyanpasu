var gulp = require('gulp'),
	compass = require('gulp-compass'),
	uglify = require('gulp-uglify'),
	minifyCSS = require('gulp-minify-css');

gulp.task('styles', function() {
	gulp.src('./static/sass/*.scss')
		.pipe(compass({
			config_file: 'static/config.rb',
			css: 'public/stylesheets',
			sass: 'static/sass'
		}))
});

gulp.task('scripts', function() {
	gulp.src('./static/javascript/*.js')
		.pipe(gulp.dest('./public/javascripts/'));
});

function jsUglify(){
	return gulp.src('./static/javascript/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('./public/javascripts/'));
}

function cssMinify(){
	return gulp.src('./static/sass/*.scss')
		.pipe(compass({
			config_file: 'static/config.rb',
			css: 'public/stylesheets',
			sass: 'static/sass'
		}))
		.pipe(minifyCSS())
		.pipe(gulp.dest('./public/stylesheets/'));
}

gulp.task('release', function(){
	jsUglify();
	cssMinify();
})

gulp.task('default', function() {
	gulp.watch('./static/sass/*.scss', ['styles']);
	gulp.watch('./static/javascripts/*.js', ['scripts'])
});