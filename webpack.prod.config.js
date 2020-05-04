const path = require('path');
const merge = require('webpack-merge');
const WebpackMonitor = require('webpack-monitor');
const TerserPlugin = require('terser-webpack-plugin');
const packagejson = require('./package.json');
const webpackBaseConfig = require('./webpack.base.config');


console.log('\x1b[36m%s\x1b[0m', 'Running production build...');

const webpackConfig = (env, args) => {
    const webpackConfig = merge(webpackBaseConfig(env),
                                {
                                    entry: './src/js/index.js',
                                    mode: 'production',
                                    performance: {
                                        hints: 'warning'
                                    },
                                    stats: {
                                        builtAt: false,
                                        children: false,
                                        colors: true,
                                        performance: true,
                                        logging: 'warn',
                                        reasons: true,
                                        timings: true
                                    },
                                    output: {
                                        library: packagejson.name,
                                        libraryTarget: 'umd',
                                        path: path.join(__dirname, 'lib'),
                                        filename: `${filterOutScopeName(packagejson.name)}.min.js`,
                                    },
                                    optimization: {
                                        minimize: true,
                                        minimizer: [new TerserPlugin({
                                                                         extractComments: true,
                                                                         parallel: true
                                                                     })],
                                    }
                                });

    if (env.analyze) {
        webpackConfig.plugins.push(new WebpackMonitor({
                                                          capture: true,
                                                          launch: true,
                                                          port: 7000,
                                                      }));
    }

    return webpackConfig;
};

function filterOutScopeName(name) {
    return name.replace(/^@.*\//, '');
}

module.exports = webpackConfig;
