import type { MultiTrueFalseQuestion, TrueFalseQuestion } from "../types";

const tfBankBase = [
  { statement: "Ethyl acetate thuoc nhom ester.", correct: true, explanation: "Ethyl acetate la mot ester pho bien." },
  { statement: "Methyl formate co cong thuc C2H4O2.", correct: true, explanation: "Methyl formate co cong thuc phan tu C2H4O2." },
  { statement: "Ester thuong co mui thom de chiu.", correct: true, explanation: "Nhieu ester co mui thom, dung trong huong lieu." },
  { statement: "Phan ung thuy phan ester trong moi truong base la thuan nghich.", correct: false, explanation: "Xa phong hoa trong moi truong base la phan ung mot chieu." },
  { statement: "Triglyceride la triester cua glycerol voi fatty acid.", correct: true, explanation: "Day la cau tao co ban cua chat beo." },
  { statement: "Lipid chi gom triglyceride.", correct: false, explanation: "Lipid con gom wax, phospholipid, steroid..." },
  { statement: "Glucose co nhom aldehyde trong dang mach ho.", correct: true, explanation: "Glucose la aldohexose." },
  { statement: "Fructose la aldose.", correct: false, explanation: "Fructose la ketose." },
  { statement: "Sucrose la disaccharide khong co tinh khu.", correct: true, explanation: "Sucrose khong con nhom hemiacetal tu do." },
  { statement: "Maltose co tinh khu.", correct: true, explanation: "Maltose co nhom hemiacetal tu do." },
  { statement: "Cellulose tan tot trong nuoc lanh.", correct: false, explanation: "Cellulose khong tan trong nuoc." },
  { statement: "Starch gom amylose va amylopectin.", correct: true, explanation: "Day la hai thanh phan chinh cua starch." },
  { statement: "Amine la dan xuat cua ammonia khi thay H bang hydrocarbon group.", correct: true, explanation: "Dinh nghia co ban cua amine." },
  { statement: "Aniline la amine beo.", correct: false, explanation: "Aniline la aromatic amine." },
  { statement: "Glycine co the phan ung voi ca acid va base.", correct: true, explanation: "Glycine la hop chat luong tinh." },
  { statement: "Protein la polymer cua amino acid.", correct: true, explanation: "Protein duoc tao boi nhieu goc amino acid." },
  { statement: "Peptide bond co dang -CO-NH-.", correct: true, explanation: "Lien ket peptide duoc tao tu -COOH va -NH2." },
  { statement: "Polyethylene duoc tao tu monomer ethylene.", correct: true, explanation: "Phan ung polymer hoa ethylene tao polyethylene." },
  { statement: "Poly(vinyl chloride) duoc viet tat la PVC.", correct: true, explanation: "PVC la vat lieu polymer rat pho bien." },
  { statement: "Teflon la polyamide.", correct: false, explanation: "Teflon la polytetrafluoroethylene." },
  { statement: "Corrosion dien hoa cua iron can dong thoi anode va cathode.", correct: true, explanation: "Day la ban chat cua pin an mon." },
  { statement: "Trong pin galvanic, electron di chuyen tu cathode sang anode.", correct: false, explanation: "Electron di tu anode sang cathode." },
  { statement: "Trong dien phan dung dich sodium chloride co mang ngan, o cathode tao hydrogen.", correct: true, explanation: "Nuoc bi khu tao hydrogen tai cathode." },
  { statement: "Aluminum duoc dieu che cong nghiep bang dien phan molten aluminum oxide.", correct: true, explanation: "Dien phan nong chay la phuong phap chinh." },
  { statement: "Iron la kim loai co tinh khu manh hon potassium.", correct: false, explanation: "Potassium hoat dong manh hon nhieu." },
  { statement: "Copper khong day duoc silver khoi dung dich silver nitrate.", correct: false, explanation: "Copper day duoc silver vi hoat dong manh hon silver." },
  { statement: "Sodium bicarbonate co the dung lam bot no.", correct: true, explanation: "Sodium bicarbonate giai phong carbon dioxide khi gap nhiet/acid." },
  { statement: "Calcium carbonate phan ung voi hydrochloric acid tao carbon dioxide.", correct: true, explanation: "Phan ung tao muoi, nuoc va carbon dioxide." },
  { statement: "Ammonia la mot base yeu trong nuoc.", correct: true, explanation: "Ammonia nhan proton tao ammonium." },
  { statement: "Nitrogen trong ammonia co so oxi hoa +3.", correct: false, explanation: "Nitrogen trong ammonia co so oxi hoa -3." },
];

