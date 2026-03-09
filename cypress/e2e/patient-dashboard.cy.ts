// cypress/e2e/patient-dashboard.cy.ts
// Smoke tests for the patient dashboard page.

describe('Patient Dashboard', () => {
  beforeEach(() => {
    // Bootstrap the app as a PATIENT and navigate to the patient dashboard.
    cy.loginAs('PATIENT', '/patient');
  });

  it('displays the dashboard heading', () => {
    // Heading text comes from i18n key patient:dashboard → "Dashboard"
    cy.contains('h1', 'Dashboard').should('be.visible');
  });

  it('renders all three quick-action cards', () => {
    cy.get('[data-cy="quick-action-ask-question"]').should('be.visible');
    cy.get('[data-cy="quick-action-book-appointment"]').should('be.visible');
    cy.get('[data-cy="quick-action-history"]').should('be.visible');
  });

  it('navigates to Ask Question page when the card is clicked', () => {
    // Stub /patients/specialties so the Ask Question page can render.
    cy.intercept('GET', '**/patients/specialties', {
      statusCode: 200,
      body: { data: [] },
    }).as('loadSpecialties');

    cy.get('[data-cy="quick-action-ask-question"]').click();
    cy.url().should('include', '/patient/ask-question');
  });

  it('navigates to Book Appointment page when the card is clicked', () => {
    cy.intercept('GET', '**/patients/specialties', {
      statusCode: 200,
      body: { data: [] },
    }).as('loadSpecialties');

    cy.get('[data-cy="quick-action-book-appointment"]').click();
    cy.url().should('include', '/patient/book-appointment');
  });

  it('navigates to Consultation History page when the card is clicked', () => {
    cy.intercept('GET', '**/patients/history', {
      statusCode: 200,
      body: { data: { questions: [], appointments: [] } },
    }).as('loadHistory');

    cy.get('[data-cy="quick-action-history"]').click();
    cy.url().should('include', '/patient/history');
  });

  it('shows the sidebar navigation links for a patient', () => {
    // Patient-specific nav links defined in MainLayout.getMenuItems()
    cy.get('[data-cy="nav-item-patient"]').should('exist');
    cy.get('[data-cy="nav-item-ask-question"]').should('exist');
    cy.get('[data-cy="nav-item-book-appointment"]').should('exist');
    cy.get('[data-cy="nav-item-history"]').should('exist');
    cy.get('[data-cy="nav-item-profile"]').should('exist');
  });

  it('does NOT show doctor or admin nav links', () => {
    cy.get('[data-cy="nav-item-inbox"]').should('not.exist');
    cy.get('[data-cy="nav-item-users"]').should('not.exist');
  });
});
