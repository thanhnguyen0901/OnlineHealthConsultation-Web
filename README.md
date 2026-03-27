# OnlineHealthConsultation-Web

Frontend cho hệ thống tư vấn sức khỏe trực tuyến, xây dựng bằng React + TypeScript + Vite.

## Tổng quan

Ứng dụng hỗ trợ 3 vai trò chính:

- `PATIENT`: hỏi đáp sức khỏe, đặt lịch, theo dõi lịch sử tư vấn, cập nhật hồ sơ cá nhân.
- `DOCTOR`: xử lý câu hỏi, quản lý lịch làm việc, quản lý lịch hẹn, xem đánh giá, cập nhật hồ sơ bác sĩ.
- `ADMIN`: dashboard quản trị, quản lý users/patients/doctors/specialties/appointments, moderation nội dung.

Ngoài ra có trang `Reports` dùng chung cho `ADMIN` và `DOCTOR`.

## Công nghệ chính

- React 18 + TypeScript 5
- Vite 5
- React Router v6
- Redux Toolkit + Redux Saga
- PrimeReact + Tailwind CSS
- Axios (request/response interceptor)
- i18next (`vi`, `en`)
- Formik + Yup
- Recharts
- Cypress E2E

## Tính năng nổi bật

- ✅ **Dark Mode**: Chế độ tối, lưu preference tự động
- ✅ **Đa ngôn ngữ (i18n)**: Tiếng Việt & English
- ✅ **Biểu đồ thống kê**: Visualize dữ liệu với Recharts
- ✅ **Responsive Design**: Giao diện thân thiện trên mọi thiết bị
- ✅ **Toast Notifications**: Thông báo người dùng thời gian thực
- ✅ **Form Validation**: Validate form với Formik + Yup

## Kiến trúc thư mục (thực tế hiện tại)

