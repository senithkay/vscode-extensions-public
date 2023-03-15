const path = require('path');
const webpack = require('webpack');
module.exports = {
    entry: './src/index.tsx',
    target: "web",
    mode: "development",
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js',
        library: 'choreoWebviews'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                exclude: '/node_modules/'
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(woff|woff2|ttf|eot|svg)$/,
                type: 'asset/inline'
            }
        ],
    },
    devServer: {
        allowedHosts: 'all',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        devMiddleware: {
            mimeTypes: { 'text/css': ['css'] },
        },
        static: path.join(__dirname, 'build'),
        port: 3000
    }
};
