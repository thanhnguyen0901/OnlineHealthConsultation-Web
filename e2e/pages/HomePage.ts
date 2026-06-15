import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/');
  }

  get primaryHeading() {
    return this.heading(1);
  }

  get root() {
    return this.byTestId('home-page');
  }

  get loginLink() {
    return this.page.getByRole('link', { name: /login|đăng nhập/i }).first();
  }

  get registerLink() {
    return this.page.getByRole('link', { name: /register|đăng ký/i }).first();
  }
}
