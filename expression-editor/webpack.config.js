const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const APP_DIR = path.resolve(__dirname, './src');
const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor');

module.exports = (env, argv) => ({
    mode: 'none',
    entry: {
        ExprEditor: path.join(__dirname, './src', 'index.ts') // tsx was changed ts
    },
    target: 'web',
    devtool: argv.mode === "production" ? undefined : "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".mjs"],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
            "vscode": require.resolve('monaco-languageclient/lib/vscode-compatibility'),
            "crypto": false,
            "net": false,
            "os": false,
            "path": false
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.ts(x?)$/,
                use: {
                    loader: 'ts-loader'
                },
                exclude: '/node_modules/'
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
            {
                test: /\.css$/,
                include: APP_DIR,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.css$/,
                include: [MONACO_DIR],
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(woff|woff2|ttf|otf|eot)$/,
                include: [APP_DIR, MONACO_DIR],
                type: 'asset/inline'
            },
            {
                test: /\.svg/,
                use: {
                    loader: 'svg-url-loader',
                    options: {

                    }
                }
            },
        ],
    },
    ignoreWarnings: [/Failed to parse source map/],
    output: {
        filename: 'ExprEditor.js',
        path: path.resolve(__dirname, 'build'),
        library: {
            name: "ExprEditor",
            type: "umd"
        }
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),
        new ForkTsCheckerWebpackPlugin(), // run TSC on a separate thread,
        new MonacoWebpackPlugin({
            languages: ['ballerina', 'yaml', 'json']
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(argv.mode)
        })
    ]
});

