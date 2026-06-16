# Playwright E2E Test Summary

## Tổng quan

Playwright E2E suite hiện cover các luồng chính của đồ án cuối kỳ theo UC trong báo cáo:

- UC01 Guest tra cứu bác sĩ.
- UC02 Đăng ký / đăng nhập / phân quyền.
- UC03 Patient đặt lịch tư vấn.
- UC04 Patient gửi câu hỏi và Doctor phản hồi.
- UC05 Doctor tư vấn, ghi kết quả và đơn thuốc.
- UC06 Administrator quản lý hệ thống và dashboard.

Suite không dùng Cypress, không dùng intercept/fixture kiểu Cypress, không mock toàn bộ API. Lần chạy mới nhất sử dụng frontend thật, backend thật và seed E2E từ backend `prisma/seed-e2e.ts`.

## Spec Files

- `e2e/specs/public.spec.ts`
- `e2e/specs/auth.spec.ts`
- `e2e/specs/patient-appointments.spec.ts`
- `e2e/specs/patient-questions.spec.ts`
- `e2e/specs/doctor-workflow.spec.ts`
- `e2e/specs/admin.spec.ts`

## Page Objects and Helpers

Page objects:

- `BasePage`
- `HomePage`
- `LoginPage`
- `RegisterPage`
- `DoctorListPage`
- `DoctorDetailPage`
- `PatientDashboardPage`
- `PatientAppointmentPage`
- `PatientQuestionPage`
- `DoctorDashboardPage`
- `DoctorQuestionPage`
- `DoctorAppointmentPage`
- `AdminDashboardPage`
- `AdminDoctorPage`

Helpers/test data:

- `e2e/utils/auth.ts`
- `e2e/utils/api.ts`
- `e2e/utils/selectors.ts`
- `e2e/utils/testIds.ts`
- `e2e/test-data/users.ts`
- `e2e/test-data/doctors.ts`
- `e2e/test-data/appointments.ts`
- `e2e/test-data/seed-data.ts`

## Test Cases

| Test ID | UC | Title | Spec | Current status |
|---|---|---|---|---|
| E2E-001 | UC01 | Guest can view home page | `public.spec.ts` | Passed |
| E2E-002 | UC01 | Guest can view doctor list | `public.spec.ts` | Passed |
| E2E-003 | UC01 | Guest can search/filter doctors by keyword | `public.spec.ts` | Passed |
| E2E-004 | UC01 | Guest can view doctor detail with rating summary | `public.spec.ts` | Passed |
| E2E-005 | UC01 | Guest book appointment redirects login | `public.spec.ts` | Passed |
| E2E-006 | UC02 | Patient can login | `auth.spec.ts` | Passed |
| E2E-007 | UC02 | Doctor can login | `auth.spec.ts` | Passed |
| E2E-008 | UC02 | Admin can login | `auth.spec.ts` | Passed |
| E2E-009 | UC02 | Guest protected Patient route redirects login | `auth.spec.ts` | Passed |
| E2E-010 | UC02 | Patient cannot access Doctor/Admin | `auth.spec.ts` | Passed |
| E2E-011 | UC02 | Doctor cannot access Patient/Admin | `auth.spec.ts` | Passed |
| E2E-012 | UC02 | Logout clears session | `auth.spec.ts` | Passed |
| E2E-013 | UC03 | Patient can create appointment | `patient-appointments.spec.ts` | Passed |
| E2E-014 | UC03 | Patient can view appointment list | `patient-appointments.spec.ts` | Passed |
| E2E-015 | UC03 | Patient can view appointment detail | `patient-appointments.spec.ts` | Passed |
| E2E-016 | UC03 | Patient can cancel appointment | `patient-appointments.spec.ts` | Passed |
| E2E-017 | UC03 | Appointment validation error | `patient-appointments.spec.ts` | Passed |
| E2E-018 | UC04 | Patient can create health question | `patient-questions.spec.ts` | Passed |
| E2E-019 | UC04 | Patient can view own question list | `patient-questions.spec.ts` | Passed |
| E2E-020 | UC04 | Doctor can view assigned/open question | `patient-questions.spec.ts` | Passed |
| E2E-021 | UC04 | Doctor can answer question | `patient-questions.spec.ts` | Passed |
| E2E-022 | UC04 | Patient can view doctor answer | `patient-questions.spec.ts` | Passed |
| E2E-023 | UC04 | Doctor unauthorized question negative | `patient-questions.spec.ts` | Skipped/Fixme: frontend MVP has no direct question detail route/API |
| E2E-024 | UC05 | Doctor can confirm appointment | `doctor-workflow.spec.ts` | Passed |
| E2E-025 | UC05 | Doctor can complete appointment | `doctor-workflow.spec.ts` | Passed |
| E2E-026 | UC05 | Doctor can start/join consultation | `doctor-workflow.spec.ts` | Passed |
| E2E-027 | UC05 | Doctor can save consultation summary | `doctor-workflow.spec.ts` | Passed |
| E2E-028 | UC05 | Doctor can create prescription | `doctor-workflow.spec.ts` | Passed |
| E2E-029 | UC05 | Patient can view result/prescription | `doctor-workflow.spec.ts` | Passed |
| E2E-030 | UC06 | Admin can view dashboard | `admin.spec.ts` | Passed |
| E2E-031 | UC06 | Admin can view doctor list | `admin.spec.ts` | Passed |
| E2E-032 | UC06 | Admin can approve/reject doctor profile | `admin.spec.ts` | Passed |
| E2E-033 | UC06 | Admin can view specialties | `admin.spec.ts` | Passed |
| E2E-034 | UC06 | Admin can create/update/deactivate specialty | `admin.spec.ts` | Passed |
| E2E-035 | UC06 | Non-admin cannot access admin dashboard | `admin.spec.ts` | Passed |

