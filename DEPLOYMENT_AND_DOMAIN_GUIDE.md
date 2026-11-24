# 🌿 HƯỚNG DẪN MUA TÊN MIỀN & DEPLOY WEBSITE AN CANDLE STUDIO

Tài liệu này hướng dẫn chi tiết từng bước để đưa website **AN CANDLE STUDIO** từ mã nguồn trên máy tính lên Internet công khai với tên miền riêng (ví dụ: `ancandlestudio.vn` hoặc `ancandle.com`).

---

## MỤC LỤC
1. [Lựa Chọn & Đăng Ký Tên Miền (Domain Name)](#1-lựa-chọn--đăng-ký-tên-miền-domain-name)
2. [Lựa Chọn Nền Tảng Deploy (Máy Chủ / Hosting)](#2-lựa-chọn-nền-tảng-deploy-máy-chủ--hosting)
3. [Phương Án 1: Deploy Miễn Phí / Cực Dễ Với Render hoặc Railway (Khuyên Dùng)](#3-phương-án-1-deploy-miễn-phí--nhanh-gọn-với-render-khuyên-dùng)
4. [Phương Án 2: Deploy Trên VPS Riêng (Ubuntu Linux + Docker + Nginx + SSL)](#4-phương-án-2-deploy-trên-vps-riêng-ubuntu-linux--docker--ssl)
5. [Cấu Hình DNS & Kích Hoạt HTTPS (Ổ Khóa Xanh Miễn Phí Qua Cloudflare)](#5-cấu-hình-dns--kích-hoạt-https-ổ-khóa-xanh-qua-cloudflare)
6. [Quản Lý & Vận Hành Đơn Hàng Sau Khi Lên Sóng](#6-quản-lý--vận-hành-đơn-hàng-sau-khi-lên-sóng)

---

## 1. LỰA CHỌN & ĐĂNG KÝ TÊN MIỀN (DOMAIN NAME)

### 1.1. Gợi ý tên miền phù hợp với AN CANDLE STUDIO
| Tên Miền Gợi Ý | Đuôi | Ưu Điểm | Mức Giá Tham Khảo |
|----------------|------|---------|-------------------|
| `ancandlestudio.vn` | `.vn` | Tên miền quốc gia Việt Nam, tăng độ tin cậy và tuân thủ TMĐT Việt Nam | ~450.000đ – 650.000đ/năm đầu |
| `ancandlestudio.com` | `.com` | Đuôi quốc tế phổ biến nhất thế giới, dễ nhớ | ~250.000đ – 300.000đ/năm |
| `ancandle.vn` | `.vn` | Ngắn gọn, sang trọng | ~450.000đ – 650.000đ/năm |
| `annenthom.vn` | `.vn` | Tối ưu SEO từ khóa tìm kiếm "nến thơm" tại VN | ~450.000đ – 650.000đ/năm |
| `ancandle.studio` | `.studio` | Độc đáo, hợp với thương hiệu nghệ thuật thủ công | ~500.000đ/năm |

### 1.2. Mua tên miền ở đâu uy tín nhất?
- **Nếu mua đuôi `.com` hoặc `.net`:**
  - **Porkbun** ([porkbun.com](https://porkbun.com)): Giá rẻ nhất, bảo mật ẩn thông tin miễn phí trọn đời (khoảng $9.5/năm).
  - **Namecheap** ([namecheap.com](https://namecheap.com)): Rất phổ biến, hỗ trợ thanh toán thẻ Visa/Mastercard/Paypal.
  - **Cloudflare Registrar** ([cloudflare.com](https://cloudflare.com)): Bán đúng giá gốc của cơ quan quản lý (ICANN), không chênh lệch phí.
- **Nếu mua đuôi `.vn` (yêu cầu CMND/CCCD theo quy định VNNIC):**
  - **iNET** ([inet.vn](https://inet.vn))
  - **Mắt Bão** ([matbao.net](https://matbao.net))
  - **PA Việt Nam** ([pavietnam.vn](https://pavietnam.vn))

> 💡 **Mẹo:** Nên chuẩn bị sẵn thẻ Visa/Mastercard hoặc tài khoản ngân hàng nội địa quét mã VietQR để thanh toán khi mua tên miền.

---

## 2. LỰA CHỌN NỀN TẢNG DEPLOY (MÁY CHỦ / HOSTING)

| Nền Tảng | Chi Phí | Độ Phức Tạp | Đánh Giá |
|----------|---------|-------------|----------|
| **Render.com** | Miễn phí hoặc $7/tháng | Cực dễ (Chỉ cần kết nối GitHub) | ⭐⭐⭐⭐⭐ **Tốt nhất cho người mới bắt đầu** |
| **Railway.app** | $5/tháng (có dùng thử) | Cực dễ, tốc độ cao | ⭐⭐⭐⭐⭐ Rất mượt, tự động build |
| **VPS Việt Nam (Vietnix, CloudFly)** | ~60k – 120k VNĐ/tháng | Trung bình (cần dùng dòng lệnh Linux) | ⭐⭐⭐⭐ Tốc độ truy cập ở VN cực nhanh |
| **VPS Quốc Tế (Hetzner, DigitalOcean)** | ~$4 – $6/tháng | Trung bình (cần cài Docker) | ⭐⭐⭐⭐ Cực kỳ ổn định |

---

## 3. PHƯƠNG ÁN 1: DEPLOY MIỄN PHÍ & NHANH GỌN VỚI RENDER (KHUYÊN DÙNG)

Render là dịch vụ đám mây hiện đại hỗ trợ Node.js cực kỳ tốt và miễn phí.

### Bước 1: Đưa mã nguồn lên GitHub
1. Mở cửa sổ dòng lệnh tại thư mục dự án `c:\New folder`.
2. Khởi tạo Git và đẩy lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao Fullstack AN Candle Studio"
   git branch -M main
   git remote add origin https://github.com/TENTAIKHOAN/an-candle-studio.git
   git push -u origin main
   ```

### Bước 2: Tạo Web Service trên Render
1. Truy cập [https://render.com](https://render.com) và đăng ký/đăng nhập bằng tài khoản GitHub.
2. Bấm nút **"New +"** ở góc trên ➔ Chọn **"Web Service"**.
3. Chọn kho lưu trữ `an-candle-studio` vừa tạo.
4. Điền các thông số cơ bản:
   - **Name:** `an-candle-studio`
   - **Region:** `Singapore` (để khách hàng tại Việt Nam truy cập nhanh nhất).
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Chọn gói `Free` (hoặc Starter $7/tháng nếu muốn chạy 24/7 không sleep).
5. Bấm **"Create Web Service"**.
6. Render sẽ tự động cài đặt và cấp cho bạn một đường dẫn dạng: `https://an-candle-studio.onrender.com`.

### Bước 3: Gắn tên miền riêng của bạn vào Render
1. Trong trang quản lý dự án trên Render, bấm vào mục **"Settings"** ➔ cuộn xuống phần **"Custom Domains"**.
2. Nhập tên miền của bạn (ví dụ: `ancandlestudio.vn` và `www.ancandlestudio.vn`).
3. Render sẽ hiển thị bản ghi CNAME hoặc A Record cần trỏ. Bạn chỉ cần vào trang quản lý DNS của tên miền để điền theo là xong.

---

## 4. PHƯƠNG ÁN 2: DEPLOY TRÊN VPS RIÊNG (UBUNTU LINUX + DOCKER + SSL)

Nếu bạn đã có một máy chủ ảo VPS (Ubuntu 22.04 / 24.04), dự án đã được tích hợp sẵn file `Dockerfile` và `docker-compose.yml` để chạy trong 1 nốt nhạc:

### Bước 1: SSH vào VPS
```bash
ssh root@IP_CUA_BAN
```

### Bước 2: Clone dự án về VPS
```bash
git clone https://github.com/TENTAIKHOAN/an-candle-studio.git /var/www/an-candle-studio
cd /var/www/an-candle-studio
```

### Bước 3: Khởi chạy bằng Docker Compose
```bash
docker compose up -d --build
```
Hệ thống sẽ tự động tải Node image, cài dependencies và khởi chạy container tại cổng 3000. Dữ liệu đơn hàng trong `server/data/store.json` sẽ được ánh xạ ra ngoài ổ cứng VPS, không bao giờ bị mất khi restart.

### Bước 4: Cấu hình Nginx làm Reverse Proxy
Tạo file cấu hình Nginx `/etc/nginx/sites-available/ancandle`:
```nginx
server {
    server_name ancandlestudio.vn www.ancandlestudio.vn;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Kích hoạt cấu hình:
```bash
ln -s /etc/nginx/sites-available/ancandle /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Bước 5: Cấp chứng chỉ bảo mật HTTPS miễn phí trọn đời
```bash
apt update && apt install -y certbot python3-certbot-nginx
certbot --nginx -d ancandlestudio.vn -d www.ancandlestudio.vn
```
Certbot sẽ tự động cấu hình SSL và tự động gia hạn khi hết hạn.

---

## 5. CẤU HÌNH DNS & KÍCH HOẠT HTTPS (Ổ KHÓA XANH QUA CLOUDFLARE)

Để website có tốc độ tải nhanh nhất, chống tấn công DDoS và có chứng chỉ SSL HTTPS miễn phí, bạn nên dùng DNS của **Cloudflare** ([cloudflare.com](https://cloudflare.com)):

1. Đăng ký tài khoản Cloudflare miễn phí.
2. Bấm **"Add a Domain"** ➔ Điền tên miền của bạn (ví dụ: `ancandlestudio.vn`).
3. Chọn gói **Free**.
4. Cloudflare sẽ cấp cho bạn 2 địa chỉ Nameservers (ví dụ: `ns1.cloudflare.com` và `ns2.cloudflare.com`).
5. Vào nơi bạn mua tên miền (iNET, Porkbun, Mắt Bão...) ➔ Thay đổi Nameservers thành 2 địa chỉ của Cloudflare.
6. Thêm 2 bản ghi DNS trên Cloudflare:
   - **Bản ghi 1:** Type `A` | Name `@` | IPv4 `[Điền địa chỉ IP máy chủ của bạn]` | Proxy status: `Proxied (Đám mây màu cam)`
   - **Bản ghi 2:** Type `CNAME` | Name `www` | Target `@` | Proxy status: `Proxied`
7. Trong mục **SSL/TLS** trên Cloudflare, chọn chế độ **Full** hoặc **Flexible**. Ngay lập tức website sẽ có ổ khóa xanh HTTPS bảo mật chuẩn ngân hàng.

---

## 6. QUẢN LÝ & VẬN HÀNH ĐƠN HÀNG SAU KHI LÊN SÓNG

Sau khi website đã chạy trên tên miền chính thức của bạn (ví dụ: `https://ancandlestudio.vn`):

1. **Trang Chủ Bán Hàng:**
   `https://ancandlestudio.vn/`
   Khách hàng có thể trải nghiệm xem hũ nến 3D X-Ray, công nghệ AR đặt nến vào phòng khách/phòng ngủ, làm Quiz chọn mùi hương, chọn hũ nến, viết thiệp chúc và đặt hàng qua mã VietQR hoặc COD.

2. **Trang Tra Cứu Đơn Hàng:**
   `https://ancandlestudio.vn/track`
   Khách hàng nhập mã đơn (ví dụ: `AN-2611-982415`) hoặc Số điện thoại để xem tiến trình giao hàng, xem lại thiệp chúc và quét mã QR chuyển khoản nếu chưa thanh toán.

3. **Bảng Quản Trị Hệ Thống (Admin Portal):**
   `https://ancandlestudio.vn/admin`
   - Theo dõi doanh thu thực tế, số lượng đơn hàng theo thời gian thực.
   - 1-Click chuyển trạng thái đơn: **"Duyệt đơn" ➔ "Đang giao hàng" ➔ "Hoàn tất"**.
   - Bật/tắt trạng thái tồn kho của từng loại nến thơm trong 4 bộ sưu tập (CALM, FOCUS, COZY, MEMORY).
   - Quản lý các chương trình khuyến mãi (mã `ANCHAO20`, `ANFREESHIP`).
