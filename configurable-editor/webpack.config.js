const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const APP_DIR = path.resolve(__dirname, './src');
const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor');

module.exports = (env, argv) => ({
    mode: 'none',
    entry: {
        ConfigForm: path.join(__dirname, 'src', 'index.tsx')
    },
    target: 'web',
    devtool: 'source-map',
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
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
        filename: 'ConfigEditor.js',
        path: path.resolve(__dirname, 'build'),
        library: {
            name: "configEditor",
            type: "umd"
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(argv.mode)
        })
    ]
});
