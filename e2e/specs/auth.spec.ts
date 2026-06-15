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
  });

  test('register page loads', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await expect(register.submitButton).toBeVisible();
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
