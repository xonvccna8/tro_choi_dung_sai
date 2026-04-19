import fs from "fs";
import path from "path";

// DATA CHO 20 BÀI HỌC (SÁT LUYỆN THI THPT CHUẨN IUPAC)
const CHEM_CONTENT = {
  "Bài 1. Ester – Lipid": {
    sentences: [
      { t: "Phản ứng ester hóa giữa carboxylic acid và alcohol là phản ứng thuận nghịch.", c: true, e: "Đúng. Phản ứng ester hóa cần H2SO4 đặc xúc tác và đun nóng, luôn là thuận nghịch." },
      { t: "Ester có nhiệt độ sôi cao hơn carboxylic acid có cùng số nguyên tử carbon.", c: false, e: "Sai. Ester không có liên kết hydrogen liên phân tử nên nhiệt độ sôi thấp hơn acid." },
      { t: "Tristearin là triester của glycerol và stearic acid.", c: true, e: "Đúng. Cấu trúc là (C17H35COO)3C3H5." },
      { t: "Ethyl acetate có công thức hóa học là CH3COOCH3.", c: false, e: "Sai. Ethyl acetate là CH3COOC2H5, còn CH3COOCH3 là methyl acetate." }
    ],
    multi: [
      {
        q: "Cho các nhận định sau về ester và lipid:",
        s: [
          { t: "Chất béo là triester của glycerol với các fatty acid.", c: true },
          { t: "Dầu ăn và mỡ bôi trơn máy móc đều có thành phần nguyên tố giống nhau.", c: false },
          { t: "Vinyl acetate được điều chế trực tiếp từ acetic acid và acetylene.", c: true },
          { t: "Benzyl formate có mùi thơm của hoa nhài.", c: false }
        ],
        e: "Mỡ bôi trơn là hydrocarbon (C, H), dầu ăn là ester (C, H, O). Benzyl acetate mới có mùi hoa nhài."
      },
      {
        q: "Thực hiện thí nghiệm xà phòng hóa tristearin:",
        s: [
          { t: "Cần đun nóng hỗn hợp tristearin với dung dịch NaOH.", c: true },
          { t: "Sản phẩm thu được gồm sodium stearate và ethanol.", c: false },
          { t: "Phản ứng xà phòng hóa chất béo xảy ra hoàn toàn (một chiều).", c: true },
          { t: "Có thể thay thế NaOH bằng KOH để thu được xà phòng mềm.", c: true }
        ],
        e: "Sản phẩm là sodium stearate và glycerol (không phải ethanol)."
      },
      {
         q: "Khi nói về tính chất vật lý của ester:",
         s: [
           { t: "Các ester thường nhẹ hơn nước.", c: true },
           { t: "Đa số ester rất dễ tan trong nước.", c: false },
           { t: "Isoamyl acetate có mùi chuối chín.", c: true },
           { t: "Ester tạo được liên kết hydrogen với nước yếu hơn nhiều so với alcohol.", c: true }
         ],
         e: "Ester hầu như không tan trong nước do không có liên kết hydrogen với nước đủ mạnh."
      },
      {
         q: "Xét phản ứng đốt cháy ester:",
         s: [
           { t: "Đốt cháy ester no, đơn chức, mạch hở luôn thu được số mol CO2 bằng số mol H2O.", c: true },
           { t: "Ester chưa no khi đốt cháy cho số mol H2O lớn hơn CO2.", c: false },
           { t: "Dựa vào tỉ lệ số mol CO2 và H2O có thể dự đoán độ bất bão hòa của ester.", c: true },
           { t: "Oxi (Oxygen) là chất oxy hóa duy nhất trong phản ứng đốt.", c: true }
         ],
         e: "Ester chưa no đốt cháy sinh ra nCO2 > nH2O."
      }
    ]
  },
  "Bài 2. Xà phòng và chất giặt rửa": {
    sentences: [
      { t: "Xà phòng là hỗn hợp muối sodium hoặc potassium của các carboxylic acid.", c: false, e: "Sai. Đặc trưng phải là muối của các fatty acid (acid béo tự nhiên)." },
      { t: "Phân tử chất giặt rửa tổng hợp gồm phần phân cực (ưa nước) và phần không phân cực (kị nước).", c: true, e: "Đúng. Đây là cấu trúc lưỡng tính đặc trưng của chất hoạt động bề mặt." },
      { t: "Xà phòng bị mất tác dụng giặt rửa khi hòa vào nước cứng.", c: true, e: "Đúng. Nước cứng chứa Ca2+ và Mg2+ tạo kết tủa với muối acid béo." },
      { t: "Chất giặt rửa tổng hợp có nguồn gốc từ dầu mỏ thay vì mỡ động vật.", c: true, e: "Đúng. Rất nhiều chất giặt rửa tổng hợp đi từ quá trình lọc hóa dầu." }
    ],
    multi: [
      {
        q: "So sánh xà phòng và chất giặt rửa tổng hợp:",
        s: [
          { t: "Cả hai đều có khả năng làm giảm sức căng bề mặt của nước.", c: true },
          { t: "Chất giặt rửa tổng hợp bị tủa trong nước cứng giống xà phòng.", c: false },
          { t: "Gốc hydrocarbon kị nước trong xà phòng thường kéo dài từ 11 đến 17 nguyên tử carbon.", c: true },
          { t: "Các chất giặt rửa tổng hợp hiện nay thường chứa phụ gia tẩy trắng sinh học.", c: true }
        ],
        e: "Chất giặt rửa tổng hợp KHÔNG bị tủa trong nước cứng."
      },
      {
        q: "Nguyên lý hoạt động của chất giặt rửa:",
        s: [
          { t: "Đầu ưa nước sẽ quay vào vết bẩn dầu mỡ.", c: false },
          { t: "Đầu kị nước cắm vào vết dầu bẩn.", c: true },
          { t: "Sự phân tán hạt micelle giúp dầu mỡ không bám lại vào vải.", c: true },
          { t: "Cần tác động cơ học (vò, khuấy) để đẩy chất bẩn ra dễ hơn.", c: true }
        ],
        e: "Đầu ưa nước hút với nước, đầu kị nước (gốc hydrocarbon) mới liên kết với vết dầu mỡ."
      },
      {
         q: "Chỉ số hóa học liên quan đến phản ứng xà phòng hóa:",
         s: [
           { t: "Chỉ số xà phòng hóa là số mg KOH cần để tác dụng hoàn toàn 1g chất béo.", c: true },
           { t: "Chỉ số acid là số mg NaOH để trung hòa acid béo tự do trong 1g chất béo.", c: false },
           { t: "Chỉ số iodine đánh giá mức độ chưa no của lipid.", c: true },
           { t: "Chất béo có chỉ số iodine càng cao thì độ lỏng càng lớn.", c: true }
         ],
         e: "Chỉ số acid tính bằng mg KOH, không phải NaOH."
      },
      {
         q: "Quá trình sản xuất xà phòng trong công nghiệp:",
         s: [
           { t: "Người ta có thể sản xuất xà phòng từ dầu thực vật.", c: true },
           { t: "Glycerol là phụ phẩm có giá trị cao trong công nghiệp xà phòng.", c: true },
           { t: "Sau khi đun kiềm, phải thêm dung dịch NaCl bão hòa để tách xà phòng.", c: true },
           { t: "Xà phòng nổi lên trên do nhẹ hơn dung dịch.", c: true }
         ],
         e: "Tất cả các mệnh đề đều phản ánh chính xác quy trình sản xuất."
      }
    ]
  },
  "Bài 3. Glucose và fructose": {
    sentences: [
      { t: "Glucose có công thức phân tử là C6H12O6 và chứa 5 nhóm hydroxyl (-OH).", c: true, e: "Đúng. Cấu trúc hở là CH2OH-(CHOH)4-CHO." },
      { t: "Fructose không tham gia phản ứng tráng bạc (Tollens).", c: false, e: "Sai. Trong môi trường kiềm của thuốc thử Tollens, fructose chuyển hóa thành glucose và có tham gia tráng bạc." },
      { t: "Glucose tốn tại chủ yếu ở phân tử mạch hở trong dung dịch.", c: false, e: "Sai. Glucose tồn tại chủ yếu ở dạng vòng (alpha và beta)." },
      { t: "Khi khử glucose bằng H2 (xúc tác Ni, t°), ta thu được sorbitol.", c: true, e: "Đúng. Mất nhóm -CHO để biến thành nhóm -CH2OH tạo sorbitol." }
    ],
    multi: [
      {
        q: "Cho các phát biểu về Glucose và Fructose:",
        s: [
          { t: "Cả 2 đều hòa tan Cu(OH)2 tạo dung dịch xanh lam ở nhiệt độ thường.", c: true },
          { t: "Glucose làm mất màu nước bromine còn fructose thì không.", c: true },
          { t: "Glucose và fructose là các đồng phân hình học của nhau.", c: false },
          { t: "Fructose ngọt hơn sucrose (đường mía) và glucose.", c: true }
        ],
        e: "Glucose và fructose là đồng phân cấu tạo của nhau, không phải đồng phân hình học."
      },
      {
        q: "Trong y tế và sinh học:",
        s: [
          { t: "Dung dịch glucose 5% đóng vai trò làm dung dịch truyền dịch (nước biển).", c: true },
          { t: "Mức đường huyết bình thường trong máu người là khoảng 0.1%.", c: true },
          { t: "Glucose cung cấp phần lớn năng lượng thông qua chu trình hô hấp tế bào.", c: true },
          { t: "Do độ ngọt cao nên y tế thường tiêm tĩnh mạch fructose cho người bệnh tụt đường.", c: false }
        ],
        e: "Y tế chỉ tiêm glucose vì nó là nguồn năng lượng trực tiếp hấp thụ được vào tế bào, fructose cần qua gan chuyển hóa."
      },
      {
         q: "Tính chất vòng của monosaccharide:",
         s: [
           { t: "Glucose tạo thành 2 dạng vòng α-glucose và β-glucose.", c: true },
           { t: "Vòng α-glucose là vòng 5 cạnh (furanose).", c: false },
           { t: "Fructose kết tinh ở dạng β-fructose vòng 6 cạnh nhưng trong dung dịch tồn tại ở dạng vòng 5 cạnh.", c: true },
           { t: "Các dạng vòng chuyển hóa qua lại với nhau thông qua dạng mạch hở trung gian.", c: true }
         ],
         e: "Vòng glucose thường là vòng 6 cạnh (pyranose), vòng 5 cạnh furanose là fructose."
      },
      {
         q: "Phản ứng lên men:",
         s: [
           { t: "Dưới tác dụng xúc tác enzyme, glucose lên men tạo thành ethanol và CO2.", c: true },
           { t: "Phản ứng lên men glucose tỏa nhiệt làm ấm dung dịch.", c: true },
           { t: "Nho chín chứa lượng lớn glucose nên hiện tượng lên men nho tạo ra rượu nho.", c: true },
           { t: "Fructose không bao giờ lên men tạo ethanol do không phải chất trực tiếp bị men rượu phân giải.", c: false }
         ],
         e: "Fructose và glucose trong tự nhiên (mật ong, hoa quả) đều dễ dàng bị enzyme zymase lên men cồn."
      }
    ]
  }
};

