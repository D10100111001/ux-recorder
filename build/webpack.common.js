const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    'ux-recorder': './src/index.ts',
    'workers/html-diff': './src/worker-scripts/html-diff.ts',
    //'workers/screenshot': './src/worker-scripts/screenshot.ts'
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
        root: path.resolve(__dirname, '..')
    }),
  ],
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: '[name].js', // [contenthash],
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
}