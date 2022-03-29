const path = require("path");
const webpack = require('webpack');
module.exports = {
  entry: "./src/components/index.tsx",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "variableView.js",
    library: 'variableView',
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
      }
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
};
