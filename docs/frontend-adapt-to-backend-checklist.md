# Frontend Adapt to Backend Checklist

## 1. Mục tiêu

Checklist này dùng để adapt frontend hiện có của `OnlineHealthConsultation-Web` với backend thật `OnlineHealthConsultation-Service`, hoàn thiện MVP đủ demo cuối kỳ, đủ màn hình chụp ảnh cho báo cáo Chương III và đủ selector ổn định để viết Playwright E2E.

Phạm vi ưu tiên là luồng public discovery, auth, patient appointment/question/consultation result, doctor appointment/question/consultation/prescription và admin doctor approval/list. Không làm Future Enhancement trong giai đoạn này: gửi email thật, SMS thật, video call thật, file upload, rate limiting, audit log UI nâng cao, performance/security test chuyên sâu hoặc full pagination toàn hệ thống nếu không cần cho demo.

## 2. Hiện trạng frontend

- Tech stack: React 18, TypeScript, Vite, React Router v6, Redux Toolkit, Redux Saga, Axios, PrimeReact, Tailwind CSS, Formik, Yup, i18next, Recharts, Playwright.
- Cấu trúc chính: `src/app` routing/guards, `src/layouts`, `src/apis/core`, `src/features/{auth,patient,doctor,admin,reports}`, `src/redux`, `src/state`, `src/components`, `src/i18n`, `e2e`.
- Routing hiện tại:
  - Public: `/`, `/login`, `/register`, wildcard 404.
  - Patient: `/patient`, `/patient/ask-question`, `/patient/book-appointment`, `/patient/history`, `/patient/profile`.
  - Doctor: `/doctor`, `/doctor/inbox`, `/doctor/patients`, `/doctor/appointments`, `/doctor/schedule`, `/doctor/ratings`, `/doctor/profile`.
  - Admin: `/admin`, `/admin/users`, `/admin/patients`, `/admin/doctors`, `/admin/specialties`, `/admin/appointments`, `/admin/moderation`.
  - Shared: `/reports` for `ADMIN`, `DOCTOR`.
- Layout hiện tại: `AuthLayout` cho login/register; `MainLayout` sidebar/topbar theo role, dark mode, language switch, logout.
- Auth flow hiện tại: `App.tsx` dispatch `meRequested`; auth saga ưu tiên access token trong `sessionStorage`, fallback `POST /auth/refresh`; role redirect sau login.
- Token storage hiện tại: access token lưu trong `sessionStorage` qua `ohc_access_token` + `ohc_access_exp`; refresh token kỳ vọng ở httpOnly cookie, không lưu local.
- API client hiện tại: Axios base URL `(VITE_API_BASE_URL || http://localhost:4000) + /api`, request interceptor gắn Bearer token, response interceptor refresh khi 401.
- State management hiện tại: Redux Toolkit slices + Redux Saga cho auth, patient, doctor, admin, reports.
- Form handling/validation hiện tại: Formik + Yup, custom `FormikInputText`, `FormikDropdown`, `FormikCalendar`.
- UI library/component pattern: PrimeReact DataTable/Dialog/Tag/Rating/Card/Button icon classes, Tailwind layout; custom common `Button`, `InlineAlert`, `Spinner`, `EmptyState`.
- Existing tests: Playwright smoke foundation đã thay thế Cypress; các test nghiệp vụ với backend thật sẽ viết ở phase sau.
- Các màn hình đã có: Home, Login, Register, Patient dashboard/profile/book appointment/ask question/history, Doctor dashboard/inbox/schedule/appointments/patients/ratings/profile, Admin dashboard/users/patients/doctors/specialties/appointments/moderation, Reports.
- Các màn hình còn thiếu: public Specialty list, public Doctor list/search/filter route, public Doctor detail route, explicit Unauthorized/Forbidden page, Appointment detail route/page, Question detail route/page, Consultation result page, Prescription page, Consultation chat/session page, Doctor create summary/prescription screen.
- Các màn hình đã có nhưng chưa gọi API thật đúng backend: Home, Register specialty dropdown, Patient profile/book/question/history/rating, Doctor profile/questions/appointments/schedule/ratings, Admin dashboard/doctors/specialties/appointments/moderation, Reports.
- Các màn hình còn dùng endpoint legacy/mismatch ở FE API files như `/patients/history`, `/patients/profile`, `/doctors/me`, `/reports/stats`; Playwright sẽ hướng tới app thật + backend thật thay vì mock toàn bộ API.

