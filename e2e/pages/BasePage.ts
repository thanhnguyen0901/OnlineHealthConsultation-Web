import type { Locator, Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path);
  }

  byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  heading(level = 1): Locator {
    return this.page.getByRole('heading', { level }).first();
  }
}
