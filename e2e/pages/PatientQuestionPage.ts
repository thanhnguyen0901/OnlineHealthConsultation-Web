import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PatientQuestionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openCreate() {
    await this.goto('/patient/ask-question');
  }

  async openHistory() {
    await this.goto('/patient/history');
  }

  get createRoot() {
    return this.byTestId('question-create-page');
  }

  get titleInput() {
    return this.byTestId('question-title-input');
  }

  get contentInput() {
    return this.byTestId('question-content-input');
  }

  get submit() {
    return this.byTestId('question-submit');
  }

  get questionTable() {
    return this.byTestId('patient-question-table');
  }
}
