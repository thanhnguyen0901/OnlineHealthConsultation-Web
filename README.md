# OnlineHealthConsultation-Web

Frontend cho hệ thống tư vấn sức khỏe trực tuyến, xây dựng bằng React + TypeScript + Vite.

## Mục tiêu

Ứng dụng phục vụ 3 vai trò:

- `PATIENT`: đặt lịch, hỏi đáp, theo dõi lịch sử tư vấn, cập nhật hồ sơ.
- `DOCTOR`: xử lý câu hỏi, quản lý lịch làm việc, quản lý lịch hẹn, xem đánh giá.
- `ADMIN`: quản trị người dùng, bác sĩ, chuyên khoa, lịch hẹn, moderation nội dung.

Ngoài ra có trang `Reports` dùng chung cho `ADMIN` và `DOCTOR`.

## Công nghệ

- React 18 + TypeScript
- Vite
- React Router v6
- Redux Toolkit + Redux Saga
- Axios
- PrimeReact + Tailwind CSS
- Formik + Yup
- i18next (`vi`, `en`)
- Recharts
- Cypress E2E

## Cấu trúc chính

```text
OnlineHealthConsultation-Web/
├── cypress/
├── src/
│   ├── apis/core/
│   ├── app/
│   ├── components/
│   ├── constants/
│   ├── features/
│   │   ├── auth/
│   │   ├── patient/
│   │   ├── doctor/
│   │   ├── admin/
│   │   └── reports/
│   ├── i18n/
│   ├── layouts/
│   ├── redux/
│   ├── state/
│   ├── types/
│   └── utils/
├── .env.example
├── package.json
└── README.md
```

## Routing và phân quyền

- Public:
  - `/`
  - `/login`
  - `/register`
  - `*` -> `404`
- Protected qua `AuthGuard` + `RoleGuard`:
  - Patient: `/patient`, `/patient/ask-question`, `/patient/book-appointment`, `/patient/history`, `/patient/profile`
  - Doctor: `/doctor`, `/doctor/inbox`, `/doctor/patients`, `/doctor/appointments`, `/doctor/schedule`, `/doctor/ratings`, `/doctor/profile`
  - Admin: `/admin`, `/admin/users`, `/admin/patients`, `/admin/doctors`, `/admin/specialties`, `/admin/appointments`, `/admin/moderation`
  - Shared: `/reports` (`ADMIN`, `DOCTOR`)

## Auth/AuthZ flow trên frontend

### 1. Bootstrap phiên

- `App.tsx` dispatch `meRequested()` khi app mount.
- Saga auth thử lấy access token từ `sessionStorage` trước.
- Nếu token local không hợp lệ thì fallback sang `POST /auth/refresh` (cookie).

### 2. Request pipeline

- Request interceptor tự gắn `Authorization: Bearer <accessToken>` từ Redux.
- Nếu API trả `401`, interceptor gọi refresh rồi retry request cũ.
- Nếu refresh thất bại, app clear auth state và điều hướng về `/login`.

### 3. Guard

- `AuthGuard`: chặn route private khi chưa đăng nhập.
- `RoleGuard`: chặn route sai role.

## Cài đặt và chạy

```bash
npm install
cp .env.example .env
npm run dev
```

App chạy tại: `http://localhost:5173`

## Biến môi trường

`.env.example`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Biến sử dụng:

- `VITE_API_BASE_URL`: base URL backend.
- `VITE_DEBUG_REFRESH` (optional): bật log refresh manager khi đặt `true`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
npm run type-check
npm run cy:open
npm run cy:run
npm run test:e2e
```

## E2E

- Specs: `cypress/e2e/**/*.cy.ts`
- Nhóm test: `auth`, `patient`, `doctor`, `admin`, `role-guard`

## Tích hợp backend

Frontend gọi API từ dự án `OnlineHealthConsultation-Service` trong cùng workspace.
