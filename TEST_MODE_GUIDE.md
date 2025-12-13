# 🧪 HƯỚNG DẪN TEST MODE - HARD CODE LOGIN

## ✅ Đã thực hiện

Đã comment các API calls và hard code user data để test frontend mà không cần backend.

## 📝 Các thay đổi

### 1. `src/features/auth/redux/auth.saga.ts`
- ✅ Comment API call `authApi.login()` 
- ✅ Hard code 3 options user: PATIENT, DOCTOR, ADMIN
- ✅ Comment API call `authApi.register()`
- ✅ Comment API call `authApi.logout()`

### 2. `src/features/auth/pages/LoginPage.tsx`
- ✅ Pre-filled email & password (test@example.com / 123456)
- ✅ Thêm warning banner hiển thị TEST MODE
- ✅ Hướng dẫn đổi role trong banner

### 3. `src/app/guards/AuthGuard.tsx`
- ✅ Thêm option để bypass auth guard hoàn toàn (commented)

## 🎯 Cách sử dụng

### Test với role khác nhau:

Mở file `src/features/auth/redux/auth.saga.ts` và uncomment role bạn muốn test:

#### Option 1: Test PATIENT
```typescript
// ĐANG BẬT (default)
const user: User = {
  id: '1',
  email: 'patient@test.com',
  name: 'Test Patient',
  role: 'PATIENT',
};
```

#### Option 2: Test DOCTOR
```typescript
// Comment Option 1, uncomment Option 2
const user: User = {
  id: '2',
  email: 'doctor@test.com',
  name: 'Dr. Test',
  role: 'DOCTOR',
};
```

#### Option 3: Test ADMIN
```typescript
// Comment Option 1, uncomment Option 3
const user: User = {
  id: '3',
  email: 'admin@test.com',
  name: 'Admin Test',
  role: 'ADMIN',
};
```

### Test flow:

1. **Chạy app**: `npm run dev`
2. **Vào trang login**: http://localhost:5173/login
3. **Nhấn Login** (email/password đã pre-filled, không cần nhập)
4. **Tự động redirect** theo role:
   - PATIENT → `/patient`
   - DOCTOR → `/doctor`
   - ADMIN → `/admin`

### Bypass auth guard hoàn toàn (optional):

Nếu muốn test route mà không cần login, mở `src/app/guards/AuthGuard.tsx` và uncomment dòng:

```typescript
// Uncomment dòng này để bypass hoàn toàn auth guard
return <>{children}</>;
```

## ⚠️ Lưu ý

### Mock data cho các API khác

Hiện tại chỉ hard code **auth**. Các API khác (patient, doctor, admin) vẫn cần backend hoặc mock riêng.

Nếu muốn mock tất cả APIs:

1. **Option 1: Mock từng API**
   - Vào các file `*.saga.ts` trong từng feature
   - Comment `yield call(api.xxx)` 
   - Return mock data

2. **Option 2: Mock Axios globally**
   - Dùng `axios-mock-adapter` hoặc `msw`
   - Intercept tất cả requests

3. **Option 3: Dùng local JSON**
   - Tạo folder `src/mocks/data/`
   - Import JSON thay vì gọi API

## 🔙 Khôi phục về code gốc

Khi cần connect backend thật:

1. Tìm comment `// ===== HARD CODE FOR TESTING =====`
2. Uncomment API calls bên trong
3. Comment/xóa mock data
4. Xóa pre-filled values trong LoginPage

Hoặc dùng Git:
```bash
git checkout src/features/auth/redux/auth.saga.ts
git checkout src/features/auth/pages/LoginPage.tsx
git checkout src/app/guards/AuthGuard.tsx
```

## 📋 Checklist test

- [ ] Login với PATIENT role → Check dashboard hiển thị đúng
- [ ] Login với DOCTOR role → Check inbox questions
- [ ] Login với ADMIN role → Check CRUD users/doctors
- [ ] Test navigation giữa các pages
- [ ] Test logout → Redirect về login
- [ ] Test responsive trên mobile
- [ ] Test dark mode toggle
- [ ] Test language switch (vi/en)

## 🎨 UI Components đã test được

✅ Tất cả pages đã có UI hoàn chỉnh, chỉ cần mock data API responses nếu cần test chi tiết:

- Patient: Dashboard, Profile, Ask Question, Book Appointment, History
- Doctor: Dashboard, Inbox, Schedule
- Admin: Dashboard, Users, Doctors, Specialties, Appointments, Moderation
- Reports: Statistics & Charts

Happy testing! 🚀
