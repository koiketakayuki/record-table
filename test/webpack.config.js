var webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: {
    jsx: './index.jsx'
  },
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { 
        test: /\.(js|jsx)/, 
        exclude: /node_modules/, 
        loader: 'babel-loader', 
        query:{
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
};