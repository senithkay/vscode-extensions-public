// module.exports = {
//     resolve: {
//         fallback: { "url": require.resolve("url/") }
//     },
//     resolve: {
//         mainFields: ['browser', 'main', 'module'],
//         extensions: [".mjs", ".js", ".json", ".ts", ".tsx",],
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.ts$|tsx/,
//                 loader: "ts-loader",
//             },
//             {
//                 test: /\.m?js$/,
//                 type: "javascript/auto",
//                 resolve: {
//                     fullySpecified: false
//                 },
//             },
//             {
//                 enforce: "pre",
//                 test: /\.js$/,
//                 loader: "source-map-loader",
//             },
//             {
//                 test: /\.css$/,
//                 use: [
//                     'style-loader',
//                     'css-loader'
//                 ]
//             }
//         ]
//     }
// };
