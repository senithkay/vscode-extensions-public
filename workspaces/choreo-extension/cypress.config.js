const { defineConfig } = require("cypress");
const { getCypressBrowser, getCypressBrowserOptions } = require("@wso2-enterprise/cypress-vscode-runner");
const path = require("path");
const os = require("os");

const version = "1.81.0";
const quality = "stable";
const resourcesFolder = path.join(__dirname, "test-resources");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
          
          if (browser.name === 'vscode') {
              return getCypressBrowserOptions(resourcesFolder, version, quality).then((options) => {
                  console.log("Retrieved Browser Options", options);

                  launchOptions.args.push(...options.args);
                  launchOptions.env = Object.assign({}, launchOptions.env, options.env);

                  delete launchOptions.env['NODE_OPTIONS'];
                  console.log("Launch Options", launchOptions);
                  return launchOptions;
              });
          }
      });

      return getCypressBrowser(resourcesFolder, version, quality).then((vscode) => {
          console.log("Retrieved Browser", vscode);
          return {
            browsers: config.browsers.concat(vscode),
          };
      });
    },
  },
});
