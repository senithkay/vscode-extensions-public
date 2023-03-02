const path = require("path");
const webpack = require('webpack');
module.exports = {
  entry: "./src/index.tsx",
  target: "web",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "ArchitectureView.js",
    library: "architectureView",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)$/,
        type: 'asset/inline'
      }
    ],
  },
  ignoreWarnings: [/Failed to parse source map/],
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
