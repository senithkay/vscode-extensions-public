const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { argv } = require('process');

const LOW_CODE_DIR = path.resolve(__dirname, '../low-code-editor');
const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor');


function getConfig(env, argv, entrypointName, entrypointPath, outputPath, disableChunks = false, genHTML = false) {
    const optionalPlugins = [];
    if (disableChunks) {
        optionalPlugins.push(
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1
            })
        );
    }
    if (genHTML) {
        optionalPlugins.push(
            new HtmlWebpackPlugin({
                title: genHTML.title,
                template: genHTML.template
            })
        );
    }
    return {
        mode: 'none',
        entry: {
            [entrypointName]: entrypointPath,
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
                    include: LOW_CODE_DIR,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.css$/,
                    include: [MONACO_DIR],
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(woff|woff2|ttf|otf|eot)$/,
                    include: [LOW_CODE_DIR, MONACO_DIR],
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
            filename: '[name].js',
            path: outputPath,
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
            
            new ForkTsCheckerWebpackPlugin(), // run TSC on a separate thread,
            new MonacoWebpackPlugin({
                languages: ['ballerina', 'yaml', 'json']
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(argv.mode)
            }),
            
            ...optionalPlugins
        ]
    };
}

module.exports = [
    (env, argv) => (getConfig(
        env,
        argv,
        "BLCEditor",
        path.join(__dirname, 'src', 'index.tsx'),
        path.resolve(__dirname, 'build'),
        true,
        false
    )),
    (env, argv) => (getConfig(
        env,
        argv,
        "BLCEditor",
        path.join(__dirname, 'src', 'app', 'index.tsx'),
        path.resolve(__dirname, 'build-app'),
        false,
        {
            title: "BLC Editor Standalone",
            template: path.join(__dirname, 'src', 'app', 'index.html')
        }
    ))
];

