const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config');

console.log('\x1b[36m%s\x1b[0m', 'Running development build...');
console.log('\x1b[36m%s\x1b[0m', `path:${__dirname}`);

module.exports = (env, args) => {
    const webpackConfing = merge(webpackBaseConfig(env),
                                 {
                                     mode: 'development',
                                     devtool: 'eval-source-map',
                                     entry: './src/js/demo-root.jsx',
                                     output: {
                                         path: '/',
                                         filename: 'bundle.js',
                                     },
                                     devServer: {
                                         port: 4000
                                     }
                                 });

    return webpackConfing;
};
