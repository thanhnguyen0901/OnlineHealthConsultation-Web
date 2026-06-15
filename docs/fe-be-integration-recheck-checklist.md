# FE-BE Integration Recheck Checklist

## 1. Scope

MVP scope for this recheck:

- Public discovery: home, specialties, doctor list/search/filter, doctor detail/rating summary.
- Auth: register, login, logout, refresh, current user bootstrap.
- Patient profile.
- Patient appointments: create, list, detail, cancel.
- Patient questions: create, own list, answer view via list/detail modal.
- Patient consultation result and prescription view.
- Rating creation and patient/doctor rating history.
- Doctor profile, schedule, specialties.
- Doctor appointments: list, detail, confirm, complete.
- Doctor question/answer.
- Doctor consultation chat fallback, summary, prescription.
- Admin dashboard/reporting.
- Admin doctor list and approval.
- Admin user, specialty, appointment management where backend endpoints exist.

Out of scope: real email/SMS providers, real video call, file upload, rate limiting, advanced audit UI, deep performance/security testing, full-system pagination, Cypress.

## 2. API Contract Verification Table

| Feature | FE file/function đang gọi | FE method/path/payload hiện tại | Backend controller endpoint thật | Backend method/path/payload thật | Response shape backend | FE expected response shape | Status | Fix required |
|---|---|---|---|---|---|---|---|---|
| Public home | `public.api.getPublicHome` | `GET /public/home` | `DiscoveryController.getHome` | `GET /api/public/home` | service/version/status | direct or `{data}` | OK | None |
| Public specialties | `public.api.getPublicSpecialties` | `GET /public/specialties` | `DiscoveryController.listSpecialties` | `GET /api/public/specialties` | specialty array | specialty array | OK | None |
| Public doctors | `public.api.getPublicDoctors` | `GET /public/doctors?keyword&specialtyId&page&limit` | `DiscoveryController.listDoctors` | same | `{ data, meta }`, rating summary | paged doctors | OK | None |
| Public doctor detail | `public.api.getPublicDoctorDetail` | `GET /public/doctors/:doctorId` | `DiscoveryController.getDoctorDetail` | same | doctor detail with `avgRating`, `ratingCount` | doctor detail | OK | None |
| Register | `auth.api.register` | `POST /auth/register`, `email,password,firstName,lastName,role,specialtyId` | `AuthController.register` | same, `specialtyId` required for DOCTOR | auth payload with user/token | normalized user + access token | OK | None |
| Login | `auth.api.login` | `POST /auth/login` | `AuthController.login` | same | auth payload + refresh cookie | normalized user + access token | OK | None |
| Refresh | `refreshManager.performRefresh` | `POST /auth/refresh`, cookie only | `AuthController.refresh` | same | accessToken + user | accessToken + user | OK | None |
| Logout | `auth.api.logout` | `POST /auth/logout` | `AuthController.logout` | same | logout result | void | OK | None |
| Me | `auth.api.me/meWithToken` | `GET /auth/me` | `AuthController.me` | same | safe user | normalized user | OK | None |
| Patient profile | `patient.api.getProfile/updateProfile` | `GET/PATCH /patients/me/profile` | `PatientController` | same | profile + user safe info | normalized profile | OK | None |
| Create appointment | `patient.api.bookAppointment` | `POST /appointments`, `doctorId,scheduledAt,durationMinutes,reason,notes` | `AppointmentController.create` | same | appointment | normalized appointment/history item | OK | None |
| Patient appointments | `patient.api.getHistory` | `GET /appointments/mine` | `AppointmentController.listMine` | `status/fromDate/toDate` optional | appointment array | history appointment rows | OK | None |
| Appointment detail | `patient.api.getAppointmentDetail`, `doctor.api.getAppointmentDetail` | `GET /appointments/:id` | `AppointmentController.getDetail` | same | owner-safe detail | detail modal/page data | OK | None |
| Cancel appointment | `patient.api.cancelAppointment` | `PATCH /appointments/:id/cancel` | `AppointmentController.cancel` | same | updated appointment | refresh list | OK | None |
| Create question | `patient.api.askQuestion` | `POST /questions`, `title,content,doctorId?` | `QuestionController.create` | same | question | normalized question | OK | None |
| Patient question list | `patient.api.getHistory` | `GET /questions/mine` | `QuestionController.listMine` | same | question array with answers | history question rows | OK | None |
| Patient consultations | `patient.api.getHistory` | Not currently called | `ConsultationController.listMine` | `GET /api/consultations/mine` | sessions with appointment/prescription | Optional history enrichment | P2 Missing Use | Not blocking; use result endpoint from appointment history |
| Consultation result | `patient.api.getConsultationResult` | `GET /consultations/:appointmentId/result` | `ConsultationController.getResult` | same | appointment, consultation, prescription/items | result dialog | OK | None |
| Create rating | `patient.api.rateConsultation` | `POST /ratings`, `appointmentId,score,comment` | `RatingController.create` | same | rating | list refresh | OK | None |
| Patient ratings | `patient.api.getRatings/getHistory` | `GET /ratings/mine` | `RatingController.listMine` | same | rating array | rating history/hasRating | OK | None |
| Doctor profile | `doctor.api.getMe/updateProfile` | `GET/PATCH /doctors/me/profile` | `DoctorController` | same | profile + user + specialties | normalized doctor profile | OK | None |
| Doctor schedule | `doctor.api.updateSchedule` | `PATCH /doctors/me/schedule`, `{schedule}` | `DoctorController.updateMySchedule` | same | updated profile | refresh/profile state | OK | None |
| Doctor specialties | `doctor.api.updateProfile` | `PATCH /doctors/me/specialties`, `{specialtyIds}` | `DoctorController.updateMySpecialties` | same | updated profile | refresh profile | OK | None |
| Doctor appointments | `doctor.api.getAppointments` | `GET /appointments/doctor/me?status` | `AppointmentController.listDoctorMine` | same plus date filters | appointment array | table rows | OK | None |
| Confirm appointment | `doctor.api.updateAppointment` | `PATCH /appointments/:id/confirm` | `AppointmentController.confirm` | same | appointment | row update | OK | None |
| Complete appointment | `doctor.api.updateAppointment` | `PATCH /appointments/:id/complete` | `AppointmentController.complete` | same | appointment | row update | OK | None |
| Doctor questions | `doctor.api.getQuestions` | `GET /questions/assigned` | `QuestionController.listAssigned` | same | assigned/open questions | inbox rows | OK | None |
| Answer question | `doctor.api.answerQuestion` | `POST /questions/:id/answers`, `{content}` | `QuestionController.answer` | same | question with answers | refresh inbox | OK | None |
| Consultation start | `doctor.api.startConsultation` | `POST /consultations/:appointmentId/start`, `{channel:'CHAT'}` | `ConsultationController.start` | same | session | session page | OK | None |
| Consultation join | `doctor.api.joinConsultation` | `POST /consultations/:appointmentId/join` | `ConsultationController.join` | same | join info/session | session page | OK | None |
| Consultation messages | `doctor.api.getMessages/sendMessage` | `GET/POST /consultations/:appointmentId/messages`, `{content}` | `ConsultationController` | same | message array/message | chat fallback | OK | None |
| Consultation end | `doctor.api.endConsultation` | `PATCH /consultations/:appointmentId/end` | `ConsultationController.end` | same | session | session page | OK | None |
| Summary | `doctor.api.saveSummary` | `PATCH /consultations/:appointmentId/summary`, `{summary}` | `ConsultationController.updateSummary` | same | session | summary form | OK | None |
| Prescription | `doctor.api.createPrescription` | `POST /consultations/:appointmentId/prescriptions`, `{notes,items}` | `ConsultationController.createPrescription` | same | prescription + items | prescription form | OK | None |
| Doctor ratings | `doctor.api.getRatings` | `GET /ratings/doctor/me` | `RatingController.listDoctorMine` | same | visible ratings | ratings page | OK | None |
| Admin dashboard | `admin.api.getStats`, `reports.api.getStatistics` | `GET /reports/dashboard` | `ReportingController.getDashboard` | same | metrics + status counts | normalized stats | OK | None |
| Reports trend | `reports.api.getAppointmentsChart` | `GET /reports/consultations/trend?groupBy=day` | `ReportingController.getConsultationTrend` | same | `{points:[bucket,count]}` | chart rows | OK | None |
| Admin users list/create/update/delete | `admin.api` | `GET/POST/PATCH/DELETE /admin/users` | `AdminUserController` | create only PATIENT/DOCTOR, update no role | user list/detail-safe user | user table | Need Fix | Remove ADMIN from create role options and do not send role on update |
| Admin user status | `admin.api.deletePatient` | `PATCH /admin/users/:id/status`, `{isActive:false}` | `AdminUserController.updateUserStatus` | same | safe user | deactivate action | OK | None |
| Admin doctors | `admin.api.getDoctors/updateDoctor/deleteDoctor` | `GET /admin/doctors`, `PATCH /admin/doctors/:id/approval` | `DoctorController` | same | profile with user/specialties | doctor approval table | OK | None |
| Admin specialties | `admin.api` | `GET/POST/PATCH /admin/specialties`, deactivate | `SpecialtyController` | same | specialty | specialty table | OK | None |
| Admin appointments | `admin.api` | `GET /admin/appointments`, `PATCH /admin/appointments/:id/status` | `AdminAppointmentController` | same | appointment list/detail | appointment table | OK | None |
| Admin question moderation action | `admin.api.approveModeration/rejectModeration` | `PATCH /admin/questions/:id/moderation`, `APPROVE/REJECT` | `AdminQuestionController.moderate` | action string; service maps `CLOSE`, `REOPEN`, else `MODERATED` | question | currently no list | Need Fix | Use explicit `REOPEN` for approve and `MODERATE` for reject/hide |
| Admin rating moderation | `admin.api.approveModeration/rejectModeration` | `PATCH /admin/ratings/:id/moderation`, `VISIBLE/HIDDEN` | `AdminRatingController.moderate` | `status` enum | rating | moderation action | OK | None |

