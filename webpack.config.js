var webpack = require('webpack');

module.exports = {
  context: __dirname + '/source',
  entry: {
    'record-table': './record-table.jsx',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  plugins: [
  ],
  module: {
    loaders: [
      { 
        test: /\.(js|jsx)/, 
        exclude: /node_modules/, 
        loader: 'babel-loader', 
        query:{
          presets: ['es2015', 'react'],
          plugins: ['add-module-exports']
        }
      }
    ]
  }
};