export const trueFalseQuestions: TrueFalseQuestion[] = Array.from({ length: 4 }).flatMap((_, round) =>
  tfBankBase.map((item, i) => ({
    id: `tf-${String(round * tfBankBase.length + i + 1).padStart(3, "0")}`,
    type: "true-false" as const,
    statement: `${item.statement} (Muc ${round + 1})`,
    correct: item.correct,
    explanation: item.explanation,
  })),
);

const mtfBase = [
  {
    a: ["Ethyl acetate thuoc nhom ester.", true],
    b: ["Phan ung xa phong hoa la phan ung thuan nghich.", false],
    c: ["Triglyceride la triester cua glycerol.", true],
    d: ["Lipid chi gom triglyceride.", false],
    explanation: "Xa phong hoa la mot chieu va lipid gom nhieu nhom chat.",
  },
  {
    a: ["Glucose la aldohexose.", true],
    b: ["Fructose la aldose.", false],
    c: ["Sucrose co tinh khu.", false],
    d: ["Maltose co tinh khu.", true],
    explanation: "Fructose la ketose, sucrose khong co tinh khu.",
  },
  {
    a: ["Aniline la aromatic amine.", true],
    b: ["Glycine la hop chat luong tinh.", true],
    c: ["Peptide bond co dang -CO-NH-.", true],
    d: ["Protein khong duoc tao tu amino acid.", false],
    explanation: "Protein la polymer cua amino acid va co peptide bond.",
  },
  {
    a: ["Polyethylene tao tu ethylene.", true],
    b: ["PVC la poly(vinyl chloride).", true],
    c: ["Teflon la polyamide.", false],
    d: ["Nylon-6,6 thuoc nhom polyamide.", true],
    explanation: "Teflon la polytetrafluoroethylene, khong phai polyamide.",
  },
  {
    a: ["Trong pin galvanic, electron di tu anode sang cathode.", true],
    b: ["Corrosion dien hoa cua iron lien quan pin vi mo.", true],
    c: ["Copper khong day duoc silver khoi silver nitrate.", false],
    d: ["Aluminum duoc dieu che bang dien phan molten aluminum oxide.", true],
    explanation: "Copper day duoc silver, cac y con lai dung theo ly thuyet lop 12.",
  },
];

export const multiTrueFalseQuestions: MultiTrueFalseQuestion[] = Array.from({ length: 5 }).flatMap((_, round) =>
  mtfBase.map((set, i) => ({
    id: `mtf-${String(round * mtfBase.length + i + 1).padStart(3, "0")}`,
    type: "multi-true-false" as const,
    question: "Cho cac nhan dinh sau:",
    statements: [
      { id: "a", label: "a." as const, text: `${set.a[0]} (Cap do ${round + 1})`, correct: Boolean(set.a[1]) },
      { id: "b", label: "b." as const, text: `${set.b[0]} (Cap do ${round + 1})`, correct: Boolean(set.b[1]) },
      { id: "c", label: "c." as const, text: `${set.c[0]} (Cap do ${round + 1})`, correct: Boolean(set.c[1]) },
      { id: "d", label: "d." as const, text: `${set.d[0]} (Cap do ${round + 1})`, correct: Boolean(set.d[1]) },
    ],
    explanation: set.explanation,
  })),
);
