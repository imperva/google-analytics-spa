const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config');

console.log(`[DEV] path:${__dirname}. `);

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: './src/js/demo-root.jsx',
  output: {
    path: '/',
    filename: 'bundle.js',
  },
});