## 3. Route and Screen Verification Table

| Screen | Route | Actor | Is route registered? | Is route protected correctly? | API called | Loading/empty/error state? | data-testid present? | Status | Fix required |
|---|---|---|---|---|---|---|---|---|---|
| Home | `/` | Guest/Auth | Yes | Public; auth redirects by role | public home/doctors/specialties | Yes | `home-page` | OK | None |
| Specialty list | `/specialties` | Guest | Yes | Public | `/public/specialties` | Yes | specialty cards | OK | None |
| Doctor list | `/doctors` | Guest | Yes | Public | `/public/doctors`, `/public/specialties` | Yes | `doctor-list-page`, `doctor-card-{id}` | OK | None |
| Doctor detail | `/doctors/:doctorId` | Guest | Yes | Public | `/public/doctors/:doctorId` | Yes | `doctor-detail-page` | OK | None |
| Login | `/login` | Guest | Yes | Public | `/auth/login` | Yes | `login-page` | OK | None |
| Register | `/register` | Guest | Yes | Public | `/public/specialties`, `/auth/register` | Yes | `register-page` | OK | None |
| Forbidden | `/403` | All | Yes | Public error page | None | N/A | `forbidden-page` | OK | None |
| Patient dashboard | `/patient` | PATIENT | Yes | `AuthGuard` + PATIENT role | `/patients/me/profile` | Yes | `patient-dashboard-page` | OK | None |
| Patient profile | `/patient/profile` | PATIENT | Yes | PATIENT | `/patients/me/profile` | Yes | `patient-profile-page` | OK | None |
| Book appointment | `/patient/book-appointment` | PATIENT | Yes | PATIENT | public specialties/doctors, `/appointments` | Yes | `appointment-create-page` | OK | None |
| Patient history | `/patient/history` | PATIENT | Yes | PATIENT | `/appointments/mine`, `/questions/mine`, `/ratings/mine`, result/detail on demand | Yes | `appointment-list-page` | OK | None |
| Appointment detail | Modal in history/doctor appointments | PATIENT/DOCTOR | No dedicated route | Owner-safe API | `/appointments/:id` | Yes | `appointment-detail` | OK | No dedicated route needed for MVP |
| Ask question | `/patient/ask-question` | PATIENT | Yes | PATIENT | `/questions` | Yes | `question-create-page` | OK | None |
| Consultation result | Dialog in history | PATIENT | Yes via history | PATIENT | `/consultations/:appointmentId/result` | Yes | `consultation-result`, `prescription-items` | OK | None |
| Doctor dashboard | `/doctor` | DOCTOR | Yes | DOCTOR | `/doctors/me/profile` | Yes | `doctor-dashboard-page` | OK | None |
| Doctor profile | `/doctor/profile` | DOCTOR | Yes | DOCTOR | doctor profile/specialties | Yes | `doctor-profile-page` | OK | None |
| Doctor appointments | `/doctor/appointments` | DOCTOR | Yes | DOCTOR | `/appointments/doctor/me`, action endpoints | Yes | `doctor-appointment-list-page` | OK | None |
| Doctor inbox | `/doctor/inbox` | DOCTOR | Yes | DOCTOR | `/questions/assigned`, answers | Yes | `doctor-question-list-page`, `doctor-answer-form` | OK | None |
| Doctor consultation session | `/doctor/consultations/:appointmentId` | DOCTOR | Yes | DOCTOR | consultation start/join/messages/summary/prescription | Yes | `consultation-session-page` | OK | None |
| Doctor ratings | `/doctor/ratings` | DOCTOR | Yes | DOCTOR | `/ratings/doctor/me` | Yes | `doctor-ratings-page` | OK | None |
| Admin dashboard | `/admin` | ADMIN | Yes | ADMIN | `/reports/dashboard` | Yes | `admin-dashboard` only | Need Fix | Add expected `admin-dashboard-page` selector |
| Admin users | `/admin/users` | ADMIN | Yes | ADMIN | `/admin/users` | Yes | `admin-user-management-page` | Need Fix | Align role create/update UI with backend |
| Admin doctors | `/admin/doctors` | ADMIN | Yes | ADMIN | `/admin/doctors`, approval | Yes | `admin-doctor-list-page` | OK | None |
| Admin specialties | `/admin/specialties` | ADMIN | Yes | ADMIN | `/admin/specialties` | Yes | `admin-specialty-page` | OK | None |
| Admin appointments | `/admin/appointments` | ADMIN | Yes | ADMIN | `/admin/appointments` | Yes | `admin-appointment-page` | OK | None |
| Admin moderation | `/admin/moderation` | ADMIN | Yes | ADMIN | No unified list; action helpers only | Empty state | `admin-moderation-page` | P2 Missing API | Keep TODO_BACKEND_API |
| Reports | `/reports` | ADMIN/DOCTOR | Yes | ADMIN/DOCTOR | `/reports/dashboard`, `/reports/consultations/trend` | Yes | `reports-page` | OK | None |

