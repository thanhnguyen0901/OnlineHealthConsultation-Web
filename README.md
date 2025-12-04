# Ứng dụng Tư vấn Sức khỏe Trực tuyến - Frontend
## Online Health Consultation System - Web Frontend

Ứng dụng web React TypeScript cho Hệ thống Tư vấn Sức khỏe Trực tuyến.

### Thông tin Đề tài
- **Đề tài số**: 8
- **Học viện**: Công nghệ Bưu chính Viễn thông
- **Khoa**: Công nghệ Thông tin
- **Học phần**: Lập Trình Website
- **Số lượng sinh viên**: 3-4 sinh viên

---

## ✨ Tính năng Chính

### 🔐 Xác thực & Phân quyền
- Đăng ký, đăng nhập tài khoản
- Phân quyền theo vai trò: Bệnh nhân, Bác sĩ, Quản trị viên
- Bảo vệ route với AuthGuard và RoleGuard
- Tự động làm mới token (refresh token)

### 🏥 Chức năng Bệnh nhân (Patient)
- **Dashboard**: Tổng quan nhanh với các hành động chính
- **Gửi câu hỏi**: Hỏi bác sĩ về vấn đề sức khỏe
- **Đặt lịch hẹn**: Đặt lịch tư vấn với bác sĩ theo chuyên khoa
- **Lịch sử tư vấn**: Xem lại câu hỏi đã gửi, câu trả lời và lịch hẹn
- **Hồ sơ cá nhân**: Cập nhật thông tin sức khỏe

### 👨‍⚕️ Chức năng Bác sĩ (Doctor)
- **Dashboard**: Thống kê nhanh về câu hỏi và lịch hẹn
- **Hộp thư câu hỏi**: Xem danh sách câu hỏi từ bệnh nhân
- **Trả lời câu hỏi**: Gửi hướng dẫn, tư vấn điều trị cho bệnh nhân
- **Quản lý lịch làm việc**: Thiết lập thời gian có sẵn để tư vấn

### 👑 Chức năng Quản trị viên (Admin)
- **Dashboard**: Thống kê tổng quan hệ thống
- **Quản lý người dùng**: CRUD thông tin bệnh nhân
- **Quản lý bác sĩ**: CRUD thông tin bác sĩ, chuyên khoa
- **Quản lý chuyên khoa**: CRUD danh mục chuyên khoa y tế
- **Quản lý lịch hẹn**: Xem, kiểm duyệt, cập nhật trạng thái lịch hẹn
- **Báo cáo thống kê**: Biểu đồ số lượt tư vấn, người dùng hoạt động

### 📊 Tính năng Nâng cao
- ✅ **Dark Mode**: Chế độ tối, lưu preference tự động
- ✅ **Đa ngôn ngữ (i18n)**: Tiếng Việt & English
- ✅ **Biểu đồ thống kê**: Visualize dữ liệu với Recharts
- ✅ **Responsive Design**: Giao diện thân thiện trên mọi thiết bị
- ✅ **Toast Notifications**: Thông báo người dùng thời gian thực
- ✅ **Form Validation**: Validate form với Formik + Yup

---

## 🛠 Công nghệ Sử dụng

### Frontend Stack
- **Framework**: React 18.3.1 + TypeScript 5.6.2
- **Build Tool**: Vite 5.4.8
- **Routing**: React Router v6.26.2
- **State Management**: Redux Toolkit 2.2.7 + Redux Saga 1.3.0
- **UI Library**: PrimeReact 10.8.3 + PrimeIcons 7.0.0
- **Styling**: Tailwind CSS 3.4.11 + PostCSS 8.4.47
- **Forms**: Formik 2.4.6 + Yup 1.4.0
- **Charts**: Recharts 2.12.7
- **HTTP Client**: Axios 1.7.7
- **Internationalization**: i18next 23.15.1 + react-i18next 15.0.2
- **Date Utilities**: Day.js 1.11.13
- **Utilities**: clsx 2.1.1

