import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer,
  ImageRun
} from 'docx';
import { ExamData, QuestionItem } from './types';

export async function generateDocxFromExam(
  exam: ExamData,
  croppedImagesMap?: Record<string, Buffer>
): Promise<Buffer> {
  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  // Header Table: Left: Department/School, Right: Exam code/Duration
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderNone,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: exam.title || "SỞ GIÁO DỤC VÀ ĐÀO TẠO",
                    bold: true,
                    size: 24, // 12pt
                    font: "Times New Roman"
                  }),
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: exam.subTitle || "KỲ THI CHỌN HỌC SINH GIỎI",
                    bold: true,
                    size: 22, // 11pt
                    font: "Times New Roman"
                  }),
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Thời gian làm bài: ${exam.duration || "90 phút"}`,
                    italics: true,
                    size: 22,
                    font: "Times New Roman"
                  }),
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "ĐỀ THI CHÍNH THỨC",
                    bold: true,
                    size: 24,
                    font: "Times New Roman"
                  }),
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "(Đề thi gồm có 05 trang)",
                    italics: true,
                    size: 20,
                    font: "Times New Roman"
                  }),
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `MÃ ĐỀ THI: ${exam.examCode || "2001"}`,
                    bold: true,
                    size: 24,
                    color: "1e40af",
                    font: "Times New Roman"
                  }),
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  const divider = new Paragraph({
    spacing: { before: 180, after: 240 },
    border: {
      bottom: { color: "94a3b8", size: 6, style: BorderStyle.SINGLE }
    }
  });

  const bodyElements: (Paragraph | Table)[] = [headerTable, divider];

  // Section title
  bodyElements.push(
    new Paragraph({
      spacing: { before: 120, after: 180 },
      children: [
        new TextRun({
          text: "PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (Thí sinh trả lời từ câu 1 đến câu 18)",
          bold: true,
          size: 24,
          font: "Times New Roman"
        })
      ]
    })
  );

  // Helper to build options paragraph safely
  const buildOptionsParagraph = (q: QuestionItem) => {
    if (!q.options || q.options.length === 0) return null;
    const runs: TextRun[] = [];
    q.options.forEach((opt, idx) => {
      const label = opt.label || String.fromCharCode(65 + idx);
      runs.push(new TextRun({ text: `${label}. `, bold: true, size: 24, font: "Times New Roman" }));
      runs.push(new TextRun({ text: `${opt.text || ''}        `, size: 24, font: "Times New Roman" }));
    });
    return new Paragraph({
      spacing: { before: 80, after: 140 },
      indent: { left: 360 },
      children: runs
    });
  };

  // Helper to build question content paragraph
  const buildQuestionParagraph = (q: QuestionItem) => {
    return new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({
          text: `Câu ${q.number || ''}: `,
          bold: true,
          size: 24,
          font: "Times New Roman"
        }),
        new TextRun({
          text: q.content || '',
          size: 24,
          font: "Times New Roman"
        })
      ]
    });
  };

  // Loop through questions
  for (const q of (exam.questions || [])) {
    const hasDiagram = q.diagramId && croppedImagesMap && croppedImagesMap[q.diagramId];

    if (hasDiagram) {
      // Golden trick for teachers: 2-column borderless table
      // Left: Question + options, Right: Cropped diagram image
      const imgBuffer = croppedImagesMap[q.diagramId!];
      const optP = buildOptionsParagraph(q);
      const leftCellChildren: Paragraph[] = [buildQuestionParagraph(q)];
      if (optP) leftCellChildren.push(optP);

      const qTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: borderNone,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 68, type: WidthType.PERCENTAGE },
                borders: borderNone,
                children: leftCellChildren
              }),
              new TableCell({
                width: { size: 32, type: WidthType.PERCENTAGE },
                borders: borderNone,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: imgBuffer,
                        transformation: { width: 170, height: 120 },
                        type: "png"
                      })
                    ]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "(Hình minh họa)",
                        italics: true,
                        size: 18,
                        color: "64748b",
                        font: "Times New Roman"
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      bodyElements.push(qTable);
    } else {
      bodyElements.push(buildQuestionParagraph(q));
      const optP = buildOptionsParagraph(q);
      if (optP) bodyElements.push(optP);
    }
  }

  // Footer notes
  bodyElements.push(
    new Paragraph({
      spacing: { before: 360, after: 120 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "------------------------ HẾT ------------------------",
          bold: true,
          size: 22,
          font: "Times New Roman"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Cán bộ coi thi không giải thích gì thêm. Thí sinh không được sử dụng tài liệu.",
          italics: true,
          size: 20,
          font: "Times New Roman"
        })
      ]
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~2.0 cm
              bottom: 1134,
              left: 1417, // ~2.5 cm
              right: 850   // ~1.5 cm
            }
          }
        },
        children: bodyElements
      }
    ]
  });

  return await Packer.toBuffer(doc);
}
