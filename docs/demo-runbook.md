# Runbook demo và chụp hình báo cáo

File này ghi lại các lệnh cần chạy khi demo hoặc chụp hình báo cáo cho hệ thống Online Health Consultation.

## 1. Chạy database

Chạy trong repo backend:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Service
docker compose up -d
docker compose ps
```

## 2. Seed data demo để chụp UI

Dùng bộ seed này khi cần chụp các màn hình app có dữ liệu đẹp, tiếng Việt có dấu.

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Service
npm run prisma:migrate:deploy
npm run prisma:seed
```

Tài khoản demo:

```text
Admin:   admin@healthcare.local / Admin@123
Patient: lan.nguyen@healthcare.local / Patient@123
Doctor:  bs.an.nguyen@healthcare.local / Doctor@123
```

## 3. Chạy backend

Mở terminal riêng:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Service
source ~/.nvm/nvm.sh
npm run dev
```

Backend chạy tại:

```text
http://localhost:4000
```

## 4. Chạy frontend

Mở terminal riêng:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Web
source ~/.nvm/nvm.sh
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## 5. Các page cần mở khi chụp UI

Public:

```text
http://localhost:5173/
http://localhost:5173/specialties
http://localhost:5173/doctors
http://localhost:5173/doctors/:doctorId
http://localhost:5173/register
http://localhost:5173/login
```

Patient:

```text
http://localhost:5173/patient
http://localhost:5173/patient/profile
http://localhost:5173/patient/book-appointment
http://localhost:5173/patient/history
http://localhost:5173/patient/ask-question
```

Doctor:

```text
http://localhost:5173/doctor
http://localhost:5173/doctor/profile
http://localhost:5173/doctor/appointments
http://localhost:5173/doctor/inbox
http://localhost:5173/doctor/consultations/:appointmentId
```

Admin:

```text
http://localhost:5173/admin
http://localhost:5173/admin/doctors
http://localhost:5173/admin/specialties
http://localhost:5173/admin/users
http://localhost:5173/admin/appointments
```

Checklist hình chi tiết nằm ở:

```text
OnlineHealthConsultation-Web/docs/screenshot-checklist.md
```

## 6. Seed E2E để chụp kết quả Playwright

Lưu ý: seed E2E khác seed demo. Seed E2E dùng dữ liệu có tiền tố `E2E` để test tự động ổn định.

Chạy trong repo backend:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Service
npm run db:seed:e2e
```

Sau khi chạy, terminal sẽ in ra các biến `E2E_*`. Copy đúng bộ biến mới nhất để chạy Playwright.

## 7. Chạy Playwright để chụp Hình 36

Chạy trong repo frontend. Dưới đây là mẫu theo bộ seed hiện tại:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Web

E2E_RUN_SEEDED=true \
E2E_PATIENT_EMAIL=patient.e2e@healthcare.local \
E2E_PATIENT_PASSWORD=Patient@123 \
E2E_DOCTOR_EMAIL=doctor.e2e@healthcare.local \
E2E_DOCTOR_PASSWORD=Doctor@123 \
E2E_ADMIN_EMAIL=admin@healthcare.local \
E2E_ADMIN_PASSWORD=Admin@123 \
E2E_APPROVED_DOCTOR_EMAIL=doctor.e2e@healthcare.local \
E2E_PENDING_DOCTOR_EMAIL=doctor.pending.e2e@healthcare.local \
E2E_APPROVED_DOCTOR_ID=019ee01d-9cab-77c9-905b-1439b2b71dc6 \
E2E_PENDING_DOCTOR_ID=019ee01d-9cab-77c9-905b-143ad3b89645 \
E2E_APPOINTMENT_ID=019ee01d-9cb5-7d53-beaa-5a58fc82bffd \
E2E_CONFIRMED_APPOINTMENT_ID=019ee01d-9cb7-7951-bd44-209968ab7699 \
E2E_COMPLETED_APPOINTMENT_ID=019ee01d-9cba-7343-94be-2bc0fd3c5a8c \
E2E_CONSULTATION_APPOINTMENT_ID=019ee01d-9cbb-7d1a-8b3b-d586138e9813 \
E2E_CANCELLABLE_APPOINTMENT_ID=019ee01d-9cb8-7aad-a4cb-c8cdd38c0fce \
E2E_OTHER_PATIENT_APPOINTMENT_ID=019ee01d-9cbc-764e-8233-05ebf67b4daa \
E2E_DOCTOR_SEARCH_KEYWORD=cardiology \
E2E_SPECIALTY_NAME="E2E Cardiology" \
VITE_API_BASE_URL=http://localhost:4000 \
E2E_API_BASE_URL=http://localhost:4000 \
PLAYWRIGHT_BASE_URL=http://localhost:5173 \
npm run test:e2e
```

Quan trọng: nếu đã chạy Playwright một lần, một số record E2E sẽ bị đổi trạng thái. Muốn chạy lại full suite đẹp thì phải seed lại:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Service
npm run db:seed:e2e
```

## 8. Mở Playwright HTML report để chụp Hình 37

Chạy trong repo frontend:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Web
npm run test:e2e:report
```

Nếu lệnh không tự mở browser, mở file:

```text
OnlineHealthConsultation-Web/playwright-report/index.html
```

## 9. Kiểm tra nhanh trước demo

Backend:

```bash
curl http://localhost:4000/api/public/specialties
```

Frontend:

```bash
curl -I http://localhost:5173/
```

Build/check nhanh nếu cần:

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Service
npm run type-check
```

```bash
cd /Users/ThanhNguyen/Projects/SV/WebProgramming/OnlineHealthConsultation/OnlineHealthConsultation-Web
npm run type-check
npm run lint
```
