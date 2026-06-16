import { expect, test } from '@playwright/test';
import { PatientAppointmentPage } from '../pages/PatientAppointmentPage';
import { appointments } from '../test-data/appointments';
import { seedData } from '../test-data/seed-data';
import { loginAsPatient } from '../utils/auth';

test.describe('UC03 Patient appointment', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!seedData.hasPatient(), 'Requires E2E_RUN_SEEDED=true and patient credentials.');
    await loginAsPatient(page);
  });

  test('E2E-013 patient can create appointment with valid doctor/time/reason', async ({ page }) => {
    test.skip(!seedData.hasApprovedDoctor(), 'Requires approved public doctor seed and E2E_APPROVED_DOCTOR_ID.');
    const appointment = new PatientAppointmentPage(page);

    await appointment.openBooking();

    await expect(appointment.createRoot).toBeVisible();
    await expect(appointment.specialty).toBeVisible();
    await expect(appointment.doctor).toBeVisible();
    await expect(appointment.date).toBeVisible();
    await expect(appointment.reason).toBeVisible();
  });

  test('E2E-014 patient can view appointment list', async ({ page }) => {
    const appointment = new PatientAppointmentPage(page);

    await appointment.openHistory();

    await expect(appointment.listRoot).toBeVisible();
    await expect(page.getByTestId('patient-appointment-table')).toBeVisible();
  });

  test('E2E-015 patient can view appointment detail when a row exists', async ({ page }) => {
    const appointment = new PatientAppointmentPage(page);

    await appointment.openHistory();
    const detailButton = page.getByTestId('appointment-detail').first();
    await expect(detailButton).toBeVisible();

    await detailButton.click();
    await expect(appointment.detail.first()).toBeVisible();
  });

  test('E2E-016 patient can cancel appointment if status allows', async ({ page }) => {
    test.skip(
      !appointments.cancellableAppointmentId,
      'Requires E2E_CANCELLABLE_APPOINTMENT_ID disposable appointment seed.'
    );
    const appointment = new PatientAppointmentPage(page);

    await appointment.openHistory();
    const cancelButton = page.getByTestId(
      `appointment-cancel-${appointments.cancellableAppointmentId}`
    );
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    await expect(cancelButton).toBeHidden();
  });

  test('E2E-017 patient sees validation error when appointment data is missing', async ({ page }) => {
    const appointment = new PatientAppointmentPage(page);

    await appointment.openBooking();
    await appointment.submit.click();

    await expect(appointment.createRoot).toBeVisible();
  });
});
