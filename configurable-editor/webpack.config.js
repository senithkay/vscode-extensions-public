const path = require('path');
const webpack = require('webpack');

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
        path: path.resolve(__dirname, 'build', 'umd'),
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
