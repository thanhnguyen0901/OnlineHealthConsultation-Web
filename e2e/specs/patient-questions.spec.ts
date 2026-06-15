import { expect, test } from '@playwright/test';
import { DoctorQuestionPage } from '../pages/DoctorQuestionPage';
import { PatientQuestionPage } from '../pages/PatientQuestionPage';
import { seedData } from '../test-data/seed-data';
import { loginAsDoctor, loginAsPatient } from '../utils/auth';

test.describe('UC04 Patient question and doctor answer', () => {
  test('E2E-018 patient can create health question', async ({ page }) => {
    test.skip(!seedData.hasPatient(), 'Requires E2E_RUN_SEEDED=true and patient credentials.');
    const question = new PatientQuestionPage(page);

    await loginAsPatient(page);
    await question.openCreate();
    await question.titleInput.fill(`E2E question ${Date.now()}`);
    await question.contentInput.fill('I have a mild headache during exercise. Should I worry?');
    await question.submit.click();

    await expect(page).toHaveURL(/\/patient\/history|\/patient\/ask-question/);
  });

  test('E2E-019 patient can view own question list', async ({ page }) => {
    test.skip(!seedData.hasPatient(), 'Requires E2E_RUN_SEEDED=true and patient credentials.');
    const question = new PatientQuestionPage(page);

    await loginAsPatient(page);
    await question.openHistory();

    await expect(question.questionTable).toBeVisible();
  });

  test('E2E-020 doctor can view assigned/open question', async ({ page }) => {
    test.skip(!seedData.hasDoctor(), 'Requires E2E_RUN_SEEDED=true and doctor credentials.');
    const question = new DoctorQuestionPage(page);

    await loginAsDoctor(page);
    await question.open();

    await expect(question.root).toBeVisible();
    await expect(question.table).toBeVisible();
  });

  test('E2E-021 doctor can answer question when a pending row exists', async ({ page }) => {
    test.skip(!seedData.hasDoctor(), 'Requires E2E_RUN_SEEDED=true and doctor credentials.');
    const question = new DoctorQuestionPage(page);

    await loginAsDoctor(page);
    await question.open();
    const answerButton = page.getByTestId('doctor-question-detail').first();
    if ((await answerButton.count()) === 0) {
      test.skip(true, 'No pending assigned question exists in current seed data.');
    }

    await answerButton.click();
    await expect(question.answerForm).toBeVisible();
    await page.getByRole('textbox').last().fill('Please monitor symptoms and book a consultation if it persists.');
    await page.getByTestId('answer-question-submit').click();
  });

  test('E2E-022 patient can view doctor answer when answered question exists', async ({ page }) => {
    test.skip(!seedData.hasPatient(), 'Requires E2E_RUN_SEEDED=true and answered question seed.');
    const question = new PatientQuestionPage(page);

    await loginAsPatient(page);
    await question.openHistory();
    const detailButton = page.getByTestId('question-detail').first();
    if ((await detailButton.count()) === 0) {
      test.skip(true, 'No question detail row exists in current seed data.');
    }

    await detailButton.click();
    await expect(page.getByTestId('question-detail').first()).toBeVisible();
  });

  test('E2E-023 doctor cannot access unauthorized question direct route', async () => {
    test.fixme(true, 'Frontend has no direct question detail route/API for this negative test in MVP.');
  });
});
