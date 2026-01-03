# 🚀 QUICK START - Frontend (Windows)

Hướng dẫn nhanh để chạy **frontend** và kết nối với backend.

---

## ⚠️ YÊU CẦU

Đảm bảo **backend đã chạy** trước khi start frontend:

```bash
# Trong terminal khác, cd vào thư mục backend
cd ..\OnlineHealthConsultation-Service
npm run dev

# Backend phải chạy tại: http://localhost:4000
```

✅ Node.js 18+ đã cài đặt  
✅ Backend đang chạy tại port 4000

---

## 📋 PART 1: CÀI ĐẶT LẦN ĐẦU

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Kiểm tra cấu hình API

File `.env` đã có sẵn với cấu hình:

```env
VITE_API_BASE_URL=http://localhost:4000
```

**Lưu ý:** Nếu backend chạy ở port khác, sửa file `.env` này.

---

## 🎯 PART 2: CHẠY FRONTEND

### Khởi động Development Server

```bash
npm run dev
```

**Kết quả mong đợi:**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Truy cập ứng dụng

Mở trình duyệt: **http://localhost:5173**

---

## 👤 TÀI KHOẢN TEST (từ Backend Seed Data)

### Admin

- Email: `admin@healthcare.com`
- Password: `Admin@123`

### Bác sĩ (Doctors)

1. **Tim mạch**
   - Email: `nguyen.van.hung@healthcare.com`
   - Password: `Doctor@123`

2. **Da liễu**
   - Email: `tran.thi.lan@healthcare.com`
   - Password: `Doctor@123`

3. **Nhi khoa**
   - Email: `le.van.minh@healthcare.com`
   - Password: `Doctor@123`

4. **Chấn thương chỉnh hình**
   - Email: `pham.thi.nga@healthcare.com`
   - Password: `Doctor@123`

### Bệnh nhân (Patients)

1. Email: `vo.van.nam@gmail.com` - Password: `Patient@123`
2. Email: `hoang.thi.thao@gmail.com` - Password: `Patient@123`
3. Email: `nguyen.van.khanh@gmail.com` - Password: `Patient@123`

---

## 🔧 CÁC LỆNH HỮU ÍCH

```bash
# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🌐 API ENDPOINTS

Frontend tự động kết nối với backend API:

- **Base URL:** http://localhost:4000/api
- **Auth:** http://localhost:4000/api/auth/\*
- **Health Check:** http://localhost:4000/api/health

**Lưu ý:** File `.env` chỉ cần `VITE_API_BASE_URL=http://localhost:4000`, code tự động thêm `/api`

---

## 📝 TÍNH NĂNG TEST DATA

Sau khi login, bạn có thể test các tính năng với data có sẵn:

### Admin Dashboard

- ✅ 8 users (1 admin, 4 doctors, 3 patients)
- ✅ 5 specialties
- ✅ 6 questions (nhiều trạng thái khác nhau)
- ✅ 7 appointments (completed, confirmed, pending, cancelled)
- ✅ 3 ratings (visible và hidden)

### Doctor Features

- ✅ Trả lời câu hỏi (có câu pending chờ trả lời)
- ✅ Quản lý lịch hẹn
- ✅ Xem ratings của mình

### Patient Features

- ✅ Đặt câu hỏi mới
- ✅ Đặt lịch hẹn với bác sĩ
- ✅ Đánh giá sau khi khám (có appointment completed)
- ✅ Xem câu hỏi và câu trả lời

---

## ⚠️ TROUBLESHOOTING

### Lỗi: "Network Error" hoặc không kết nối được API

**Nguyên nhân:** Backend chưa chạy hoặc sai port

**Giải pháp:**

1. Kiểm tra backend đang chạy:

   ```bash
   # Mở terminal khác
   cd ..\OnlineHealthConsultation-Service
   npm run dev
   ```

2. Kiểm tra port trong `.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:4000
   ```

3. Restart frontend sau khi sửa `.env`

### Lỗi: CORS (Cross-Origin)

**Đã cấu hình sẵn** trong backend với `withCredentials: true`

Nếu vẫn gặp lỗi CORS, kiểm tra backend có cấu hình CORS middleware đúng không.

### Lỗi: "Cannot find module"

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 đã được sử dụng

Vite sẽ tự động chọn port khác (5174, 5175...). Hoặc chỉ định port:

```bash
npm run dev -- --port 3000
```

---

## 📚 THAM KHẢO

- **Backend Setup:** `../OnlineHealthConsultation-Service/QUICK_START.md`
- **Database Setup:** `../Docs/DATABASE_SETUP.md`
- **Test Mode:** `TEST_MODE_GUIDE.md`
- **Backend API:** http://localhost:4000/api

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Backend đã chạy thành công (port 4000)
- [ ] Frontend dependencies đã cài (`npm install`)
- [ ] File `.env` đã có `VITE_API_BASE_URL=http://localhost:4000`
- [ ] Frontend chạy thành công (`npm run dev`)
- [ ] Truy cập http://localhost:5173 thành công
- [ ] Login được với tài khoản test
- [ ] API calls hoạt động (kiểm tra Network tab trong DevTools)

---

**🎉 DONE! Frontend đã sẵn sàng integrate với Backend!**
