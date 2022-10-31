/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const webpackPreprocessor = require('@cypress/webpack-batteries-included-preprocessor', 'cypress-terminal-report/src/installLogsPrinter')

/**
 * @type {Cypress.PluginConfig}
 * 
 */
module.exports = (on, config) => {
  on('file:preprocessor', webpackPreprocessor({
    typescript: require.resolve('typescript')
  }))

  require('@cypress/code-coverage/task')(on, config)

  const logOptions = {
    outputRoot: config.projectRoot + '/logs/',
    printLogsToConsole: 'never',
    printLogsToFile: 'onFail',
    outputTarget: {
      'failing-tests-log.json': 'json',
    }
  };
  require('cypress-terminal-report/src/installLogsPrinter')(on, logOptions);

  return config
}
