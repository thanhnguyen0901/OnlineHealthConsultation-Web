import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Vite dev server default port
    baseUrl: 'http://localhost:5173',

    // Where test specs live
    specPattern: 'cypress/e2e/**/*.cy.ts',

    // Support file loaded before every spec
    supportFile: 'cypress/support/e2e.ts',

    // Fixtures directory
    fixturesFolder: 'cypress/fixtures',

    // Screenshots and videos
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false,

    // Viewport matching a typical laptop screen
    viewportWidth: 1440,
    viewportHeight: 900,

    // All API calls are intercepted — no real backend needed
    // Keep the timeout generous enough not to flake on CI
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 10000,

    // Retry on CI to absorb flakiness from React hydration timing
    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      // ------ add Node-side plugins here (e.g. code-coverage) ------
      return config;
    },
  },
});
