import { ExamData } from './types';

export async function parsePhysicsExamWithGemini(
  imagesBase64: string[],
  userApiKey?: string
): Promise<ExamData> {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Chưa có API Key của Google Gemini. Vui lòng thiết lập biến GEMINI_API_KEY hoặc nhập key trong phần cài đặt.");
  }

  const prompt = `
Bạn là chuyên gia số hóa đề thi môn Vật lý trung học phổ thông. Nhiệm vụ của bạn là đọc các ảnh đề thi được cung cấp và chuyển đổi thành cấu trúc JSON chuẩn xác 100%.

QUY TẮC BẮT BUỘC:
1. Trích xuất đầy đủ thông tin: Tiêu đề trường/sở (title), kỳ thi (subTitle), mã đề (examCode), thời gian làm bài (duration).
2. Từng câu hỏi (questions):
   - Đánh số chính xác (number: 1, 2, 3...)
   - Giữ nguyên vẹn mọi công thức vật lý, biểu thức toán học (dùng ký hiệu chuẩn như q₁ = 8·10⁻⁹ C, g = 9,8 m/s², T-t, p-V, ΔU = A + Q).
   - Trích xuất 4 phương án A, B, C, D kèm nội dung của từng phương án.
3. Nhận diện ĐỒ THỊ và HÌNH VẼ (diagrams):
   - Nếu trong câu hỏi có hình vẽ đồ thị nhiệt độ, đồ thị chu trình khí, sơ đồ mạch điện, nam châm, thí nghiệm pit-tông:
   - Trả về tọa độ bounding box 2D chuẩn hóa [ymin, xmin, ymax, xmax] theo thang điểm từ 0 đến 1000.
   - Ghi rõ pageIndex (chỉ số trang: 0, 1, 2...), questionIndex (câu hỏi tương ứng), và nhãn label mô tả ngắn gọn.
   - Gán diagramId vào trường diagramId của câu hỏi đó.

Trả về DUY NHẤT một khối JSON hợp lệ theo định dạng sau (không thêm markdown hay chữ giải thích):
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

  // Try gemini-3.8-flash as recommended by Google, with fallbacks
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  let lastError = '';
  let responseText = '';

  for (const model of candidateModels) {
    try {
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
        break; // Success!
      } else {
        const errText = await response.text();
        lastError = `Model ${model} (${response.status}): ${errText}`;
        console.warn(`Gemini model ${model} failed, trying next:`, lastError);
      }
    } catch (fetchErr: any) {
      lastError = fetchErr.message;
    }
  }

  if (!responseText) {
    throw new Error(`Lỗi kết nối máy chủ Gemini API: ${lastError}`);
  }

  try {
    let cleanJson = responseText.trim();
    // Strip markdown fences ```json ... ``` if present
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
    console.error("JSON parse error from Gemini output:", responseText);
    throw new Error("Không thể phân tích dữ liệu trả về từ Gemini: " + (err as Error).message);
  }
}
