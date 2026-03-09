// cypress/e2e/doctor-dashboard.cy.ts
// Smoke tests for the Doctor Dashboard page.

describe('Doctor Dashboard', () => {
  beforeEach(() => {
    cy.fixture('doctor-profile').then((profile) => {
      cy.intercept('GET', '**/doctors/me', {
        statusCode: 200,
        body: { data: profile },
      }).as('loadDoctorProfile');
    });

    cy.loginAs('DOCTOR', '/doctor');
    cy.wait('@loadDoctorProfile');
  });

  it('renders the dashboard heading', () => {
    cy.contains('h1', /dashboard/i).should('be.visible');
  });

  it('displays the doctor welcome message with their name', () => {
    cy.contains('Jane').should('be.visible');
    cy.contains('Smith').should('be.visible');
  });

  it('shows stat cards with profile stats from the API', () => {
    // doctor-profile fixture: totalAppointments: 45, ratingAverage: 4.7
    cy.contains('45').should('be.visible');
    cy.contains('4.7').should('be.visible');
  });

  it('shows doctor-specific sidebar links', () => {
    cy.get('[data-cy="nav-item-doctor"]').should('exist');
    cy.get('[data-cy="nav-item-inbox"]').should('exist');
    cy.get('[data-cy="nav-item-appointments"]').should('exist');
    cy.get('[data-cy="nav-item-schedule"]').should('exist');
    cy.get('[data-cy="nav-item-ratings"]').should('exist');
    cy.get('[data-cy="nav-item-profile"]').should('exist');
  });

  it('does NOT show patient or admin sidebar links', () => {
    cy.get('[data-cy="nav-item-ask-question"]').should('not.exist');
    cy.get('[data-cy="nav-item-users"]').should('not.exist');
  });

  it('navigates to Inbox Questions page via sidebar link', () => {
    cy.intercept('GET', '**/doctors/questions', {
      statusCode: 200,
      body: { data: [] },
    }).as('loadQuestions');

    cy.get('[data-cy="nav-item-inbox"]').click();
    cy.url().should('include', '/doctor/inbox');
  });

  it('navigates to Appointments page via sidebar link', () => {
    cy.intercept('GET', '**/doctors/appointments**', {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    }).as('loadAppointments');

    cy.get('[data-cy="nav-item-appointments"]').click();
    cy.url().should('include', '/doctor/appointments');
  });
});