## 4. Auth and Role Guard Verification

| Check | Status | Notes |
|---|---|---|
| Guest into protected route redirects login | OK | `AuthGuard` redirects with `returnUrl`. |
| Patient cannot enter Doctor/Admin route | OK | `RoleGuard` redirects `/403`. |
| Doctor cannot enter Patient/Admin route | OK | `RoleGuard` redirects `/403`. |
| Admin can enter admin routes | OK | Admin routes protected with ADMIN role. |
| Login redirect by role | OK | PATIENT -> `/patient`, DOCTOR -> `/doctor`, ADMIN -> `/admin`. |
| Logout clears token and redirects login | OK | saga clears session storage and state. |
| Refresh does not loop forever on 401 | OK | interceptor skips auth endpoints and uses `_retry`. |
| Refresh token is not stored in local/session storage | OK | only access token + exp stored in `sessionStorage`; refresh cookie is httpOnly. |

## 5. Legacy / Dead Code Scan

| Search | Result | Status | Fix required |
|---|---|---|---|
| `cypress`, `Cypress`, `cy.` in `src`, `e2e`, `package.json` | None | OK | None |
| `/doctors/featured` | None in source | OK | None |
| `/patients/history` API | None in source | OK | None |
| `/patients/profile` API | None in source | OK | None |
| `/doctors/me` legacy | Only valid `/doctors/me/profile`, `/schedule`, `/specialties` | OK | None |
| `/reports/stats` | None in source | OK | None |
| `/admin/moderation` unified endpoint | Only FE route constant | OK | No API call; keep route with TODO_BACKEND_API |
| `apiClient.put` | None | OK | None |
| hardcoded users/tokens/roles | No seeded credentials/tokens in source | OK | None |
| mock data without TODO | Empty fallback APIs have `TODO_BACKEND_API` | OK | None |

