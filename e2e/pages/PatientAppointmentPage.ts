import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PatientAppointmentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openBooking() {
    await this.goto('/patient/book-appointment');
  }

  async openHistory() {
    await this.goto('/patient/history');
  }

  get createRoot() {
    return this.byTestId('appointment-create-page');
  }

  get listRoot() {
    return this.byTestId('appointment-list-page');
  }

  get specialty() {
    return this.byTestId('appointment-specialty');
  }

  get doctor() {
    return this.byTestId('appointment-doctor');
  }

  get date() {
    return this.byTestId('appointment-date');
  }

  get time() {
    return this.byTestId('appointment-time');
  }

  get reason() {
    return this.byTestId('appointment-reason');
  }

  get submit() {
    return this.byTestId('appointment-submit');
  }

  get detail() {
    return this.byTestId('appointment-detail');
  }
}
