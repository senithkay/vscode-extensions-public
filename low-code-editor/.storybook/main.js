const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "core": {
    "builder": "webpack5"
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      compilerOptions: {
        "allowSyntheticDefaultImports": true,
        "resolveJsonModule": true,
        "esModuleInterop": true,
      },
    }
  },
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });
    config.plugins = [
      ...config.plugins,
      new MonacoWebpackPlugin({
        languages: ['ballerina', 'yaml', 'json']
      })
    ];
    config.resolve = {
      ...config.resolve,
      modules: [path.resolve(__dirname, '../src'), 'node_modules'],
      alias: {
        handlebars: 'handlebars/dist/handlebars.min.js',
        "vscode": require.resolve('monaco-languageclient/lib/vscode-compatibility'),
        "crypto": false,
        "net": false,
        "os": false,
        "path": false
      }
    }
    return config;
  }
}