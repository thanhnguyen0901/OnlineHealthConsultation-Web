// cypress/support/e2e.ts
// This file is loaded automatically before every spec file.
// Global setup, plugins, and command imports go here.

import './commands';

// Suppress known React Router / PrimeReact console errors in Cypress output
// so test log noise is kept to a minimum.
Cypress.on('uncaught:exception', (err) => {
  // React Router "ResizeObserver loop limit exceeded" from PrimeReact DataTable
  if (err.message.includes('ResizeObserver loop')) return false;
  // Common async cleanup warning from React 18 strict mode
  if (err.message.includes('Warning:')) return false;
  return true;
});
