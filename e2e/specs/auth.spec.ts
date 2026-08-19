import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { seedData } from '../test-data/seed-data';
import { users } from '../test-data/users';
import {
  expectForbiddenOrRedirect,
  loginAsAdmin,
  loginAsDoctor,
  loginAsPatient,
  logout,
} from '../utils/auth';

test.describe('UC02 Auth and role guard', () => {
  test('login page loads', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();
    await expect(page.getByTestId('forgot-password-link')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await expect(register.submitButton).toBeVisible();
  });

  test('forgot password page submits a generic reset request', async ({ page }) => {
    let requestedEmail = '';
    await page.route('**/api/auth/forgot-password', async (route) => {
      const body = route.request().postDataJSON() as { email?: string };
      requestedEmail = body.email ?? '';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'If the email exists, reset instructions have been generated',
        }),
      });
    });

    await page.goto('/forgot-password');
    await expect(page.getByTestId('forgot-password-page')).toBeVisible();
    await page.getByTestId('forgot-email-input').fill('patient@example.com');
    await page.getByTestId('forgot-password-submit-button').click();

    await expect(page.getByText(/reset instructions/i)).toBeVisible();
    expect(requestedEmail).toBe('patient@example.com');
  });

  test('reset password page submits token and new password', async ({ page }) => {
    let resetBody: { token?: string; newPassword?: string } = {};
    await page.route('**/api/auth/reset-password', async (route) => {
      resetBody = route.request().postDataJSON() as typeof resetBody;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset successful' }),
      });
    });

    await page.goto('/reset-password?token=reset-token-123');
    await expect(page.getByTestId('reset-password-page')).toBeVisible();
    await page.getByTestId('new-password-input').fill('NewPassword123!');
    await page.getByTestId('confirm-password-input').fill('NewPassword123!');
    await page.getByTestId('reset-password-submit-button').click();

    await expect(page.getByText(/password reset successful/i)).toBeVisible();
    expect(resetBody).toEqual({
      token: 'reset-token-123',
      newPassword: 'NewPassword123!',
    });
  });

  test('E2E-006 patient can login and is redirected to Patient dashboard', async ({ page }) => {
    test.skip(!seedData.hasPatient(), 'Requires E2E_RUN_SEEDED=true and patient credentials.');
    await loginAsPatient(page);
  });

  test('E2E-007 doctor can login and is redirected to Doctor dashboard', async ({ page }) => {
    test.skip(!seedData.hasDoctor(), 'Requires E2E_RUN_SEEDED=true and doctor credentials.');
    await loginAsDoctor(page);
  });

  test('E2E-008 admin can login and is redirected to Admin dashboard', async ({ page }) => {
    test.skip(!seedData.hasAdmin(), 'Requires E2E_RUN_SEEDED=true and admin credentials/backend seed.');
    await loginAsAdmin(page);
  });

  test('E2E-009 guest opening protected Patient route is redirected to login', async ({ page }) => {
    await page.goto('/patient');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-page')).toBeVisible();

    await page.goto('/patient/consultations/00000000-0000-0000-0000-000000000000');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-page')).toBeVisible();
  });

  test('E2E-010 patient cannot access Doctor/Admin routes', async ({ page }) => {
    test.skip(!seedData.hasPatient(), 'Requires E2E_RUN_SEEDED=true and patient credentials.');
    await loginAsPatient(page);
    await page.goto('/doctor');
    await expectForbiddenOrRedirect(page);
    await page.goto('/admin');
    await expectForbiddenOrRedirect(page);
  });

  test('E2E-011 doctor cannot access Patient/Admin routes', async ({ page }) => {
    test.skip(!seedData.hasDoctor(), 'Requires E2E_RUN_SEEDED=true and doctor credentials.');
    await loginAsDoctor(page);
    await page.goto('/patient');
    await expectForbiddenOrRedirect(page);
    await page.goto('/admin');
    await expectForbiddenOrRedirect(page);
  });

  test('E2E-012 logout clears session and redirects login', async ({ page }) => {
    test.skip(
      !seedData.hasPatient() && !seedData.hasAdmin(),
      'Requires E2E_RUN_SEEDED=true and at least one login account.'
    );
    if (seedData.hasPatient() && users.patient.email) {
      await loginAsPatient(page);
    } else {
      await loginAsAdmin(page);
    }
    await logout(page);
  });
});
