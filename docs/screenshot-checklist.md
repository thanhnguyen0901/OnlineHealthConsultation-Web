# Checklist hình cần chụp cho báo cáo

File này dùng để chạy app và chụp hình cho Chương 3 của báo cáo `OnlineHealthConsultationPlatform_Report.md`.

## Tài khoản demo

| Vai trò | Email | Mật khẩu | Dùng cho |
|---|---|---|---|
| Admin | `admin@healthcare.local` | `Admin@123` | Dashboard quản trị, quản lý bác sĩ, chuyên khoa, user, lịch hẹn |
| Patient | `lan.nguyen@healthcare.local` | `Patient@123` | Dashboard bệnh nhân, đặt lịch, câu hỏi, lịch sử tư vấn |
| Doctor | `bs.an.nguyen@healthcare.local` | `Doctor@123` | Dashboard bác sĩ, lịch hẹn, câu hỏi, hồ sơ |

## Public / Guest

| Hình | Nội dung cần chụp | Route / page | Tài khoản | Ghi chú |
|---|---|---|---|---|
| Hình 15 | Giao diện Trang chủ public | `http://localhost:5173/` | Không đăng nhập | Nên chụp phần hero + chuyên khoa + bác sĩ nổi bật nếu màn hình đủ dài. |
| Hình 16 | Giao diện Danh sách chuyên khoa | `http://localhost:5173/specialties` | Không đăng nhập | Data demo có 8 chuyên khoa tiếng Việt có dấu. |
| Hình 17 | Giao diện Danh sách bác sĩ | `http://localhost:5173/doctors` | Không đăng nhập | Có thể lọc theo chuyên khoa để hình gọn hơn. |
| Hình 18 | Giao diện Chi tiết bác sĩ | Từ `/doctors` bấm `Detail` một bác sĩ, hoặc route `/doctors/:doctorId` | Không đăng nhập | Nên chọn bác sĩ có bio dài và có lịch làm việc, ví dụ BS. Bình Trần hoặc BS. Mai Đỗ. |
| Hình 19 | Giao diện Đăng ký | `http://localhost:5173/register` | Không đăng nhập | Có thể chọn role Doctor để hiện dropdown chuyên khoa. |
| Hình 20 | Giao diện Đăng nhập | `http://localhost:5173/login` | Không đăng nhập | Chụp form đăng nhập sạch, chưa nhập lỗi validation. |

## Patient

| Hình | Nội dung cần chụp | Route / page | Tài khoản | Ghi chú |
|---|---|---|---|---|
| Hình 21 | Patient dashboard và hồ sơ | `/patient`, phụ: `/patient/profile` | Patient | Nếu báo cáo chỉ nhận 1 ảnh, ưu tiên `/patient`; nếu muốn đúng caption, chụp thêm `/patient/profile`. |
| Hình 22 | Patient đặt lịch tư vấn | `/patient/book-appointment` | Patient | Chọn chuyên khoa và bác sĩ để form có dữ liệu đẹp trước khi chụp. |
| Hình 23 | Patient danh sách lịch hẹn | `/patient/history` | Patient | Chụp tab/bảng lịch hẹn; dữ liệu có nhiều trạng thái: confirmed, completed, cancelled. |
| Hình 24 | Patient gửi câu hỏi sức khỏe | `/patient/ask-question` | Patient | Có thể nhập tiêu đề/nội dung mẫu nhưng chưa cần submit. |
| Hình 25 | Patient xem câu hỏi và phản hồi | `/patient/history` | Patient | Chụp bảng câu hỏi hoặc mở chi tiết một câu hỏi đã được trả lời. |
| Hình 26 | Patient xem kết quả tư vấn và đơn thuốc | `/patient/history` | Patient | Mở lịch hẹn `COMPLETED`, bấm xem kết quả tư vấn/đơn thuốc. |

## Doctor

| Hình | Nội dung cần chụp | Route / page | Tài khoản | Ghi chú |
|---|---|---|---|---|
| Hình 27 | Doctor dashboard và hồ sơ | `/doctor`, phụ: `/doctor/profile` | Doctor | Nếu chỉ chụp 1 ảnh, ưu tiên dashboard; nếu đúng caption, chụp thêm hồ sơ. |
| Hình 28 | Doctor quản lý lịch hẹn | `/doctor/appointments` | Doctor | Dữ liệu có lịch chờ xác nhận, đã xác nhận, đã hoàn tất. |
| Hình 29 | Doctor quản lý câu hỏi | `/doctor/inbox` | Doctor | Nên mở chi tiết câu hỏi hoặc form trả lời nếu cần thấy rõ nghiệp vụ. |
| Hình 30 | Doctor phiên tư vấn, kết quả và đơn thuốc | `/doctor/consultations/019ee02d-586e-707b-87c4-4c199322765a` | Doctor | Login `bs.an.nguyen@healthcare.local`, vào `/doctor/appointments`, bấm `Mở tư vấn` ở lịch của bệnh nhân Lan Nguyễn; hoặc mở trực tiếp route này sau khi chạy `npm run prisma:seed`. |

## Admin

| Hình | Nội dung cần chụp | Route / page | Tài khoản | Ghi chú |
|---|---|---|---|---|
| Hình 31 | Admin dashboard | `/admin` | Admin | Chụp các stat card và quick actions. |
| Hình 32 | Admin quản lý và duyệt bác sĩ | `/admin/doctors` | Admin | Seed có 1 bác sĩ `PENDING` để minh họa duyệt hồ sơ. |
| Hình 33 | Admin quản lý chuyên khoa | `/admin/specialties` | Admin | Chụp danh sách 8 chuyên khoa hoặc mở form tạo/sửa nếu cần. |
| Hình 34 | Admin quản lý người dùng và lịch hẹn | `/admin/users`, phụ: `/admin/appointments` | Admin | Caption gom 2 màn hình; nên chụp cả user management và appointment management. |

## Kiểm thử / Playwright

| Hình | Nội dung cần chụp | Page / vị trí | Tài khoản | Ghi chú |
|---|---|---|---|---|
| Hình 35 | Cấu trúc thư mục kiểm thử tự động Playwright | IDE hoặc Finder tại `OnlineHealthConsultation-Web/e2e` | Không cần | Mở cây thư mục `e2e/specs`, `e2e/pages`, `e2e/utils`, `e2e/test-data`. |
| Hình 36 | Kết quả chạy kiểm thử Playwright trên terminal | Terminal sau khi chạy `npm run test:e2e` | Không cần | Chụp đoạn summary pass/fail. |
| Hình 37 | Báo cáo HTML của Playwright | `OnlineHealthConsultation-Web/playwright-report/index.html` | Không cần | Có thể mở bằng `npm run test:e2e:report`. |

## Ghi chú

- Chương 4 hiện không có hình cần chụp.
- Nếu vừa seed lại database, nên refresh app hoặc đăng xuất/đăng nhập lại để tránh session cũ.
- Sau khi chụp xong, nhớ cập nhật phần `DANH SÁCH HÌNH ẢNH` trong report vì hiện report có thể chưa liệt kê đủ Hình 36 và Hình 37.
