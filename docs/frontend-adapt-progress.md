# Frontend Adapt Progress

## Phase 1 — Public + Auth

### Những file đã sửa

- `src/apis/core/refreshManager.ts`
- `src/app/App.tsx`
- `src/app/guards/AuthGuard.tsx`
- `src/app/guards/RoleGuard.tsx`
- `src/app/routes.tsx`
- `src/components/common/ToastPortal.tsx`
- `src/components/form-controls/FormikDropdown.tsx`
- `src/components/form-controls/FormikInputText.tsx`
- `src/constants/routePaths.ts`
- `src/features/auth/apis/auth.api.ts`
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/pages/RegisterPage.tsx`
- `src/features/auth/redux/auth.saga.ts`
- `src/features/auth/redux/auth.slice.ts`
- `src/features/auth/types.ts`
- `src/features/public/apis/public.api.ts`
- `src/features/public/pages/DoctorDetailPage.tsx`
- `src/features/public/pages/DoctorListPage.tsx`
- `src/features/public/pages/SpecialtyListPage.tsx`
- `src/features/public/pages/publicPageUtils.ts`
- `src/features/public/types.ts`
- `src/layouts/MainLayout.tsx`
- `src/pages/ForbiddenPage.tsx`
- `src/pages/HomePage.tsx`
- `e2e/specs/public-smoke.spec.ts`

### Những màn hình đã hoàn thành

- Public Home dùng API public thật.
- Public Specialty list tại `/specialties`.
- Public Doctor list/search/filter tại `/doctors`.
- Public Doctor detail tại `/doctors/:doctorId`.
- Guest Book/Ask CTA redirect tới `/login` với `returnUrl`/intent state.
- Login giữ role-based redirect và hỗ trợ returnUrl an toàn theo role.
- Register doctor gửi `specialtyId`.
- Logout vẫn gọi `/auth/logout`, clear local auth qua saga và redirect `/login`.
- Forbidden page tại `/403`.

### API thật đã dùng

- `GET /api/public/specialties`
- `GET /api/public/doctors?keyword=&specialtyId=&page=&limit=`
- `GET /api/public/doctors/:doctorId`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Endpoint legacy đã thay thế

- Home bỏ `/doctors/featured`, thay bằng `/public/doctors?limit=6`.
- Register bỏ admin/specialty source cũ cho dropdown doctor, thay bằng `/public/specialties`.
- Register payload bỏ `specialty`, thay bằng `specialtyId`.

### data-testid đã thêm

- `app-root`
- `global-toast`
- `home-page`
- `home-doctor-card`
- `home-book-cta`
- `home-ask-cta`
- `specialty-list-page`
- `specialty-card-{id}`
- `doctor-list-page`
- `doctor-search-input`
- `specialty-filter`
- `doctor-card-{id}`
- `doctor-detail-page`
- `doctor-rating-summary`
- `book-appointment-guest`
- `ask-question-guest`
- `login-page`
- `register-page`
- `email-input`
- `password-input`
- `login-submit-button`
- `register-submit-button`
- `auth-error-alert`
- `forbidden-page`
- `loading-state`
- `empty-state`
- `error-alert`
- `logout-button`
- `register-role`
- `register-specialty`

### Mock/TODO còn lại

- Playwright CTA smoke test skip khi backend/dev data không có public doctor card.
- Patient/Doctor/Admin feature API mismatch còn để Phase 2+ theo checklist.
- Public pages dùng text English trực tiếp; có thể đưa vào i18n sau nếu cần polish song ngữ hoàn toàn.
- Refresh flow vẫn không lưu refresh token ở client; cần backend httpOnly cookie hoặc contract refresh tương thích.

### Lệnh đã chạy

```bash
npm run build
npm run lint
npm run test:e2e
```

### Kết quả build/lint/test thật

- `npm run build`: pass. Có warning browserslist cũ và chunk size lớn, không block build.
- `npm run lint`: pass.

## Phase 5 — Final Cleanup and Validation

### Cleanup đã làm

- Xóa selector legacy `data-cy` khỏi source; Playwright dùng `data-testid`.
- Quét lại source để đảm bảo không còn Cypress keyword/import/config trong `src`, `e2e`, `package.json`.
- Quét lại source để đảm bảo các endpoint legacy P0/P1 chính không còn API call thật.
- Tạo `docs/frontend-final-implementation-summary.md`.

### Kết quả scan

- Không còn `data-cy`, `cypress`, `Cypress`, `cy.` trong `src`, `e2e`, `package.json`.
- Không còn thư mục/file Cypress qua `rg --files`.
- Không còn API call legacy như `/doctors/featured`, `/patients/history`, `/patients/profile`, `/reports/stats`, `/reports/appointments-chart`, `/reports/questions-chart`, `apiClient.put`.
- `/admin/moderation` còn là frontend route, không phải backend API call.

### Lệnh đã chạy

```bash
npm run build
npm run lint
npm run test:e2e
```

### Kết quả thật

- `npm run build`: pass. Có warning browserslist cũ và chunk size lớn, không block build.
- `npm run lint`: pass.
- `npm run test:e2e`: pass, 4 passed và 1 skipped vì backend/test data hiện không trả public doctor card cho CTA test.

## Phase 4 — Admin and Reports

### Những file đã sửa

- `src/features/admin/apis/admin.api.ts`
- `src/features/reports/apis/reports.api.ts`
- `src/features/admin/pages/AdminDashboardPage.tsx`
- `src/features/admin/pages/UsersManagePage.tsx`
- `src/features/admin/pages/DoctorsManagePage.tsx`
- `src/features/admin/pages/SpecialtiesManagePage.tsx`
- `src/features/admin/pages/AppointmentsManagePage.tsx`
- `src/features/admin/pages/ModerationPage.tsx`
- `src/features/reports/pages/ReportsPage.tsx`

### Những màn hình đã hoàn thành

- Admin dashboard dùng `/reports/dashboard`.
- Reports dùng `/reports/dashboard` và `/reports/consultations/trend`.
- Admin users dùng `GET/POST/PATCH/DELETE /admin/users`.
- Admin patient management dùng `/admin/users?role=PATIENT` và status deactivate.
- Admin doctors dùng `/admin/doctors` và approval action `/admin/doctors/:doctorId/approval`.
- Admin specialties dùng `/admin/specialties`, `PATCH`, và deactivate endpoint.
- Admin appointments dùng `/admin/appointments` với `status/fromDate/toDate` và status update endpoint.
- Admin moderation không gọi unified endpoint cũ vì backend chưa có list API; screen giữ empty state an toàn.

### API thật đã dùng

- `GET /api/reports/dashboard`
- `GET /api/reports/consultations/trend`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:userId`
- `PATCH /api/admin/users/:userId/status`
- `DELETE /api/admin/users/:userId`
- `GET /api/admin/doctors`
- `PATCH /api/admin/doctors/:doctorId/approval`
- `GET /api/admin/specialties`
- `POST /api/admin/specialties`
- `PATCH /api/admin/specialties/:id`
- `PATCH /api/admin/specialties/:id/deactivate`
- `GET /api/admin/appointments`
- `PATCH /api/admin/appointments/:id/status`
- `PATCH /api/admin/questions/:id/moderation`
- `PATCH /api/admin/ratings/:id/moderation`

