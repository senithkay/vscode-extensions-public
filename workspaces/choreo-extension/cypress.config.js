const { defineConfig } = require("cypress");
const { getCypressBrowser, getCypressBrowserOptions } = require("@wso2-enterprise/cypress-vscode-runner");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
          if (browser.name === 'vscode') {
              return getCypressBrowserOptions().then((options) => {
                  console.log("Retrieved Browser Options", options);
                  launchOptions.args.push(...options.args);
                  launchOptions.env = { ...launchOptions.env, ...options.env };
                  return launchOptions;
              });
          }
      });

      return getCypressBrowser().then((vscode) => {
          console.log("Retrieved Browser", vscode);
          return {
            browsers: config.browsers.concat(vscode),
          };
      });
    },
  },
});
