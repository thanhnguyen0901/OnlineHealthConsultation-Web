import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/login');
  }

  get emailInput() {
    return this.page.getByRole('textbox', { name: /email/i });
  }

  get passwordInput() {
    return this.page.getByLabel(/password|mật khẩu/i);
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /login|đăng nhập/i });
  }
}
