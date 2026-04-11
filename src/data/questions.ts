import type { MultiTrueFalseQuestion, TrueFalseQuestion } from "../types";

const tfBankBase = [
  { statement: "Ethyl acetate thuộc nhóm ester.", correct: true, explanation: "Ethyl acetate là một ester phổ biến." },
  { statement: "Methyl formate có công thức C2H4O2.", correct: true, explanation: "Methyl formate có công thức phân tử C2H4O2." },
  { statement: "Ester thường có mùi thơm dễ chịu.", correct: true, explanation: "Nhiều ester có mùi thơm, dùng trong hương liệu." },
  { statement: "Phản ứng thủy phân ester trong môi trường base là thuận nghịch.", correct: false, explanation: "Xà phòng hóa trong môi trường base là phản ứng một chiều." },
  { statement: "Triglyceride là triester của glycerol với acid béo.", correct: true, explanation: "Đây là cấu tạo cơ bản của chất béo." },
  { statement: "Lipid chỉ gồm triglyceride.", correct: false, explanation: "Lipid còn gồm wax, phospholipid, steroid..." },
  { statement: "Glucose có nhóm aldehyde trong dạng mạch hở.", correct: true, explanation: "Glucose là aldohexose." },
  { statement: "Fructose là aldose.", correct: false, explanation: "Fructose là ketose." },
  { statement: "Saccharose là disaccharide không có tính khử.", correct: true, explanation: "Saccharose không còn nhóm hemiacetal tự do." },
  { statement: "Maltose có tính khử.", correct: true, explanation: "Maltose có nhóm hemiacetal tự do." },
  { statement: "Cellulose tan tốt trong nước lạnh.", correct: false, explanation: "Cellulose không tan trong nước." },
  { statement: "Tinh bột gồm amylose và amylopectin.", correct: true, explanation: "Đây là hai thành phần chính của tinh bột." },
  { statement: "Amine là dẫn xuất của NH3 khi thay H bằng gốc hydrocarbon.", correct: true, explanation: "Định nghĩa cơ bản của amine." },
  { statement: "Aniline là amine béo.", correct: false, explanation: "Aniline là amine thơm (aromatic amine)." },
  { statement: "Glycine có thể phản ứng với cả acid và base.", correct: true, explanation: "Glycine là hợp chất lưỡng tính." },
  { statement: "Protein là polymer của amino acid.", correct: true, explanation: "Protein được tạo bởi nhiều gốc amino acid." },
  { statement: "Liên kết peptide có dạng –CO–NH–.", correct: true, explanation: "Liên kết peptide được tạo từ –COOH và –NH2." },
  { statement: "Polyethylene được tạo từ monomer ethylene.", correct: true, explanation: "Phản ứng trùng hợp ethylene tạo polyethylene." },
  { statement: "PVC (poly vinyl chloride) là vật liệu polymer rất phổ biến.", correct: true, explanation: "PVC được dùng rộng rãi trong đời sống." },
  { statement: "Teflon là polyamide.", correct: false, explanation: "Teflon là polytetrafluoroethylene (PTFE)." },
  { statement: "Ăn mòn điện hóa của sắt cần đồng thời anode và cathode.", correct: true, explanation: "Đây là bản chất của pin ăn mòn." },
  { statement: "Trong pin galvanic, electron di chuyển từ cathode sang anode.", correct: false, explanation: "Electron đi từ anode sang cathode." },
  { statement: "Trong điện phân dung dịch NaCl có màng ngăn, ở cathode tạo H2.", correct: true, explanation: "Nước bị khử tạo H2 tại cathode." },
  { statement: "Nhôm được điều chế công nghiệp bằng điện phân nóng chảy Al2O3.", correct: true, explanation: "Điện phân nóng chảy là phương pháp chính." },
  { statement: "Sắt là kim loại có tính khử mạnh hơn kali.", correct: false, explanation: "Kali hoạt động mạnh hơn sắt rất nhiều." },
  { statement: "Đồng không đẩy được bạc ra khỏi dung dịch AgNO3.", correct: false, explanation: "Đồng đẩy được bạc vì hoạt động mạnh hơn bạc." },
  { statement: "NaHCO3 có thể dùng làm bột nở.", correct: true, explanation: "NaHCO3 giải phóng CO2 khi gặp nhiệt hoặc acid." },
  { statement: "CaCO3 phản ứng với HCl tạo CO2.", correct: true, explanation: "Phản ứng tạo muối, nước và CO2." },
  { statement: "NH3 là một base yếu trong nước.", correct: true, explanation: "NH3 nhận proton tạo NH4^{+}." },
  { statement: "Nitrogen trong NH3 có số oxi hóa +3.", correct: false, explanation: "Nitrogen trong NH3 có số oxi hóa –3." },
];

