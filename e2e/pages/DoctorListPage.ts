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
    return this.byTestId('doctor-search-input');
  }

  get root() {
    return this.byTestId('doctor-list-page');
  }

  get specialtyFilter() {
    return this.byTestId('specialty-filter');
  }

  get firstDoctorCard() {
    return this.page.locator('[data-testid^="doctor-card-"]').first();
  }

  get firstDetailLink() {
    return this.byTestId('doctor-detail-link').first();
  }

  doctorCard(doctorId: string) {
    return this.byTestId(`doctor-card-${doctorId}`);
  }
}