Additional smoke checks:

- Login page loads: Passed.
- Register page loads: Passed.

## Test Data / Accounts Used

Seed source: backend `OnlineHealthConsultation-Service/prisma/seed-e2e.ts`.

Environment variables used for the final run:

```bash
E2E_RUN_SEEDED=true
E2E_PATIENT_EMAIL=patient.e2e@healthcare.local
E2E_PATIENT_PASSWORD=Patient@123
E2E_DOCTOR_EMAIL=doctor.e2e@healthcare.local
E2E_DOCTOR_PASSWORD=Doctor@123
E2E_ADMIN_EMAIL=admin@healthcare.local
E2E_ADMIN_PASSWORD=Admin@123
E2E_APPROVED_DOCTOR_ID=019ed085-9bb9-7a83-bdee-b3b266b827b8
E2E_PENDING_DOCTOR_ID=019ed085-9bb9-7a83-bdee-b3b35ffc1f61
E2E_APPOINTMENT_ID=019ed085-9bc5-7ee1-aeb6-93edb9a2e3ce
E2E_CONFIRMED_APPOINTMENT_ID=019ed085-9bc7-7925-9834-cedf831db8df
E2E_COMPLETED_APPOINTMENT_ID=019ed085-9bca-78ba-b82b-f11d937b337c
E2E_CONSULTATION_APPOINTMENT_ID=019ed085-9bcc-76ff-91ae-fa05ce14721d
E2E_CANCELLABLE_APPOINTMENT_ID=019ed085-9bc9-76a1-b3d0-7f6a3899cc0b
E2E_DOCTOR_SEARCH_KEYWORD=cardiology
E2E_SPECIALTY_NAME=E2E Cardiology
VITE_API_BASE_URL=http://localhost:4000
E2E_API_BASE_URL=http://localhost:4000
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

## Cách chạy test

Prepare backend:

```bash
cd OnlineHealthConsultation-Service
source ~/.nvm/nvm.sh
npm run prisma:migrate:deploy
npm run db:seed:e2e
npm run dev
```

Run frontend checks:

```bash
cd OnlineHealthConsultation-Web
source ~/.nvm/nvm.sh
npm run build
npm run lint
npm run test:e2e
```

## Kết quả chạy thật

Commands actually run:

```bash
npm run build
npm run lint
npm run test:e2e
```

Results:

- `npm run build`: pass. Non-blocking warnings: old browserslist data and large chunks.
- `npm run lint`: pass.
- `npm run test:e2e`: pass.
  - 37 tests discovered.
  - 36 passed.
  - 1 skipped/fixme.
  - 0 failed.

Remaining skipped/fixme:

- E2E-023: Doctor unauthorized question direct route. Reason: current frontend MVP has no direct question detail route/API for this negative test. This is documented as a future route/API coverage item, not a seed-data gap.

## Screenshot / Report Path

- HTML report: `playwright-report/index.html`
- Test artifacts on failure: `test-results/`
- Final run had no failed tests, so no final failure screenshot/video/trace artifact was produced.
- Earlier failed/retried runs may have artifacts under `test-results/`; they are not final-pass evidence.

## Mapping với UC trong report

- UC01: `public.spec.ts` - 5 passed.
- UC02: `auth.spec.ts` - 8 passed including smoke login/register.
- UC03: `patient-appointments.spec.ts` - 5 passed.
- UC04: `patient-questions.spec.ts` - 5 passed, 1 skipped/fixme.
- UC05: `doctor-workflow.spec.ts` - 6 passed.
- UC06: `admin.spec.ts` - 6 passed.

## Bug/fix notes

- Added E2E seed data in backend for patient, doctor, admin, appointments, questions, consultations, prescriptions, ratings and disposable specialty workflows.
- Updated tests that checked seeded UI rows too early to wait for expected seeded controls instead of skipping.
- Updated doctor confirm/complete tests to target deterministic seeded appointment IDs instead of clicking the first matching action.
- Reopened patient cancel appointment and admin specialty create/update/deactivate tests using disposable seed/test data.