### Endpoint legacy đã thay thế

- `/reports/stats` -> `/reports/dashboard`
- `/reports/appointments-chart` -> `/reports/consultations/trend`
- `/reports/questions-chart` -> dashboard-derived fallback
- `PUT /admin/users/:id` -> `PATCH /admin/users/:id`
- `/specialties` admin list -> `/admin/specialties`
- `PUT /admin/specialties/:id` -> `PATCH /admin/specialties/:id`
- `DELETE /admin/specialties/:id` -> `PATCH /admin/specialties/:id/deactivate`
- `PUT /admin/appointments/:id` -> `PATCH /admin/appointments/:id/status`
- `/admin/moderation` unified list -> local empty state with `TODO_BACKEND_API`

### data-testid đã thêm

- `admin-dashboard`
- `admin-dashboard-card`
- `admin-user-management-page`
- `admin-user-table`
- `admin-user-save`
- `admin-doctor-list-page`
- `admin-doctor-table`
- `doctor-approval-status`
- `approve-doctor-{id}`
- `reject-doctor-{id}`
- `admin-specialty-page`
- `admin-specialty-table`
- `specialty-save`
- `specialty-deactivate`
- `admin-appointment-page`
- `admin-appointment-table`
- `appointment-status-save`
- `admin-moderation-page`
- `moderation-table`
- `reports-page`
- `reports-chart`

### Mock/TODO còn lại

- `TODO_BACKEND_API`: backend chưa có unified admin moderation list, FE không gọi endpoint giả.
- `TODO_BACKEND_API`: backend reporting MVP chưa có question chart, top doctors report, specialty distribution report.
- `TODO_BACKEND_API`: admin create doctor hiện tạo DOCTOR user qua `/admin/users`; profile specialty/bio cần backend admin profile endpoint nếu muốn CRUD đầy đủ.

