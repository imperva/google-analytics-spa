const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const packagejson = require('./package.json');
const webpackBaseConfig = require('./webpack.base.config');

module.exports = (env) => {
    const webpackConfig = merge(webpackBaseConfig, {
        entry: './src/js/index.js',
        mode: 'production',
        output: {
            library: packagejson.name,
            libraryTarget: 'umd',
            path: path.join(__dirname, 'lib'),
            filename: `${filterOutScopeName(packagejson.name)}.min.js`,
        },
        optimization: {
            minimizer: [new UglifyJsPlugin({
                                               uglifyOptions: {
                                                   sourceMap: process.env.WITH_MAPS,
                                                   compress: {
                                                       drop_console: true,
                                                   },
                                               }
                                           }
            )],
        }
    });

    if (process.env.WITH_MAPS) {
        webpackConfig.devtool = 'eval-source-map';
    }

    if (process.env.ANALYZE) {
        webpackConfig.plugins.push(new BundleAnalyzerPlugin());
    }

    // for some reason the --env.production is not recognized by webpack
    webpackConfig.plugins.push(new webpack.DefinePlugin({
                                                            'process.env.NODE_ENV': JSON.stringify('production'),
                                                        }));

    console.log(`Building ${env.production ? 'production' : 'dev'}...`);

    return webpackConfig;
};

function filterOutScopeName(name) {
    return name.replace(/^@.*\//, '');
}
