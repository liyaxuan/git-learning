var gulp=require("gulp");
var del=require("del");
var less=require("gulp-less");
var mincss=require("gulp-minify-css");
var minjs=require("gulp-uglify");
var concat=require("gulp-concat");
var rename=require("gulp-rename");
var sequence=require("gulp-sequence");

var libcss=[
	"lib/simditor/css/*.css"
];

var unminedlibjs=[
	"lib/jquery/jquery.cookie.js",
	"lib/simditor/js/*.js",
	"lib/md5/md5.js"
];

var minedlibjs=[
	"lib/angular/*.js",
	"lib/jquery/jquery.min.js",
	"lib/plupload/*.js"
];

gulp.task("css_1", function () {
	return gulp.src(libcss)
	.pipe(concat("lib.temp.css"))
	.pipe(gulp.dest("../pub/src/css"));	
});

gulp.task("css_2", function () {
	return gulp.src(["src/css/*.css"])
	.pipe(mincss())
	.pipe(concat("admin.temp.css"))
	.pipe(gulp.dest("../pub/src/css"));
});

gulp.task("css_3", function () {
	return gulp.src(["../pub/src/css/*.temp.css"])
	.pipe(concat("admin.min.css"))
	.pipe(gulp.dest("../pub/src/css"));
});

gulp.task("css_4", function () {
	del(["../pub/src/css/*.temp.css"], { force: true });
});

gulp.task("css", sequence(["css_1", "css_2"], "css_3", "css_4"));

gulp.task("js", function () {
	gulp.src(["src/js/*.js"])
	.pipe(concat("admin.min.js"))
	.pipe(gulp.dest("../pub/src/js"));
});

gulp.task("html", function () {
	gulp.src(["src/page/*.html"]).pipe(gulp.dest("../pub/src/page"));
	gulp.src(["src/template/*.html"]).pipe(gulp.dest("../pub/src/template"));
});

gulp.task("resource", function () {
	gulp.src(["res/*"]).pipe(gulp.dest("../pub/res"));
});

gulp.task("default", ["css", "js", "html", "resource"]);