### Development Tools
- **Linter**: ESLint 8.57.0 + TypeScript ESLint 7.18.0
- **Formatter**: Prettier 3.3.3
- **Type Checking**: TypeScript (strict mode)


---

## 📁 Cấu trúc Dự án

```
OnlineHealthConsultation-Web/
├── public/                     # Static assets
├── src/
│   ├── apis/                   # API clients
│   │   └── core/              # Core API setup
│   │       ├── apiClient.ts   # Axios instance with interceptors
│   │       └── httpError.ts   # Error handling utilities
│   │
│   ├── app/                    # App configuration
│   │   ├── guards/            # Route guards
│   │   │   ├── AuthGuard.tsx  # Authentication guard
│   │   │   └── RoleGuard.tsx  # Role-based access guard
│   │   ├── App.tsx            # Root component
│   │   └── routes.tsx         # Route definitions
│   │
│   ├── components/            # Reusable components
│   │   ├── common/           # Common UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ToastPortal.tsx
│   │   ├── charts/           # Chart widgets
│   │   │   ├── BarChartWidget.tsx
│   │   │   └── PieChartWidget.tsx
│   │   └── form-controls/    # Formik form controls
│   │       ├── FormikInputText.tsx
│   │       ├── FormikDropdown.tsx
│   │       └── FormikCalendar.tsx
│   │
│   ├── constants/             # Application constants
│   │   ├── routePaths.ts     # Route path definitions
│   │   ├── permissionConstants.ts
│   │   └── userKeys.ts       # LocalStorage keys
│   │
│   ├── features/              # Feature modules (domain-driven)
│   │   ├── auth/             # Authentication feature
│   │   │   ├── apis/
│   │   │   │   └── auth.api.ts
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── redux/
│   │   │   │   ├── auth.slice.ts
│   │   │   │   ├── auth.saga.ts
│   │   │   │   ├── auth.selectors.ts
│   │   │   │   └── auth.state.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── patient/          # Patient feature
│   │   │   ├── apis/
│   │   │   │   └── patient.api.ts
│   │   │   ├── components/
│   │   │   │   ├── QuestionForm.tsx
│   │   │   │   └── AppointmentForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── PatientDashboardPage.tsx
│   │   │   │   ├── AskQuestionPage.tsx
│   │   │   │   ├── BookAppointmentPage.tsx
│   │   │   │   └── ConsultationHistoryPage.tsx
│   │   │   ├── redux/
│   │   │   │   ├── patient.slice.ts
│   │   │   │   ├── patient.saga.ts
│   │   │   │   ├── patient.selectors.ts
│   │   │   │   └── patient.state.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── doctor/           # Doctor feature
│   │   │   ├── apis/
│   │   │   │   └── doctor.api.ts
│   │   │   ├── components/
│   │   │   │   ├── AnswerEditor.tsx
│   │   │   │   └── ScheduleTable.tsx
│   │   │   ├── pages/
│   │   │   │   ├── DoctorDashboardPage.tsx
│   │   │   │   ├── InboxQuestionsPage.tsx
│   │   │   │   └── SchedulePage.tsx
│   │   │   ├── redux/
│   │   │   │   ├── doctor.slice.ts
│   │   │   │   ├── doctor.saga.ts
│   │   │   │   ├── doctor.selectors.ts
│   │   │   │   └── doctor.state.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── admin/            # Admin feature
│   │   │   ├── apis/
│   │   │   │   └── admin.api.ts
│   │   │   ├── components/
│   │   │   │   ├── UserTable.tsx
│   │   │   │   ├── DoctorTable.tsx
│   │   │   │   └── SpecialtyTable.tsx
│   │   │   ├── pages/
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   ├── UsersManagePage.tsx
│   │   │   │   ├── DoctorsManagePage.tsx
│   │   │   │   ├── SpecialtiesManagePage.tsx
│   │   │   │   └── AppointmentsManagePage.tsx
│   │   │   ├── redux/
│   │   │   │   ├── admin.slice.ts
│   │   │   │   ├── admin.saga.ts
│   │   │   │   ├── admin.selectors.ts
│   │   │   │   └── admin.state.ts
│   │   │   └── types.ts
│   │   │
│   │   └── reports/          # Reports & Analytics feature
│   │       ├── apis/
│   │       ├── exporters/    # Export utilities (CSV, PDF)
│   │       ├── pages/
│   │       │   └── ReportsPage.tsx
│   │       ├── redux/
│   │       │   ├── reports.slice.ts
│   │       │   ├── reports.saga.ts
│   │       │   ├── reports.selectors.ts
│   │       │   └── reports.state.ts
│   │       └── types.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   └── useDebouncedValue.ts
│   │
│   ├── i18n/                  # Internationalization
│   │   ├── initI18n.ts       # i18next configuration
│   │   ├── en/               # English translations
│   │   │   ├── common.json
│   │   │   ├── patient.json
│   │   │   ├── doctor.json
│   │   │   └── admin.json
│   │   └── vi/               # Vietnamese translations
│   │       ├── common.json
│   │       ├── patient.json
│   │       ├── doctor.json
│   │       └── admin.json
│   │
│   ├── layouts/               # Layout components
│   │   ├── MainLayout.tsx    # Main app layout with sidebar
│   │   └── AuthLayout.tsx    # Authentication pages layout
│   │
│   ├── pages/                 # Standalone pages
│   │   └── NotFound.tsx      # 404 page
│   │
│   ├── redux/                 # Global Redux
│   │   ├── sagas/
│   │   │   └── index.ts      # Root saga
│   │   ├── selectors/
│   │   │   └── index.ts
│   │   └── slices/
│   │       └── ui.slice.ts   # UI state (dark mode, sidebar)
│   │
│   ├── state/                 # Redux store setup
│   │   ├── store.ts          # Store configuration
│   │   ├── rootSaga.ts       # Combine all sagas
│   │   └── hooks.ts          # Typed Redux hooks
│   │
│   ├── styles/                # Global styles
│   │   └── globals.css
│   │
│   ├── theme/                 # Theme files
│   │   ├── primereact-theme.css
│   │   └── tailwind.css
│   │
│   ├── types/                 # TypeScript types
│   │   ├── common.ts         # Common types
│   │   └── redux/
│   │       └── index.ts
│   │
│   ├── utils/                 # Utility functions
│   │   ├── classnames.ts     # CSS class utilities
│   │   ├── date.ts           # Date formatting
│   │   ├── number.ts         # Number formatting
│   │   └── storage.ts        # LocalStorage wrapper
│   │
│   ├── main.tsx               # Entry point
│   ├── index.css              # Global CSS imports
│   └── vite-env.d.ts          # Vite type definitions
│
├── .env                        # Environment variables
├── .gitignore
├── .prettierrc                 # Prettier config
├── eslint.config.js            # ESLint config
├── index.html
├── package.json
├── postcss.config.js           # PostCSS config
├── tailwind.config.js          # Tailwind config
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
└── README.md
```