const DEFAULT_LESSON = {
  sentences: [
    { t: "Hiệu ứng hóa học của hiện tượng này thường phụ thuộc vào nhiệt độ (T).", c: true, e: "Đúng. Nhiệt độ là yếu tố động học thiết yếu." },
    { t: "Hợp chất này không tan cả trong nước lạnh lẫn nước nóng.", c: false, e: "Sai. Nhiệt độ cao làm tăng độ tan của nhiều hợp chất." },
    { t: "Quá trình oxy hóa khử diễn ra song song với sự đứt gãy liên kết (bond cleavage).", c: true, e: "Đúng. Trao đổi electron gây đứt gãy mạch phân tử." },
    { t: "Toàn bộ các phân tử tham gia đều ở trạng thái acid mạnh (strong acid).", c: false, e: "Sai. Chỉ một số môi trường cục bộ mang tính acid." }
  ],
  multi: [
    {
      q: "Xét các nhận định trong hệ cân bằng:",
      s: [
        { t: "Hệ cân bằng chuyển dịch theo nguyên lý Le Chatelier.", c: true },
        { t: "Tăng áp suất làm dư thừa hạt proton trong hỗn hợp.", c: false },
        { t: "Năng lượng kích hoạt (Activation energy) được giảm nhờ chất xúc tác.", c: true },
        { t: "Enzyme đóng vai trò xúc tác sinh học hữu hiệu.", c: true }
      ],
      e: "Áp suất thay đổi sự dịch chuyển thể tích khí, không sinh ra dư thừa proton độc lập."
    },
    {
      q: "Đóng vai trò trong phản ứng tách mạch (elimination):",
      s: [
        { t: "Cần sự có mặt của base mạnh.", c: true },
        { t: "Nhiệt độ cao kìm hãm quá trình đứt liên kết pi.", c: false },
        { t: "Carbon bậc cao dễ dàng nhường proton hơn theo quy tắc Zaitsev.", c: true },
        { t: "Sản phẩm thu được ưu tiên nối đôi ở giữa mạch (more substituted alkene).", c: true }
      ],
      e: "Nhiệt độ cao kích thích (chứ không kìm hãm) các phản ứng tách mạch."
    },
    {
       q: "Đánh giá tính phân cực dung môi:",
       s: [
         { t: "Nước là chất phân cực rất mạnh.", c: true },
         { t: "Hexane là dung môi hòa tan rất tốt muối vô cơ.", c: false },
         { t: "Hợp chất hữu cơ phân cực thường tan trong cồn công nghiệp.", c: true },
         { t: "Lực Van der Waals đóng vai trò quan trọng trong hòa tan hợp chất không phân cực.", c: true }
       ],
       e: "Hexane là hydrocarbon không phân cực, không hòa tan muối."
    },
    {
       q: "Quá trình phân tích nồng độ:",
       s: [
         { t: "Chuẩn độ (Titration) dùng phenolphthalein làm điểm dừng nhận biết.", c: true },
         { t: "Điểm tương đương và điểm kết thúc chuẩn độ có thể không trùng khớp hoàn toàn.", c: true },
         { t: "Dùng HCl để vô hiệu hóa một base dư là quá trình tỏa nhiệt mạnh.", c: true },
         { t: "Không thể dùng giấy quỳ tím để thay thế phenolphtalein do thiếu độ chính xác.", c: true }
       ],
       e: "Toàn bộ hiện tượng chuẩn độ được trình bày hợp lý."
    }
  ]
};

