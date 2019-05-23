const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    'ux-player': './src/index.tsx'
  },
  devtool: 'source-map',
  output: {
    filename: "[name]/[name].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      '@models': path.resolve(__dirname, '../../models/')
    }
  },
  stats: {
    warnings: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.woff$/,
        use: [{
          loader: 'base64-inline-loader'
        }]
      },
      {
        test: /\.html$/,
        loader: "file-loader"
      },
      {
        test: /\.(txt|md)$/i,
        use: 'raw-loader',
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            },
          },
        ],
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..')
    }),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new CopyWebpackPlugin([{ from: "**/*.html", context: "src/public" }])
  ]
};