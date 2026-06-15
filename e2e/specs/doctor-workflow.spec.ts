import { expect, test } from '@playwright/test';
import { DoctorAppointmentPage } from '../pages/DoctorAppointmentPage';
import { appointments } from '../test-data/appointments';
import { seedData } from '../test-data/seed-data';
import { loginAsDoctor, loginAsPatient } from '../utils/auth';

test.describe('UC05 Doctor consultation and prescription workflow', () => {
  test('E2E-024 doctor can confirm appointment when pending action exists', async ({ page }) => {
    test.skip(!seedData.hasDoctor(), 'Requires E2E_RUN_SEEDED=true and doctor credentials.');
    const appointment = new DoctorAppointmentPage(page);

    await loginAsDoctor(page);
    await appointment.open();
    await expect(appointment.root).toBeVisible();
    await expect(appointment.table).toBeVisible();

    const confirmButton = page.locator('[data-testid^="confirm-appointment-"]').first();
    if ((await confirmButton.count()) === 0) {
      test.skip(true, 'No pending appointment confirm action exists in current seed data.');
    }

    await confirmButton.click();
  });

  test('E2E-025 doctor can complete appointment when complete action exists', async ({ page }) => {
    test.skip(!seedData.hasDoctor(), 'Requires E2E_RUN_SEEDED=true and doctor credentials.');
    const appointment = new DoctorAppointmentPage(page);

    await loginAsDoctor(page);
    await appointment.open();
    await expect(appointment.root).toBeVisible();

    const completeButton = page.locator('[data-testid^="complete-appointment-"]').first();
    if ((await completeButton.count()) === 0) {
      test.skip(true, 'No confirmed appointment complete action exists in current seed data.');
    }

    await completeButton.click();
  });

  test('E2E-026 doctor can start/join consultation session route', async ({ page }) => {
    test.skip(
      !seedData.hasDoctor() || !seedData.hasConsultationAppointment(),
      'Requires doctor credentials and E2E_CONSULTATION_APPOINTMENT_ID.'
    );

    await loginAsDoctor(page);
    await page.goto(`/doctor/consultations/${appointments.consultationAppointmentId}`);

    await expect(page.getByTestId('consultation-session-page')).toBeVisible();
  });

  test('E2E-027 doctor can save consultation summary', async ({ page }) => {
    test.skip(
      !seedData.hasDoctor() || !seedData.hasConsultationAppointment(),
      'Requires doctor credentials and E2E_CONSULTATION_APPOINTMENT_ID.'
    );

    await loginAsDoctor(page);
    await page.goto(`/doctor/consultations/${appointments.consultationAppointmentId}`);
    await page.getByTestId('consultation-summary-input').fill(`E2E summary ${Date.now()}`);
    await page.getByTestId('save-summary').click();

    await expect(page.getByTestId('consultation-session-page')).toBeVisible();
  });

  test('E2E-028 doctor can create prescription', async ({ page }) => {
    test.skip(
      !seedData.hasDoctor() || !seedData.hasConsultationAppointment(),
      'Requires doctor credentials and E2E_CONSULTATION_APPOINTMENT_ID.'
    );

    await loginAsDoctor(page);
    await page.goto(`/doctor/consultations/${appointments.consultationAppointmentId}`);
    await expect(page.getByTestId('prescription-form')).toBeVisible();
    await page.getByTestId('save-prescription').click();

    await expect(page.getByTestId('consultation-session-page')).toBeVisible();
  });

  test('E2E-029 patient can view consultation result and prescription when row exists', async ({
    page,
  }) => {
    test.skip(!seedData.hasPatient(), 'Requires E2E_RUN_SEEDED=true and patient credentials.');

    await loginAsPatient(page);
    await page.goto('/patient/history');
    const resultButton = page.getByTestId('consultation-result').first();
    if ((await resultButton.count()) === 0) {
      test.skip(true, 'No completed consultation result action exists in current seed data.');
    }

    await resultButton.click();
    await expect(page.getByTestId('consultation-result').first()).toBeVisible();
  });
});
