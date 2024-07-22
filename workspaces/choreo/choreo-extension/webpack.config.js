const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const CopyPlugin = require("copy-webpack-plugin");
const PermissionsOutputPlugin = require("webpack-permissions-plugin");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
	target: "node",
	mode: "none",

	entry: {
		extension: "./src/extension.ts",
		"askpass-main": "./src/git/askpass-main.ts",
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js",
		libraryTarget: "commonjs2",
		devtoolModuleFilenameTemplate: "../[resource-path]",
	},
	externals: {
		keytar: "commonjs keytar",
		vscode: "commonjs vscode",
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader",
					},
				],
			},
			{
				test: /\.m?js$/,
				type: "javascript/auto",
				resolve: {
					fullySpecified: false,
				},
			},
		],
	},
	devtool: "source-map",
	infrastructureLogging: {
		level: "log",
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					// https://github.com/webpack-contrib/terser-webpack-plugin/

					// Don't mangle class names.  Otherwise parseError() will not recognize user cancelled errors (because their constructor name
					// will match the mangled name, not UserCancelledError).  Also makes debugging easier in minified code.
					keep_classnames: true,

					// Don't mangle function names. https://github.com/microsoft/vscode-azurestorage/issues/525
					keep_fnames: true,
				},
			}),
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: "src/git/*.sh", to: "[name][ext]" }],
		}),
		new PermissionsOutputPlugin({
			buildFolders: [path.resolve(__dirname, "dist/")],
		}),
	],
};
module.exports = [extensionConfig];
