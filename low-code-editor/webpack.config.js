const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const APP_DIR = path.resolve(__dirname, './src');
const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor');

module.exports = {
    mode: 'none',
    entry: {
        app: path.join(__dirname, 'src', 'index.tsx')
    },
    target: 'web',
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
                use: [{
                    loader: 'style-loader',
                }, {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        namedExport: true,
                    },
                }],
            },
            {
                test: /\.css$/,
                include: [MONACO_DIR],
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                include: [MONACO_DIR],
                use: ['file-loader']
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
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build')
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(), // run TSC on a separate thread,
        new MonacoWebpackPlugin({
            languages: ['ballerina', 'yaml', 'json']
        }),
    ]
}