## 3. Backend API contract cần dùng

| Feature | Endpoint | Method | Auth required? | Role allowed | Request chính | Response chính | FE screen sử dụng | Status |
|---|---|---|---|---|---|---|---|---|
| Public home | `/api/public/home` | GET | No | Guest | None | service/version/status | Home | Available |
| Public specialties | `/api/public/specialties` | GET | No | Guest | None | active specialties | Home, Specialty list, Register doctor specialty, Book appointment, Ask question | Available |
| Public doctors list/search/filter | `/api/public/doctors?keyword=&specialtyId=&page=&limit=` | GET | No | Guest | query filters | `{ data, meta }`, doctor user, specialties, `avgRating`, `ratingCount` | Doctor list/search/filter, Home featured doctors | Available |
| Public doctor detail | `/api/public/doctors/:doctorId` | GET | No | Guest | `doctorId` | doctor profile, user basic info, specialties, `avgRating`, `ratingCount` | Doctor detail | Available |
| Register | `/api/auth/register` | POST | No | Guest | `email`, `password`, `firstName`, `lastName`, `role`, `specialtyId` for doctor | `accessToken`, user | Register | Available; FE currently sends `specialty`, must adapt to `specialtyId` |
| Login | `/api/auth/login` | POST | No | Guest | `email`, `password` | `accessToken`, user; refresh cookie expected | Login | Available |
| Refresh token | `/api/auth/refresh` | POST | Cookie | Auth session | refresh cookie/body per backend | `accessToken`, user | Auth bootstrap/interceptor | Available |
| Logout | `/api/auth/logout` | POST | Yes | PATIENT/DOCTOR/ADMIN | None | logout result | Logout button | Available |
| Forgot password | `/api/auth/forgot-password` | POST | No | Guest | `email` | reset token/mock response | Forgot password screen | Available backend, FE screen missing |
| Reset password | `/api/auth/reset-password` | POST | No | Guest | token/password | reset result | Reset password screen | Available backend, FE screen missing |
| Patient profile get | `/api/patients/me/profile` | GET | Yes | PATIENT | None | patient profile + user safe info | Patient dashboard/profile | Available |
| Patient profile update | `/api/patients/me/profile` | PATCH | Yes | PATIENT | profile fields | updated profile | Patient profile | Available |
| Create appointment | `/api/appointments` | POST | Yes | PATIENT | `doctorId`, `scheduledAt`, `durationMinutes?`, `reason`, `notes?` | appointment | Appointment create | Available |
| Patient appointment list | `/api/appointments/mine?status=&fromDate=&toDate=` | GET | Yes | PATIENT | filters | own appointments with doctor basic info | Appointment list/history | Available |
| Appointment detail | `/api/appointments/:id` | GET | Yes | PATIENT/DOCTOR/ADMIN | `id` | appointment detail | Appointment detail | Available |
| Cancel appointment | `/api/appointments/:id/cancel` | PATCH | Yes | PATIENT | `id` | updated appointment | Patient appointment detail/list | Available |
| Create question | `/api/questions` | POST | Yes | PATIENT | `title`, `content`, optional `doctorId` | question | Question create | Available; FE currently sends `question`, `specialtyId` |
| Patient question list | `/api/questions/mine` | GET | Yes | PATIENT | None | own questions with answers | Question list/history | Available |
| Question detail/view answer | No dedicated detail endpoint | GET | Yes | PATIENT/DOCTOR | question id | single question detail | Question detail | Missing; can derive from list for MVP |
| Consultation result | `/api/consultations/:appointmentId/result` | GET | Yes | PATIENT/DOCTOR/ADMIN | `appointmentId` | appointment, consultation, prescription, items | Consultation result, Prescription view | Available |
| Patient consultation history | `/api/consultations/mine` | GET | Yes | PATIENT | None | sessions with appointment + prescription items | Consultation history/result | Available |
| Create rating | `/api/ratings` | POST | Yes | PATIENT | `appointmentId`, `score`, `comment?` | rating | Rating after completed appointment | Available |
| Patient ratings | `/api/ratings/mine` | GET | Yes | PATIENT | None | own ratings | Rating history | Available |
| Doctor profile get | `/api/doctors/me/profile` | GET | Yes | DOCTOR | None | profile, user, specialties | Doctor dashboard/profile | Available |
| Doctor profile update | `/api/doctors/me/profile` | PATCH | Yes | DOCTOR | `bio`, `yearsOfExperience`, `isActive?` | updated profile | Doctor profile | Available |
| Doctor schedule update | `/api/doctors/me/schedule` | PATCH | Yes | DOCTOR | `schedule` JSON | updated profile/schedule | Schedule | Available |
| Doctor specialties update | `/api/doctors/me/specialties` | PATCH | Yes | DOCTOR | `specialtyIds` | updated profile | Doctor profile specialties | Available |
| Doctor appointment list | `/api/appointments/doctor/me?status=&fromDate=&toDate=` | GET | Yes | DOCTOR | filters | appointments with patient basic info | Doctor appointments | Available |
| Doctor appointment detail | `/api/appointments/:id` | GET | Yes | DOCTOR/ADMIN/PATIENT | `id` | appointment detail | Doctor appointment detail | Available |
| Confirm appointment | `/api/appointments/:id/confirm` | PATCH | Yes | DOCTOR | `id` | updated appointment | Doctor appointments/detail | Available |
| Complete appointment | `/api/appointments/:id/complete` | PATCH | Yes | DOCTOR | `id` | updated appointment | Doctor appointments/detail | Available |
| Doctor question list | `/api/questions/assigned` | GET | Yes | DOCTOR | None | assigned/open questions | Doctor inbox | Available |
| Doctor answer question | `/api/questions/:id/answers` | POST | Yes | DOCTOR | `content` | question with answers | Doctor answer question | Available; FE currently sends `{ answer }` |
| Start consultation | `/api/consultations/:appointmentId/start` | POST | Yes | DOCTOR | `channel?` | session | Consultation session screen | Available |
| Join consultation | `/api/consultations/:appointmentId/join` | POST | Yes | PATIENT/DOCTOR/ADMIN | None | session join info | Chat/video mock screen | Available |
| Consultation messages | `/api/consultations/:appointmentId/messages` | GET/POST | Yes | PATIENT/DOCTOR/ADMIN | content for POST | messages | Chat screen | Available |
| End consultation | `/api/consultations/:appointmentId/end` | PATCH | Yes | DOCTOR | None | session | Doctor consultation session | Available |
| Create/update summary | `/api/consultations/:appointmentId/summary` | PATCH | Yes | DOCTOR | `summary` | session | Create consultation summary | Available |
| Create prescription | `/api/consultations/:appointmentId/prescriptions` | POST | Yes | DOCTOR | notes + items | prescription + items | Create prescription | Available |
| Doctor consultations | `/api/consultations/doctor/me` | GET | Yes | DOCTOR | None | sessions with appointment + prescription | Doctor consultation history | Available |
| Doctor ratings | `/api/ratings/doctor/me` | GET | Yes | DOCTOR | None | visible ratings with patient/appointment | Doctor ratings | Available |
| Admin dashboard | `/api/reports/dashboard` | GET | Yes | ADMIN | optional date query | dashboard metrics | Admin dashboard | Available |
| Reporting trend | `/api/reports/consultations/trend` | GET | Yes | ADMIN | optional date query | trend rows | Reports | Available |
| Admin user list | `/api/admin/users?role=&isActive=&page=&limit=` | GET | Yes | ADMIN | filters | `{ data, meta }` users | Admin user management | Available |
| Admin user detail | `/api/admin/users/:userId` | GET | Yes | ADMIN | `userId` | safe user detail | Admin user detail | Available |
| Admin create user | `/api/admin/users` | POST | Yes | ADMIN | user fields/password | user | Admin create user | Available |
| Admin update user | `/api/admin/users/:userId` | PATCH | Yes | ADMIN | user fields | user | Admin edit user | Available |
| Admin user status | `/api/admin/users/:userId/status` | PATCH | Yes | ADMIN | `isActive`, `reason?` | user | Admin activate/deactivate | Available |
| Admin delete user | `/api/admin/users/:userId` | DELETE | Yes | ADMIN | `userId` | safe user | Admin delete/deactivate | Available |
| Admin doctor list | `/api/admin/doctors?approvalStatus=&isActive=&keyword=&page=&limit=` | GET | Yes | ADMIN | filters | doctors with user/profile/specialties | Admin doctor list/approval | Available |
| Admin doctor approval | `/api/admin/doctors/:doctorId/approval` | PATCH | Yes | ADMIN | `approvalStatus`, optional `isActive` | updated doctor | Admin doctor approval | Available |
| Admin specialties list | `/api/admin/specialties` | GET | Yes | ADMIN | None | specialties | Admin specialties | Available |
| Admin create specialty | `/api/admin/specialties` | POST | Yes | ADMIN | `nameEn`, `nameVi`, `description?` | specialty | Admin specialties | Available |
| Admin update specialty | `/api/admin/specialties/:id` | PATCH | Yes | ADMIN | fields | specialty | Admin specialties | Available |
| Admin deactivate specialty | `/api/admin/specialties/:id/deactivate` | PATCH | Yes | ADMIN | id | specialty inactive | Admin specialties | Available |
| Admin appointment list | `/api/admin/appointments?status=&fromDate=&toDate=` | GET | Yes | ADMIN | filters | appointments with patient/doctor | Admin appointment management | Available |
| Admin appointment status | `/api/admin/appointments/:id/status` | PATCH | Yes | ADMIN | `status` | appointment | Admin appointment management | Available |
| Admin question moderation | `/api/admin/questions/:id/moderation` | PATCH | Yes | ADMIN | `action`, `reason?` | question | Admin moderation | Available |
| Admin rating moderation | `/api/admin/ratings/:id/moderation` | PATCH | Yes | ADMIN | `status` | rating | Admin moderation | Available |
| Admin moderation list | No unified `/api/admin/moderation` | GET | Yes | ADMIN | None | mixed moderation items | Admin moderation | Missing; FE currently expects this |
| Admin patient management | `/api/admin/patients` | GET/POST/PATCH/DELETE | Yes | ADMIN | patient CRUD | patient list | Admin patients | Missing in backend source; use `/admin/users?role=PATIENT` or mark Need verify |

