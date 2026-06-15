import { expect, Page } from '@playwright/test';
import type { E2EAccount } from '../test-data/users';
import { users } from '../test-data/users';

const dashboardByRole = {
  patient: { path: /\/patient$/, testId: 'patient-dashboard-page' },
  doctor: { path: /\/doctor$/, testId: 'doctor-dashboard-page' },
  admin: { path: /\/admin$/, testId: 'admin-dashboard-page' },
};

export async function loginAs(page: Page, account: E2EAccount) {
  if (!account.email || !account.password) {
    throw new Error(`Missing ${account.role} credentials`);
  }

  await page.goto('/login');
  await page.getByTestId('email-input').fill(account.email);
  await page.getByTestId('password-input').fill(account.password);
  await page.getByTestId('login-submit-button').click();

  const expected = dashboardByRole[account.role];
  await expect(page).toHaveURL(expected.path);
  await expect(page.getByTestId(expected.testId)).toBeVisible();
}

export const loginAsPatient = (page: Page) => loginAs(page, users.patient);
export const loginAsDoctor = (page: Page) => loginAs(page, users.doctor);
export const loginAsAdmin = (page: Page) => loginAs(page, users.admin);

export async function logout(page: Page) {
  await page.getByTestId('logout-button').click();
  await expect(page).toHaveURL(/\/login/);
}

export async function expectForbiddenOrRedirect(page: Page) {
  await expect
    .poll(() => page.url(), { timeout: 5_000 })
    .toMatch(/\/403|\/login|\/patient|\/doctor|\/admin/);
}

export function createUniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@e2e.local`;
}
