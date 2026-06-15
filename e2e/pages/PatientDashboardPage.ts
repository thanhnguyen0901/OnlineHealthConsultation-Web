import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PatientDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/patient');
  }

  get root() {
    return this.byTestId('patient-dashboard-page');
  }
}
