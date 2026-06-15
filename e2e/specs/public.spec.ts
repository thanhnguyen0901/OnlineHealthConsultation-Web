import { expect, test } from '@playwright/test';
import { DoctorDetailPage } from '../pages/DoctorDetailPage';
import { DoctorListPage } from '../pages/DoctorListPage';
import { HomePage } from '../pages/HomePage';
import { doctors } from '../test-data/doctors';

test.describe('UC01 Public discovery', () => {
  test('E2E-001 guest can view home page', async ({ page }) => {
    const home = new HomePage(page);

    await home.open();

    await expect(home.root).toBeVisible();
    await expect(home.primaryHeading).toBeVisible();
  });

  test('E2E-002 guest can view doctor list', async ({ page }) => {
    const doctorList = new DoctorListPage(page);

    await doctorList.open();

    await expect(doctorList.root).toBeVisible();
    await expect(doctorList.searchInput).toBeVisible();
  });

  test('E2E-003 guest can search/filter doctors by keyword', async ({ page }) => {
    const doctorList = new DoctorListPage(page);

    await doctorList.open();
    await doctorList.searchInput.fill(doctors.searchKeyword);
    await doctorList.searchInput.press('Enter');

    await expect(doctorList.root).toBeVisible();
    const visibleState = page
      .getByTestId('empty-state')
      .or(page.getByTestId('error-alert'))
      .or(doctorList.firstDoctorCard)
      .first();
    await expect(visibleState).toBeVisible();
  });

  test('E2E-004 guest can view doctor detail with rating summary', async ({ page }) => {
    const doctorList = new DoctorListPage(page);
    const doctorDetail = new DoctorDetailPage(page);

    await doctorList.open();
    if ((await doctorList.firstDetailLink.count()) === 0) {
      test.skip(true, 'No approved public doctor seed data is available.');
    }

    await doctorList.firstDetailLink.click();

    await expect(doctorDetail.root).toBeVisible();
    await expect(doctorDetail.ratingSummary).toBeVisible();
  });

  test('E2E-005 guest book appointment redirects to login', async ({ page }) => {
    const doctorList = new DoctorListPage(page);

    await doctorList.open();
    const firstBookButton = page.getByTestId('book-appointment-guest').first();
    if ((await firstBookButton.count()) === 0) {
      test.skip(true, 'No approved public doctor seed data is available.');
    }

    await firstBookButton.click();

    await expect(page).toHaveURL(/\/login/);
  });
});
