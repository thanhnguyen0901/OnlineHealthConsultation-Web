import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DoctorListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/doctors');
  }

  get searchInput() {
    return this.page.getByTestId('doctor-search-input');
  }

  doctorCard(doctorId: string) {
    return this.page.getByTestId(`doctor-card-${doctorId}`);
  }
}
