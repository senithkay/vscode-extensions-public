//@ts-check

'use strict';

const SentryPlugin = require("@sentry/webpack-plugin");
const path = require('path');
const MergeIntoSingleFile = require('webpack-merge-and-include-globally');
const APP_VERSION = "20220531-0431";
const optionalPlugins = [];
const BALLERINA_VS_CODE_PATH = "~/config/extensions/wso2.ballerina-3.0.2-snapshot/resources/jslibs";
const logging = require('webpack/lib/logging/runtime');

logging.getLogger("plugin-vscode").info('IS_RELEASE: ' + process.env.IS_RELEASE);

if (process.env.IS_RELEASE) {
  optionalPlugins.push(
    new SentryPlugin({
      release: APP_VERSION,
      include: ["./node_modules/@wso2-enterprise/ballerina-low-code-editor-distribution/build/"],
      urlPrefix: BALLERINA_VS_CODE_PATH,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "platformer-cloud-rm",
      project: "choreo-low-code",
      ignore: ["node_modules", "webpack.config.js"],
    })
  )
}

/** @type {import('webpack').Configuration} */
module.exports = {
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
  stats: 'normal',
  plugins: [
    new MergeIntoSingleFile({
      files: {
        [path.join('..', 'resources', 'jslibs', 'webviewCommons.js')]: [
          path.resolve('resources', 'utils', 'messaging.js'),
          path.resolve('resources', 'utils', 'undo-redo.js'),
          path.resolve('node_modules', 'pako', 'dist', 'pako.min.js'),
        ],
      },
      transform: {
        'webviewCommons.js': code => require("uglify-js").minify(code).code
      }
    }),
    ...optionalPlugins
  ]
};
