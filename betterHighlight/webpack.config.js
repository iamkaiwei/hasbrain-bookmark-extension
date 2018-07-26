const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'web',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'HighlightHelper.js'
  },
  resolve: {
    modules: ['node_modules']
  },
  mode: 'development',
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
    }),
  ],
};