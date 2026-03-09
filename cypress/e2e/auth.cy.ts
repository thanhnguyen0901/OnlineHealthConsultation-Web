// cypress/e2e/auth.cy.ts
// Tests for the authentication flow: login, register, logout, and redirects.

import type { UsersFixture } from '../support/commands';

describe('Authentication', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Login page — initial render
  // ──────────────────────────────────────────────────────────────────────────
  describe('Login page', () => {
    beforeEach(() => {
      // Intercept bootstrap call — no valid session so meFailed fires, user stays on /login.
      cy.intercept('GET', '**/auth/me', { statusCode: 401, body: {} }).as('authMe');
      cy.intercept('POST', '**/auth/refresh', { statusCode: 401, body: {} }).as('authRefresh');
      cy.visit('/login');
    });

    it('renders the login form', () => {
      cy.get('[data-cy="login-email"]').should('be.visible');
      cy.get('[data-cy="login-password"]').should('be.visible');
      cy.get('[data-cy="login-submit"]').should('be.visible').and('contain.text', 'Login');
    });

    it('shows validation errors when form is submitted empty', () => {
      cy.get('[data-cy="login-submit"]').click();
      // Yup validation runs on submit; error messages appear below the fields.
      cy.get('[data-cy="login-email"]').closest('div').find('small').should('be.visible');
      cy.get('[data-cy="login-password"]').closest('div').find('small').should('be.visible');
    });

    it('shows validation error for invalid email format', () => {
      cy.get('[data-cy="login-email"]').type('not-an-email');
      cy.get('[data-cy="login-password"]').type('password123');
      cy.get('[data-cy="login-submit"]').click();
      cy.get('[data-cy="login-email"]').closest('div').find('small').should('be.visible');
    });

    it('shows validation error when password is too short', () => {
      cy.get('[data-cy="login-email"]').type('user@example.com');
      cy.get('[data-cy="login-password"]').type('abc');
      cy.get('[data-cy="login-submit"]').click();
      cy.get('[data-cy="login-password"]').closest('div').find('small').should('be.visible');
    });

    it('has a link to the register page', () => {
      cy.contains('a', 'Register').should('have.attr', 'href', '/register');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Successful login — role-based redirect
  // ──────────────────────────────────────────────────────────────────────────
  describe('Successful login redirects', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/auth/me', { statusCode: 401, body: {} });
      cy.intercept('POST', '**/auth/refresh', { statusCode: 401, body: {} });
    });

    it('redirects PATIENT to /patient after login', () => {
      cy.fixture<UsersFixture>('users').then((users) => {
        const { token } = buildFakeTokenContext(users.patient);

        cy.intercept('POST', '**/auth/login', {
          statusCode: 200,
          body: {
            data: {
              accessToken: token,
              refreshToken: 'fake-rt',
              user: users.patient,
            },
          },
        }).as('loginReq');

        cy.intercept('GET', '**/auth/me', {
          statusCode: 200,
          body: { data: users.patient },
        });

        cy.visit('/login');
        cy.get('[data-cy="login-email"]').type(users.patient.email);
        cy.get('[data-cy="login-password"]').type('password123');
        cy.get('[data-cy="login-submit"]').click();
        cy.wait('@loginReq');
        cy.url().should('include', '/patient');
      });
    });

    it('redirects DOCTOR to /doctor after login', () => {
      cy.fixture<UsersFixture>('users').then((users) => {
        const { token } = buildFakeTokenContext(users.doctor);

        cy.intercept('POST', '**/auth/login', {
          statusCode: 200,
          body: {
            data: {
              accessToken: token,
              refreshToken: 'fake-rt',
              user: users.doctor,
            },
          },
        }).as('loginReq');

        cy.intercept('GET', '**/auth/me', {
          statusCode: 200,
          body: { data: users.doctor },
        });

        cy.visit('/login');
        cy.get('[data-cy="login-email"]').type(users.doctor.email);
        cy.get('[data-cy="login-password"]').type('password123');
        cy.get('[data-cy="login-submit"]').click();
        cy.wait('@loginReq');
        cy.url().should('include', '/doctor');
      });
    });

    it('redirects ADMIN to /admin after login', () => {
      cy.fixture<UsersFixture>('users').then((users) => {
        const { token } = buildFakeTokenContext(users.admin);

        cy.intercept('POST', '**/auth/login', {
          statusCode: 200,
          body: {
            data: {
              accessToken: token,
              refreshToken: 'fake-rt',
              user: users.admin,
            },
          },
        }).as('loginReq');

        cy.intercept('GET', '**/auth/me', {
          statusCode: 200,
          body: { data: users.admin },
        });

        cy.visit('/login');
        cy.get('[data-cy="login-email"]').type(users.admin.email);
        cy.get('[data-cy="login-password"]').type('password123');
        cy.get('[data-cy="login-submit"]').click();
        cy.wait('@loginReq');
        cy.url().should('include', '/admin');
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Failed login — shows error toast
  // ──────────────────────────────────────────────────────────────────────────
  describe('Failed login', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/auth/me', { statusCode: 401, body: {} });
      cy.intercept('POST', '**/auth/refresh', { statusCode: 401, body: {} });
    });

    it('shows an error toast on invalid credentials', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid email or password' },
      }).as('loginFail');

      cy.visit('/login');
      cy.get('[data-cy="login-email"]').type('wrong@example.com');
      cy.get('[data-cy="login-password"]').type('wrongpass');
      cy.get('[data-cy="login-submit"]').click();
      cy.wait('@loginFail');

      // PrimeReact Toast is rendered in a portal; look for it anywhere in the DOM.
      cy.contains('Login Failed').should('be.visible');
    });

    it('re-enables the submit button after a failed login', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid email or password' },
      }).as('loginFail');

      cy.visit('/login');
      cy.get('[data-cy="login-email"]').type('wrong@example.com');
      cy.get('[data-cy="login-password"]').type('wrongpass');
      cy.get('[data-cy="login-submit"]').click();
      cy.wait('@loginFail');
      cy.get('[data-cy="login-submit"]').should('not.be.disabled');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Register page
  // ──────────────────────────────────────────────────────────────────────────
  describe('Register page', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/auth/me', { statusCode: 401, body: {} });
      cy.intercept('POST', '**/auth/refresh', { statusCode: 401, body: {} });
      cy.visit('/register');
    });

    it('renders the registration form', () => {
      cy.get('[data-cy="register-first-name"]').should('be.visible');
      cy.get('[data-cy="register-last-name"]').should('be.visible');
      cy.get('[data-cy="register-email"]').should('be.visible');
      cy.get('[data-cy="register-password"]').should('be.visible');
      cy.get('[data-cy="register-submit"]').should('be.visible');
    });

    it('shows validation errors for empty submission', () => {
      cy.get('[data-cy="register-submit"]').click();
      cy.get('[data-cy="register-first-name"]').closest('div').find('small').should('be.visible');
      cy.get('[data-cy="register-last-name"]').closest('div').find('small').should('be.visible');
      cy.get('[data-cy="register-email"]').closest('div').find('small').should('be.visible');
      cy.get('[data-cy="register-password"]').closest('div').find('small').should('be.visible');
    });

    it('successfully registers and redirects to /login', () => {
      cy.intercept('POST', '**/auth/register', {
        statusCode: 201,
        body: {
          data: {
            accessToken: 'fake-token',
            refreshToken: 'fake-rt',
            user: {
              id: 'new-user-001',
              firstName: 'Alice',
              lastName: 'Nguyen',
              email: 'alice@example.com',
              role: 'PATIENT',
            },
          },
        },
      }).as('registerReq');

      cy.get('[data-cy="register-first-name"]').type('Alice');
      cy.get('[data-cy="register-last-name"]').type('Nguyen');
      cy.get('[data-cy="register-email"]').type('alice@example.com');
      cy.get('[data-cy="register-password"]').type('securepass');
      cy.get('[data-cy="register-submit"]').click();
      cy.wait('@registerReq');

      // registerSucceeded action sets registerCompleted flag → navigates to /login.
      cy.url().should('include', '/login');
    });

    it('has a link back to the login page', () => {
      cy.contains('a', 'Login').should('have.attr', 'href', '/login');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Logout flow
  // ──────────────────────────────────────────────────────────────────────────
  describe('Logout', () => {
    it('logs out and redirects to /login', () => {
      // Log in as patient first
      cy.loginAs('PATIENT', '/patient');

      // Intercept the logout endpoint
      cy.intercept('POST', '**/auth/logout', { statusCode: 200, body: {} }).as('logoutReq');

      // Click logout in the sidebar
      cy.get('[data-cy="logout-btn"]').click();
      cy.wait('@logoutReq');

      cy.url().should('include', '/login');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Already-authenticated redirect from /login
  // ──────────────────────────────────────────────────────────────────────────
  describe('Already authenticated', () => {
    it('redirects patient away from /login to /patient', () => {
      cy.loginAs('PATIENT', '/patient');

      // Try to go to /login — should redirect back to /patient
      cy.visit('/login');
      cy.url().should('include', '/patient');
    });
  });
});

// ─── Local test helper ────────────────────────────────────────────────────
// (Duplicates the logic in commands.ts without exporting; keeps the spec self-contained for readers.)
function buildFakeTokenContext(user: { id: string; role: string; email: string }) {
  const expSec = Math.floor(Date.now() / 1000) + 3600;
  const toBase64Url = (s: string) =>
    btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({ sub: user.id, role: user.role, email: user.email, exp: expSec })
  );
  return { token: `${header}.${payload}.sig`, expiresAtMs: expSec * 1000 };
}
