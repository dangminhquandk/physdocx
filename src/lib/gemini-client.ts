import { ExamData } from './types';

export async function parsePhysicsExamDirect(
  imagesBase64: string[],
  apiKey: string,
  onProgress?: (message: string) => void
): Promise<ExamData> {
  if (!apiKey) {
    throw new Error("Chưa có khóa Google Gemini API Key. Cô hoặc bạn vui lòng nhập khóa trong mục Cấu hình ạ.");
  }

  onProgress?.("Đang kiểm tra mô hình AI khả dụng trên tài khoản của bạn...");

  // 1. Discover models available for this specific API key
  let candidateModels: string[] = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const available = (listData.models || [])
        .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => (m.name || '').replace(/^models\//, ''))
        .filter((name: string) => name.length > 0);

      const preferredPriority = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-2.5-pro'];
      available.sort((a: string, b: string) => {
        const idxA = preferredPriority.findIndex(p => a.includes(p));
        const idxB = preferredPriority.findIndex(p => b.includes(p));
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

      candidateModels = available;
    }
  } catch (listErr) {
    console.warn("Could not query ListModels, using static fallback:", listErr);
  }

  if (candidateModels.length === 0) {
    candidateModels = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-002',
      'gemini-1.5-pro',
      'gemini-2.5-flash',
      'gemini-pro'
    ];
  }

  onProgress?.("Đang gửi tài liệu sang Google AI để bóc tách công thức & đồ thị...");

  const prompt = `
Bạn là chuyên gia số hóa đề thi môn Vật lý trung học phổ thông. Nhiệm vụ của bạn là đọc toàn bộ ảnh/PDF đề thi được cung cấp và chuyển đổi thành cấu trúc JSON chuẩn xác 100%.

QUY TẮC BẮT BUỘC:
1. Trích xuất đầy đủ thông tin: Tiêu đề trường/sở (title), kỳ thi (subTitle), mã đề (examCode), thời gian làm bài (duration).
2. Từng câu hỏi (questions):
   - Đánh số chính xác (number: 1, 2, 3...)
   - Giữ nguyên vẹn mọi công thức vật lý, biểu thức toán học (dùng ký hiệu chuẩn như q₁ = 8·10⁻⁹ C, g = 9,8 m/s², T-t, p-V, ΔU = A + Q).
   - Trích xuất các phương án lựa chọn A, B, C, D kèm nội dung của từng phương án (nếu có).
3. Nhận diện ĐỒ THỊ và HÌNH VẼ (diagrams):
   - Nếu trong câu hỏi có hình vẽ đồ thị nhiệt độ, đồ thị chu trình khí, sơ đồ mạch điện, nam châm, thí nghiệm pit-tông:
   - Trả về tọa độ bounding box 2D chuẩn hóa [ymin, xmin, ymax, xmax] theo thang điểm từ 0 đến 1000.
   - Ghi rõ pageIndex (chỉ số trang: 0, 1, 2...), questionIndex (câu hỏi tương ứng), và nhãn label mô tả ngắn gọn.
   - Gán diagramId vào trường diagramId của câu hỏi đó.

Trả về DUY NHẤT một khối JSON hợp lệ theo định dạng sau:
{
  "title": "SỞ GIÁO DỤC VÀ ĐÀO TẠO...",
  "subTitle": "KỲ THI CHỌN HỌC SINH GIỎI...",
  "examCode": "2001",
  "duration": "90 phút",
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "content": "Nội dung câu hỏi...",
      "options": [
        { "label": "A", "text": "Phương án A" },
        { "label": "B", "text": "Phương án B" },
        { "label": "C", "text": "Phương án C" },
        { "label": "D", "text": "Phương án D" }
      ],
      "diagramId": "diag_1"
    }
  ],
  "diagrams": [
    {
      "id": "diag_1",
      "label": "Đồ thị T-t",
      "box_2d": [100, 600, 300, 950],
      "pageIndex": 0,
      "questionIndex": 1
    }
  ]
}
`;

  const parts: any[] = [{ text: prompt }];

  for (const imgBase64 of imagesBase64) {
    const match = imgBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,/);
    const mimeType = match ? match[1] : (imgBase64.startsWith('JVBER') ? 'application/pdf' : 'image/jpeg');
    const cleanBase64 = imgBase64.replace(/^data:[^;]+;base64,/, '');

    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: cleanBase64
      }
    });
  }

  let lastError = '';
  let responseText = '';

  for (const model of candidateModels) {
    try {
      onProgress?.(`Đang phân tích bằng mô hình ${model}...`);
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            response_mime_type: 'application/json'
          }
        })
      });

      if (response.ok) {
        const resultJson = await response.json();
        const candidate = resultJson.candidates?.[0];
        responseText = candidate?.content?.parts?.[0]?.text || "{}";
        break;
      } else {
        const errText = await response.text();
        if (errText.includes("API_KEY_INVALID") || errText.includes("API key not valid")) {
          throw new Error("Khóa Google Gemini API Key không hợp lệ. Cô hoặc bạn vui lòng bấm 'Cấu hình' để kiểm tra lại khóa ạ.");
        }
        lastError = `Model ${model} (${response.status}): ${errText}`;
        console.warn(`Model ${model} failed, trying next candidate:`, lastError);
      }
    } catch (fetchErr: any) {
      if (fetchErr.message?.includes("Khóa Google Gemini API Key không hợp lệ")) {
        throw fetchErr;
      }
      lastError = fetchErr.message;
    }
  }

  if (!responseText) {
    throw new Error(`Không thể kết nối đến máy chủ Google Gemini: ${lastError}`);
  }

  try {
    let cleanJson = responseText.trim();
    cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }

    const parsedData = JSON.parse(cleanJson) as ExamData;
    parsedData.questions = parsedData.questions || [];
    parsedData.diagrams = parsedData.diagrams || [];
    return parsedData;
  } catch (err) {
    console.error("JSON parse error:", responseText);
    throw new Error("Lỗi đọc cấu trúc đề thi từ AI: " + (err as Error).message);
  }
}