const CHAPTERS = [
  { chap: "Chương 1. Ester – Lipid. Xà phòng và chất giặt rửa", lessons: ["Bài 1. Ester – Lipid", "Bài 2. Xà phòng và chất giặt rửa"] },
  { chap: "Chương 2. Carbohydrate", lessons: ["Bài 3. Glucose và fructose", "Bài 4. Saccharose và maltose", "Bài 5. Tinh bột và cellulose"] },
  { chap: "Chương 3. Hợp chất chứa nitrogen", lessons: ["Bài 6. Amine", "Bài 7. Amino acid và peptide", "Bài 8. Protein và enzyme"] },
  { chap: "Chương 4. Polymer", lessons: ["Bài 9. Đại cương về polymer", "Bài 10. Chất dẻo và vật liệu composite", "Bài 11. Tơ – cao su – keo dán tổng hợp"] },
  { chap: "Chương 5. Pin điện và điện phân", lessons: ["Bài 12. Thế điện cực và nguồn điện hóa học", "Bài 13. Điện phân"] },
  { chap: "Chương 6. Đại cương về kim loại", lessons: ["Bài 14. Đặc điểm cấu tạo kim loại", "Bài 15. Phương pháp tách kim loại", "Bài 16. Hợp kim – Sự ăn mòn kim loại"] },
  { chap: "Chương 7. Nguyên tố nhóm IA và nhóm IIA", lessons: ["Bài 17. Nguyên tố nhóm IA", "Bài 18. Nguyên tố nhóm IIA"] },
  { chap: "Chương 8. Sơ lược kim loại chuyển tiếp", lessons: ["Bài 19. Đại cương về sự hình thành kim loại", "Bài 20. Sơ lược về phức chất (Complex)"] }
];

