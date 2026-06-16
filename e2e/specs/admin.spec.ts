import { expect, test } from '@playwright/test';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminDoctorPage } from '../pages/AdminDoctorPage';
import { seedData } from '../test-data/seed-data';
import { loginAsAdmin, loginAsDoctor, loginAsPatient, expectForbiddenOrRedirect } from '../utils/auth';

test.describe('UC06 Admin management', () => {
  test('E2E-030 admin can view dashboard', async ({ page }) => {
    test.skip(!seedData.hasAdmin(), 'Requires E2E_RUN_SEEDED=true and admin credentials/backend seed.');
    const dashboard = new AdminDashboardPage(page);

    await loginAsAdmin(page);

    await expect(dashboard.root).toBeVisible();
  });

  test('E2E-031 admin can view doctor list', async ({ page }) => {
    test.skip(!seedData.hasAdmin(), 'Requires E2E_RUN_SEEDED=true and admin credentials/backend seed.');
    const doctors = new AdminDoctorPage(page);

    await loginAsAdmin(page);
    await doctors.open();

    await expect(doctors.root).toBeVisible();
    await expect(doctors.table).toBeVisible();
  });

  test('E2E-032 admin can approve/reject doctor profile when pending doctor seed exists', async ({
    page,
  }) => {
    test.skip(
      !seedData.hasAdmin() || !seedData.hasPendingDoctor(),
      'Requires admin credentials and E2E_PENDING_DOCTOR_ID.'
    );
    const doctors = new AdminDoctorPage(page);

    await loginAsAdmin(page);
    await doctors.open();

    await expect(doctors.approveButton(seedData.doctors.pendingDoctorId)).toBeVisible();
  });

  test('E2E-033 admin can view specialties', async ({ page }) => {
    test.skip(!seedData.hasAdmin(), 'Requires E2E_RUN_SEEDED=true and admin credentials/backend seed.');

    await loginAsAdmin(page);
    await page.goto('/admin/specialties');

    await expect(page.getByTestId('admin-specialty-page')).toBeVisible();
    await expect(page.getByTestId('admin-specialty-table')).toBeVisible();
  });

  test('E2E-034 admin can create/update/deactivate specialty', async ({ page }) => {
    test.skip(!seedData.hasAdmin(), 'Requires E2E_RUN_SEEDED=true and admin credentials/backend seed.');
    const uniqueSuffix = Date.now();
    const nameEn = `E2E Disposable Specialty ${uniqueSuffix}`;
    const updatedNameEn = `E2E Disposable Specialty Updated ${uniqueSuffix}`;

    await loginAsAdmin(page);
    await page.goto('/admin/specialties');
    await expect(page.getByTestId('admin-specialty-page')).toBeVisible();

    await page.getByTestId('new-specialty').click();
    await page.locator('#nameEn').fill(nameEn);
    await page.locator('#nameVi').fill(`Chuyen khoa tam E2E ${uniqueSuffix}`);
    await page.locator('#description').fill('Created by Playwright E2E.');
    await page.getByTestId('specialty-save').click();

    const createdRow = page.getByRole('row', { name: new RegExp(nameEn) });
    await expect(createdRow).toBeVisible();

    await createdRow.locator('[data-testid^="edit-specialty-"]').click();
    await page.locator('#nameEn').fill(updatedNameEn);
    await page.locator('#description').fill('Updated by Playwright E2E.');
    await page.getByTestId('specialty-save').click();

    const updatedRow = page.getByRole('row', { name: new RegExp(updatedNameEn) });
    await expect(updatedRow).toBeVisible();

    await updatedRow.locator('[data-testid^="deactivate-specialty-"]').click();
    await page.getByTestId('specialty-deactivate').click();
    await expect(page.getByTestId('admin-specialty-page')).toBeVisible();
  });

  test('E2E-035 non-admin cannot access admin dashboard', async ({ page }) => {
    test.skip(
      !seedData.hasPatient() && !seedData.hasDoctor(),
      'Requires E2E_RUN_SEEDED=true and patient or doctor credentials.'
    );

    if (seedData.hasPatient()) {
      await loginAsPatient(page);
    } else {
      await loginAsDoctor(page);
    }
    await page.goto('/admin');
    await expectForbiddenOrRedirect(page);
  });
});
