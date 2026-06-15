import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/register');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /^(register|đăng ký)$/i });
  }
}