const QUESTIONS = [];
let qId = 1;

CHAPTERS.forEach(cat => {
  cat.lessons.forEach(lessonName => {
    // Ưu tiên load kiến thức chính xác cao, nếu không có thì lấy Fallback logic Hóa (có tên Lesson ghép vào)
    const exactData = CHEM_CONTENT[lessonName] || DEFAULT_LESSON;
    
    // Câu Đúng Sai
    exactData.sentences.forEach(st => {
      QUESTIONS.push({
        id: `q-${qId++}`,
        type: "true-false",
        statement: CHEM_CONTENT[lessonName] ? st.t : `[${lessonName}] ${st.t}`,
        correct: st.c,
        explanation: st.e,
        gameModes: ["run", "pirate"],
        arenaRound: null,
        gradeLevel: "12",
        subject: "Hóa học",
        chapter: cat.chap,
        lesson: lessonName,
        createdByUid: "demo-ntmb",
        createdByName: "NGUYỄN THỊ MỸ BÌNH",
        createdByRole: "teacher",
        createdAt: "2025-08-20T10:00:00.000Z",
        updatedAt: "2025-08-20T10:00:00.000Z"
      });
    });

    // Câu 4 Ý
    exactData.multi.forEach((mq, idx) => {
      QUESTIONS.push({
        id: `q-${qId++}`,
        type: "multi-true-false",
        question: CHEM_CONTENT[lessonName] ? mq.q : `Vận dụng lý thuyết của bài học ${lessonName}. ${mq.q}`,
        statements: mq.s.map((sub, sIdx) => ({
          id: ["a","b","c","d"][sIdx],
          label: ["a.","b.","c.","d."][sIdx],
          text: sub.t,
          correct: sub.c
        })),
        explanation: mq.e,
        gameModes: ["blind-box", "elimination", "arena"],
        arenaRound: (idx % 3) + 1,
        gradeLevel: "12",
        subject: "Hóa học",
        chapter: cat.chap,
        lesson: lessonName,
        createdByUid: "demo-ntmb",
        createdByName: "NGUYỄN THỊ MỸ BÌNH",
        createdByRole: "teacher",
        createdAt: "2025-08-20T10:00:00.000Z",
        updatedAt: "2025-08-20T10:00:00.000Z"
      });
    });
  });
});

