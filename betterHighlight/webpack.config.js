const path = require('path');

module.exports = {
  target: 'web',
  entry: './src/getBoundingRect.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'getBoundingRect.js'
  }
};