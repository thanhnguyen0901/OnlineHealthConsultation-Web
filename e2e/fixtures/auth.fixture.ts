import { test as base } from '@playwright/test';
import { loginAsAdmin, loginAsDoctor, loginAsPatient } from '../utils/auth';

export const test = base.extend({
  patientPage: async ({ browser }, use) => {
    const page = await browser.newPage();
    await loginAsPatient(page);
    await use(page);
    await page.close();
  },
  doctorPage: async ({ browser }, use) => {
    const page = await browser.newPage();
    await loginAsDoctor(page);
    await use(page);
    await page.close();
  },
  adminPage: async ({ browser }, use) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await use(page);
    await page.close();
  },
});
