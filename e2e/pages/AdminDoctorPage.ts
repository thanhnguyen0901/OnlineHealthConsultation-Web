import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminDoctorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/admin/doctors');
  }

  get root() {
    return this.byTestId('admin-doctor-list-page');
  }

  get table() {
    return this.byTestId('admin-doctor-table');
  }

  approveButton(doctorId: string) {
    return this.byTestId(`approve-doctor-${doctorId}`);
  }

  rejectButton(doctorId: string) {
    return this.byTestId(`reject-doctor-${doctorId}`);
  }
}
