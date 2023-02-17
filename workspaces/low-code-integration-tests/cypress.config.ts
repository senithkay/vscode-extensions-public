import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 100000,
  pageLoadTimeout: 100000,
  responseTimeout: 100000,
  viewportHeight: 1080,
  viewportWidth: 1080,
  chromeWebSecurity: false,
  video: true,
  videosFolder: './cypress/videos',
  videoCompression: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/./**/*.ts',
  },
  retries: {
    runMode: 2,
    openMode: 0
  },
})
