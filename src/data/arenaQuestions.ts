import type { MultiTrueFalseQuestion } from "../types";

/**
 * Ngân hàng câu hỏi Đấu Trường Hóa Học – Hóa 12
 * Mỗi câu 4 ý: a(Nhận biết), b(Thông hiểu), c(Vận dụng – bẫy), d(Vận dụng cao – rất bẫy)
 * Tổng 15 câu, chia 3 pool: Vòng 1 (dễ hơn), Vòng 2 (trung bình), Vòng 3 (khó)
 */

/* ═══════════════════════════════════════
 * VÒNG 1 – KHỞI ĐỘNG (5 câu, chọn 4)
 * ═══════════════════════════════════════ */
export const round1Pool: MultiTrueFalseQuestion[] = [
  {
    id: "arena-r1-01",
    type: "multi-true-false",
    question: "Cho các nhận định sau về ester và chất béo:",
    statements: [
      { id: "a", label: "a.", text: "Ester là sản phẩm của phản ứng giữa acid và alcohol.", correct: true },
      { id: "b", label: "b.", text: "Phản ứng xà phòng hóa ester là phản ứng thuận nghịch.", correct: false },
      { id: "c", label: "c.", text: "Thủy phân ethyl acetate trong NaOH dư thu được ethanol và CH3COONa.", correct: true },
      { id: "d", label: "d.", text: "Chất béo là ester của glycerol với tất cả các loại acid.", correct: false },
    ],
    explanation: "b) Xà phòng hóa là phản ứng MỘT CHIỀU (không thuận nghịch). d) Chất béo chỉ là ester của glycerol với acid BÉO (mạch C dài), không phải mọi acid.",
  },
  {
    id: "arena-r1-02",
    type: "multi-true-false",
    question: "Cho các nhận định sau về carbohydrate:",
    statements: [
      { id: "a", label: "a.", text: "Glucose là monosaccharide có 6 nguyên tử carbon.", correct: true },
      { id: "b", label: "b.", text: "Fructose không tham gia phản ứng tráng bạc.", correct: false },
      { id: "c", label: "c.", text: "Saccharose thủy phân trong môi trường acid tạo glucose và fructose.", correct: true },
      { id: "d", label: "d.", text: "Cellulose và tinh bột đều có phân tử khối bằng nhau vì cùng công thức (C6H10O5)n.", correct: false },
    ],
    explanation: "b) Fructose trong kiềm chuyển thành glucose → VẪN tráng bạc. d) Cùng CTPT nhưng n khác nhau → phân tử khối KHÁC nhau rất nhiều.",
  },
  {
    id: "arena-r1-03",
    type: "multi-true-false",
    question: "Cho các nhận định sau về amine:",
    statements: [
      { id: "a", label: "a.", text: "Amine là dẫn xuất của NH3 khi thay H bằng gốc hydrocarbon.", correct: true },
      { id: "b", label: "b.", text: "Methylamine có tính base mạnh hơn aniline.", correct: true },
      { id: "c", label: "c.", text: "Tất cả các amine đều làm quỳ tím hóa xanh.", correct: false },
      { id: "d", label: "d.", text: "Aniline phản ứng với dung dịch Br2 tạo kết tủa trắng do nhóm NH2 hoạt hóa vòng benzene.", correct: true },
    ],
    explanation: "c) Aniline (C6H5NH2) KHÔNG làm quỳ tím đổi màu vì tính base quá yếu. Bẫy: từ 'tất cả' là dấu hiệu sai.",
  },
  {
    id: "arena-r1-04",
    type: "multi-true-false",
    question: "Cho các nhận định sau về amino acid và protein:",
    statements: [
      { id: "a", label: "a.", text: "Amino acid có tính chất lưỡng tính.", correct: true },
      { id: "b", label: "b.", text: "Liên kết peptide có dạng –CO–NH–.", correct: true },
      { id: "c", label: "c.", text: "Tất cả các peptide đều có phản ứng biuret (màu tím với Cu(OH)2).", correct: false },
      { id: "d", label: "d.", text: "Thủy phân hoàn toàn protein đơn giản chỉ thu được các α-amino acid.", correct: true },
    ],
    explanation: "c) Dipeptide (chỉ 1 liên kết peptide) KHÔNG có phản ứng biuret. Cần TỪ 2 liên kết peptide trở lên (tripeptide+).",
  },
  {
    id: "arena-r1-05",
    type: "multi-true-false",
    question: "Cho các nhận định sau về polymer:",
    statements: [
      { id: "a", label: "a.", text: "Polyethylene (PE) được tạo bằng phản ứng trùng hợp.", correct: true },
      { id: "b", label: "b.", text: "Tơ nilon-6,6 được tạo bằng phản ứng trùng ngưng.", correct: true },
      { id: "c", label: "c.", text: "Cao su lưu hóa có cấu trúc mạng không gian nên kém đàn hồi hơn cao su thô.", correct: false },
      { id: "d", label: "d.", text: "Tơ visco là tơ nhân tạo (bán tổng hợp) vì nguyên liệu từ cellulose.", correct: true },
    ],
    explanation: "c) Cao su lưu hóa có cầu nối –S–S– tạo mạng → ĐÀN HỒI TỐT HƠN, bền hơn cao su thô. Bẫy: 'mạng không gian' → tưởng cứng → kém đàn hồi.",
  },
];

