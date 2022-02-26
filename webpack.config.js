//@ts-check

'use strict';

const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
  watch: false,
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    keytar: "commonjs keytar",
    vscode: 'commonjs vscode',
    bufferutil: 'commonjs bufferutil',
    'utf-8-validate': 'commonjs utf-8-validate'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              logLevel: "info"
            }
          }
        ]
      }
    ]
  },
  stats: 'normal'
};
const rendererConfig = {
	entry: './src/notebook/renderer/index.tsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'renderer.js',
		libraryTarget: 'module',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.css']
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
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
};

module.exports = [config, rendererConfig];
