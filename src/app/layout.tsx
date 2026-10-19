import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhysDocx - Trợ lý Chuyển đổi Đề thi Vật lý sang Word (.docx)",
  description: "Phần mềm thông minh biến ảnh chụp và file PDF đề thi môn Vật lý thành văn bản Microsoft Word (.docx) chuẩn Equation và cố định đồ thị chống nhảy trang.",
  authors: [{ name: "IT1 Bách Khoa" }],
  keywords: ["Vật lý", "Chuyển PDF sang Word", "Equation", "MathType", "Đề thi HSG", "PhysDocx"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
