const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const APP_DIR = path.resolve(__dirname, './src');
const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor');
const SentryPlugin = require("@sentry/webpack-plugin");
const APP_VERSION = process.env.APP_VERSION || "Low-code-default";

module.exports = (env, argv) => ({
    mode: 'none',
    entry: {
        BLCEditor: path.join(__dirname, 'src', 'index.tsx')
    },
    target: 'web',
    devtool: "source-map",
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
                use: [
                    // "@jsdevtools/coverage-istanbul-loader", TODO: Enable this only when we are using final build for cypress
                    'ts-loader'
                ],
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
        filename: 'BLCEditor.js',
        path: path.resolve(__dirname, 'build'),
        library: {
            name: "BLCEditor",
            type: "umd"
        }
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
            'process.env.NODE_ENV': JSON.stringify(argv.mode),
            'process.env.APP_VERSION': JSON.stringify(APP_VERSION)
        }),
        ...(process.env.IS_RELEASE ? [
            new SentryPlugin({
                release: APP_VERSION,
                include: ["./build/"],
                urlPrefix: process.env.BALLERINA_VS_CODE_PATH,
                authToken: process.env.SENTRY_AUTH_TOKEN,
                org: "platformer-cloud-rm",
                project: "choreo-low-code",
                ignore: ["node_modules", "webpack.config.js"],
            })
        ] : [
        ])
    ]
});

