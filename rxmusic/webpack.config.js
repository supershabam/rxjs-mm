var webpack = require('webpack')

module.exports = {
  context: __dirname + "/src",
  entry: {
    synth:  "./synth.js",
    control: "./control.js"
  },
  output: {
    path: __dirname + '/public',
    filename: "[name].bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.jsx$/, exclude: /node_modules/, loaders: ['jsx-loader', 'babel-loader']}
    ]
  }
}
