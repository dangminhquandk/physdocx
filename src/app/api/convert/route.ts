import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { parsePhysicsExamWithGemini } from '@/lib/gemini';
import { generateDocxFromExam } from '@/lib/docx-builder';
import { DEMO_EXAM_DATA } from '@/lib/demo-data';
import { ExamData } from '@/lib/types';

// Helper to create synthetic diagram images for demo testing
async function createDemoDiagramImage(text: string, color: string): Promise<Buffer> {
  const svg = `
    <svg width="400" height="260" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" rx="8"/>
      <line x1="40" y1="220" x2="360" y2="220" stroke="#334155" stroke-width="2"/>
      <line x1="40" y1="220" x2="40" y2="40" stroke="#334155" stroke-width="2"/>
      <polygon points="360,216 370,220 360,224" fill="#334155"/>
      <polygon points="36,40 40,30 44,40" fill="#334155"/>
      <!-- Grid lines -->
      <line x1="40" y1="160" x2="360" y2="160" stroke="#e2e8f0" stroke-dasharray="4,4"/>
      <line x1="40" y1="100" x2="360" y2="100" stroke="#e2e8f0" stroke-dasharray="4,4"/>
      <line x1="140" y1="220" x2="140" y2="40" stroke="#e2e8f0" stroke-dasharray="4,4"/>
      <line x1="240" y1="220" x2="240" y2="40" stroke="#e2e8f0" stroke-dasharray="4,4"/>
      <!-- Graph curve -->
      <path d="M 40,200 Q 140,80 240,110 T 350,60" fill="none" stroke="${color}" stroke-width="3"/>
      <!-- Text label -->
      <text x="200" y="245" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="middle">${text}</text>
    </svg>
  `;
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { images, useDemo, apiKey } = body;

    let examData: ExamData;
    const croppedImagesMap: Record<string, Buffer> = {};

    if (useDemo || !images || images.length === 0) {
      // 1-Click Instant Demo with real Da Nang HSG exam
      examData = DEMO_EXAM_DATA;

      // Generate clean illustration diagrams
      croppedImagesMap['diag_tt'] = await createDemoDiagramImage('Đồ thị Nhiệt độ - Thời gian (T - t)', '#dc2626');
      croppedImagesMap['diag_pv'] = await createDemoDiagramImage('Đồ thị chu trình khí (p - V)', '#2563eb');
      croppedImagesMap['diag_piston'] = await createDemoDiagramImage('Hệ Xilanh Pit-tông (He &amp; O₂)', '#059669');
      croppedImagesMap['diag_magnet'] = await createDemoDiagramImage('Từ trường Nam châm &amp; Dây AB', '#7c3aed');

      // Generate base64 images for frontend preview
      examData.diagrams.forEach(d => {
        if (croppedImagesMap[d.id]) {
          d.imageBase64 = `data:image/png;base64,${croppedImagesMap[d.id].toString('base64')}`;
        }
      });

      const docxBuffer = await generateDocxFromExam(examData, croppedImagesMap);

      return NextResponse.json({
        success: true,
        message: "Chuyển đổi thành công đề mẫu HSG Đà Nẵng!",
        data: examData,
        docxBase64: docxBuffer.toString('base64'),
        fileName: "De_HSG_Vat_Ly_Da_Nang_2025_2026_Ma_2001.docx"
      });
    }

    // Real conversion using Gemini Multimodal Vision API
    examData = await parsePhysicsExamWithGemini(images, apiKey);

    // Crop diagrams if coordinates exist
    if (examData.diagrams && examData.diagrams.length > 0) {
      for (const diag of examData.diagrams) {
        try {
          const pageImg = images[diag.pageIndex] || images[0];
          const rawBase64 = pageImg.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
          const imgBuf = Buffer.from(rawBase64, 'base64');
          
          const metadata = await sharp(imgBuf).metadata();
          const w = metadata.width || 1000;
          const h = metadata.height || 1000;

          const [ymin, xmin, ymax, xmax] = diag.box_2d;
          const left = Math.max(0, Math.round((xmin / 1000) * w));
          const top = Math.max(0, Math.round((ymin / 1000) * h));
          const cropW = Math.min(w - left, Math.round(((xmax - xmin) / 1000) * w));
          const cropH = Math.min(h - top, Math.round(((ymax - ymin) / 1000) * h));

          if (cropW > 10 && cropH > 10) {
            const croppedBuffer = await sharp(imgBuf)
              .extract({ left, top, width: cropW, height: cropH })
              .png()
              .toBuffer();

            croppedImagesMap[diag.id] = croppedBuffer;
            diag.imageBase64 = `data:image/png;base64,${croppedBuffer.toString('base64')}`;
          }
        } catch (cropErr) {
          console.warn(`Could not crop diagram ${diag.id}:`, cropErr);
        }
      }
    }

    // Build the .docx document
    const docxBuffer = await generateDocxFromExam(examData, croppedImagesMap);
    const cleanFileName = `De_Thi_Vat_Ly_Ma_${examData.examCode || 'Chuan'}.docx`;

    return NextResponse.json({
      success: true,
      message: "Chuyển đổi hoàn tất thành công!",
      data: examData,
      docxBase64: docxBuffer.toString('base64'),
      fileName: cleanFileName
    });

  } catch (error: any) {
    console.error("Error in convert API:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Đã xảy ra lỗi trong quá trình xử lý đề thi."
      },
      { status: 500 }
    );
  }
}