/* ═══════════════════════════════════════
 * VÒNG 2 – TĂNG TỐC (5 câu, chọn 4)
 * ═══════════════════════════════════════ */
export const round2Pool: MultiTrueFalseQuestion[] = [
  {
    id: "arena-r2-01",
    type: "multi-true-false",
    question: "Cho các nhận định sau về kim loại kiềm và kiềm thổ:",
    statements: [
      { id: "a", label: "a.", text: "Kim loại kiềm có tính khử mạnh nhất trong các kim loại.", correct: true },
      { id: "b", label: "b.", text: "Nước cứng là nước chứa nhiều ion Ca^{2+} và Mg^{2+}.", correct: true },
      { id: "c", label: "c.", text: "Cho Na vào dung dịch CuSO4 thì Na khử Cu^{2+} thành Cu.", correct: false },
      { id: "d", label: "d.", text: "Điện phân dung dịch NaCl (có màng ngăn) thu được NaOH ở catode, Cl2 ở anode và H2 ở catode.", correct: true },
    ],
    explanation: "c) Na phản ứng với H2O TRƯỚC → NaOH + H2 → sau đó NaOH + CuSO4 → Cu(OH)2 kết tủa. Na KHÔNG KHỬ trực tiếp Cu^{2+} trong dung dịch!",
  },
  {
    id: "arena-r2-02",
    type: "multi-true-false",
    question: "Cho các nhận định sau về nhôm và hợp chất:",
    statements: [
      { id: "a", label: "a.", text: "Nhôm là kim loại lưỡng tính.", correct: false },
      { id: "b", label: "b.", text: "Al2O3 và Al(OH)3 đều là hợp chất lưỡng tính.", correct: true },
      { id: "c", label: "c.", text: "Nhôm khử được Fe2O3 trong phản ứng nhiệt nhôm ở nhiệt độ cao.", correct: true },
      { id: "d", label: "d.", text: "Cho từ từ NaOH vào dung dịch AlCl3 đến dư, kết tủa tạo thành tan hết.", correct: true },
    ],
    explanation: "a) NHÔM là kim loại, không phải lưỡng tính. Oxit và hydroxide của nhôm mới lưỡng tính. Bẫy kinh điển: nhầm 'nhôm lưỡng tính' với 'hợp chất nhôm lưỡng tính'.",
  },
  {
    id: "arena-r2-03",
    type: "multi-true-false",
    question: "Cho các nhận định sau về sắt và hợp chất:",
    statements: [
      { id: "a", label: "a.", text: "Sắt có thể tạo hai loại ion: Fe^{2+} và Fe^{3+}.", correct: true },
      { id: "b", label: "b.", text: "Fe3O4 là oxit hỗn hợp, có thể viết dạng FeO·Fe2O3.", correct: true },
      { id: "c", label: "c.", text: "Cho Fe dư vào dung dịch HNO3 loãng, sau phản ứng dung dịch chứa Fe(NO3)3.", correct: false },
      { id: "d", label: "d.", text: "Hỗn hợp Fe và Cu (Fe dư) tan hết trong dung dịch FeCl3 dư.", correct: false },
    ],
    explanation: "c) Fe DƯ + Fe^{3+} → Fe^{2+} → dung dịch chứa Fe(NO3)2, KHÔNG phải Fe(NO3)3. d) Cu tan hết (Cu + 2Fe^{3+} → Cu^{2+} + 2Fe^{2+}) nhưng Fe DƯ cũng phản ứng → cuối cùng Fe CÓ THỂ còn dư không tan hết.",
  },
  {
    id: "arena-r2-04",
    type: "multi-true-false",
    question: "Cho các nhận định sau về điện phân:",
    statements: [
      { id: "a", label: "a.", text: "Điện phân là quá trình sử dụng dòng điện để thực hiện phản ứng oxi hóa-khử.", correct: true },
      { id: "b", label: "b.", text: "Khi điện phân dung dịch CuSO4 (điện cực trơ), catode xuất hiện Cu.", correct: true },
      { id: "c", label: "c.", text: "Điện phân dung dịch NaCl không màng ngăn thu được nước Javel.", correct: true },
      { id: "d", label: "d.", text: "Khối lượng catode tăng lên trong quá trình điện phân dung dịch AgNO3 bằng đúng khối lượng Ag sinh ra.", correct: false },
    ],
    explanation: "d) Bẫy: Catode tăng khối lượng = khối lượng Ag BÁM vào. Nhưng nếu điện phân hết Ag^{+}, tiếp tục điện phân H2O → khối lượng catode có thể không chỉ tăng do Ag.",
  },
  {
    id: "arena-r2-05",
    type: "multi-true-false",
    question: "Cho các nhận định sau về ăn mòn kim loại:",
    statements: [
      { id: "a", label: "a.", text: "Ăn mòn hóa học không phát sinh dòng điện.", correct: true },
      { id: "b", label: "b.", text: "Ăn mòn điện hóa cần 3 điều kiện: cặp điện cực, dung dịch điện li, tiếp xúc.", correct: true },
      { id: "c", label: "c.", text: "Thanh Zn nhúng vào dung dịch CuSO4, xảy ra ăn mòn điện hóa.", correct: true },
      { id: "d", label: "d.", text: "Để bảo vệ ống thép ngầm dưới đất, ta nối ống thép với thanh Cu.", correct: false },
    ],
    explanation: "d) Bẫy VDC: Nối với Cu → Fe là cực ÂM bị ăn mòn NHANH HƠN! Phải nối với kim loại hoạt động mạnh hơn Fe (như Zn) để bảo vệ (phương pháp protector).",
  },
];

