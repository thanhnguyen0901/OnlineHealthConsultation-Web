// cypress/e2e/admin-dashboard.cy.ts
// Smoke and regression tests for the Admin Dashboard page.

describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Stub the stats API — called immediately on mount.
    cy.fixture('admin-stats').then((stats) => {
      cy.intercept('GET', '**/reports/stats', {
        statusCode: 200,
        body: { data: stats },
      }).as('loadStats');
    });

    cy.loginAs('ADMIN', '/admin');
    cy.wait('@loadStats');
  });

  it('renders the dashboard heading', () => {
    cy.contains('h1', /dashboard/i).should('be.visible');
  });

  it('displays stat cards with figures from the API', () => {
    // Figures come from admin-stats fixture (totalUsers: 150, etc.)
    cy.contains('150').should('be.visible'); // totalUsers
    cy.contains('20').should('be.visible');  // totalDoctors
    cy.contains('130').should('be.visible'); // totalPatients
  });

  it('shows admin-specific sidebar links', () => {
    cy.get('[data-cy="nav-item-admin"]').should('exist');
    cy.get('[data-cy="nav-item-users"]').should('exist');
    cy.get('[data-cy="nav-item-patients"]').should('exist');
    cy.get('[data-cy="nav-item-doctors"]').should('exist');
    cy.get('[data-cy="nav-item-specialties"]').should('exist');
    cy.get('[data-cy="nav-item-appointments"]').should('exist');
    cy.get('[data-cy="nav-item-moderation"]').should('exist');
  });

  it('does NOT show patient-only sidebar links', () => {
    cy.get('[data-cy="nav-item-ask-question"]').should('not.exist');
    cy.get('[data-cy="nav-item-book-appointment"]').should('not.exist');
  });

  it('navigates to Manage Users page when the sidebar link is clicked', () => {
    cy.fixture('admin-users').then((adminUsers) => {
      cy.intercept('GET', '**/admin/users**', {
        statusCode: 200,
        body: adminUsers,
      }).as('loadUsers');
    });

    cy.get('[data-cy="nav-item-users"]').click();
    cy.url().should('include', '/admin/users');
  });

  it('navigates to Manage Specialties page', () => {
    cy.fixture('specialties').then((specialties) => {
      cy.intercept('GET', '**/admin/specialties', {
        statusCode: 200,
        body: { data: specialties },
      }).as('loadSpecialties');
    });

    cy.get('[data-cy="nav-item-specialties"]').click();
    cy.url().should('include', '/admin/specialties');
  });
});