export const trueFalseQuestions: TrueFalseQuestion[] = Array.from({ length: 4 }).flatMap((_, round) =>
  tfBankBase.map((item, i) => ({
    id: `tf-${String(round * tfBankBase.length + i + 1).padStart(3, "0")}`,
    type: "true-false" as const,
    statement: item.statement,
    correct: item.correct,
    explanation: item.explanation,
  })),
);

const mtfBase = [
  {
    question: "Cho các nhận định sau về ester và chất béo:",
    a: ["Ethyl acetate thuộc nhóm ester.", true],
    b: ["Phản ứng xà phòng hóa là phản ứng thuận nghịch.", false],
    c: ["Triglyceride là triester của glycerol.", true],
    d: ["Lipid chỉ gồm triglyceride.", false],
    explanation: "Xà phòng hóa là phản ứng một chiều. Lipid gồm nhiều nhóm chất khác nhau.",
  },
  {
    question: "Cho các nhận định sau về carbohydrate:",
    a: ["Glucose là aldohexose.", true],
    b: ["Fructose là aldose.", false],
    c: ["Saccharose có tính khử.", false],
    d: ["Maltose có tính khử.", true],
    explanation: "Fructose là ketose. Saccharose không có tính khử.",
  },
  {
    question: "Cho các nhận định sau về amine và amino acid:",
    a: ["Aniline là amine thơm.", true],
    b: ["Glycine là hợp chất lưỡng tính.", true],
    c: ["Liên kết peptide có dạng –CO–NH–.", true],
    d: ["Protein không được tạo từ amino acid.", false],
    explanation: "Protein là polymer của amino acid và có liên kết peptide.",
  },
  {
    question: "Cho các nhận định sau về polymer:",
    a: ["Polyethylene được tạo từ ethylene.", true],
    b: ["PVC là poly(vinyl chloride).", true],
    c: ["Teflon là polyamide.", false],
    d: ["Nilon-6,6 thuộc nhóm polyamide.", true],
    explanation: "Teflon là polytetrafluoroethylene, không phải polyamide.",
  },
  {
    question: "Cho các nhận định sau về điện hóa:",
    a: ["Trong pin galvanic, electron đi từ anode sang cathode.", true],
    b: ["Ăn mòn điện hóa của sắt liên quan đến pin vi mô.", true],
    c: ["Đồng không đẩy được bạc ra khỏi dung dịch AgNO3.", false],
    d: ["Nhôm được điều chế bằng điện phân nóng chảy Al2O3.", true],
    explanation: "Đồng đẩy được bạc, các ý còn lại đúng theo lý thuyết lớp 12.",
  },
];

export const multiTrueFalseQuestions: MultiTrueFalseQuestion[] = Array.from({ length: 5 }).flatMap((_, round) =>
  mtfBase.map((set, i) => ({
    id: `mtf-${String(round * mtfBase.length + i + 1).padStart(3, "0")}`,
    type: "multi-true-false" as const,
    question: set.question,
    statements: [
      { id: "a", label: "a." as const, text: String(set.a[0]), correct: Boolean(set.a[1]) },
      { id: "b", label: "b." as const, text: String(set.b[0]), correct: Boolean(set.b[1]) },
      { id: "c", label: "c." as const, text: String(set.c[0]), correct: Boolean(set.c[1]) },
      { id: "d", label: "d." as const, text: String(set.d[0]), correct: Boolean(set.d[1]) },
    ],
    explanation: set.explanation,
  })),
);
