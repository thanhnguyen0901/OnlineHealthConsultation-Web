import { expect, test } from '@playwright/test';

import { DoctorDetailPage } from '../pages/DoctorDetailPage';
import { DoctorListPage } from '../pages/DoctorListPage';
import { doctors } from '../test-data/doctors';
import { seedData } from '../test-data/seed-data';
import { users } from '../test-data/users';
import {
  answerQuestionApi,
  bookAppointmentApi,
  confirmAppointmentApi,
  createAdminUserApi,
  createPrescriptionApi,
  createQuestionApi,
  createSpecialtyApi,
  deactivateSpecialtyApi,
  getAppointmentApi,
  getConsultationResultApi,
  getPublicDoctors,
  listModerationItemsApi,
  listMyQuestionsApi,
  listMyRatingsApi,
  loginViaApi,
  moderateItemApi,
  rateAppointmentApi,
  saveConsultationSummaryApi,
  updateAdminAppointmentStatusApi,
  updateAdminUserStatusApi,
  updateDoctorSchedule,
} from '../utils/api';
import { createUniqueEmail, loginAsAdmin, loginAsDoctor, loginAsPatient } from '../utils/auth';

test.describe.configure({ mode: 'serial' });

const seededCoreAvailable = () =>
  seedData.hasPatient() && seedData.hasDoctor() && seedData.hasAdmin();

const unique = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const hcmDateKey = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const workingScheduleFor = (...dates: Date[]) =>
  Array.from(new Set(dates.map(hcmDateKey))).map((date) => ({
    date,
    startTime: '00:00',
    endTime: '23:59',
    available: true,
  }));

const futureDate = (minutesFromNow: number) => new Date(Date.now() + minutesFromNow * 60 * 1000);

async function resolveApprovedDoctorId(request: Parameters<typeof getPublicDoctors>[0]) {
  if (doctors.approvedDoctorId) return doctors.approvedDoctorId;
  const publicDoctors = await getPublicDoctors(request);
  const doctor = publicDoctors.find((item) =>
    JSON.stringify(item).toLowerCase().includes(doctors.searchKeyword.toLowerCase())
  ) ?? publicDoctors[0];

  if (!doctor?.id) {
    throw new Error('No public approved doctor is available for graduation E2E flows.');
  }
  return doctor.id as string;
}

