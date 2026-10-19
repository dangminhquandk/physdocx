import { ExamData } from './types';

export const DEMO_EXAM_DATA: ExamData = {
  title: "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ ĐÀ NẴNG",
  subTitle: "KỲ THI CHỌN HỌC SINH GIỎI THPT NĂM HỌC 2025 - 2026\nMôn thi: VẬT LÍ (Thời gian làm bài: 90 phút)",
  examCode: "2001",
  duration: "90 phút",
  questions: [
    {
      id: "q1",
      number: 1,
      content: "Một lượng khí lý tưởng xác định thực hiện quá trình biến đổi trạng thái trong đó nhiệt độ tuyệt đối T tỉ lệ thuận với áp suất p. Quá trình này là quá trình:",
      options: [
        { label: "A", text: "đẳng nhiệt." },
        { label: "B", text: "đẳng tích." },
        { label: "C", text: "đẳng áp." },
        { label: "D", text: "chuyển thể." }
      ]
    },
    {
      id: "q2",
      number: 2,
      content: "Hai điện tích điểm q₁ = +8·10⁻⁹ C và q₂ = -8·10⁻⁹ C đặt tại hai điểm A và B cách nhau d = 6 cm trong chân không. Cường độ điện trường tổng hợp tại trung điểm M của đoạn thẳng AB có độ lớn bằng:",
      options: [
        { label: "A", text: "0 V/m." },
        { label: "B", text: "8·10⁴ V/m." },
        { label: "C", text: "1,6·10⁵ V/m." },
        { label: "D", text: "3,2·10⁵ V/m." }
      ]
    },
    {
      id: "q3",
      number: 3,
      content: "Một đoạn dây dẫn thẳng AB dài l = 20 cm có dòng điện I = 5 A chạy qua, đặt trong từ trường đều có cảm ứng từ B = 0,08 T sao cho đoạn dây vuông góc với các đường sức từ như hình vẽ bên. Lực từ tác dụng lên đoạn dây có độ lớn bằng:",
      options: [
        { label: "A", text: "0,08 N." },
        { label: "B", text: "0,04 N." },
        { label: "C", text: "0,16 N." },
        { label: "D", text: "0 N." }
      ],
      diagramId: "diag_magnet"
    },
    {
      id: "q4",
      number: 4,
      content: "Đồ thị biểu diễn sự phụ thuộc của nhiệt độ T theo thời gian t của một chất rắn khi được cấp nhiệt lượng ổn định được cho như hình bên. Quá trình chuyển thể nóng chảy của chất diễn ra trong khoảng thời gian nào?",
      options: [
        { label: "A", text: "Từ t = 0 đến t₁." },
        { label: "B", text: "Từ t₁ đến t₂." },
        { label: "C", text: "Từ t₂ đến t₃." },
        { label: "D", text: "Sau thời điểm t₃." }
      ],
      diagramId: "diag_tt"
    },
    {
      id: "q5",
      number: 5,
      content: "Một mol khí lý tưởng đơn nguyên tử thực hiện chu trình biến đổi 1 → 2 → 3 → 1 được biểu diễn trên đồ thị (p, V) như hình vẽ. Nhiệt lượng mà khối khí nhận được trong quá trình giãn đẳng áp 1 → 2 bằng:",
      options: [
        { label: "A", text: "Q = 2,5 p₀V₀." },
        { label: "B", text: "Q = 3,5 p₀V₀." },
        { label: "C", text: "Q = 5 p₀V₀." },
        { label: "D", text: "Q = 1,5 p₀V₀." }
      ],
      diagramId: "diag_pv"
    },
    {
      id: "q6",
      number: 6,
      content: "Theo định luật I nhiệt động lực học, độ biến thiên nội năng của một hệ kín thỏa mãn hệ thức ΔU = A + Q. Trong quá trình nén đẳng nhiệt một khối khí lý tưởng:",
      options: [
        { label: "A", text: "ΔU = 0 và A = -Q (A > 0)." },
        { label: "B", text: "ΔU > 0 và Q = 0." },
        { label: "C", text: "A = 0 và ΔU = Q." },
        { label: "D", text: "ΔU = 0 và A = Q (A < 0)." }
      ]
    },
    {
      id: "q7",
      number: 7,
      content: "Một xilanh hình trụ đặt thẳng đứng được chia làm hai ngăn nhờ một pit-tông cách nhiệt có khối lượng m = 2 kg. Ngăn trên chứa khí Heli (He), ngăn dưới chứa khí Oxy (O₂). Khi hệ cân bằng nhiệt tại nhiệt độ T = 300 K, pit-tông đứng yên ở vị trí cân bằng. Cho g = 9,8 m/s². Lực tác dụng lên mặt trên pit-tông bằng:",
      options: [
        { label: "A", text: "F = 19,6 N." },
        { label: "B", text: "F = p₁·S + 19,6 N." },
        { label: "C", text: "F = p₁·S." },
        { label: "D", text: "F = (p₂ - p₁)·S." }
      ],
      diagramId: "diag_piston"
    },
    {
      id: "q8",
      number: 8,
      content: "Khung dây dẫn phẳng có diện tích S = 50 cm² gồm N = 100 vòng dây quay đều với tốc độ góc ω = 100π rad/s trong từ trường đều có vectơ cảm ứng từ B vuông góc với trục quay, B = 0,2 T. Suất điện động cực đại xuất hiện trong khung là:",
      options: [
        { label: "A", text: "E₀ = 10π V." },
        { label: "B", text: "E₀ = 31,4 V." },
        { label: "C", text: "E₀ = 10 V." },
        { label: "D", text: "E₀ = 3,14 V." }
      ]
    }
  ],
  diagrams: [
    {
      id: "diag_tt",
      label: "Đồ thị Nhiệt độ - Thời gian (T - t)",
      box_2d: [60, 580, 210, 940],
      pageIndex: 0
    },
    {
      id: "diag_pv",
      label: "Đồ thị chu trình khí (p - V)",
      box_2d: [370, 660, 530, 920],
      pageIndex: 0
    },
    {
      id: "diag_piston",
      label: "Hệ Pit-tông chứa khí He và O₂",
      box_2d: [690, 330, 800, 630],
      pageIndex: 0
    },
    {
      id: "diag_magnet",
      label: "Sơ đồ nam châm N-S và đoạn dây dẫn AB",
      box_2d: [420, 750, 580, 930],
      pageIndex: 1
    }
  ]
};