## 4. Screen-to-API mapping

| Screen | Route đề xuất hoặc hiện tại | Actor | API cần gọi | Frontend status hiện tại | Backend status | Cần sửa/thêm gì | Priority | Có cần cho báo cáo không | Có cần cho Playwright không |
|---|---|---|---|---|---|---|---|---|---|
| Home | `/` | Guest | `/public/home`, `/public/doctors?limit=...`, `/public/specialties` | Có, gọi sai `/doctors/featured` | Available | Đổi sang public doctors, hiển thị rating summary, CTA book/ask redirect login | P0 | Yes | Yes |
| Specialty list | `/specialties` | Guest | `/public/specialties` | Thiếu route/page riêng | Available | Thêm page hoặc section; stable selectors | P1 | Yes | Optional |
| Doctor list/search/filter | `/doctors` | Guest | `/public/doctors` | Thiếu route/page riêng | Available | Thêm route list, keyword/specialty filter, cards | P0 | Yes | Yes |
| Doctor detail with rating summary | `/doctors/:doctorId` | Guest | `/public/doctors/:doctorId` | Thiếu route/page riêng | Available | Thêm detail, avgRating/ratingCount, CTA book/ask | P0 | Yes | Yes |
| Guest click book appointment redirect | `/doctors/:doctorId` CTA | Guest | No API; route to login with return intent | Thiếu | FE only | Thêm CTA redirect `/login` hoặc store return URL | P0 | Yes | Yes |
| Guest click ask question redirect | `/doctors/:doctorId` CTA | Guest | No API; route to login | Thiếu | FE only | Thêm CTA redirect login | P1 | Yes | Optional |
| Register | `/register` | Guest | `/public/specialties`, `/auth/register` | Có, specialty API/payload mismatch | Available | Use public specialties; send `specialtyId` not `specialty` | P0 | Yes | Yes |
| Login | `/login` | Guest | `/auth/login`, `/auth/me`, `/auth/refresh` | Có, mostly aligned | Available | Verify response wrapper; add data-testid mirrors | P0 | Yes | Yes |
| Logout | MainLayout | Auth users | `/auth/logout` | Có | Available | Verify redirect and clear storage | P0 | Yes | Yes |
| Role-based redirect | HomeRedirect/LoginPage | Auth users | auth state | Có | FE only | Keep; add test for real login fixture | P0 | Yes | Yes |
| Unauthorized/Forbidden page | `/403` proposed | All | None | Thiếu; RoleGuard redirects home | FE only | Add explicit Forbidden page or document redirect behavior | P1 | Yes | Yes |
| Patient dashboard | `/patient` | PATIENT | `/patients/me/profile`, maybe appointment/question summaries | Có, profile endpoint mismatch | Available | Update profile API; optionally add summary cards | P0 | Yes | Yes |
| Patient profile view/update | `/patient/profile` | PATIENT | GET/PATCH `/patients/me/profile` | Có, endpoint/method mismatch | Available | Map gender enum upper/lower, user/profile response normalize | P0 | Yes | Yes |
| Appointment create | `/patient/book-appointment` | PATIENT | `/public/specialties`, `/public/doctors`, POST `/appointments` | Có, all patient endpoint paths mismatch | Available | Change API paths, normalize doctor list, use backend status enum | P0 | Yes | Yes |
| Appointment list | `/patient/history` or `/patient/appointments` | PATIENT | `/appointments/mine` | Part of history page, currently `/patients/history` | Available | Split or adapt page to separate calls | P0 | Yes | Yes |
| Appointment detail | `/patient/appointments/:id` proposed | PATIENT | `/appointments/:id` | Missing route; modal uses list row only | Available | Add detail route/modal fetching real detail | P0 | Yes | Yes |
| Cancel appointment | List/detail action | PATIENT | PATCH `/appointments/:id/cancel` | Có, wrong path | Available | Update path and status enum handling | P0 | Yes | Yes |
| Question create | `/patient/ask-question` | PATIENT | POST `/questions` | Có, payload/path mismatch | Available | Add title/content mapping; decide doctor assignment optional; remove specialtyId unless UI maps to doctor | P0 | Yes | Yes |
| Question list | `/patient/history` or `/patient/questions` | PATIENT | `/questions/mine` | In history page via `/patients/history` | Available | Load from `/questions/mine`, normalize answers | P0 | Yes | Yes |
| Question detail/view answer | `/patient/questions/:id` proposed | PATIENT | Use `/questions/mine` item or Need backend detail | Missing | Missing detail endpoint | Use list detail modal for MVP; mark backend detail future | P1 | Yes | Optional |
| Consultation result view | `/patient/consultations/:appointmentId/result` proposed | PATIENT | `/consultations/:appointmentId/result`, `/consultations/mine` | Missing | Available | Add result page/dialog | P0 | Yes | Yes |
| Prescription view | same as result or `/prescription` tab | PATIENT | `/consultations/:appointmentId/result` | Missing | Available | Render prescription + items | P0 | Yes | Yes |
| Rating after completed appointment | History/detail action | PATIENT | POST `/ratings`, GET `/ratings/mine` | Có, endpoint/payload mismatch | Available | Send `score`, remove `doctorId`; update hasRating from ratings | P1 | Yes | Optional |
| Doctor dashboard | `/doctor` | DOCTOR | `/doctors/me/profile`, maybe appointments/ratings | Có, endpoint mismatch | Available | Update API path/normalizer | P0 | Yes | Yes |
| Doctor profile view/update | `/doctor/profile` | DOCTOR | GET/PATCH `/doctors/me/profile`, PATCH specialties/schedule | Có, endpoint/payload mismatch | Available | Use correct endpoints; update specialty selection via `/doctors/me/specialties` | P1 | Yes | Optional |
| Doctor appointment list | `/doctor/appointments` | DOCTOR | `/appointments/doctor/me` | Có, endpoint mismatch | Available | Update endpoint/status enum mapping | P0 | Yes | Yes |
| Doctor appointment detail | `/doctor/appointments/:id` proposed | DOCTOR | `/appointments/:id` | Missing route/detail | Available | Add detail modal/page | P0 | Yes | Yes |
| Confirm appointment | appointment action | DOCTOR | PATCH `/appointments/:id/confirm` | Có generic update API mismatch | Available | Replace update status PUT with confirm endpoint | P0 | Yes | Yes |
| Complete appointment | appointment action | DOCTOR | PATCH `/appointments/:id/complete` | Có generic update API mismatch | Available | Replace update status PUT with complete endpoint | P0 | Yes | Yes |
| Question list | `/doctor/inbox` | DOCTOR | `/questions/assigned` | Có, endpoint mismatch | Available | Update path and normalizer | P0 | Yes | Yes |
| Question detail | `/doctor/questions/:id` proposed | DOCTOR | Use `/questions/assigned` item | Missing route | Missing detail endpoint | Detail modal from list for MVP | P1 | Yes | Optional |
| Answer question | inbox dialog | DOCTOR | POST `/questions/:id/answers` | Có, payload mismatch `{ answer }` | Available | Send `{ content }` | P0 | Yes | Yes |
| Consultation start/join/end | `/doctor/consultations/:appointmentId` proposed | DOCTOR | `/consultations/:id/start|join|end` | Missing | Available | Add simple session page/actions | P1 | Yes | Optional |
| Chat/video mock screen | same consultation route | PATIENT/DOCTOR | messages GET/POST; video mock local | Missing | Available for chat, no real video | Implement chat or mock video panel with CHAT fallback | P2 | Yes | Optional |
| Create consultation summary | doctor consultation/detail | DOCTOR | PATCH `/consultations/:appointmentId/summary` | Missing | Available | Add summary form after session | P1 | Yes | Optional |
| Create prescription | doctor consultation/detail | DOCTOR | POST `/consultations/:appointmentId/prescriptions` | Missing | Available | Add prescription item form | P1 | Yes | Optional |
| Admin dashboard/reporting | `/admin`, `/reports` | ADMIN | `/reports/dashboard`, `/reports/consultations/trend` | Có, endpoints mismatch | Available | Update reporting API and cards/charts | P0 | Yes | Yes |
| Admin user management | `/admin/users` | ADMIN | `/admin/users` GET/POST/PATCH/DELETE/status | Có, update method mismatch | Available | Use PATCH not PUT; status endpoint for activate/deactivate | P1 | Yes | Optional |
| Admin doctor list/approval | `/admin/doctors` | ADMIN | `/admin/doctors`, `/admin/doctors/:id/approval` | Có CRUD style but approval action missing/mismatch | Available | Adapt list shape; replace create/update/delete doctor where backend lacks dedicated endpoints with admin users + approval | P0 | Yes | Yes |
| Admin specialty management | `/admin/specialties` | ADMIN | `/admin/specialties` GET/POST/PATCH/deactivate | Có, update/delete methods mismatch | Available | Use PATCH and deactivate, no DELETE | P1 | Yes | Optional |
| Admin appointment management | `/admin/appointments` | ADMIN | `/admin/appointments`, `/admin/appointments/:id/status` | Có, update endpoint mismatch | Available | Use PATCH status; query `fromDate/toDate` not `startDate/endDate` | P1 | Yes | Optional |
| Admin question/rating moderation | `/admin/moderation` | ADMIN | `/admin/questions/:id/moderation`, `/admin/ratings/:id/moderation` | Có unified moderation API expected | Partial; list missing | Build list from available APIs not possible now; keep screen mock or add backend later | P2 | Yes | Optional |

