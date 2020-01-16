const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const packagejson = require('./package.json');
const webpackBaseConfig = require('./webpack.base.config');


webpackBaseConfig.plugins.push(new webpack.optimize.UglifyJsPlugin(
  {
    sourceMap: process.env.WITH_MAPS,
    minimize: true,
    compress: {
      warnings: false,
      drop_debugger: true,
      drop_console: true,
    },
  },
));

module.exports = (env) => {
  const webpackConfig = merge(webpackBaseConfig, {
    entry: './src/js/index.js',
    externals: {
      react: 'react',
      'prop-types': 'prop-types',
      highcharts: 'highcharts',
      'highcharts-more': 'highcharts-more',
      'highcharts-drilldown': 'highcharts-drilldown',
      'react-highcharts': 'react-highcharts',
      'highcharts/highmaps': 'highcharts/highmaps',
      '@imperva/tag': '@imperva/tag',
      '@imperva/base': '@imperva/base',
      '@fortawesome/react-fontawesome': '@fortawesome/react-fontawesome',
      '@fortawesome/fontawesome-svg-core': '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons': '@fortawesome/free-solid-svg-icons',
    },
    output: {
      library: packagejson.name,
      libraryTarget: 'umd',
      path: path.join(__dirname, 'lib'),
      filename: `${filterOutScopeName(packagejson.name)}.min.js`,
    },
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
