# Playwright E2E Test Summary

## Tổng quan

Đã mở rộng Playwright E2E suite cho các luồng chính của đồ án cuối kỳ theo UC trong báo cáo:

- UC01 Guest tra cứu bác sĩ.
- UC02 Đăng ký / đăng nhập / phân quyền.
- UC03 Patient đặt lịch tư vấn.
- UC04 Patient gửi câu hỏi và Doctor phản hồi.
- UC05 Doctor tư vấn, ghi kết quả và đơn thuốc.
- UC06 Administrator quản lý hệ thống và dashboard.

Suite không dùng Cypress, không dùng intercept/fixture kiểu Cypress, không mock toàn bộ API. Các flow cần dữ liệu nghiệp vụ thật được viết sẵn nhưng skip khi chưa bật seed bằng `E2E_RUN_SEEDED=true`.

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
| E2E-004 | UC01 | Guest can view doctor detail with rating summary | `public.spec.ts` | Skipped: no public doctor seed |
| E2E-005 | UC01 | Guest book appointment redirects login | `public.spec.ts` | Skipped: no public doctor seed |
| E2E-006 | UC02 | Patient can login | `auth.spec.ts` | Skipped: missing seeded patient env |
| E2E-007 | UC02 | Doctor can login | `auth.spec.ts` | Skipped: missing seeded doctor env |
| E2E-008 | UC02 | Admin can login | `auth.spec.ts` | Skipped by `E2E_RUN_SEEDED` gate |
| E2E-009 | UC02 | Guest protected Patient route redirects login | `auth.spec.ts` | Passed |
| E2E-010 | UC02 | Patient cannot access Doctor/Admin | `auth.spec.ts` | Skipped: missing seeded patient env |
| E2E-011 | UC02 | Doctor cannot access Patient/Admin | `auth.spec.ts` | Skipped: missing seeded doctor env |
| E2E-012 | UC02 | Logout clears session | `auth.spec.ts` | Skipped: no seeded login account enabled |
| E2E-013 | UC03 | Patient can create appointment | `patient-appointments.spec.ts` | Skipped: missing patient/approved doctor seed |
| E2E-014 | UC03 | Patient can view appointment list | `patient-appointments.spec.ts` | Skipped: missing patient env |
| E2E-015 | UC03 | Patient can view appointment detail | `patient-appointments.spec.ts` | Skipped: missing patient/appointment seed |
| E2E-016 | UC03 | Patient can cancel appointment | `patient-appointments.spec.ts` | Fixme: needs disposable appointment seed |
| E2E-017 | UC03 | Appointment validation error | `patient-appointments.spec.ts` | Skipped: missing patient env |
| E2E-018 | UC04 | Patient can create health question | `patient-questions.spec.ts` | Skipped: missing patient env |
| E2E-019 | UC04 | Patient can view own question list | `patient-questions.spec.ts` | Skipped: missing patient env |
| E2E-020 | UC04 | Doctor can view assigned/open question | `patient-questions.spec.ts` | Skipped: missing doctor env |
| E2E-021 | UC04 | Doctor can answer question | `patient-questions.spec.ts` | Skipped: missing doctor/pending question seed |
| E2E-022 | UC04 | Patient can view doctor answer | `patient-questions.spec.ts` | Skipped: missing answered question seed |
| E2E-023 | UC04 | Doctor unauthorized question negative | `patient-questions.spec.ts` | Fixme: no direct FE detail route/API |
| E2E-024 | UC05 | Doctor can confirm appointment | `doctor-workflow.spec.ts` | Skipped: missing doctor/pending appointment seed |
| E2E-025 | UC05 | Doctor can complete appointment | `doctor-workflow.spec.ts` | Skipped: missing doctor/confirmed appointment seed |
| E2E-026 | UC05 | Doctor can start/join consultation | `doctor-workflow.spec.ts` | Skipped: missing consultation appointment seed |
| E2E-027 | UC05 | Doctor can save consultation summary | `doctor-workflow.spec.ts` | Skipped: missing consultation appointment seed |
| E2E-028 | UC05 | Doctor can create prescription | `doctor-workflow.spec.ts` | Skipped: missing consultation appointment seed |
| E2E-029 | UC05 | Patient can view result/prescription | `doctor-workflow.spec.ts` | Skipped: missing patient/completed consultation seed |
| E2E-030 | UC06 | Admin can view dashboard | `admin.spec.ts` | Skipped by `E2E_RUN_SEEDED` gate |
| E2E-031 | UC06 | Admin can view doctor list | `admin.spec.ts` | Skipped by `E2E_RUN_SEEDED` gate |
| E2E-032 | UC06 | Admin can approve/reject doctor profile | `admin.spec.ts` | Skipped: missing pending doctor seed |
| E2E-033 | UC06 | Admin can view specialties | `admin.spec.ts` | Skipped by `E2E_RUN_SEEDED` gate |
| E2E-034 | UC06 | Admin can create/update/deactivate specialty | `admin.spec.ts` | Fixme: needs disposable specialty seed |
| E2E-035 | UC06 | Non-admin cannot access admin dashboard | `admin.spec.ts` | Skipped: missing patient/doctor env |