const MOCK_USERS = [
  ...Array.from({length: 35}).map((_, i) => ({
    id: `demo-${i+1}`, 
    email: `hs${String(i+1).padStart(6, '0')}@gmail.com`, 
    name: [
      "Huỳnh Thái An", "Phạm Đình Bảo Anh", "Tống Ngọc Hải Âu", "Nguyễn Trọng Đạt", "Nguyễn Quang Đạt",
      "Nguyễn Anh Đức", "Nguyễn Trung Dũng", "Trần Minh Hoàng", "Nguyễn Văn Huy", "Nguyễn Dũng Kiên",
      "Vũ Tuấn Kiệt", "Hoàng Khánh Ly", "Trần Trà My", "Nguyễn Văn Hoàng Sâm", "Nguyễn Văn Sơn",
      "Lưu Đình Tài", "Nguyễn Hữu Tuấn", "Phan Bá Tùng", "Nguyễn Long Khánh", "Nguyễn Bá Trường",
      "Nguyễn Thị Quỳnh Chi", "Nguyễn Trần Đăng", "Trịnh Đức Duy", "Thái Văn Duy", "Lê Chu Tuấn Duy",
      "Lê Huy Hoàng", "Nguyễn Thị Thanh Huyền", "Chương Tấn Sang", "Nguyễn Thị Thảo Sương", "Nguyễn Thị Hà Thủy",
      "Nguyễn Thị Huyền Trang", "Nguyễn Thị Cẩm Tú", "Nguyễn Hoàng Tuấn", "Hà Thảo Uyên", "Lê Thị Bảo Hà"
    ][i], 
    role: "student"
  })),
  { id: "demo-ntmb", email: "ntmb@gmail.com", name: "NGUYỄN THỊ MỸ BÌNH", role: "teacher" },
  { id: "demo-nvxo", email: "nvxo@gmail.com", name: "NGUYỄN VĂN XÔ", role: "teacher" },
];

