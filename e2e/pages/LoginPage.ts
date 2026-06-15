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
    return this.byTestId('email-input');
  }

  get passwordInput() {
    return this.byTestId('password-input');
  }

  get submitButton() {
    return this.byTestId('login-submit-button');
  }
}
