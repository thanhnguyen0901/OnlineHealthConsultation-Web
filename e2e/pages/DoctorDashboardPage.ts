import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DoctorDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/doctor');
  }

  get root() {
    return this.byTestId('doctor-dashboard-page');
  }
}
