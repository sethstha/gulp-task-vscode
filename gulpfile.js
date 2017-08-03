'use strict';

var gulp            = require( 'gulp' );
var browserSync     = require('browser-sync').create();
var sass            = require( 'gulp-sass' );
var zip             = require( 'gulp-zip' );
var uglify          = require( 'gulp-uglify' );
var rename          = require( 'gulp-rename' );
var autoprefixer    = require('autoprefixer');
var postcss         = require( 'gulp-postcss' );
var image           = require( 'gulp-image' );
var wpPot           = require( 'gulp-wp-pot' );
var rimraf          = require( 'gulp-rimraf' );
// Define paths
var paths = {
    styles: {
        src: './assets/sass/**/*.scss',
        dest: './'
    },
    js: {
        src: './assets/js/*.js',
        dest: './assets/js/'
    },
    php: {
        src: [ './*.php', './inc/*.php', 'C:/xampp/htdocs/suffice/wp-content/plugins/suffice-toolkit/templates/*.php' ]
    },
    uglify: {
        src: [
            './assets/js/countUp.js',
            './assets/js/jQuery.headroom.js',
            './assets/js/jquery.visible.js',
            './assets/js/suffice-custom.js'
        ],
        dest: './assets/js/'
    },
    img: {
        src: [
            './assets/img/dev/*'
        ],
        dest: './assets/img'
    }
};

// Start browserSync
function browserSyncStart( cb ) {
    browserSync.init({
        proxy: 'localhost/suffice'
    }, cb);
}

// Reloads the browser
function browserSyncReload( cb ) {
    browserSync.reload();
    cb();
}

// Compiles SASS into CSS
function sassCompile() {
    return gulp.src( paths.styles.src )
        .pipe( sass({
            indentType: 'tab',
            indentWidth: 1,
            outputStyle: 'expanded'
        } ).on( 'error', sass.logError) )
        .pipe( gulp.dest( paths.styles.dest ) )
        .pipe( browserSync.stream() );
}

// postcss for better css
function postCSSfile() {
     var plugins = [
        autoprefixer({ browsers: ['last 4 version', '> 10%', '> 5% in US', 'ie 8', 'ie 7']})
    ];

    return gulp.src( './style.css' )
        .pipe( postcss( plugins ) )
        .pipe( rename({ suffix: '.dist' }))
        .pipe( gulp.dest( './' ) );
}

// Creates Zip file of theme
function createZip() {
    return gulp.src( ['**', '!.*', '!*.zip', '!.*/**', '!gulpfile.js', '!project.ruleset.xml', '!package.json', '!node_modules', '!node_modules/**', '!assets/sass', '!assets/sass/**'] )
        .pipe( zip( 'suffice.zip' ) )
        .pipe( gulp.dest( './' ) );
}

// minify image files
function minifyImg() {
    return gulp.src( paths.img.src )
        .pipe( image({
            zopflipng: false
        }) )
        .pipe( gulp.dest( paths.img.dest ) );
}

// Minifies the js files
function minifyJs() {
    return gulp.src( paths.uglify.src )
        .pipe( uglify() )
        .pipe( rename({ suffix: '.min' }))
        .pipe( gulp.dest( paths.uglify.dest ));
}

// Makes translation file
function makepotfile() {
    return gulp.src( '**/*.php' )
    .pipe( wpPot( {
        domain: 'suffice',
        package: 'Suffice',
        bugReport: 'themegrill@gmail.com',
        team: 'ThemeGrill <themegrill@gmail.com'
    } ) )
    .pipe( gulp.dest( 'languages/suffice.pot' ) );
}

// Watch for file changes
function watch() {
    gulp.watch( paths.styles.src, sassCompile );
    gulp.watch( [paths.js.src, paths.php.src], browserSyncReload );
}

function deleteCSS() {
    return gulp.src('./style.dist.css', { read: false })
        .pipe(rimraf());
}

function renameCSS() {
    return gulp.src('./style.dist.css')
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./'));
}

// define series of tasks
var server = gulp.series( browserSyncStart, watch );
var build = gulp.series( sassCompile, postCSSfile, makepotfile, minifyImg, minifyJs, renameCSS, deleteCSS, createZip );
// define tasks
exports.browserSyncStart = browserSyncStart;
exports.browserSyncReload = browserSyncReload;
exports.sassCompile = sassCompile;
exports.postCSSfile = postCSSfile;
exports.createZip = createZip;
exports.minifyImg = minifyImg;
exports.minifyJs = minifyJs;
exports.makepotfile = makepotfile;
exports.watch = watch;
exports.server = server;
exports.build = build;
exports.deleteCSS = deleteCSS;
exports.renameCSS = renameCSS;
