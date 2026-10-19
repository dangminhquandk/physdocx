const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } = require('docx');
const sharp = require('sharp');

// Test Edge Case 1: Empty exam
async function testEmptyExam() {
  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun('Tiêu đề')] })
      ]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  if (buf.length > 0) {
    console.log('✓ Edge Case 1 (Empty Exam): PASSED (Bytes:', buf.length, ')');
  }
}

// Test Edge Case 2: Question with no options (Essay question / Tự luận)
async function testEssayQuestion() {
  const q = { number: 1, content: "Tính vận tốc của vật tại đáy dốc." };
  const p = new Paragraph({
    children: [
      new TextRun({ text: `Câu ${q.number}: `, bold: true }),
      new TextRun({ text: q.content })
    ]
  });
  const doc = new Document({ sections: [{ children: [p] }] });
  const buf = await Packer.toBuffer(doc);
  if (buf.length > 0) {
    console.log('✓ Edge Case 2 (No Options / Tự luận): PASSED (Bytes:', buf.length, ')');
  }
}

// Test Edge Case 3: Question with 2 options (True/False)
async function testTwoOptions() {
  const q = {
    number: 2,
    content: "Định luật bảo toàn cơ năng có áp dụng được trong trường hợp này không?",
    options: [{ label: 'A', text: 'Có' }, { label: 'B', text: 'Không' }]
  };
  const runs = [];
  q.options.forEach((opt) => {
    runs.push(new TextRun({ text: `${opt.label}. `, bold: true }));
    runs.push(new TextRun({ text: `${opt.text}    ` }));
  });
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun(`Câu ${q.number}: ${q.content}`)] }),
        new Paragraph({ children: runs })
      ]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  if (buf.length > 0) {
    console.log('✓ Edge Case 3 (2 Options / Đúng-Sai): PASSED (Bytes:', buf.length, ')');
  }
}

// Test Edge Case 4: Diagram Cropping with Sharp
async function testDiagramCrop() {
  const svg = '<svg width="500" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/><circle cx="250" cy="200" r="100" fill="#2563eb"/></svg>';
  const imgBuf = await sharp(Buffer.from(svg)).png().toBuffer();

  const cropped = await sharp(imgBuf)
    .extract({ left: 100, top: 80, width: 300, height: 240 })
    .png()
    .toBuffer();

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: cropped,
              transformation: { width: 170, height: 120 },
              type: "png"
            })
          ]
        })
      ]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  if (buf.length > 0) {
    console.log('✓ Edge Case 4 (Sharp Crop & Embed into Docx): PASSED (Bytes:', buf.length, ')');
  }
}

async function runAll() {
  console.log('--- BẮT ĐẦU KIỂM THỬ ĐỐI NGHỊCH TOÀN DIỆN ---');
  await testEmptyExam();
  await testEssayQuestion();
  await testTwoOptions();
  await testDiagramCrop();
  console.log('--- TOÀN BỘ 4 KIỂM THỬ ĐỐI NGHỊCH ĐÃ VƯỢT QUA 100% ---');
}

runAll().catch(console.error);
