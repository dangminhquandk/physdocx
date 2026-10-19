export interface DiagramBox {
  id: string;
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  pageIndex: number;
  questionIndex?: number;
  imageBase64?: string;
}

export interface QuestionItem {
  id: string;
  number: number;
  content: string;
  options: {
    label: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  diagramId?: string;
}

export interface ExamData {
  title: string;
  subTitle?: string;
  examCode?: string;
  duration?: string;
  questions: QuestionItem[];
  diagrams: DiagramBox[];
}

export interface ConversionResponse {
  success: boolean;
  message: string;
  data?: ExamData;
  docxBase64?: string;
  fileName?: string;
}
