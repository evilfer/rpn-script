var path = require('path'),
    gulp = require('gulp'),
    webpack = require('webpack'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    babel = require('gulp-babel');

var babelQuery = {
    presets: ['es2015'],
    plugins: [
        'transform-flow-strip-types',
        'transform-decorators-legacy',
        'transform-class-properties'
    ]
};

var jsTaskGen = function (mode) {
    var isProd = mode === 'prod',
        doWatch = mode === 'watch',
        output = './build/' + (isProd ? 'prod' : 'dev') + '/js/',
        plugins = isProd ?
            [
                new webpack.DefinePlugin({
                    'process.env': {'NODE_ENV': JSON.stringify('production')},
                    'process.env.NODE_ENV': '"production"'
                }),
                new webpack.optimize.UglifyJsPlugin({minimize: true})
            ] :
            [
                new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify('development')}}),
            ];

    return function () {
        // run webpack
        return webpack({
            entry: {
                app: './src/app.js'
            },
            watch: doWatch,
            plugins: plugins,
            output: {
                path: path.join(__dirname, output),
                filename: '[name].js'
            },
            devtool: !isProd && '#inline-source-map',
            module: {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        loader: 'babel-loader',
                        exclude: /node_modules/,
                        query: babelQuery
                    },
                    {test: /\.json$/, loader: 'json-loader'}
                ]
            }
        }, function (err, stats) {
            if (err) throw new gutil.PluginError('webpack', err);
            gutil.log('[webpack]', stats.toString({chunks: false}));
        });
    };
};


gulp.task('js-watch', jsTaskGen('watch'));
gulp.task('js-dev', jsTaskGen('dev'));
gulp.task('js-prod', jsTaskGen('prod'));