## 5. FE Must Do Now

### P0 — Bắt buộc để demo/report/test

| Task | File/module dự kiến cần sửa | API liên quan | UI cần có | Acceptance criteria | data-testid cần thêm |
|---|---|---|---|---|---|
| Align API base and response unwrap for backend real contract | `src/apis/core/apiClient.ts`, feature API normalizers | All APIs | Existing error/loading states | All feature APIs read `{ data, meta }` correctly; no legacy path remains in P0 screens | `app-root`, `global-toast` |
| Replace public home featured doctors with public doctor API | `src/pages/HomePage.tsx`, new public API module | `/public/doctors`, `/public/specialties` | Featured doctor cards with rating summary | Home loads approved doctors from backend; empty/error states work | `home-doctor-card`, `home-book-cta`, `home-ask-cta` |
| Add public doctor list/search/filter | new public pages/routes, `routePaths`, `routes.tsx` | `/public/doctors`, `/public/specialties` | Search input, specialty filter, doctor cards | Guest can search/filter and open detail | `doctor-search-input`, `specialty-filter`, `doctor-card-{id}` |
| Add public doctor detail with rating summary and guest CTAs | new detail page | `/public/doctors/:doctorId` | Doctor profile, specialties, avgRating/ratingCount, book/ask CTA | Detail renders backend rating summary; guest CTA redirects login | `doctor-detail`, `doctor-rating-summary`, `book-appointment-guest`, `ask-question-guest` |
| Fix register doctor specialty payload | `auth.api.ts`, `RegisterPage.tsx` | `/public/specialties`, `/auth/register` | Existing register form | Doctor register sends `specialtyId`; patient register unaffected | `register-role`, `register-specialty` |
| Fix patient profile API | `patient.api.ts`, patient normalizers | `/patients/me/profile` GET/PATCH | Existing profile form | Load/update profile succeeds with backend shape; gender enum maps correctly | `patient-profile-form`, `patient-profile-save` |
| Fix patient appointment booking API | `patient.api.ts`, `BookAppointmentPage.tsx` | `/public/specialties`, `/public/doctors`, `/appointments` | Existing booking form | Specialty/doctor dropdowns use real public data; submit creates appointment | `appointment-specialty`, `appointment-doctor`, `appointment-date`, `appointment-time` |
| Replace patient history aggregate API | `patient.api.ts`, `ConsultationHistoryPage.tsx`, patient state | `/questions/mine`, `/appointments/mine`, `/consultations/mine`, `/ratings/mine` | Questions and appointments tables | History page loads from separate backend endpoints and normalizes status | `patient-question-table`, `patient-appointment-table` |
| Add/fetch appointment detail for patient/doctor/admin | routes/pages or detail dialogs | `/appointments/:id` | Detail view/modal | Clicking detail fetches owner-safe detail from backend | `appointment-detail`, `appointment-detail-close` |
| Fix patient cancel and rating | `patient.api.ts`, `ConsultationHistoryPage.tsx` | PATCH `/appointments/:id/cancel`, POST `/ratings` | Cancel button, rating dialog | Cancel works; rating sends `score` and comment only | `appointment-cancel-{id}`, `rating-submit` |
| Add patient consultation result/prescription view | new page/dialog in patient history | `/consultations/:appointmentId/result` | Result summary, prescription items | Completed consultation shows summary and prescription; no prescription shows empty state | `consultation-result`, `prescription-items` |
| Fix doctor profile/dashboard API | `doctor.api.ts`, doctor pages | `/doctors/me/profile` | Existing dashboard/profile | Doctor dashboard/profile loads from real endpoint | `doctor-profile-form`, `doctor-dashboard-stats` |
| Fix doctor appointment list/actions | `doctor.api.ts`, `DoctorAppointmentsPage.tsx` | `/appointments/doctor/me`, `/appointments/:id/confirm`, `/appointments/:id/complete` | Appointment table with confirm/complete/detail | Doctor can confirm/complete own appointments only | `doctor-appointment-table`, `confirm-appointment-{id}`, `complete-appointment-{id}` |
| Fix doctor inbox answer question | `doctor.api.ts`, `InboxQuestionsPage.tsx` | `/questions/assigned`, `/questions/:id/answers` | Inbox table + answer dialog | Doctor answers with `{ content }`; list refreshes | `doctor-question-table`, `answer-question-submit` |
| Fix admin dashboard and doctor approval | `admin.api.ts`, `AdminDashboardPage.tsx`, `DoctorsManagePage.tsx` | `/reports/dashboard`, `/admin/doctors`, `/admin/doctors/:id/approval` | Dashboard cards; doctor approval controls | Admin can list/filter doctors and approve/reject/activate | `admin-dashboard`, `doctor-approval-status`, `approve-doctor-{id}`, `reject-doctor-{id}` |
| Update E2E selectors for Playwright compatibility | all P0 screens | N/A | Add `data-testid`; keep existing attributes only where source already uses them | Playwright can locate stable controls without text-only selectors | `login-submit`, `doctor-card-*`, `appointment-detail`, etc. |