Additional smoke checks:

- Login page loads.
- Register page loads.

## Test Data / Accounts Required

Environment variables:

```bash
E2E_RUN_SEEDED=true
E2E_PATIENT_EMAIL=
E2E_PATIENT_PASSWORD=
E2E_DOCTOR_EMAIL=
E2E_DOCTOR_PASSWORD=
E2E_ADMIN_EMAIL=admin@healthcare.local
E2E_ADMIN_PASSWORD=Admin@123
E2E_APPROVED_DOCTOR_ID=
E2E_PENDING_DOCTOR_ID=
E2E_APPOINTMENT_ID=
E2E_CONFIRMED_APPOINTMENT_ID=
E2E_COMPLETED_APPOINTMENT_ID=
E2E_CONSULTATION_APPOINTMENT_ID=
```

Detailed seed requirements are documented in `docs/test-seed-requirements.md`.

## Cách chạy test

Install browsers once:

```bash
npm run test:e2e:install
```

Run default public/smoke + seed-aware suite:

```bash
npm run test:e2e
```

Run with seeded real workflows:

```bash
E2E_RUN_SEEDED=true \
E2E_PATIENT_EMAIL=... \
E2E_PATIENT_PASSWORD=... \
E2E_DOCTOR_EMAIL=... \
E2E_DOCTOR_PASSWORD=... \
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
  - 6 passed.
  - 31 skipped/fixme due missing seeded real workflow data or intentionally protected mutations.

## Screenshot / Report Path

- HTML report: `playwright-report/index.html`
- Test artifacts on failure: `test-results/`
- Current run had no failures, so no failure screenshot/video/trace artifact was produced.

## Hình cần chụp cho báo cáo

- Terminal result showing `37 tests`, `6 passed`, `31 skipped`.
- Playwright HTML report overview from `npm run test:e2e:report`.
- Optional seeded run report after adding patient/doctor/appointment/consultation seed data.

## Mapping với UC trong report

- UC01: `public.spec.ts`
- UC02: `auth.spec.ts`
- UC03: `patient-appointments.spec.ts`
- UC04: `patient-questions.spec.ts`
- UC05: `doctor-workflow.spec.ts`
- UC06: `admin.spec.ts`

## Flow chưa automation đầy đủ và lý do

- Patient appointment create/cancel requires disposable approved doctor and appointment seed.
- Question answer workflow requires pending question assigned to seeded doctor.
- Consultation summary/prescription/result requires completed/consultation appointment seed.
- Admin approve/reject requires pending doctor seed.
- Admin specialty mutation is marked fixme to avoid mutating shared demo data without DB reset.
