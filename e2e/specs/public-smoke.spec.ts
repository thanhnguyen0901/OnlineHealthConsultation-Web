import { expect, test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DoctorListPage } from '../pages/DoctorListPage';

test.describe('Public smoke', () => {
  test('home page loads', async ({ page }) => {
    const home = new HomePage(page);

    await home.open();

    await expect(home.primaryHeading).toBeVisible();
  });

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

  test('doctor list page loads', async ({ page }) => {
    const doctorList = new DoctorListPage(page);

    await doctorList.open();

    await expect(page.getByTestId('doctor-list-page')).toBeVisible();
    await expect(doctorList.searchInput).toBeVisible();
  });

  test('guest book appointment CTA redirects to login when a doctor card exists', async ({
    page,
  }) => {
    const doctorList = new DoctorListPage(page);

    await doctorList.open();
    const firstBookButton = page.getByTestId('book-appointment-guest').first();

    if ((await firstBookButton.count()) === 0) {
      test.skip(true, 'No public doctors returned by the current backend/test data.');
    }

    await firstBookButton.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
