// cypress/e2e/role-guard.cy.ts
// Tests for RoleGuard and AuthGuard behaviour.
//
// Rules (from src/app/routes.tsx):
//  - Unauthenticated user → redirected to /login (AuthGuard)
//  - PATIENT accessing /doctor or /admin → redirected to / (RoleGuard)
//  - DOCTOR accessing /patient or /admin → redirected to / (RoleGuard)
//  - ADMIN accessing /patient or /doctor → redirected to / (RoleGuard)
//  - /reports is accessible to DOCTOR and ADMIN
//  - /404 is public

describe('AuthGuard – unauthenticated access', () => {
  beforeEach(() => {
    // Ensure no valid session exists.
    cy.intercept('GET', '**/api/auth/me', { statusCode: 401, body: {} });
    cy.intercept('POST', '**/api/auth/refresh', { statusCode: 401, body: {} });
  });

  const protectedRoutes = [
    '/patient',
    '/patient/ask-question',
    '/patient/book-appointment',
    '/patient/history',
    '/patient/profile',
    '/doctor',
    '/doctor/inbox',
    '/doctor/appointments',
    '/doctor/schedule',
    '/doctor/ratings',
    '/doctor/profile',
    '/admin',
    '/admin/users',
    '/admin/patients',
    '/admin/doctors',
    '/admin/specialties',
    '/admin/appointments',
    '/admin/moderation',
    '/reports',
  ];

  protectedRoutes.forEach((route) => {
    it(`redirects unauthenticated user from ${route} to /login`, () => {
      cy.visit(route);
      cy.url().should('include', '/login');
    });
  });
});

describe('RoleGuard – cross-role access', () => {
  // Note: RoleGuard redirects to / (ROUTE_PATHS.HOME).
  // HomeRedirect then immediately forwards each role to their own dashboard.
  // Final URL = the role's dashboard, not /.

  it('redirects a PATIENT away from /doctor to /patient', () => {
    cy.loginAs('PATIENT', '/doctor');
    cy.url().should('include', '/patient');
  });

  it('redirects a PATIENT away from /admin to /patient', () => {
    cy.loginAs('PATIENT', '/admin');
    cy.url().should('include', '/patient');
  });

  it('redirects a DOCTOR away from /patient to /doctor', () => {
    cy.fixture('doctor-profile').then((profile) => {
      cy.intercept('GET', '**/api/doctors/me', {
        statusCode: 200,
        body: { data: profile },
      });
    });
    cy.loginAs('DOCTOR', '/patient');
    cy.url().should('include', '/doctor');
  });

  it('redirects a DOCTOR away from /admin to /doctor', () => {
    cy.fixture('doctor-profile').then((profile) => {
      cy.intercept('GET', '**/api/doctors/me', {
        statusCode: 200,
        body: { data: profile },
      });
    });
    cy.loginAs('DOCTOR', '/admin');
    cy.url().should('include', '/doctor');
  });

  it('redirects an ADMIN away from /patient to /admin', () => {
    cy.fixture('admin-stats').then((stats) => {
      cy.intercept('GET', '**/api/reports/stats', {
        statusCode: 200,
        body: { data: stats },
      });
    });
    cy.loginAs('ADMIN', '/patient');
    cy.url().should('include', '/admin');
  });

  it('redirects an ADMIN away from /doctor to /admin', () => {
    cy.fixture('admin-stats').then((stats) => {
      cy.intercept('GET', '**/api/reports/stats', {
        statusCode: 200,
        body: { data: stats },
      });
    });
    cy.loginAs('ADMIN', '/doctor');
    cy.url().should('include', '/admin');
  });
});

describe('RoleGuard – shared /reports route', () => {
  it('allows a DOCTOR to access /reports', () => {
    cy.fixture('doctor-profile').then((profile) => {
      cy.intercept('GET', '**/api/doctors/me', { statusCode: 200, body: { data: profile } });
    });
    cy.intercept('GET', '**/api/reports/stats', { statusCode: 200, body: { data: {} } });
    cy.intercept('GET', '**/api/reports/appointments-chart', {
      statusCode: 200,
      body: { data: [] },
    });
    cy.intercept('GET', '**/api/reports/questions-chart', { statusCode: 200, body: { data: [] } });

    cy.loginAs('DOCTOR', '/reports');
    cy.url().should('include', '/reports');
  });

  it('allows an ADMIN to access /reports', () => {
    cy.intercept('GET', '**/api/reports/stats', { statusCode: 200, body: { data: {} } });
    cy.intercept('GET', '**/api/reports/appointments-chart', {
      statusCode: 200,
      body: { data: [] },
    });
    cy.intercept('GET', '**/api/reports/questions-chart', { statusCode: 200, body: { data: [] } });

    cy.loginAs('ADMIN', '/reports');
    cy.url().should('include', '/reports');
  });

  it('redirects a PATIENT away from /reports to /', () => {
    cy.loginAs('PATIENT', '/reports');
    // RoleGuard → HomeRedirect → PATIENT dashboard (/patient)
    cy.url().should('include', '/patient');
  });
});

describe('Public 404 page', () => {
  it('renders the 404 page for unknown routes', () => {
    cy.intercept('GET', '**/auth/me', { statusCode: 401, body: {} });
    cy.intercept('POST', '**/auth/refresh', { statusCode: 401, body: {} });
    cy.visit('/this-route-does-not-exist');
    cy.contains('404').should('be.visible');
  });
});
