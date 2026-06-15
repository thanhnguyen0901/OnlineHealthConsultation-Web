# Playwright Migration Summary

## 1. Cypress đã bị remove

- Xóa thư mục `cypress/`, bao gồm specs, fixtures, support commands và config riêng cho Cypress.
- Xóa `cypress.config.ts`.
- Xóa scripts `cy:*` khỏi `package.json`.
- Xóa dependency `cypress` khỏi `package.json`.
- Xóa hướng dẫn test cũ `RUN_AUTO_CYPRESS.md`.
- Xóa hướng dẫn hard-code login/mock test mode cũ `TEST_MODE_GUIDE.md`.
- Cập nhật README, QUICK_START, CI comment và frontend checklist để không dùng Cypress làm reference chính nữa.

Lưu ý: Cypress đã bị remove hoàn toàn khỏi project.

## 2. Playwright đã được thêm

- Thêm dependency `@playwright/test`.
- Thêm `playwright.config.ts`.
- Base URL lấy theo thứ tự:
  - `PLAYWRIGHT_BASE_URL`
  - `VITE_APP_URL`
  - mặc định `http://localhost:5173`
- Reporter:
  - `list`
  - `html`
- Artifact policy:
  - trace: `on-first-retry`
  - screenshot: `only-on-failure`
  - video: `retain-on-failure`
- Web server mặc định chạy `npm run dev -- --host 127.0.0.1`.
- Có thể tắt web server tự động bằng `PLAYWRIGHT_SKIP_WEB_SERVER=true`.

## 3. Scripts mới

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:debug
npm run test:e2e:report
npm run test:e2e:install
```

## 4. Cấu trúc thư mục E2E mới

```text
e2e/
├── fixtures/
├── pages/
│   ├── BasePage.ts
│   ├── DoctorListPage.ts
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   └── RegisterPage.ts
├── specs/
│   └── public-smoke.spec.ts
├── test-data/
└── utils/
```

## 5. Smoke tests đã tạo

- Home page loads.
- Login page loads.
- Register page loads.
- Doctor list page loads.
- Guest book appointment CTA redirect login: chạy khi backend/dev data có public doctor card, skip có chủ đích nếu chưa có dữ liệu.

## 6. Cách chạy test

```bash
npm install
npm run test:e2e:install
npm run build
npm run test:e2e
```

Nếu frontend đang chạy sẵn ở URL khác:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:5174 PLAYWRIGHT_SKIP_WEB_SERVER=true npm run test:e2e
```

## 7. TODO còn lại

- Bổ sung `data-testid` cho các màn hình Patient/Doctor/Admin ở phase sau:
  - `appointment-detail`
  - `consultation-result`
  - `prescription-items`
- Viết Playwright tests cho luồng thật với backend seed data:
  - login theo role
  - public discovery
  - patient booking/history/result
  - doctor confirm/complete/answer/prescription
  - admin doctor approval

## 8. Kết quả validation

- `npm install`: pass. Đã thêm Playwright packages và prune Cypress packages khỏi `package-lock.json`.
- `npm run test:e2e:install`: pass sau khi cấp quyền network để tải browser binaries.
- `npm run build`: pass. Có warning về browserslist cũ và chunk size lớn, không block build.
- `npm run test:e2e`: pass sau khi cấp quyền bind localhost cho Vite/Playwright. Sau Phase 1 public/auth: `4 passed`, `1 skipped`.

Kết quả Playwright smoke:

- 4 passed.
- 1 skipped có chủ đích nếu backend/dev data chưa trả public doctor card cho CTA redirect test.
