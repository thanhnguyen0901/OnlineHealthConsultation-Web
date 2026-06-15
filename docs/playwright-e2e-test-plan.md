# Playwright E2E Test Plan

## 1. Scope

- UC01 Guest tra cứu bác sĩ.
- UC02 Đăng ký / đăng nhập / phân quyền.
- UC03 Patient đặt lịch tư vấn.
- UC04 Patient gửi câu hỏi và Doctor phản hồi.
- UC05 Doctor tư vấn, ghi kết quả và đơn thuốc.
- UC06 Administrator quản lý hệ thống và dashboard.

Không dùng Cypress, không mock toàn bộ API, không kiểm thử video/file/email/SMS thật trong MVP.

## 2. Test Environment

| Item | Value |
|---|---|
| Frontend URL | `PLAYWRIGHT_BASE_URL` hoặc `VITE_APP_URL`, default `http://localhost:5173` |
| Backend URL | `E2E_API_BASE_URL` hoặc `VITE_API_BASE_URL`, default `http://localhost:4000` |
| Database | PostgreSQL backend test/dev database |
| Seed requirement | `npm run prisma:seed` hiện tạo admin + specialties; patient/doctor/appointment/question/consultation seed cần bổ sung theo `docs/test-seed-requirements.md` |
| Required accounts | Patient, approved Doctor, Admin, optional pending Doctor |
| Browser targets | Chromium |
| Reporter | `list`, `html` |
| Trace/screenshot/video | trace on first retry, screenshot/video on failure |

## 3. Test Data

Created files:

- `e2e/test-data/users.ts`
- `e2e/test-data/doctors.ts`
- `e2e/test-data/appointments.ts`
- `e2e/test-data/seed-data.ts`

Required data:

- Admin account: default seed `admin@healthcare.local` / `Admin@123`, overridable by `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD`.
- Patient account: `E2E_PATIENT_EMAIL`, `E2E_PATIENT_PASSWORD`.
- Approved/active Doctor account: `E2E_DOCTOR_EMAIL`, `E2E_DOCTOR_PASSWORD`.
- Optional pending doctor profile: `E2E_PENDING_DOCTOR_ID`.
- Active specialty, default from backend seed: `Cardiology`.
- Public approved doctor card for UC01.
- Appointment IDs for doctor/patient workflows: `E2E_APPOINTMENT_ID`, `E2E_CONFIRMED_APPOINTMENT_ID`, `E2E_COMPLETED_APPOINTMENT_ID`, `E2E_CONSULTATION_APPOINTMENT_ID`.
- Pending/open question assigned to doctor.
- Completed consultation with prescription for patient result test.

## 4. E2E Test Case Matrix