### P1 — Nên làm để báo cáo đầy đủ hơn

| Task | File/module dự kiến cần sửa | API liên quan | UI cần có | Acceptance criteria | data-testid cần thêm |
|---|---|---|---|---|---|
| Add explicit Specialty list page | new route/page | `/public/specialties` | Specialty cards/list | Guest can browse specialties and filter doctors | `specialty-card-{id}` |
| Add explicit Question detail screens/modals | patient/doctor question pages | list-derived item; Need backend detail for direct link | Detail modal with answer history | User can inspect question and answer | `question-detail`, `question-answer` |
| Add doctor consultation summary form | doctor appointment/detail | `/consultations/:id/summary` | Textarea form | Doctor saves summary after completion | `consultation-summary-input`, `save-summary` |
| Add doctor prescription form | doctor appointment/detail | `/consultations/:id/prescriptions` | Dynamic prescription item rows | Doctor creates prescription with at least one item | `prescription-item-row`, `save-prescription` |
| Fix admin users/specialties/appointments methods | `admin.api.ts`, admin pages | PATCH endpoints, deactivate/status endpoints | Existing tables/dialogs | Admin CRUD-like flows work with backend true methods | `admin-user-save`, `specialty-deactivate`, `appointment-status-save` |
| Update reports page to real dashboard/trend APIs | `reports.api.ts`, reports pages | `/reports/dashboard`, `/reports/consultations/trend` | Charts/cards | Reports route renders real backend data | `reports-chart`, `reports-filter` |
| Expand Playwright E2E smoke suite into critical flows | `e2e/specs`, `e2e/pages`, real backend seed data | Real backend or seeded API | Login, discovery, booking, admin approval tests | Playwright can run demo smoke suite and later full flows | `e2e-*` stable selectors |

