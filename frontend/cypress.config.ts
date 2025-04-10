import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): void {
      // implement node event listeners here
    },
  },
}) 