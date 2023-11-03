const path = require("path");
const webpack = require('webpack');
module.exports = {
  entry: "./src/index.tsx",
  target: "web",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "Visualizer.js",
    library: "visualizerWebview",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: {  }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        exclude: '/node_modules/'
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: './fonts/[name][ext]',
        },
      },
      {
        test: /\.(svg)$/,
        type: 'asset/resource',
        generator: {
          filename: './images/[name][ext]',
        },
      }
    ],
  },
  devServer: {
    allowedHosts: 'all',
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    devMiddleware: {
      mimeTypes: { 'text/css': ['css'] },
    },
  }
};
