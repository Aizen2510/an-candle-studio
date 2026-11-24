# 🕯️ AN CANDLE STUDIO — Fullstack E-Commerce & Sensory Studio

Website thương mại điện tử chuyên biệt cho xưởng nến thơm thủ công **AN CANDLE STUDIO** với công nghệ mô phỏng 3D tương tác, Live AR đặt phòng, VR 360° Showroom, kết hợp hệ thống Backend Node.js/Express, API RESTful và Bảng Quản trị (Admin Dashboard) vận hành đơn hàng theo thời gian thực.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Phía Khách Hàng (Storefront — `/`)
- **Interactive Sensory Studio 3 Chế Độ**:
  - **Chế độ 1 — 3D Candle & Ingredient X-Ray**: Xoay 360°, bóc tách các lớp cấu tạo (sáp đậu nành, bấc cotton, tinh dầu), thử nghiệm mô phỏng lửa cháy.
  - **Chế độ 2 — Live AR Room Simulator**: Thử đặt nến vào 3 không gian (bàn gỗ phòng khách, kệ sách, tab đầu giường) và kéo thanh chỉnh ánh sáng từ Ngày sang Đêm.
  - **Chế độ 3 — VR 360° Showroom**: Khám phá 3 không gian trải nghiệm với các điểm chạm mùi hương và âm thanh tiếng lửa bập bùng thư giãn (Web Audio API).
- **4 Bộ Sưu Tập Hương Chuẩn Hóa**: CALM, FOCUS, COZY, MEMORY (hũ mini 90g 139k, tiêu chuẩn 180g 229k, set quà 299k).
- **Quiz Trắc Nghiệm Mùi Hương**: Gợi ý dòng nến phù hợp với tâm trạng và phong cách sống của từng khách hàng.
- **Trợ Lý Ảo AN Care (AI Chatbot)**: Trả lời tự động về 4 bộ sưu tập, bảng giá, quy tắc cắt bấc và an toàn đốt nến.
- **Quy Trình Mua Hàng & Thanh Toán 2 Bước (Checkout)**:
  - Cho phép viết lời chúc cá nhân hóa in thiệp thủ công đi kèm hũ nến.
  - Áp dụng mã ưu đãi giảm 20% `ANCHAO20`.
  - Tích hợp mã chuyển khoản nhanh **VietQR** tự động điền số tiền và nội dung chuyển khoản.

### 2. Tra Cứu Vận Đơn Khách Hàng (`/track`)
- Khách hàng nhập mã đơn (ví dụ: `AN-2611-982415`) hoặc Số điện thoại.
- Hiển thị tiến trình đơn hàng (Đặt hàng ➔ Đã duyệt ➔ Đang giao ➔ Hoàn thành).
- Xem lại thiệp chúc in theo yêu cầu, danh sách sản phẩm và hỗ trợ in hóa đơn.

### 3. Bảng Quản Trị Hệ Thống (`/admin`)
- Thống kê doanh thu thực tế, số lượng đơn hàng, số đơn chờ xác nhận.
- Quản lý danh sách đơn hàng: Lọc theo trạng thái, tìm kiếm theo tên/SĐT, thao tác 1-chạm cập nhật tiến trình đơn.
- Quản lý kho hàng sản phẩm: Bật/tắt mở kho, xem số lượng tồn kho.
- Quản lý các chiến dịch khuyến mãi (Vouchers).

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
c:\New folder\
├── server\                          # Mã nguồn Backend Node.js
│   ├── src\
│   │   ├── config\db.js             # Cơ sở dữ liệu atomic JSON database & DAL
│   │   ├── routes\api.js            # REST API endpoints (Products, Orders, Vouchers, Chat, Stats)
│   │   └── server.js                # Express app & static server
│   ├── data\
│   │   └── store.json               # Dữ liệu sản phẩm, đơn hàng và cấu hình
│   └── test\
│       └── test-api.js              # Kịch bản kiểm thử tự động toàn diện
├── public\                          # Mã nguồn Frontend Client
│   ├── index.html                   # Trang chủ mua sắm & Studio 3D/AR/VR
│   ├── track-order.html             # Trang tra cứu đơn hàng cho khách
│   └── admin.html                   # Bảng điều khiển quản trị viên
├── Dockerfile                       # Cấu hình đóng gói Container Production
├── docker-compose.yml               # Khởi chạy 1 lệnh với Docker
├── DEPLOYMENT_AND_DOMAIN_GUIDE.md   # Hướng dẫn chi tiết mua tên miền & deploy
├── package.json                     # Quản lý dependencies & scripts
└── README.md
```

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY CỤC BỘ (LOCALHOST)

### 1. Chạy với Node.js
```bash
# Khởi chạy máy chủ
npm start

# Hoặc khởi chạy chế độ phát triển (tự reload khi sửa code)
npm run dev
```

Sau khi chạy lệnh trên, truy cập trình duyệt tại:
- 🌿 **Trang chủ cửa hàng:** `http://localhost:3000`
- 📦 **Tra cứu đơn hàng:** `http://localhost:3000/track`
- ⚙️ **Quản trị viên (Admin):** `http://localhost:3000/admin`
- 📄 **REST API Sản phẩm:** `http://localhost:3000/api/products`

### 2. Chạy kiểm thử tự động (Tests)
```bash
npm test
```

### 3. Chạy với Docker
```bash
docker compose up -d --build
```

---

## 🌐 HƯỚNG DẪN MUA TÊN MIỀN & DEPLOY LÊN INTERNET

Vui lòng tham khảo tài liệu chi tiết tại file:
👉 **[DEPLOYMENT_AND_DOMAIN_GUIDE.md](./DEPLOYMENT_AND_DOMAIN_GUIDE.md)**
- Hướng dẫn chọn và mua tên miền (`.vn` hoặc `.com`).
- Hướng dẫn deploy miễn phí trong 5 phút với **Render.com** hoặc **Railway**.
- Hướng dẫn cài đặt VPS Ubuntu với **Docker + Nginx + SSL HTTPS miễn phí**.
- Hướng dẫn cấu hình DNS Cloudflare bảo vệ website.