### Lệnh đã chạy

```bash
npm run build
npm run lint
```

### Kết quả build/lint thật

- `npm run build`: pass. Có warning browserslist cũ và chunk size lớn, không block build.
- `npm run lint`: pass.
- `npm run test:e2e`: pass. Kết quả `4 passed`, `1 skipped` do không có public doctor card trong backend/dev data tại thời điểm chạy.

### Lỗi/rủi ro còn lại

- Nếu backend không set httpOnly refresh cookie và chỉ trả `refreshToken` trong body, silent refresh sẽ fail vì frontend cố ý không lưu refresh token theo yêu cầu bảo mật.
- Public doctor CTA chỉ redirect login ở Phase 1; auto-prefill doctor cho appointment/question cần làm ở Patient phase.
- Doctor schedule hiện render JSON đơn giản trên detail nếu backend có `schedule`.

### Gợi ý phase tiếp theo

- Phase 2 nên adapt Patient dashboard/profile/booking/history/result với backend thật.
- Sau khi seed backend có public doctors, enable CTA Playwright smoke không skip.
- Thêm i18n keys cho public discovery pages nếu báo cáo cần demo song ngữ mượt hơn.

## Phase 2 — Patient Features

### Những file đã sửa

- `src/components/form-controls/FormikCalendar.tsx`
- `src/features/patient/apis/patient.api.ts`
- `src/features/patient/redux/patient.saga.ts`
- `src/features/patient/redux/patient.slice.ts`
- `src/features/patient/types.ts`
- `src/features/patient/pages/PatientDashboardPage.tsx`
- `src/features/patient/pages/PatientProfilePage.tsx`
- `src/features/patient/pages/BookAppointmentPage.tsx`
- `src/features/patient/pages/AskQuestionPage.tsx`
- `src/features/patient/pages/ConsultationHistoryPage.tsx`

### Những màn hình đã hoàn thành

- Patient dashboard dùng profile endpoint thật.
- Patient profile dùng `GET/PATCH /patients/me/profile`.
- Appointment create dùng public specialties/doctors và `POST /appointments`.
- History bỏ aggregate legacy, dùng `/appointments/mine`, `/questions/mine`, `/ratings/mine`.
- Appointment detail dùng `GET /appointments/:id` khi mở dialog.
- Cancel appointment dùng `PATCH /appointments/:id/cancel`.
- Question create gửi `{ title, content }` tới `POST /questions`.
- Question detail dùng modal từ item trong `/questions/mine`.
- Consultation result/prescription dùng `GET /consultations/:appointmentId/result`.
- Rating dùng `POST /ratings` với `{ appointmentId, score, comment }`.

### API thật đã dùng

- `GET /api/patients/me/profile`
- `PATCH /api/patients/me/profile`
- `GET /api/public/specialties`
- `GET /api/public/doctors`
- `POST /api/appointments`
- `GET /api/appointments/mine`
- `GET /api/appointments/:id`
- `PATCH /api/appointments/:id/cancel`
- `POST /api/questions`
- `GET /api/questions/mine`
- `GET /api/consultations/:appointmentId/result`
- `POST /api/ratings`
- `GET /api/ratings/mine`

### Endpoint legacy đã thay thế

- `/patients/profile` -> `/patients/me/profile`
- `PUT /patients/profile` -> `PATCH /patients/me/profile`
- `/patients/appointments` -> `/appointments`
- `/patients/history` -> `/appointments/mine`, `/questions/mine`, `/ratings/mine`
- `/patients/questions` -> `/questions`
- `/patients/ratings` -> `/ratings`
- `/patients/specialties` -> `/public/specialties`
- `/patients/doctors` -> `/public/doctors`

### data-testid đã thêm

- `patient-dashboard-page`
- `patient-profile-page`
- `patient-profile-form`
- `patient-profile-save`
- `appointment-create-page`
- `appointment-specialty`
- `appointment-doctor`
- `appointment-date`
- `appointment-time`
- `appointment-reason`
- `appointment-submit`
- `appointment-list-page`
- `patient-appointment-table`
- `appointment-detail`
- `appointment-cancel-{id}`
- `question-create-page`
- `question-title-input`
- `question-content-input`
- `question-submit`
- `patient-question-table`
- `question-detail`
- `consultation-result`
- `prescription-items`
- `rating-dialog`
- `rating-submit`
- `loading-state`
- `error-alert`

### Mock/TODO còn lại