const CLASSES = [
  { id: "class-1", name: "12A1 (Nhóm 1)", gradeLevel: "12", teacherId: "demo-ntmb", createdAt: "2025-08-15T00:00:00Z" },
  { id: "class-2", name: "12A2 (Nhóm 2)", gradeLevel: "12", teacherId: "demo-ntmb", createdAt: "2025-08-15T00:00:00Z" }
];

const CLASS_MEMBERS = MOCK_USERS.filter(u => u.role === "student").map((st, i) => ({
  classId: i < 17 ? "class-1" : "class-2",
  studentId: st.id,
  studentName: st.name,
  joinedAt: "2025-09-01T08:00:00Z"
}));

const GAME_ASSIGNMENTS = [];
const GAME_RESULTS = [];
let assignId = 1;

function randomDate(s, e) { return new Date(s.getTime() + Math.random()*(e.getTime()-s.getTime())); }
const START = new Date("2025-09-01T00:00:00Z");
const END = new Date("2026-04-19T23:59:59Z");

for (let i = 0; i < 50; i++) {
  const isC1 = Math.random() > 0.5;
  const tClass = isC1 ? "class-1" : "class-2";
  const modes = ["run", "pirate", "blind-box", "elimination", "arena"];
  const mode = modes[Math.floor(Math.random()*modes.length)];
  const eligibleQs = QUESTIONS.filter(q => q.gameModes.includes(mode)).sort(() => 0.5 - Math.random()).slice(0, 10);
  
  if (eligibleQs.length === 0) continue;
  
  const cAt = randomDate(START, END);

  GAME_ASSIGNMENTS.push({
    id: `assign-${assignId}`,
    title: `Luyện tập Khối 12: Đợt đánh giá lần ${i+1}`,
    description: `Hoàn thành bài luyện tập để chuẩn bị bài kiểm tra cuối tuần.`,
    mode, audience: "class", classId: tClass, className: isC1?"12A1 (Nhóm 1)":"12A2 (Nhóm 2)",
    questionIds: eligibleQs.map(q => q.id), questionSnapshot: eligibleQs, status: "published",
    createdAt: cAt.toISOString(), updatedAt: cAt.toISOString(), 
    createdByUid: "demo-ntmb", createdByName: "NGUYỄN THỊ MỸ BÌNH", createdByRole: "teacher"
  });

  CLASS_MEMBERS.filter(m => m.classId === tClass).forEach(st => {
    if (Math.random() < 0.8) {
      const pTime = new Date(cAt.getTime() + Math.random()*86400000*2);
      if (pTime > new Date("2026-04-19T23:59:59Z")) return;
      GAME_RESULTS.push({
        id: `result-${assignId}-${st.studentId}`,
        assignmentId: `assign-${assignId}`,
        assignmentTitle: `Luyện tập Khối 12: Đợt đánh giá lần ${i+1}`,
        mode, score: Math.floor(Math.random()*60)+40, duration: Math.floor(Math.random()*300)+60,
        mistakes: Math.random() < 0.6 ? [eligibleQs[0]] : [],
        playedAt: pTime.toISOString(), playerUid: st.studentId, playerName: st.studentName, classId: tClass
      });
    }
  });
  assignId++;
}

fs.writeFileSync(path.resolve(process.cwd(), "api/mock_db.json"), JSON.stringify({
  users: MOCK_USERS, classes: CLASSES, classMembers: CLASS_MEMBERS,
  questions: QUESTIONS, gameAssignments: GAME_ASSIGNMENTS, gameResults: GAME_RESULTS
}, null, 2));

console.log("✅ FINDS AND REWRITES CHEMISTRY DATA INTO DB.");