### P2 — Có thể để TODO

| Task | File/module dự kiến cần sửa | API liên quan | UI cần có | Acceptance criteria | data-testid cần thêm |
|---|---|---|---|---|---|
| Forgot/reset password screens | auth routes/pages | `/auth/forgot-password`, `/auth/reset-password` | Forms | User can request/reset in mock/dev flow | `forgot-password-form`, `reset-password-form` |
| Doctor patients page real backend | `doctor.api.ts`, `DoctorPatientsPage.tsx` | Need verify with backend docs/source | Patient table | Page either hidden or backed by real endpoint | `doctor-patient-table` |
| Chat/session page | new consultation page | `/consultations/:id/join`, messages GET/POST | Chat UI, video mock panel | Basic chat works or is demo-mocked clearly | `chat-message-input`, `send-message` |
| Admin moderation unified screen | admin moderation page | Backend has action endpoints but no unified list | Moderation table | Keep mocked or wait backend list endpoint | `moderation-table` |
| Notification center | new page | `/notifications/mine` | Notification list | User sees in-app notifications | `notification-list` |

## 6. Future Enhancement / Not Now

| Mục | Lý do để sau |
|---|---|
| Send mail thật | Backend MVP chỉ log/in-app notification; provider thật cần SMTP/SendGrid secret và deliverability handling. |
| SMS thật | Cần provider, chi phí và test số điện thoại thật; không block demo FE. |
| Video call thật | Backend hiện fallback chat; WebRTC/Jitsi/Agora phức tạp và không cần cho final MVP. |
| File upload | Backend chưa làm upload/storage; FE không nên mở upload thật lúc này. |
| Rate limiting | Là hạ tầng bảo mật backend, không ảnh hưởng màn hình demo chính. |
| Audit log UI nâng cao | Backend có audit log nội bộ nhưng không có UI nâng cao; không block FE. |
| Performance/security test chuyên sâu | Dành cho hardening sau MVP, không phù hợp thời gian đồ án cuối kỳ. |
| Full pagination nếu chưa cần | Chỉ dùng pagination nơi backend đã có hoặc screen cần thật sự; không làm đồng loạt. |
| Patient close question | Không có endpoint patient close; admin moderation đã đủ demo. |
| Doctor cancel appointment | Backend để Future Enhancement; FE không thêm action giả. |
| Real notification provider/retry UI | Backend outbox/log đủ minh chứng, UI provider/retry nâng cao để sau. |
