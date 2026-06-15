import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DoctorQuestionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/doctor/inbox');
  }

  get root() {
    return this.byTestId('doctor-question-list-page');
  }

  get table() {
    return this.byTestId('doctor-question-table');
  }

  get answerForm() {
    return this.byTestId('doctor-answer-form');
  }
}
