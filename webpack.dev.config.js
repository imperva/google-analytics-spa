const merge = require('webpack-merge');
const path = require('path');
const webpackBaseConfig = require('./webpack.base.config');

console.log('\x1b[36m%s\x1b[0m', 'Running development build...');
console.log('\x1b[36m%s\x1b[0m', `path:${__dirname}`);

// function pushToCssRule(rules, path) {
//     return rules.map(rule => {
//         if(!"scss".match(rule.test)) {
//             return rule;
//         }
//
//         if(isEmpty(rule.include)) {
//             rule.include = [];
//         }
//
//         rule.include.push(path.resolve(path));
//
//         return rule;
//     });
// }

module.exports = (env, args) => {
    const webpackConfig = merge(webpackBaseConfig(env),
                                {
                                    mode: 'development',
                                    devtool: 'eval-source-map',
                                    entry: './src/js/demo-root.jsx',
                                    output: {
                                        path: '/',
                                        filename: 'bundle.js',
                                    },
                                    devServer: {
                                        port: 4000,
                                        host: '0.0.0.0',
                                        historyApiFallback: true,
                                        proxy: [{
                                            ignorePath: true
                                        }]
                                    }
                                });

    webpackConfig.module.rules.push({
                                        test: /\.s?css$/,
                                        include: [
                                            path.resolve('./src'),
                                            path.resolve('./node_modules/prismjs/')
                                        ],
                                        use: ['style-loader', 'css-loader', 'sass-loader'],
                                    });
    return webpackConfig;
};