- Question create vẫn hiển thị specialty selector để giữ UX hiện tại, nhưng không gửi `specialtyId` vì backend không nhận field này.
- Consultation result phụ thuộc appointment completed/session/prescription seed data thật.

### Lệnh đã chạy

```bash
npm run build
npm run lint
```

### Kết quả build/lint thật

- `npm run build`: pass. Có warning browserslist cũ và chunk size lớn, không block build.
- `npm run lint`: pass.

## Phase 3 — Doctor Features

### Những file đã sửa

- `src/features/doctor/apis/doctor.api.ts`
- `src/features/doctor/pages/DoctorDashboardPage.tsx`
- `src/features/doctor/pages/DoctorAppointmentsPage.tsx`
- `src/features/doctor/pages/InboxQuestionsPage.tsx`
- `src/features/doctor/pages/DoctorProfilePage.tsx`
- `src/features/doctor/pages/DoctorRatingsPage.tsx`
- `src/features/doctor/pages/ConsultationSessionPage.tsx`
- `src/constants/routePaths.ts`
- `src/app/routes.tsx`

### Những màn hình đã hoàn thành

- Doctor dashboard/profile dùng `/doctors/me/profile`.
- Doctor profile update dùng `/doctors/me/profile` và `/doctors/me/specialties`.
- Schedule update dùng `/doctors/me/schedule`.
- Doctor appointments dùng `/appointments/doctor/me`.
- Confirm/complete dùng `/appointments/:id/confirm` và `/appointments/:id/complete`.
- Question list dùng `/questions/assigned`.
- Answer question gửi `{ content }` tới `/questions/:id/answers`.
- Doctor ratings dùng `/ratings/doctor/me`.
- Thêm route session `/doctor/consultations/:appointmentId` với chat fallback, summary và prescription form.

### API thật đã dùng

- `GET /api/doctors/me/profile`
- `PATCH /api/doctors/me/profile`
- `PATCH /api/doctors/me/schedule`
- `PATCH /api/doctors/me/specialties`
- `GET /api/appointments/doctor/me`
- `GET /api/appointments/:id`
- `PATCH /api/appointments/:id/confirm`
- `PATCH /api/appointments/:id/complete`
- `GET /api/questions/assigned`
- `POST /api/questions/:id/answers`
- `POST /api/consultations/:appointmentId/start`
- `POST /api/consultations/:appointmentId/join`
- `GET /api/consultations/:appointmentId/messages`
- `POST /api/consultations/:appointmentId/messages`
- `PATCH /api/consultations/:appointmentId/end`
- `PATCH /api/consultations/:appointmentId/summary`
- `POST /api/consultations/:appointmentId/prescriptions`
- `GET /api/ratings/doctor/me`

### Endpoint legacy đã thay thế

- `/doctors/me` -> `/doctors/me/profile`
- `/doctors/questions` -> `/questions/assigned`
- `/doctors/questions/:id/answers` with `{ answer }` -> `/questions/:id/answers` with `{ content }`
- `/doctors/appointments` -> `/appointments/doctor/me`
- `PUT /doctors/appointments/:id` -> confirm/complete PATCH endpoints
- `/doctors/ratings` -> `/ratings/doctor/me`

### data-testid đã thêm

- `doctor-dashboard-page`
- `doctor-profile-page`
- `doctor-profile-form`
- `doctor-profile-save`
- `doctor-appointment-list-page`
- `doctor-appointment-table`
- `confirm-appointment-{id}`
- `complete-appointment-{id}`
- `doctor-question-list-page`
- `doctor-question-table`
- `doctor-question-detail`
- `doctor-answer-form`
- `answer-question-submit`
- `consultation-session-page`
- `chat-message-list`
- `chat-message-input`
- `send-message`
- `end-consultation`
- `consultation-summary-input`
- `save-summary`
- `prescription-form`
- `prescription-item-row`
- `save-prescription`
- `doctor-ratings-page`
- `error-alert`

### Mock/TODO còn lại

- `TODO_BACKEND_API`: Doctor patients list endpoint chưa có trong backend hiện tại, page giữ empty state.
- `TODO_BACKEND_API`: Doctor reschedule/cancel appointment không thuộc backend MVP; UI không gọi API giả để cancel.
- Video thật không làm; consultation session dùng chat fallback đúng scope.

### Lệnh đã chạy

```bash
npm run build
npm run lint
```

### Kết quả build/lint thật

- `npm run build`: pass. Có warning browserslist cũ và chunk size lớn, không block build.
- `npm run lint`: pass.
