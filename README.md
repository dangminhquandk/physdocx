# 🔬 PhysDocx - Trợ lý Chuyển đổi Đề thi Vật lý sang Microsoft Word

> **Dành tặng Cô giáo dạy Vật lý kính yêu**  
> Ứng dụng tự động chuyển đổi ảnh chụp và tệp PDF đề thi môn Vật lý thành tài liệu Word (`.docx`) chuẩn Equation (nhấp đúp sửa số thoải mái) và cố định đồ thị, sơ đồ mạch điện chống nhảy trang.

---

## 🌟 Điểm nổi bật (Thiết kế tối ưu cho Giáo viên)
1. **Trải nghiệm 1-Click (Zero Instruction):** Cô giáo chỉ cần kéo thả ảnh đề thi vào trang web và bấm **"Chuyển đổi sang Word"**.
2. **Không vỡ công thức:** Bóc tách chuẩn xác các phân số lồng nhau, tích phân, căn thức, ký hiệu Hy Lạp ($\Delta, \Omega, \lambda, \mu, \pi, \alpha, \beta, \omega$) dưới dạng chuẩn Microsoft Word Equation / OMML.
3. **Cố định đồ thị trong bảng ẩn viền:** Đồ thị chu trình khí $p-V$, nhiệt độ $T-t$, sơ đồ mạch điện được đặt trong ô bên phải của bảng 2 cột không viền — gõ thêm bao nhiêu chữ cũng không bao giờ bị nhảy trang.
4. **Chế độ Thử nghiệm nhanh (Demo Mode):** Tích hợp sẵn dữ liệu thật của *Đề thi chọn HSG môn Vật lý - Sở GD&ĐT Đà Nẵng 2025-2026 (Mã đề 2001)* để kiểm tra ngay lập tức.

---

## 🚀 Hướng dẫn Triển khai lên Vercel (1 phút)

### Cách 1: Đẩy lên GitHub rồi kết nối Vercel
1. Khởi tạo Git và đẩy mã nguồn lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: init PhysDocx web app"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan>/physdocx.git
   git push -u origin main
   ```
2. Truy cập [vercel.com](https://vercel.com) $\rightarrow$ Chọn **Add New Project** $\rightarrow$ Chọn repository `physdocx`.
3. Thêm biến môi trường trong phần **Environment Variables**:
   * `GEMINI_API_KEY`: Khóa API Google Gemini của bạn.
4. Bấm **Deploy**. Sau 30 giây, bạn sẽ nhận được đường link web (ví dụ: `https://physdocx.vercel.app`) gửi cho Cô giáo dùng vĩnh viễn!

### Cách 2: Deploy trực tiếp qua CLI
```bash
npx vercel
```

---

## 💻 Chạy thử nghiệm ở môi trường cục bộ (Local)

1. Cài đặt các thư viện:
   ```bash
   npm install
   ```
2. Cấu hình file `.env.local` (nếu có):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

*Phát triển bởi học trò Bách Khoa (IT1) dành tặng Cô giáo.*
