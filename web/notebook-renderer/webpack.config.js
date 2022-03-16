const path = require("path");
const webpack = require('webpack')
module.exports = {
  entry: "./src/components/index.tsx",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "renderer.js",
		libraryTarget: 'module',
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
	experiments: {
		outputModule: true,
	},
  module: {
    rules: [
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'awesome-typescript-loader'
          }
        ]
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      }
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};