```text
OnlineHealthConsultation-Web/
├── .github/workflows/
│   └── fe-ci.yml
├── cypress/
│   ├── e2e/
│   │   ├── admin-dashboard.cy.ts
│   │   ├── admin-specialties.cy.ts
│   │   ├── auth.cy.ts
│   │   ├── doctor-dashboard.cy.ts
│   │   ├── patient-ask-question.cy.ts
│   │   ├── patient-book-appointment.cy.ts
│   │   ├── patient-dashboard.cy.ts
│   │   └── role-guard.cy.ts
│   ├── fixtures/
│   └── support/
├── public/
├── src/
│   ├── apis/core/
│   │   ├── apiClient.ts
│   │   ├── httpError.ts
│   │   └── refreshManager.ts
│   ├── app/
│   │   ├── guards/
│   │   │   ├── AuthGuard.tsx
│   │   │   └── RoleGuard.tsx
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── components/
│   │   ├── charts/
│   │   │   ├── BarChartWidget.tsx
│   │   │   └── PieChartWidget.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── InlineAlert.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ToastPortal.tsx
│   │   └── form-controls/
│   │       ├── FormikCalendar.tsx
│   │       ├── FormikDropdown.tsx
│   │       └── FormikInputText.tsx
│   ├── config/
│   │   └── api.config.ts
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── routePaths.ts
│   │   └── userKeys.ts
│   ├── features/
│   │   ├── admin/
│   │   │   ├── apis/admin.api.ts
│   │   │   ├── components/
│   │   │   │   ├── DoctorTable.tsx
│   │   │   │   ├── SpecialtyTable.tsx
│   │   │   │   └── UserTable.tsx
│   │   │   ├── pages/
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   ├── AppointmentsManagePage.tsx
│   │   │   │   ├── DoctorsManagePage.tsx
│   │   │   │   ├── ModerationPage.tsx
│   │   │   │   ├── PatientsManagePage.tsx
│   │   │   │   ├── SpecialtiesManagePage.tsx
│   │   │   │   └── UsersManagePage.tsx
│   │   │   ├── redux/
│   │   │   │   ├── admin.saga.ts
│   │   │   │   ├── admin.selectors.ts
│   │   │   │   ├── admin.slice.ts
│   │   │   │   └── admin.state.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── apis/auth.api.ts
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── redux/
│   │   │   │   ├── auth.saga.ts
│   │   │   │   ├── auth.selectors.ts
│   │   │   │   ├── auth.slice.ts
│   │   │   │   └── auth.state.ts
│   │   │   └── types.ts
│   │   ├── doctor/
│   │   │   ├── apis/doctor.api.ts
│   │   │   ├── components/
│   │   │   │   ├── AnswerEditor.tsx
│   │   │   │   └── ScheduleTable.tsx
│   │   │   ├── pages/
│   │   │   │   ├── DoctorAppointmentsPage.tsx
│   │   │   │   ├── DoctorDashboardPage.tsx
│   │   │   │   ├── DoctorPatientsPage.tsx
│   │   │   │   ├── DoctorProfilePage.tsx
│   │   │   │   ├── DoctorRatingsPage.tsx
│   │   │   │   ├── InboxQuestionsPage.tsx
│   │   │   │   └── SchedulePage.tsx
│   │   │   ├── redux/
│   │   │   │   ├── doctor.saga.ts
│   │   │   │   ├── doctor.selectors.ts
│   │   │   │   ├── doctor.slice.ts
│   │   │   │   └── doctor.state.ts
│   │   │   └── types.ts
│   │   ├── patient/
│   │   │   ├── apis/patient.api.ts
│   │   │   ├── components/
│   │   │   │   ├── AppointmentForm.tsx
│   │   │   │   └── QuestionForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── AskQuestionPage.tsx
│   │   │   │   ├── BookAppointmentPage.tsx
│   │   │   │   ├── ConsultationHistoryPage.tsx
│   │   │   │   ├── PatientDashboardPage.tsx
│   │   │   │   └── PatientProfilePage.tsx
│   │   │   ├── redux/
│   │   │   │   ├── patient.saga.ts
│   │   │   │   ├── patient.selectors.ts
│   │   │   │   ├── patient.slice.ts
│   │   │   │   └── patient.state.ts
│   │   │   └── types.ts
│   │   └── reports/
│   │       ├── apis/reports.api.ts
│   │       ├── exporters/toCSV.ts
│   │       ├── pages/ReportsPage.tsx
│   │       ├── redux/
│   │       │   ├── reports.saga.ts
│   │       │   ├── reports.selectors.ts
│   │       │   ├── reports.slice.ts
│   │       │   └── reports.state.ts
│   │       └── types.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebouncedValue.ts
│   │   └── useToast.ts
│   ├── i18n/
│   │   ├── en/
│   │   │   ├── admin.json
│   │   │   ├── auth.json
│   │   │   ├── common.json
│   │   │   ├── doctor.json
│   │   │   ├── patient.json
│   │   │   └── validation.json
│   │   ├── vi/
│   │   │   ├── admin.json
│   │   │   ├── auth.json
│   │   │   ├── common.json
│   │   │   ├── doctor.json
│   │   │   ├── patient.json
│   │   │   └── validation.json
│   │   └── initI18n.ts
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── NotFound.tsx
│   ├── redux/
│   │   ├── sagas/index.ts
│   │   ├── selectors/index.ts
│   │   └── slices/ui.slice.ts
│   ├── state/
│   │   ├── hooks.ts
│   │   ├── rootSaga.ts
│   │   └── store.ts
│   ├── styles/globals.css
│   ├── theme/
│   │   ├── primereact-theme.css
│   │   └── tailwind.css
│   ├── types/
│   │   ├── common.ts
│   │   └── redux/index.ts
│   ├── utils/
│   │   ├── authStorage.ts
│   │   ├── authz.ts
│   │   ├── classnames.ts
│   │   ├── date.ts
│   │   ├── enumI18n.ts
│   │   ├── errorMessage.ts
│   │   ├── logger.ts
│   │   ├── number.ts
│   │   ├── storage.ts
│   │   └── yupLocale.ts
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env
├── .env.example
├── .nvmrc
├── cypress.config.ts
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Routing & phân quyền

- Public:
  - `/`
  - `/login`
  - `/register`
  - `*` -> `/404`
- Protected bằng `AuthGuard` + `RoleGuard`:
  - Patient: `/patient`, `/patient/ask-question`, `/patient/book-appointment`, `/patient/history`, `/patient/profile`
  - Doctor: `/doctor`, `/doctor/inbox`, `/doctor/patients`, `/doctor/appointments`, `/doctor/schedule`, `/doctor/ratings`, `/doctor/profile`
  - Admin: `/admin`, `/admin/users`, `/admin/patients`, `/admin/doctors`, `/admin/specialties`, `/admin/appointments`, `/admin/moderation`
  - Shared: `/reports` (`ADMIN`, `DOCTOR`)

## Flow Auth/AuthZ trên FE (đúng theo code hiện tại)

### 1) App bootstrap

- `main.tsx` khởi tạo i18n + Yup locale + Redux store.
- `App.tsx` dispatch `meRequested()` một lần khi app mount (dùng `useRef` để tránh StrictMode gọi đôi).
- `auth.state.ts` có `isBootstrapping = true` ban đầu để chặn render protected flow khi chưa xác định session.

### 2) Phục hồi session (me flow)

Trong `auth.saga.ts` (`handleMe`):

1. Đọc access token từ `sessionStorage` qua `loadAuthFromStorage()`.
2. Nếu token còn hạn: gọi `authApi.meWithToken(accessToken)` (`GET /auth/me` với `Authorization` header).
3. Nếu token local không hợp lệ: xóa local token và fallback sang refresh.
4. Nếu không có token local: gọi `authApi.refresh()` (`POST /auth/refresh`, dùng cookie).
5. Thành công -> `meSucceeded` (set `user`, `accessToken`, `isAuthenticated=true`, `isBootstrapping=false`).
6. Thất bại -> `meFailed` (clear auth, `isBootstrapping=false`).

### 3) Login / Register / Logout

- Login:
  - `loginRequested` -> saga gọi `POST /auth/login`.
  - Thành công -> `loginSucceeded` + `saveAuthToStorage(accessToken)`.
  - Thất bại -> `loginFailed` + đẩy toast lỗi.
- Register:
  - `registerRequested` -> saga gọi `POST /auth/register`.
  - Thành công -> `registerSucceeded` + toast success.
  - Lưu ý: `registerSucceeded` không set `isAuthenticated`; user vẫn phải login.
- Logout:
  - Saga gọi `POST /auth/logout` (nếu lỗi vẫn continue).
  - Luôn `resetRefreshState()` + `clearAuthStorage()` + `logoutSucceeded()`.

### 4) Axios auth pipeline

Trong `apis/core/apiClient.ts` + `refreshManager.ts`:

- Request interceptor tự gắn `Authorization: Bearer <accessToken>` từ Redux (nếu có).
- Response interceptor xử lý `401`:
  - Bỏ qua endpoint auth (`/auth/login|register|refresh|me`) để tránh vòng lặp vô hạn.
  - Với request thường: gọi `performRefresh()` rồi retry request cũ.
  - Nếu refresh fail: dispatch `logoutSucceeded()` và redirect về `/login`.
- `performRefresh()` dùng cơ chế single-flight: nhiều request 401 đồng thời chỉ dùng 1 promise refresh.
- Có retry 1 lần cho case `TOKEN_ROTATED` (409) sau delay ngắn.

### 5) AuthGuard và RoleGuard

- `AuthGuard`:
  - Nếu `isBootstrapping=true` -> render spinner.
  - Nếu chưa authenticated -> redirect `/login`.
  - Nếu authenticated -> cho vào `MainLayout`.
- `RoleGuard`:
  - So role hiện tại với roles được phép của route.
  - Không hợp lệ -> redirect về `/`.
  - Tại `/`, `HomeRedirect` sẽ điều hướng user về dashboard đúng role (`/patient`, `/doctor`, `/admin`).

### 6) AuthZ hiển thị & thông báo

- Sidebar/menu trong `MainLayout` render theo role.
- Một số page (ví dụ Reports) dùng `isUnauthorizedMessage()` để map lỗi quyền truy cập thành message phù hợp UI.

## Yêu cầu môi trường

- Node.js: `20` (theo file `.nvmrc`)
- npm: khuyến nghị npm đi kèm Node 20

## Cài đặt & chạy local

```bash
# 1) Cài dependencies
npm install

