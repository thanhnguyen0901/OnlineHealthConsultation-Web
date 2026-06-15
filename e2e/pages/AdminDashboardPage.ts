import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/admin');
  }

  get root() {
    return this.byTestId('admin-dashboard-page');
  }
}