| Test ID | UC | Title | Precondition | Test data | Steps summary | Expected result | Spec file | Priority | Automation status |
|---|---|---|---|---|---|---|---|---|---|
| E2E-001 | UC01 | Guest can view home page | FE running | None | Open `/` | Home page visible | `public.spec.ts` | P0 | Automated |
| E2E-002 | UC01 | Guest can view doctor list | FE/backend public endpoint reachable | None | Open `/doctors` | Doctor list page visible | `public.spec.ts` | P0 | Automated |
| E2E-003 | UC01 | Guest can search/filter doctors | Public doctor page loaded | Optional public data | Fill search keyword, verify stable page state | Search input remains usable, list/empty/error state visible | `public.spec.ts` | P0 | Automated |
| E2E-004 | UC01 | Guest can view doctor detail with rating summary | Approved doctor exists | Public doctor card | Open first detail link | Detail and rating summary visible | `public.spec.ts` | P0 | Automated, skip if no doctor seed |
| E2E-005 | UC01 | Guest book appointment redirects login | Approved doctor exists | Public doctor card | Click book CTA | URL contains `/login` | `public.spec.ts` | P0 | Automated, skip if no doctor seed |
| E2E-006 | UC02 | Patient can login | Patient seeded | Patient env account | Login as patient | Patient dashboard visible | `auth.spec.ts` | P0 | Automated, skip if env missing |
| E2E-007 | UC02 | Doctor can login | Doctor seeded | Doctor env account | Login as doctor | Doctor dashboard visible | `auth.spec.ts` | P0 | Automated, skip if env missing |
| E2E-008 | UC02 | Admin can login | Admin seeded | Admin env/default account | Login as admin | Admin dashboard visible | `auth.spec.ts` | P0 | Automated |
| E2E-009 | UC02 | Guest protected Patient route redirects | None | None | Open `/patient` as guest | Redirect login | `auth.spec.ts` | P0 | Automated |
| E2E-010 | UC02 | Patient cannot access Doctor/Admin | Patient seeded | Patient env account | Login patient, open forbidden routes | `/403` or safe redirect | `auth.spec.ts` | P0 | Automated, skip if env missing |
| E2E-011 | UC02 | Doctor cannot access Patient/Admin | Doctor seeded | Doctor env account | Login doctor, open forbidden routes | `/403` or safe redirect | `auth.spec.ts` | P0 | Automated, skip if env missing |
| E2E-012 | UC02 | Logout clears session | Any role account | Patient preferred, admin fallback | Login, click logout | Login page visible | `auth.spec.ts` | P0 | Automated |
| E2E-013 | UC03 | Patient can create appointment | Patient + approved doctor seed | Patient env + public doctor | Fill appointment form | Navigate/list update after submit | `patient-appointments.spec.ts` | P0 | Automated, skip if seed missing |
| E2E-014 | UC03 | Patient can view appointment list | Patient seeded | Patient env | Open history | Appointment list page/table visible | `patient-appointments.spec.ts` | P0 | Automated, skip if env missing |
| E2E-015 | UC03 | Patient can view appointment detail | Appointment exists | Patient env + appointment row | Click detail action | Detail dialog visible | `patient-appointments.spec.ts` | P0 | Automated, skip if no row |
| E2E-016 | UC03 | Patient can cancel appointment | Cancelable appointment exists | Patient env + appointment | Click cancel action | List refreshes or success path | `patient-appointments.spec.ts` | P0 | Fixme until safe cancel seed exists |
| E2E-017 | UC03 | Appointment validation error | Patient seeded | Patient env | Submit empty form | Form stays on create page | `patient-appointments.spec.ts` | P0 | Automated, skip if env missing |
| E2E-018 | UC04 | Patient can create health question | Patient seeded + specialty | Patient env | Fill title/content | Redirect history or success | `patient-questions.spec.ts` | P0 | Automated, skip if env missing |
| E2E-019 | UC04 | Patient can view own question list | Patient seeded | Patient env | Open history | Question table visible | `patient-questions.spec.ts` | P0 | Automated, skip if env missing |
| E2E-020 | UC04 | Doctor can view assigned/open question | Doctor seeded | Doctor env | Open inbox | Question table visible | `patient-questions.spec.ts` | P0 | Automated, skip if env missing |
| E2E-021 | UC04 | Doctor can answer question | Pending assigned question exists | Doctor env + question row | Open answer, submit content | Form closes/success | `patient-questions.spec.ts` | P0 | Automated, skip if no row |
| E2E-022 | UC04 | Patient can view doctor answer | Answered question exists | Patient env | Open history/detail | Answer/detail visible | `patient-questions.spec.ts` | P1 | Automated, skip if no row |
| E2E-023 | UC04 | Doctor cannot access unauthorized question | Direct question route/API not available in FE | N/A | Negative direct route unavailable | Marked future/manual | `patient-questions.spec.ts` | P2 | Fixme |
| E2E-024 | UC05 | Doctor can confirm appointment | Pending appointment exists | Doctor env + appointment row | Click confirm | Row/action updates | `doctor-workflow.spec.ts` | P0 | Automated, skip if no row |
| E2E-025 | UC05 | Doctor can complete appointment | Confirmed appointment exists | Doctor env + appointment row | Click complete | Row/action updates | `doctor-workflow.spec.ts` | P0 | Automated, skip if no row |
| E2E-026 | UC05 | Doctor can start/join consultation | Consultation appointment seed | Doctor env + appointmentId | Open session route | Session page visible | `doctor-workflow.spec.ts` | P1 | Automated, skip if seed missing |
| E2E-027 | UC05 | Doctor can save consultation summary | Consultation appointment seed | Doctor env + appointmentId | Fill summary | Save request triggered | `doctor-workflow.spec.ts` | P1 | Automated, skip if seed missing |
| E2E-028 | UC05 | Doctor can create prescription | Consultation appointment seed | Doctor env + appointmentId | Fill prescription | Save request triggered | `doctor-workflow.spec.ts` | P1 | Automated, skip if seed missing |
| E2E-029 | UC05 | Patient can view result/prescription | Completed consultation seed | Patient env + completed appointment | Open result from history | Result/prescription visible | `doctor-workflow.spec.ts` | P0 | Automated, skip if no row |
| E2E-030 | UC06 | Admin can view dashboard | Admin seeded | Admin env/default | Login admin | Dashboard visible | `admin.spec.ts` | P0 | Automated |
| E2E-031 | UC06 | Admin can view doctor list | Admin seeded | Admin env/default | Open doctors | Doctor table visible | `admin.spec.ts` | P0 | Automated |
| E2E-032 | UC06 | Admin can approve/reject doctor profile | Pending doctor exists | `E2E_PENDING_DOCTOR_ID` | Click approve/reject | Request/action available | `admin.spec.ts` | P0 | Automated, skip if seed missing |
| E2E-033 | UC06 | Admin can view specialties | Admin seeded | Admin env/default | Open specialties | Table visible | `admin.spec.ts` | P1 | Automated |
| E2E-034 | UC06 | Admin can create/update/deactivate specialty | Admin seeded, unique name | Admin env/default | Create specialty | Specialty saved | `admin.spec.ts` | P1 | Fixme to avoid mutating shared DB |
| E2E-035 | UC06 | Non-admin cannot access admin dashboard | Patient/doctor seeded | Patient or doctor env | Login non-admin, open `/admin` | Forbidden/redirect | `admin.spec.ts` | P0 | Automated, skip if env missing |

## 5. Execution Notes

- Run backend and database first for full E2E.
- Run frontend with Playwright `webServer` or set `PLAYWRIGHT_SKIP_WEB_SERVER=true` if frontend is already running.
- Use env variables for role accounts. Specs skip seeded workflows when required env/data is missing.
- HTML report is generated under `playwright-report/`.