## 6. Playwright Readiness Verification

| Required selector | Status | File/note |
|---|---|---|
| `home-page` | OK | `HomePage.tsx` |
| `doctor-list-page` | OK | `DoctorListPage.tsx` |
| `doctor-card-*` | OK | `DoctorListPage.tsx` |
| `doctor-detail-page` | OK | `DoctorDetailPage.tsx` |
| `book-appointment-guest` | OK | list/detail CTA |
| `login-page` | OK | `LoginPage.tsx` |
| `register-page` | OK | `RegisterPage.tsx` |
| `patient-dashboard-page` | OK | `PatientDashboardPage.tsx` |
| `appointment-create-page` | OK | `BookAppointmentPage.tsx` |
| `appointment-list-page` | OK | `ConsultationHistoryPage.tsx` |
| `question-create-page` | OK | `AskQuestionPage.tsx` |
| `doctor-dashboard-page` | OK | `DoctorDashboardPage.tsx` |
| `doctor-question-list-page` | OK | `InboxQuestionsPage.tsx` |
| `doctor-answer-form` | OK | `InboxQuestionsPage.tsx` |
| `admin-dashboard-page` | Need Fix | current selector is `admin-dashboard` |
| `admin-doctor-list-page` | OK | `DoctorsManagePage.tsx` |
| `forbidden-page` | OK | `ForbiddenPage.tsx` |
| `loading-state` | OK | common P0 screens |
| `empty-state` | OK | public/result/session screens |
| `error-alert` | OK | P0 screens |

## 7. Prioritized Fix Plan

### P0

- Add `admin-dashboard-page` selector to Admin dashboard.
- Align Admin user create/edit UI with backend: no ADMIN create option; do not send `role` on update.

### P1

- Make admin question moderation action payload explicit: approve -> `REOPEN`, reject/hide -> `MODERATE`.
- Update final integration summary after validation.

### P2 / Future Enhancement

- Unified admin moderation list endpoint.
- Dedicated doctor patient list endpoint.
- Admin doctor-profile create/update endpoint for richer specialty/bio CRUD.
- Reporting endpoints for question status chart, top doctors, specialty distribution.
- Dedicated patient appointment/detail routes if report/demo needs direct deep links.
