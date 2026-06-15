import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DoctorDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(doctorId: string) {
    await this.goto(`/doctors/${doctorId}`);
  }

  get root() {
    return this.byTestId('doctor-detail-page');
  }

  get ratingSummary() {
    return this.byTestId('doctor-rating-summary');
  }

  get bookButton() {
    return this.byTestId('book-appointment-guest');
  }
}