### Giải thích Kiến trúc

#### 🎯 Feature-based Architecture
Dự án sử dụng kiến trúc **Feature-based** (domain-driven), mỗi feature là một module độc lập bao gồm:
- **apis/**: API calls
- **components/**: Components riêng của feature
- **pages/**: Pages của feature
- **redux/**: State management (slice, saga, selectors, state)
- **types.ts**: TypeScript types

#### 🔄 State Management Flow
```
Component → Dispatch Action → Saga → API Call → Success/Error → Reducer → Update State → Re-render
```

#### 🛡️ Authentication & Authorization
- **AuthGuard**: Bảo vệ routes yêu cầu đăng nhập
- **RoleGuard**: Bảo vệ routes theo vai trò (PATIENT, DOCTOR, ADMIN)
- **Token Management**: Auto refresh token với axios interceptors

---

## 🚀 Bắt đầu

### Yêu cầu hệ thống
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 hoặc **yarn**: >= 1.22.0

### Cài đặt

```bash
# 1. Clone repository
git clone <repository-url>
cd OnlineHealthConsultation-Web

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình environment variables
cp .env .env.local
# Chỉnh sửa .env.local với API URL của bạn

# 4. Chạy development server
npm run dev

# Ứng dụng sẽ chạy tại: http://localhost:5173
```

### Scripts có sẵn

```bash
# Development
npm run dev          # Chạy development server với hot reload

# Build
npm run build        # Build cho production (output: dist/)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Chạy ESLint kiểm tra code
npm run format       # Format code với Prettier

# Type Checking
npx tsc --noEmit     # Kiểm tra TypeScript errors
```

---

## ⚙️ Cấu hình

### Environment Variables

Tạo file `.env.local` với nội dung:

```env
# API Backend URL
VITE_API_BASE_URL=http://localhost:4000

# Optional: Feature flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_I18N=true
```

### API Endpoints

Backend API cần cung cấp các endpoints sau:

#### Authentication
```
POST   /auth/register      # Đăng ký tài khoản
POST   /auth/login         # Đăng nhập
POST   /auth/logout        # Đăng xuất
POST   /auth/refresh       # Làm mới token
GET    /auth/me            # Lấy thông tin user hiện tại
```

#### Patient
```
GET    /patients/questions              # Lấy danh sách câu hỏi
POST   /patients/questions              # Gửi câu hỏi mới
GET    /patients/appointments           # Lấy danh sách lịch hẹn
POST   /patients/appointments           # Đặt lịch hẹn mới
GET    /patients/history                # Lịch sử tư vấn
```

#### Doctor
```
GET    /doctors/inbox                   # Danh sách câu hỏi chưa trả lời
POST   /doctors/answers                 # Trả lời câu hỏi
GET    /doctors/schedule                # Lịch làm việc
POST   /doctors/schedule                # Tạo/cập nhật lịch làm việc
GET    /doctors/appointments            # Danh sách lịch hẹn
```

#### Admin
```
GET    /admin/users                     # Danh sách người dùng
POST   /admin/users                     # Tạo người dùng
PUT    /admin/users/:id                 # Cập nhật người dùng
DELETE /admin/users/:id                 # Xóa người dùng

GET    /admin/doctors                   # Danh sách bác sĩ
POST   /admin/doctors                   # Tạo bác sĩ
PUT    /admin/doctors/:id               # Cập nhật bác sĩ
DELETE /admin/doctors/:id               # Xóa bác sĩ

GET    /admin/specialties               # Danh sách chuyên khoa
POST   /admin/specialties               # Tạo chuyên khoa
PUT    /admin/specialties/:id           # Cập nhật chuyên khoa
DELETE /admin/specialties/:id           # Xóa chuyên khoa

GET    /admin/appointments              # Danh sách lịch hẹn
PUT    /admin/appointments/:id          # Cập nhật trạng thái lịch hẹn

GET    /admin/stats                     # Thống kê tổng quan
```

#### Reports
```
GET    /reports/statistics              # Thống kê hệ thống
GET    /reports/appointments-chart      # Dữ liệu biểu đồ lịch hẹn
GET    /reports/questions-chart         # Dữ liệu biểu đồ câu hỏi
```

---

## 🎨 Giao diện & Responsive

### Trang chủ
- Giới thiệu ứng dụng
- Danh sách bác sĩ nổi bật (theo chuyên khoa)
- Call-to-action: Đăng ký/Đăng nhập

### Trang Bệnh nhân
- Dashboard với quick actions
- Form gửi câu hỏi với validation
- Form đặt lịch tư vấn (chọn bác sĩ, ngày giờ)
- Lịch sử tư vấn với filter & search

### Trang Bác sĩ
- Dashboard thống kê
- Danh sách câu hỏi chờ trả lời
- Form trả lời câu hỏi
- Quản lý lịch làm việc (calendar view)

### Trang Quản trị
- Dashboard với biểu đồ thống kê
- CRUD tables cho Users, Doctors, Specialties
- Quản lý lịch hẹn với status tracking
- Báo cáo chi tiết với export options

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## 🔒 Bảo mật

### Authentication
- JWT-based authentication
- HttpOnly cookies để lưu refresh token
- Access token trong memory (không lưu localStorage)

### Authorization
- Role-based access control (RBAC)
- Route guards kiểm tra quyền truy cập
- API endpoints được bảo vệ theo role

### Security Best Practices
- XSS protection với React's built-in escaping
- CSRF protection với SameSite cookies
- Input validation với Yup schemas
- Secure HTTP headers

---

## 📊 State Management

### Redux Toolkit
```typescript
// Example: Dispatch action from component
const dispatch = useAppDispatch();
dispatch(fetchQuestions());

// Example: Select state
const questions = useAppSelector(selectQuestions);
```

### Redux Saga
```typescript
// Example: Saga flow
function* fetchQuestionsSaga() {
  try {
    const questions = yield call(patientApi.getQuestions);
    yield put(fetchQuestionsSuccess(questions));
  } catch (error) {
    yield put(fetchQuestionsError(error));
  }
}
```

---

## 🌐 Internationalization (i18n)

### Sử dụng trong Component
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('patient');
  
  return <h1>{t('dashboard')}</h1>;
}
```

### Thêm Translation Key
1. Thêm key vào `src/i18n/en/<namespace>.json`
2. Thêm key tương ứng vào `src/i18n/vi/<namespace>.json`

---

## 🌙 Dark Mode

Dark mode được quản lý bởi Redux và tự động lưu vào localStorage:

```typescript
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { toggleDarkMode } from '@/redux/slices/ui.slice';

function ThemeToggle() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector(state => state.ui.darkMode);
  
  return (
    <button onClick={() => dispatch(toggleDarkMode())}>
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
}
```

---

## 📦 Build & Deploy

### Build cho Production

```bash
# Build
npm run build

# Output: dist/ folder
# - index.html
# - assets/
#   - *.js (minified, code-split)
#   - *.css (minified)
```

### Deploy Options

#### 1. Static Hosting (Vercel, Netlify)
```bash
# Deploy to Vercel
npx vercel

# Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

#### 2. Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. CI/CD với GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

---

## 🧪 Testing (Khuyến nghị)

Dự án hiện chưa có tests, nhưng nên thêm:

```bash
# Cài đặt testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Chạy tests
npm run test

# Coverage
npm run test:coverage
```

---

## 📝 Coding Standards

### TypeScript
- Sử dụng strict mode
- Định nghĩa types rõ ràng, tránh `any`
- Prefer interfaces cho object types
- Use type aliases cho unions/primitives

### React
- Functional components với hooks
- Custom hooks cho logic tái sử dụng
- Lazy loading cho pages
- Memoization khi cần (useMemo, useCallback)

### CSS
- Tailwind utility classes
- BEM naming cho custom CSS
- Dark mode với `dark:` prefix
- Responsive với mobile-first approach

### Git Commit Messages
```
feat: thêm tính năng đặt lịch hẹn
fix: sửa lỗi hiển thị dark mode
refactor: tái cấu trúc auth saga
docs: cập nhật README
style: format code
```

---

## 📚 Tài liệu Tham khảo

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Redux Saga](https://redux-saga.js.org/)
- [React Router](https://reactrouter.com/)
- [PrimeReact Components](https://primereact.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)