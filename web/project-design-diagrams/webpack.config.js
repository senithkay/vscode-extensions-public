const path = require("path");
const webpack = require('webpack');
module.exports = {
  entry: "./src/index.tsx",
  target: "web",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "DesignDiagram.js",
    library: "designDiagram",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "awesome-typescript-loader",
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
  }
};
