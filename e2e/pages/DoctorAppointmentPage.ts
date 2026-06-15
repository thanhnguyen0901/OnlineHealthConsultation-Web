import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DoctorAppointmentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/doctor/appointments');
  }

  get root() {
    return this.byTestId('doctor-appointment-list-page');
  }

  get table() {
    return this.byTestId('doctor-appointment-table');
  }
}