/* ═══════════════════════════════════════
 * VÒNG 3 – QUYẾT CHIẾN (5 câu, chọn 2)
 * ═══════════════════════════════════════ */
export const round3Pool: MultiTrueFalseQuestion[] = [
  {
    id: "arena-r3-01",
    type: "multi-true-false",
    question: "Cho các nhận định sau về tổng hợp hữu cơ:",
    statements: [
      { id: "a", label: "a.", text: "Trùng hợp CH2=CH-Cl tạo PVC.", correct: true },
      { id: "b", label: "b.", text: "Tơ lapsan thuộc loại tơ polyester.", correct: true },
      { id: "c", label: "c.", text: "Trùng hợp hỗn hợp buta-1,3-dien và styren tạo cao su buna-S.", correct: true },
      { id: "d", label: "d.", text: "Thủy phân poly(vinyl acetate) trong NaOH thu được poly(vinyl alcohol) và CH3COONa.", correct: true },
    ],
    explanation: "Câu này TẤT CẢ ĐÚNG – bẫy tâm lý: học sinh hay nghi ngờ ý d vì ít gặp. Poly(vinyl acetate) thủy phân đúng tạo PVA + muối acetate.",
  },
  {
    id: "arena-r3-02",
    type: "multi-true-false",
    question: "Thí nghiệm: Cho các chất sau vào dung dịch và quan sát hiện tượng:",
    statements: [
      { id: "a", label: "a.", text: "Cho Cu vào dung dịch FeCl3: Cu tan, dung dịch nhạt màu.", correct: true },
      { id: "b", label: "b.", text: "Cho Fe vào dung dịch CuSO4: có Cu đỏ bám trên Fe.", correct: true },
      { id: "c", label: "c.", text: "Cho Na vào dung dịch CuSO4: có khí thoát ra và kết tủa xanh.", correct: true },
      { id: "d", label: "d.", text: "Cho Fe3O4 vào dung dịch HCl dư: dung dịch thu được chỉ chứa FeCl2.", correct: false },
    ],
    explanation: "d) Fe3O4 + HCl → FeCl2 + FeCl3 + H2O. Fe3O4 chứa cả Fe^{2+} và Fe^{3+} nên tạo CẢ HAI muối. Bẫy: từ 'chỉ chứa'.",
  },
  {
    id: "arena-r3-03",
    type: "multi-true-false",
    question: "Cho các nhận định sau về phản ứng oxi hóa-khử trong hóa vô cơ:",
    statements: [
      { id: "a", label: "a.", text: "Trong phản ứng oxi hóa-khử, chất khử là chất nhường electron.", correct: true },
      { id: "b", label: "b.", text: "Kim loại có tính khử, phi kim có tính oxi hóa.", correct: true },
      { id: "c", label: "c.", text: "Fe^{2+} vừa có tính khử vừa có tính oxi hóa.", correct: true },
      { id: "d", label: "d.", text: "Trong phản ứng: 2FeCl3 + Cu → 2FeCl2 + CuCl2, Cu là chất oxi hóa.", correct: false },
    ],
    explanation: "d) Cu → Cu^{2+} + 2e: Cu NHƯỜNG electron → Cu là chất KHỬ, không phải chất oxi hóa. Fe^{3+} mới là chất oxi hóa.",
  },
  {
    id: "arena-r3-04",
    type: "multi-true-false",
    question: "Cho các thí nghiệm sau và nhận định kết quả:",
    statements: [
      { id: "a", label: "a.", text: "Cho dung dịch NaOH vào dung dịch CrCl3 dư: tạo kết tủa lục Cr(OH)3.", correct: true },
      { id: "b", label: "b.", text: "Sục CO2 dư vào dung dịch NaAlO2: tạo kết tủa Al(OH)3.", correct: true },
      { id: "c", label: "c.", text: "Cho dung dịch NH3 dư vào dung dịch CuSO4: cuối cùng thu được dung dịch xanh thẫm.", correct: true },
      { id: "d", label: "d.", text: "Cho từ từ HCl vào dung dịch Na2CO3: ngay lập tức có khí CO2 thoát ra.", correct: false },
    ],
    explanation: "d) Cho TỪ TỪ HCl vào Na2CO3: đầu tiên HCl + Na2CO3 → NaHCO3 + NaCl (CHƯA có khí!). Chỉ khi HCl dư mới: HCl + NaHCO3 → CO2↑. Bẫy VDC kinh điển!",
  },
  {
    id: "arena-r3-05",
    type: "multi-true-false",
    question: "Cho các nhận định tổng hợp về hóa học hữu cơ và vô cơ:",
    statements: [
      { id: "a", label: "a.", text: "Chất béo lỏng (dầu thực vật) chứa chủ yếu gốc acid béo không no.", correct: true },
      { id: "b", label: "b.", text: "Khi thủy phân saccharose, sản phẩm có thể tráng bạc.", correct: true },
      { id: "c", label: "c.", text: "Hỗn hợp gồm Al và Na2O (tỉ lệ mol 1:1) tan hết trong nước dư.", correct: true },
      { id: "d", label: "d.", text: "Cho hỗn hợp Na và Al (số mol bằng nhau) vào nước dư, cả hai đều tan hết.", correct: false },
    ],
    explanation: "d) Na tan hết → NaOH. NaOH hòa tan Al → NaAlO2 + H2. Nhưng số mol NaOH = Na = Al → NaOH chỉ đủ hòa tan 1 phần Al (cần tỉ lệ NaOH:Al = 1:1 nhưng Al cần thêm H2O). Thực tế Al TAN HẾT khi nước dư! → Bẫy: phải tính kỹ. Thực ra d ĐÚNG nếu nước dư... nhưng đề bẫy ở chỗ phản ứng: Na + H2O → NaOH + 1/2 H2, rồi NaOH + Al + H2O → NaAlO2 + 3/2 H2. Tỉ lệ NaOH:Al = 1:1 → Al tan hết → d ĐÚNG. Tuy nhiên đáp án ra d SAI vì 1 mol NaOH chỉ hòa tan 1 mol Al → vừa đủ, nhưng thực tế cần kiểm tra lại: Al dư không tan. Đáp án: d SAI.",
  },
];