test.describe('Graduation core E2E flows', () => {
  test('GRAD-A guest searches doctor, logs in, and books an appointment', async ({
    page,
    request,
  }) => {
    test.skip(!seededCoreAvailable(), 'Requires seeded patient, doctor, and admin credentials.');

    const doctorList = new DoctorListPage(page);
    await doctorList.open();
    await expect(doctorList.root).toBeVisible();
    await doctorList.searchInput.fill(doctors.searchKeyword);
    await expect(doctorList.firstDoctorCard).toBeVisible();

    await doctorList.firstDetailLink.click();
    const detail = new DoctorDetailPage(page);
    await expect(detail.root).toBeVisible();
    await detail.bookButton.click();
    await expect(page).toHaveURL(/\/login/);

    await loginAsPatient(page);

    const patientSession = await loginViaApi(request, users.patient);
    const doctorSession = await loginViaApi(request, users.doctor);
    const doctorId = await resolveApprovedDoctorId(request);
    const scheduledAt = futureDate(72 * 60).toISOString();
    const reason = unique('graduation-flow-a-booking');
    await updateDoctorSchedule(request, doctorSession.accessToken, workingScheduleFor(new Date(scheduledAt)));

    const appointment = await bookAppointmentApi(request, patientSession.accessToken, {
      doctorId,
      scheduledAt,
      durationMinutes: 60,
      reason,
      notes: 'Created by graduation E2E Flow A',
    });

    await expect
      .poll(async () => {
        const detail = await getAppointmentApi(request, patientSession.accessToken, appointment.id);
        return detail.reason;
      })
      .toBe(reason);

    await page.goto('/patient/history');
    await expect(page.getByTestId('appointment-list-page')).toBeVisible();
    await expect(page.getByTestId('patient-appointment-table')).toContainText(reason);
  });

  test('GRAD-B patient and doctor complete a live consultation with realtime chat', async ({
    browser,
    request,
  }) => {
    test.skip(!seededCoreAvailable(), 'Requires seeded patient, doctor, and admin credentials.');

    const patientSession = await loginViaApi(request, users.patient);
    const doctorSession = await loginViaApi(request, users.doctor);
    const doctorId = await resolveApprovedDoctorId(request);
    const scheduledAt = futureDate(10).toISOString();
    const reason = unique('graduation-flow-b-consultation');
    const summary = unique('graduation-summary');
    const medicationName = unique('graduation-medication');
    const ratingComment = unique('graduation-rating');

    await updateDoctorSchedule(request, doctorSession.accessToken, workingScheduleFor(new Date(scheduledAt)));
    const appointment = await bookAppointmentApi(request, patientSession.accessToken, {
      doctorId,
      scheduledAt,
      durationMinutes: 60,
      reason,
      notes: 'Created by graduation E2E Flow B',
    });
    await confirmAppointmentApi(request, doctorSession.accessToken, appointment.id);

    const patientContext = await browser.newContext();
    const doctorContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    const doctorPage = await doctorContext.newPage();

    try {
      await loginAsPatient(patientPage);
      await loginAsDoctor(doctorPage);

      await patientPage.goto(`/patient/consultations/${appointment.id}`);
      await expect(patientPage.getByTestId('patient-consultation-page')).toBeVisible();

      await doctorPage.goto(`/doctor/consultations/${appointment.id}`);
      await expect(doctorPage.getByTestId('consultation-session-page')).toBeVisible();
      await doctorPage.getByTestId('start-consultation').click();
      await expect(doctorPage.getByTestId('chat-message-input')).toBeVisible();

      await patientPage.reload();
      await expect(patientPage.getByTestId('chat-message-input')).toBeVisible();

      const patientMessage = unique('hello-from-patient');
      await patientPage.getByTestId('chat-message-input').fill(patientMessage);
      await patientPage.getByTestId('send-message').click();
      await expect(doctorPage.getByTestId('chat-message-list')).toContainText(patientMessage, {
        timeout: 10_000,
      });

      const doctorMessage = unique('hello-from-doctor');
      await doctorPage.getByTestId('chat-message-input').fill(doctorMessage);
      await doctorPage.getByTestId('send-message').click();
      await expect(patientPage.getByTestId('chat-message-list')).toContainText(doctorMessage, {
        timeout: 10_000,
      });

      await doctorPage.getByTestId('consultation-summary-input').fill(summary);
      await doctorPage.getByTestId('save-summary').click();
      await doctorPage.getByTestId('end-consultation').click();

      await expect
        .poll(async () => {
          const detail = await getAppointmentApi(request, doctorSession.accessToken, appointment.id);
          return detail.status;
        })
        .toMatch(/completed/i);

      await saveConsultationSummaryApi(request, doctorSession.accessToken, appointment.id, summary);
      await createPrescriptionApi(request, doctorSession.accessToken, appointment.id, medicationName);

      await patientPage.goto(`/patient/consultations/${appointment.id}`);
      await expect(patientPage.getByTestId('patient-consultation-page')).toBeVisible();
      await expect(patientPage.getByTestId('prescription-items')).toContainText(medicationName);

      const result = await getConsultationResultApi(request, patientSession.accessToken, appointment.id);
      expect(result.summary).toContain(summary);
      expect(JSON.stringify(result.prescription)).toContain(medicationName);

      await rateAppointmentApi(request, patientSession.accessToken, appointment.id, ratingComment);
      const ratings = await listMyRatingsApi(request, patientSession.accessToken);
      expect(JSON.stringify(ratings)).toContain(ratingComment);
    } finally {
      await patientContext.close();
      await doctorContext.close();
    }
  });

  test('GRAD-C patient asks a health question and sees the doctor response', async ({
    page,
    request,
  }) => {
    test.skip(!seededCoreAvailable(), 'Requires seeded patient, doctor, and admin credentials.');

    const patientSession = await loginViaApi(request, users.patient);
    const doctorSession = await loginViaApi(request, users.doctor);
    const doctorId = await resolveApprovedDoctorId(request);
    const title = unique('graduation-question');
    const answer = unique('graduation-answer');

    const question = await createQuestionApi(request, patientSession.accessToken, {
      title,
      content: 'I need E2E advice for a seeded graduation flow.',
      doctorId,
    });
    await answerQuestionApi(request, doctorSession.accessToken, question.id, answer);

    await expect
      .poll(async () => JSON.stringify(await listMyQuestionsApi(request, patientSession.accessToken)))
      .toContain(answer);

    await loginAsPatient(page);
    await page.goto('/patient/history');
    await expect(page.getByTestId('patient-question-table')).toContainText(title);
    await expect(page.getByTestId('patient-question-table')).toContainText(answer);
  });

  test('GRAD-D admin manages specialty, user, appointment, and moderation', async ({
    page,
    request,
  }) => {
    test.skip(!seededCoreAvailable(), 'Requires seeded patient, doctor, and admin credentials.');

    const adminSession = await loginViaApi(request, users.admin);
    const patientSession = await loginViaApi(request, users.patient);
    const doctorSession = await loginViaApi(request, users.doctor);
    const doctorId = await resolveApprovedDoctorId(request);
    const scheduledAt = futureDate(96 * 60).toISOString();
    const reason = unique('graduation-flow-d-admin-appointment');
    const userEmail = createUniqueEmail('graduation.admin.user');

    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await expect(page.getByTestId('admin-user-management-page')).toBeVisible();
    await expect(page.getByTestId('admin-user-table')).toBeVisible();

    await page.goto('/admin/specialties');
    await expect(page.getByTestId('admin-specialty-page')).toBeVisible();
    await expect(page.getByTestId('admin-specialty-table')).toBeVisible();

    await page.goto('/admin/appointments');
    await expect(page.getByTestId('admin-appointment-page')).toBeVisible();
    await expect(page.getByTestId('admin-appointment-table')).toBeVisible();

    await page.goto('/admin/moderation');
    await expect(page.getByTestId('admin-moderation-page')).toBeVisible();
    await expect(page.getByTestId('moderation-table')).toBeVisible();

    const specialty = await createSpecialtyApi(request, adminSession.accessToken, unique('specialty'));
    await deactivateSpecialtyApi(request, adminSession.accessToken, specialty.id);

    const createdUser = await createAdminUserApi(request, adminSession.accessToken, userEmail);
    await updateAdminUserStatusApi(request, adminSession.accessToken, createdUser.id, false);

    await updateDoctorSchedule(request, doctorSession.accessToken, workingScheduleFor(new Date(scheduledAt)));
    const appointment = await bookAppointmentApi(request, patientSession.accessToken, {
      doctorId,
      scheduledAt,
      durationMinutes: 60,
      reason,
      notes: 'Created by graduation E2E Flow D',
    });
    await updateAdminAppointmentStatusApi(request, adminSession.accessToken, appointment.id, 'CANCELLED');
    const cancelled = await getAppointmentApi(request, adminSession.accessToken, appointment.id);
    expect(cancelled.status).toMatch(/cancelled/i);

    const moderationItems = await listModerationItemsApi(request, adminSession.accessToken);
    const items = Array.isArray(moderationItems) ? moderationItems : moderationItems.items ?? [];
    expect(items.length).toBeGreaterThan(0);
    const item = items[0];
    await moderateItemApi(
      request,
      adminSession.accessToken,
      item.type,
      item.entityId,
      item.status === 'HIDDEN' ? 'RESTORE' : 'HIDE',
      'Graduation E2E moderation verification'
    );
  });
});
