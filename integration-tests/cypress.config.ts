import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 15000,
  pageLoadTimeout: 15000,
  responseTimeout: 15000,
  viewportHeight: 1080,
  viewportWidth: 1080,
  chromeWebSecurity: false,
  video: true,
  videosFolder: './cypress/videos',
  videoCompression: 32,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/./**/*.ts',
  },
})
