# HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
## BÁO CÁO ĐỒ ÁN MÔN HỌC

**ĐỀ TÀI: XÂY DỰNG WEBSITE TIẾP THỊ LIÊN KẾT DÀNH CHO CÁC NHÂN VẬT CÓ SỨC ẢNH HƯỞNG (KOL)**

**Môn học:** Phát triển Hệ thống Thương mại điện tử

**Giảng viên:** Nguyễn Thị Bích Nguyên

**Sinh viên:**
1. Nguyễn Thị Phương Thảo - N21DCCN078 - Trưởng nhóm  
2. Vũ Quốc Hoàng Anh - N21DCCN101 - Thành viên

## 📋 Giới thiệu dự án

Website Tiếp thị liên kết cho KOL là một nền tảng kết nối các nhãn hiệu với những người có sức ảnh hưởng (Key Opinion Leaders) nhằm thúc đẩy hoạt động marketing và bán hàng. Hệ thống bao gồm 3 giao diện chính:

- **Admin Panel:** Quản lý hệ thống, người dùng và dữ liệu
- **KOL Panel:** Giao diện dành cho các nhà sáng tạo nội dung
- **User Interface:** Giao diện cho người dùng cuối

## 🛠️ Yêu cầu hệ thống

- **Node.js:** Phiên bản tối thiểu 20.17
- **MySQL:** Phiên bản tối thiểu 2018
- **Git:** Để clone source code

## 🚀 Hướng dẫn cài đặt

### Bước 1: Clone repositories

```bash
# Backend
git clone https://github.com/ngphthao10/affiliate_app_backend.git

# Frontend repositories
git clone https://github.com/ngphthao10/affiliate_app_adminpanel_frontend.git
git clone https://github.com/hoanganh2k03/frontend_user.git
git clone https://github.com/ngphthao10/affiliate_app_kolpanel_frontend.git
```

### Bước 2: Cài đặt dependencies

Thực hiện lệnh sau cho từng thư mục:

```bash
# Backend
cd affiliate_app_backend
npm install

# Admin Panel
cd ../affiliate_app_adminpanel_frontend
npm install

# User Frontend
cd ../frontend_user
npm install

# KOL Frontend
cd ../affiliate_app_kolpanel_frontend
npm install
```

### Bước 3: Cấu hình môi trường

1. **Tạo file `.env`** trong 4 thư mục đã clone về (nội dung nằm trong drive nộp bài tập)
2. **Khởi động MySQL** và cập nhật thông tin kết nối
3. Chạy script SQL trong MySQL Workbench: file 01-schema.sql

### Bước 4: Chạy ứng dụng

Mở 4 terminal riêng biệt và chạy:

```bash
# Terminal 1: Backend
cd affiliate_app_backend
npm run dev

# Terminal 2: Admin Panel
cd affiliate_app_adminpanel_frontend
npm run dev

# Terminal 3: User Frontend
cd frontend_user
npm run dev

# Terminal 4: KOL Frontend
cd affiliate_app_kolpanel_frontend
npm run dev
```

## 🌐 Truy cập ứng dụng

Sau khi chạy thành công, truy cập các địa chỉ:

- **Admin Panel:** http://localhost:5173/
- **User Interface:** http://localhost:5000/
- **KOL Panel:** http://localhost:5174/

## ✅ Kiểm tra hoạt động

- Kiểm tra log trên terminal để xác nhận kết nối database
- Truy cập từng giao diện để đảm bảo hoạt động bình thường
- Test các chức năng cơ bản của từng module
