# Online Health Consultation Web

Frontend React application cho hệ thống tư vấn sức khỏe trực tuyến. Repo này cung cấp public discovery pages, authentication UI, patient/doctor/admin workspaces, realtime consultation UI, reporting screens và Playwright E2E tests.

## Business Overview

Ứng dụng phục vụ các luồng chính của nền tảng:

- Guest xem chuyên khoa, tìm kiếm bác sĩ và xem hồ sơ bác sĩ công khai.
- Patient đăng ký/đăng nhập, cập nhật hồ sơ sức khỏe, gửi câu hỏi, đặt lịch từ available slots, tham gia tư vấn realtime, xem summary/prescription và đánh giá bác sĩ.
- Doctor quản lý hồ sơ chuyên môn/lịch làm việc, trả lời câu hỏi, xác nhận lịch hẹn, bắt đầu phiên tư vấn, chat realtime, ghi summary và prescription.
- Administrator quản lý users, doctors, specialties, appointments, moderation và reporting.

Ứng dụng hiển thị disclaimer rằng tư vấn online chỉ mang tính hỗ trợ/tham khảo và không thay thế cấp cứu hoặc khám trực tiếp khi cần.

## Architecture

Frontend được tổ chức theo feature-based architecture. Mỗi feature sở hữu pages, API client, Redux state/saga và types riêng; phần dùng chung nằm ở `components`, `apis/core`, `state`, `utils`, `hooks` và `i18n`.

```text
src/
├── apis/core/                # axios client, refresh manager, auth API wiring
├── app/                      # route config and route guards
├── components/               # reusable UI components and form controls
├── config/                   # runtime frontend config
├── constants/                # roles, route paths, storage keys
├── features/
│   ├── admin/                # admin management, moderation, dashboard
│   ├── auth/                 # login, register, forgot/reset password
│   ├── consultation/         # shared realtime Socket.IO client/hook
│   ├── doctor/               # doctor workspace
│   ├── patient/              # patient workspace
│   ├── public/               # public home, specialties, doctors
│   └── reports/              # reporting UI
├── i18n/                     # Vietnamese and English translation resources
├── layouts/                  # auth/main layouts
├── state/                    # Redux store, root reducer, root saga
├── types/                    # shared app types
└── utils/                    # formatting, storage, authz, error handling
```

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router v6
- Redux Toolkit
- Redux Saga
- Axios
- Socket.IO client
- PrimeReact
- Tailwind CSS
- Formik
- Yup
- i18next (`vi`, `en`)
- Recharts
- Playwright E2E

## Application Routes

Public routes:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/specialties`
- `/doctors`
- `/doctors/:doctorId`
- `/403`

Protected patient routes:

- `/patient`
- `/patient/ask-question`
- `/patient/book-appointment`
- `/patient/history`
- `/patient/profile`
- `/patient/consultations/:appointmentId`

Protected doctor routes:

- `/doctor`
- `/doctor/inbox`
- `/doctor/schedule`
- `/doctor/patients`
- `/doctor/appointments`
- `/doctor/ratings`
- `/doctor/profile`
- `/doctor/consultations/:appointmentId`

Protected admin routes:

- `/admin`
- `/admin/users`
- `/admin/patients`
- `/admin/doctors`
- `/admin/specialties`
- `/admin/appointments`
- `/admin/moderation`
- `/reports`

## Auth And API Flow

- `App.tsx` bootstraps the session by dispatching `meRequested()`.
- Access token is kept in frontend auth state/storage for API authorization.
- Refresh token is not exposed to JavaScript; backend stores it in an HttpOnly cookie.
- Axios request interceptor attaches `Authorization: Bearer <accessToken>`.
- Axios response interceptor handles `401`, deduplicates refresh attempts and retries the original request when refresh succeeds.
- Failed refresh clears auth state and routes the user back to login.
- `AuthGuard` protects authenticated sections; `RoleGuard` protects role-specific pages.

Backend authorization remains the source of truth. Frontend guards are for navigation and user experience.

## Realtime Consultation

Realtime consultation chat uses the backend Socket.IO gateway:

- Base URL comes from `VITE_API_BASE_URL`.
- Namespace: `/consultations`.
- The shared client lives in `src/features/consultation/realtime/`.
- Patient and doctor consultation pages use REST for initial session/history/result data and Socket.IO for realtime messages.
- The client cleans up listeners on unmount/logout and handles reconnect behavior.

## Environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Local default:

```env
VITE_API_BASE_URL=http://localhost:4000
```

The same base URL is used for REST APIs and realtime consultation Socket.IO.

## Setup And Run

Start the backend first, then run:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Web
source ~/.nvm/nvm.sh
npm install
npm run dev
```

Local frontend URL:

```text
http://localhost:5173
```

## Demo Accounts

These accounts are created by the backend demo seed:

```text
Admin:   admin@healthcare.local / Admin@123
Patient: lan.nguyen@healthcare.local / Patient@123
Doctor:  bs.an.nguyen@healthcare.local / Doctor@123
```

## Scripts

```bash
npm run dev                    # Vite dev server
npm run build                  # TypeScript build + Vite production build
npm run preview                # Preview production build
npm run type-check             # TypeScript type check
npm run lint                   # ESLint
npm run format                 # Prettier write
npm run format:check           # Prettier check
npm run test:e2e               # Playwright E2E
npm run test:e2e:seeded        # Playwright E2E against seeded backend data
npm run test:e2e:install       # Install Playwright browsers
npm run test:e2e:report        # Show Playwright report
```

## E2E Testing

Playwright tests live under `e2e/`.

```text
e2e/
├── fixtures/
├── pages/
├── specs/
├── test-data/
└── utils/
```

For manual E2E runs, make sure backend, database and frontend are running and use the correct seed for the test suite.

## Styling And UI

- Tailwind CSS is used for layout and visual styling.
- PrimeReact provides form controls and widgets.
- Common controls live in `src/components/common` and `src/components/form-controls`.
- Pages are responsive and localized through i18next.

## Related Repo

Backend service: `../OnlineHealthConsultation-Service`
