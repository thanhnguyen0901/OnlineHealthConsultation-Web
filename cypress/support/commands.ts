// cypress/support/commands.ts
// Custom Cypress commands for the OnlineHealthConsultation-Web project.

// ─── Type declarations ─────────────────────────────────────────────────────

export interface UserFixture {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export interface UsersFixture {
  patient: UserFixture;
  doctor: UserFixture;
  admin: UserFixture;
}

// Extend Cypress' Chainable so TypeScript recognises our custom commands.
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Seed sessionStorage with a fake JWT and intercept /auth/me so the
       * app bootstraps as the given role.  Then visits `targetPath`.
       *
       * @example cy.loginAs('PATIENT', '/patient')
       */
      loginAs(role: 'PATIENT' | 'DOCTOR' | 'ADMIN', targetPath: string): Chainable<void>;

      /**
       * Submit the login form on /login.  Intercepts POST /auth/login so no
       * real backend is required.
       *
       * @example cy.loginViaForm('patient@test.com', 'password123', 'PATIENT')
       */
      loginViaForm(
        email: string,
        password: string,
        role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
      ): Chainable<void>;

      /**
       * Intercept the bootstrap /auth/me call that every page triggers, then
       * verify the app did not redirect to /login.
       * Useful inside tests that already visited a page using loginAs().
       */
      interceptAuthMe(role: 'PATIENT' | 'DOCTOR' | 'ADMIN'): Chainable<void>;
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Encode a plain string to Base64-URL (no padding).
 * Uses btoa() which is available in browser-context tasks.
 */
function toBase64Url(str: string): string {
  // btoa only handles Latin-1; JSON payloads stay within that range for our fixtures.
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Build a fake, structurally-valid JWT.  Signature is not verified by the app. */
function makeFakeJwt(user: UserFixture): { token: string; expiresAtMs: number } {
  const expSec = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({ sub: user.id, role: user.role, email: user.email, exp: expSec })
  );
  return { token: `${header}.${payload}.cypress-fake-sig`, expiresAtMs: expSec * 1000 };
}

// ─── Commands ──────────────────────────────────────────────────────────────

/**
 * loginAs — fast auth bypass.
 *
 * Strategy:
 *  1. Intercept GET /api/auth/me (called by the app's bootstrap saga) so it
 *     returns the fixture user.
 *  2. Seed sessionStorage via cy.visit onBeforeLoad so loadAuthFromStorage()
 *     returns a valid token *before* React initialises.
 *  3. Wait for the auth/me intercept to confirm bootstrap completed.
 */
Cypress.Commands.add('loginAs', (role, targetPath) => {
  cy.fixture<UsersFixture>('users').then((users) => {
    const key = role.toLowerCase() as 'patient' | 'doctor' | 'admin';
    const user = users[key];
    const { token, expiresAtMs } = makeFakeJwt(user);

    // Stub the bootstrap call that every page makes on load.
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: { data: { ...user, isActive: true } },
    }).as('authMe');

    // Also stub the logout endpoint to prevent errors during cleanup.
    cy.intercept('POST', '**/auth/logout', { statusCode: 200, body: {} }).as('authLogout');

    // Visit target page; seed storage *before* React initialises.
    cy.visit(targetPath, {
      onBeforeLoad(win: Window) {
        win.sessionStorage.setItem('ohc_access_token', token);
        win.sessionStorage.setItem('ohc_access_exp', String(expiresAtMs));
      },
    });

    // Confirm the app bootstrapped successfully.
    cy.wait('@authMe');
  });
});

/**
 * loginViaForm — exercises the real login form.
 *
 * Intercepts POST /auth/login to return a mock response, then fills the form
 * and submits it.  Also intercepts GET /auth/me for the subsequent bootstrap.
 */
Cypress.Commands.add('loginViaForm', (email, password, role) => {
  cy.fixture<UsersFixture>('users').then((users) => {
    const key = role.toLowerCase() as 'patient' | 'doctor' | 'admin';
    const user = users[key];
    const { token, expiresAtMs } = makeFakeJwt(user);

    // Stub POST /auth/login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        data: {
          accessToken: token,
          refreshToken: 'fake-refresh-token',
          user: { ...user, isActive: true },
        },
      },
    }).as('authLogin');

    // Stub any subsequent /auth/me (e.g. when navigating to the dashboard)
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: {
        data: {
          accessToken: token,
          expiresAtMs,
          user: { ...user, isActive: true },
        },
      },
    }).as('authMe');

    cy.visit('/login');
    cy.get('[data-cy="login-email"]').type(email);
    cy.get('[data-cy="login-password"]').type(password);
    cy.get('[data-cy="login-submit"]').click();
    cy.wait('@authLogin');
  });
});

/**
 * interceptAuthMe — convenience wrapper to re-stub auth/me in tests that need
 * to navigate between pages (each page re-runs the bootstrap saga).
 */
Cypress.Commands.add('interceptAuthMe', (role) => {
  cy.fixture<UsersFixture>('users').then((users) => {
    const key = role.toLowerCase() as 'patient' | 'doctor' | 'admin';
    const user = users[key];

    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: { data: { ...user, isActive: true } },
    }).as('authMe');
  });
});
