import { dirname, join } from "path";
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],

  "addons": [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions")
  ],

  "framework": {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {}
  },

  babel: async (options) => {
    return {
      ...options,
      presets: [...options.presets, '@babel/preset-flow', '@babel/preset-react', '@babel/preset-typescript'],
    };
  },
}

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