# 2) Cấu hình env
cp .env.example .env

# 3) Chạy dev server
npm run dev
```

App mặc định chạy tại `http://localhost:5173`.

## Biến môi trường

`.env.example` hiện có:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Biến đang được code sử dụng:

- `VITE_API_BASE_URL`: base URL backend (client sẽ gọi `${VITE_API_BASE_URL}/api/...`).
- `VITE_DEBUG_REFRESH` (optional): bật log debug cho refresh manager khi đặt `true`.

## Scripts

```bash
# Development
npm run dev
npm run build
npm run preview

# Code quality
npm run lint
npm run format
npm run format:check
npm run type-check

# Cypress
npm run cy:open
npm run cy:run
npm run cy:run:auth
npm run cy:run:patient
npm run cy:run:doctor
npm run cy:run:admin
npm run cy:run:role-guard
npm run test:e2e
```

## E2E Testing

- Specs nằm tại `cypress/e2e/**/*.cy.ts`.
- Có nhóm test chính: `auth`, `patient`, `doctor`, `admin`, `role-guard`.
- `test:e2e` dùng `start-server-and-test` để bật FE rồi chạy Cypress.

## CI hiện tại

Workflow: `.github/workflows/fe-ci.yml`

Pipeline đang chạy các bước:

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run type-check`
5. `npm run build`

Ghi chú: Cypress E2E chưa được đưa vào CI workflow này.

## API modules (frontend calls)

- Auth: `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me`, `/auth/refresh`
- Patient: `/patients/questions`, `/patients/appointments`, `/patients/history`, `/patients/profile`, `/patients/ratings`, `/patients/specialties`, `/patients/doctors`
- Doctor: `/doctors/me`, `/doctors/questions`, `/doctors/schedule`, `/doctors/appointments`, `/doctors/patients`, `/doctors/ratings`
- Admin: `/admin/users`, `/admin/patients`, `/admin/doctors`, `/admin/specialties`, `/admin/appointments`, `/admin/moderation`
- Reports: `/reports/stats`, `/reports/appointments-chart`, `/reports/questions-chart`, `/reports/top-doctors`, `/reports/specialty-distribution`

## Gợi ý chạy cùng backend

Dự án frontend này dùng chung API với `OnlineHealthConsultation-Service` trong workspace hiện tại. Để demo đầy đủ luồng nghiệp vụ, chạy backend trước rồi chạy frontend.
