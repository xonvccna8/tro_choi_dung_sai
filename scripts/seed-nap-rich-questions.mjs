const endpoint = process.argv[2] ?? "https://tro-choi-dung-sai.vercel.app/api/questions";
const baseUrl = new URL(endpoint).origin;

const user = {
  id: "seed-nap-rich",
  name: "Copilot Seeder",
  avatar: "🧪",
  role: "admin",
};

function getTitle(text) {
  return String(text).split("\n", 1)[0] ?? "";
}

function comparableQuestion(question) {
  return JSON.stringify({
    type: question.type,
    gameModes: question.gameModes,
    arenaRound: question.arenaRound,
    question: question.question,
    statements: question.statements,
    explanation: question.explanation,
  });
}

const questions = [
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 1,
    question:
      `[NAP 1] Thực hiện thí nghiệm sau:\n`
      + `- Bước 1: Cho phenol vào ống nghiệm, thêm nước và lắc đều ống nghiệm thấy dung dịch có màu trắng đục (hình A).\n`
      + `- Bước 2: Tiếp tục cho dung dịch NaOH vào ống nghiệm thấy dung dịch chuyển sang trong suốt (hình B).\n`
      + `- Bước 3: Tiếp tục sục khí CO2 vào ống nghiệm thấy dung dịch chuyển màu trắng đục như ban đầu (hình C).\n\n`
      + `![Sơ đồ phenol - NaOH - CO2](${baseUrl}/exam-assets/nap-1-phenol.svg)\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Trong ống nghiệm ở bước 1 (hình A), phenol tan tốt trong nước ở điều kiện thường nên dung dịch có màu trắng đục.",
        correct: false,
      },
      {
        id: "b",
        label: "b.",
        text: "Nếu cho quỳ tím vào ống nghiệm ở bước 1 (hình A) thì quỳ tím chuyển đỏ.",
        correct: false,
      },
      {
        id: "c",
        label: "c.",
        text: "Trong ống nghiệm ở bước 2 (hình B), dung dịch trong suốt vì sản phẩm tạo ra khi cho NaOH vào ống nghiệm tan tốt trong nước.",
        correct: true,
      },
      {
        id: "d",
        label: "d.",
        text: "Trong ống nghiệm ở bước 3 (hình C), dung dịch trắng đục là do có phenol tạo thành.",
        correct: true,
      },
    ],
    explanation:
      "Đáp án đúng: c, d. Phenol ít tan trong nước nên ban đầu tạo hệ trắng đục; thêm NaOH tạo natri phenolat tan tốt; sục CO2 tạo lại phenol nên dung dịch trắng đục trở lại.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 1,
    question:
      `[NAP 2] Tyrosine (Tyr) là một amino acid không thiết yếu nhưng đóng vai trò tiền thân quan trọng để tổng hợp các chất dẫn truyền thần kinh như dopamine và adrenaline. Cho công thức cấu tạo của tyrosine như hình bên. Tại pH ≈ 5,7, tyrosine tồn tại chủ yếu ở dạng ion lưỡng cực có tổng điện tích bằng không.\n\n`
      + `![Công thức cấu tạo tyrosine](${baseUrl}/exam-assets/nap-2-tyrosine.svg)\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Khi đặt trong điện trường tại pH = 2, tyrosine sẽ di chuyển về phía cực âm.",
        correct: true,
      },
      {
        id: "b",
        label: "b.",
        text: "Tyrosine thuộc loại hợp chất hữu cơ tạp chức, phân tử chứa hai loại nhóm chức khác nhau.",
        correct: false,
      },
      {
        id: "c",
        label: "c.",
        text: "1 mol tyrosine có thể phản ứng tối đa với 1 mol NaOH trong dung dịch.",
        correct: false,
      },
      {
        id: "d",
        label: "d.",
        text: "Khối lượng mol phân tử của tyrosine là 179.",
        correct: false,
      },
    ],
    explanation:
      "Đáp án đúng: a. Ở pH = 2, tyrosine mang điện tích dương nên đi về cực âm. Phân tử có ba loại nhóm chức đặc trưng là -COOH, -NH2 và -OH phenol; tối đa phản ứng với 2 mol NaOH; M = 181 g/mol.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 2,
    question:
      `[NAP 3] Ammonia có nhiều ứng dụng quan trọng trong đời sống và sản xuất. Trong công nghiệp, ammonia được tổng hợp từ nitrogen và hydrogen theo phương trình nhiệt hóa học sau:\n`
      + `$$\\mathrm{N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g)}$$\n`
      + `$$\\Delta_r H^\\circ_{298} = -91{,}8\\ \\mathrm{kJ}$$\n\n`
      + `Kết quả nghiên cứu sự phụ thuộc của hiệu suất tổng hợp ammonia vào áp suất và nhiệt độ của phản ứng được thể hiện ở đồ thị sau:\n\n`
      + `![Đồ thị hiệu suất tổng hợp ammonia](${baseUrl}/exam-assets/nap-3-ammonia-chart.svg)\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Ở nhiệt độ 500°C, 250 atm, 2 mol N2 tác dụng với 3 mol H2 thu được 0,6 mol NH3.",
        correct: true,
      },
      {
        id: "b",
        label: "b.",
        text: "Để tăng hiệu suất tổng hợp ammonia có thể đồng thời tăng áp suất và giảm nhiệt độ.",
        correct: true,
      },
      {
        id: "c",
        label: "c.",
        text: "Hiệu suất của phản ứng ở 500°C, 300 atm cao hơn hiệu suất ở 450°C, 200 atm.",
        correct: false,
      },
      {
        id: "d",
        label: "d.",
        text: "Nếu thực hiện phản ứng ở nhiệt độ càng thấp thì sẽ càng đạt hiệu quả kinh tế cao.",
        correct: false,
      },
    ],
    explanation:
      "Đáp án đúng: a, b. Theo đồ thị, ở 500°C và 250 atm hiệu suất xấp xỉ 30%, nên từ lượng NH3 lí thuyết 2 mol sẽ thu được khoảng 0,6 mol. Nhiệt độ quá thấp tuy tăng hiệu suất cân bằng nhưng làm tốc độ phản ứng giảm, nên không tối ưu kinh tế.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 3,
    question:
      `[NAP 4] Dùng panh lấy các mẫu kim loại (Li, Na hoặc K) có kích cỡ xấp xỉ nhau đã thấm khô dầu và cho vào các chậu thủy tinh đã chứa khoảng 1/3 thể tích nước. Thêm 2 - 3 giọt dung dịch phenolphthalein vào chậu sau khi kim loại tan hết.\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Từ hiện tượng thí nghiệm, chứng tỏ tính khử của kim loại tăng dần theo thứ tự sau: K, Na, Li.",
        correct: false,
      },
      {
        id: "b",
        label: "b.",
        text: "Các cặp oxi hóa - khử M+/M (M: Li, Na, K) đều có giá trị thế điện cực chuẩn lớn hơn giá trị thế điện cực chuẩn của cặp oxi hóa - khử 2H2O/H2, 2OH-.",
        correct: false,
      },
      {
        id: "c",
        label: "c.",
        text: "Các dung dịch thu được sau phản ứng đều có màu hồng.",
        correct: true,
      },
      {
        id: "d",
        label: "d.",
        text: "Hiện tượng ở chậu thủy tinh chứa Li và K giống nhau.",
        correct: false,
      },
    ],
    explanation:
      "Đáp án đúng: c. Tính khử tăng theo Li < Na < K; các kim loại kiềm có thế điện cực chuẩn rất âm; sau phản ứng tạo dung dịch bazơ nên phenolphthalein chuyển hồng; hiện tượng Li và K khác nhau rõ rệt về mức độ phản ứng.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 2,
    question:
      `[NAP 1] Trong công nghiệp, phần lớn phenol và chất A được sản xuất theo sơ đồ sau:\n\n`
      + `![Sơ đồ sản xuất phenol từ cumene](${baseUrl}/exam-assets/nap-b2-1-cumene.svg)\n\n`
      + `Để sản xuất 650 000 tấn phenol theo sơ đồ trên, nhà máy cần sử dụng 590 000 tấn benzene làm nguyên liệu đầu vào.\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Giá trị của h là 96. (Kết quả các phép tính trung gian không được làm tròn, chỉ kết quả cuối cùng được làm tròn đến hàng đơn vị).",
        correct: true,
      },
      {
        id: "b",
        label: "b.",
        text: "Trong sơ đồ trên, phản ứng giữa cumene và oxygen là phản ứng oxi hóa hoàn toàn.",
        correct: false,
      },
      {
        id: "c",
        label: "c.",
        text: "Chất A có tên thông thường là propan-2-one.",
        correct: true,
      },
      {
        id: "d",
        label: "d.",
        text: "Do ảnh hưởng của nhóm -OH nên phản ứng thế nguyên tử hydrogen trên vòng benzene của phenol xảy ra dễ hơn so với benzene.",
        correct: true,
      },
    ],
    explanation:
      "Đáp án đúng: a, c, d. Từ sơ đồ có 590000 × 0,95 × h × 94/78 = 650000 nên h ≈ 96%. Chất A là acetone (propan-2-one). Cumene chỉ bị oxi hóa chọn lọc chứ không phải oxi hóa hoàn toàn. Nhóm -OH hoạt hóa vòng thơm nên phenol dễ phản ứng thế hơn benzene.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 2,
    question:
      `[NAP 2] Một học sinh quan sát thấy NaOH để ngoài không khí bị chảy rữa, sau đó xuất hiện lớp chất rắn màu trắng. Học sinh này tìm hiểu được hiện tượng này là do việc hấp thu nước và CO₂ trong không khí. Học sinh đặt ra giả thuyết: “khối lượng của mẫu NaOH để ngoài không khí tăng với tốc độ không đổi theo thời gian”. Để kiểm chứng giả thuyết học sinh tiến hành thí nghiệm như sau:\n`
      + `Bước 1: Đặt đĩa thủy tinh lên cân và trừ bì về 0. Mở lọ NaOH, lấy một lượng NaOH cho vào đĩa thấy cân hiển thị đúng 10,350 g.\n`
      + `Bước 2: Ngay khi cân xong ở bước 1, bắt đầu bấm giờ.\n`
      + `Bước 3: Đặt đĩa thủy tinh lên cân để ghi lại khối lượng tại các thời điểm: t = 1; 5; 10; 20; 30 và 60 phút. Quan sát sự thay đổi vật lý của mẫu NaOH trong đĩa thủy tinh.\n`
      + `Từ kết quả thu được học sinh vẽ đồ thị như sau:\n\n`
      + `![Đồ thị thay đổi khối lượng NaOH](${baseUrl}/exam-assets/nap-b2-2-naoh-graph.svg)\n\n`
      + `Tốc độ tăng khối lượng trung bình = (m_sau - m_trước)/(t_sau - t_trước) (g/phút).\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Chất rắn màu trắng xuất hiện là muối sinh ra từ phản ứng giữa NaOH và CO₂.",
        correct: true,
      },
      {
        id: "b",
        label: "b.",
        text: "Kết quả thí nghiệm phù hợp với giả thuyết ban đầu của học sinh.",
        correct: false,
      },
      {
        id: "c",
        label: "c.",
        text: "Trong 5 phút đầu tiên từ lúc bấm giờ, tốc độ tăng khối lượng trung bình của mẫu NaOH ở thí nghiệm trên là 0,19 g/phút. (Kết quả các phép tính trung gian không được làm tròn, chỉ kết quả cuối cùng được làm tròn đến hàng phần trăm).",
        correct: false,
      },
      {
        id: "d",
        label: "d.",
        text: "Ở bước 1, cần lấy NaOH nhanh hơn và đóng nắp lọ ngay sau khi lấy xong để hạn chế NaOH hấp thụ hơi nước và CO₂ trước khi bắt đầu thí nghiệm.",
        correct: true,
      },
    ],
    explanation:
      "Đáp án đúng: a, d. NaOH hấp thụ CO₂ tạo muối carbonat hoặc hydrogencarbonat màu trắng. Đồ thị cho thấy tốc độ tăng khối lượng không hằng định nên giả thuyết ban đầu không đúng. Trong 5 phút đầu, tốc độ trung bình là (11,592 - 10,350)/5 = 0,2484 g/phút, không phải 0,19 g/phút.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 3,
    question:
      `[NAP 3] Thép là hợp kim của sắt (Fe) và carbon, vốn dễ bị ăn mòn khi tiếp xúc với nước biển giàu oxy và muối. Để bảo vệ thép, người ta thường dùng phương pháp điện hóa (gắn khối Mg làm vật hi sinh) hoặc sơn phủ bề mặt. Tuy nhiên, các loại sơn truyền thống chứa chì (Pb) hoặc chromium (Cr) thường gây độc và tích tụ sinh học trong sinh vật biển. Do đó, xu hướng hiện nay là phát triển sơn bio-polymer từ nguyên liệu tái tạo kết hợp với nano silica (SiO₂). Loại sơn mới này vừa thân thiện với môi trường, vừa tạo lớp màng ngăn cách có độ bám dính và độ kín khít cao, giúp bảo vệ công trình bền vững hơn.\n\n`
      + `![Bảng thế điện cực chuẩn](${baseUrl}/exam-assets/nap-b2-3-corrosion-table.svg)\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Khi gắn khối Mg vào chân giàn khoan bằng thép, nó sẽ đóng vai trò là cathode và bị oxi hóa thay cho sắt (Fe).",
        correct: false,
      },
      {
        id: "b",
        label: "b.",
        text: "Phương pháp bảo vệ bề mặt làm thay đổi thế điện cực chuẩn của kim loại, từ đó hạn chế quá trình oxi hóa xảy ra trên bề mặt kim loại.",
        correct: false,
      },
      {
        id: "c",
        label: "c.",
        text: "Gắn thiếc (Sn) lên vỏ tàu thép được xem là phương pháp bảo vệ điện hóa giúp ngăn ngừa quá trình ăn mòn kim loại.",
        correct: false,
      },
      {
        id: "d",
        label: "d.",
        text: "Việc lựa chọn sơn bio-polymer nano thay thế cho các dòng sơn chứa chì hay chromium là một phương án đề xuất phù hợp nhằm giải quyết vấn đề ô nhiễm thứ cấp từ kim loại nặng trong môi trường biển.",
        correct: true,
      },
    ],
    explanation:
      "Đáp án đúng: d. Trong bảo vệ điện hóa, Mg là anode hi sinh nên bị oxi hóa trước, không phải cathode. Sơn phủ chỉ tạo lớp cách ly môi trường chứ không làm thay đổi thế điện cực chuẩn. Thiếc có thế điện cực cao hơn sắt nên nếu lớp phủ hỏng sẽ làm sắt bị ăn mòn mạnh hơn. Sơn bio-polymer nano giúp giảm nguy cơ ô nhiễm kim loại nặng.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 1,
    question:
      `[NAP 4] Omega-3 và omega-6 là hai nhóm acid béo không no thiết yếu, cơ thể người không tự tổng hợp được mà phải lấy từ thức ăn. Omega-3 có nhiều trong dầu cá, dầu hạt lanh; omega-6 có nhiều trong dầu đậu nành, dầu hướng dương. Trong cơ thể, chất béo được thủy phân nhờ enzyme lipase, giải phóng acid béo tự do. Việc cân bằng tỉ lệ omega-6 và omega-3 trong khẩu phần ăn có ý nghĩa quan trọng trong phòng chống viêm nhiễm và bệnh tim mạch. Dưới đây là cấu trúc của hai phân tử chất béo tiêu biểu: một chất béo không no được tạo thành từ acid béo omega-6, và một chất béo no được tạo thành từ acid béo no:\n\n`
      + `![Cấu trúc trilinolein và tristearin](${baseUrl}/exam-assets/nap-b2-4-fat-molecules.svg)\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Acid béo thuộc nhóm omega-3 và omega-6 cũng được sinh ra từ phản ứng thủy phân chất béo trong môi trường base.",
        correct: false,
      },
      {
        id: "b",
        label: "b.",
        text: "Dầu cá chứa nhiều omega-3, còn dầu thực vật như dầu đậu nành chứa chủ yếu omega-6; do đó để phòng bệnh tim mạch, nên ưu tiên dùng dầu cá hoàn toàn thay thế dầu thực vật.",
        correct: false,
      },
      {
        id: "c",
        label: "c.",
        text: "Trilinolein có nhiệt độ nóng chảy thấp hơn so với tristearin.",
        correct: true,
      },
      {
        id: "d",
        label: "d.",
        text: "Chất béo tạo từ gốc acid omega-3 và omega-6 dễ bị oxi hóa trong không khí, tạo các hợp chất gây mùi ôi.",
        correct: true,
      },
    ],
    explanation:
      "Đáp án đúng: c, d. Thủy phân trong môi trường base tạo muối của acid béo chứ không thu trực tiếp acid béo tự do. Dầu cá và dầu thực vật cần được cân bằng hợp lí chứ không thay thế hoàn toàn. Chất béo không no có nhiệt độ nóng chảy thấp hơn chất béo no và cũng dễ bị oxi hóa gây ôi.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 2,
    question:
      `[NAP 1] Trong công nghiệp, sodium hydrogencarbonate (baking soda) và sodium carbonate được sản xuất bằng phương pháp Solvay từ nguyên liệu chính là đá vôi, muối ăn, ammonia và nước. Quá trình sản xuất theo phương pháp Solvay bao gồm các công đoạn như trong sơ đồ sau:\n\n`
      + `![Sơ đồ quá trình Solvay](${baseUrl}/exam-assets/nap-b3-1-solvay.svg)\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "CaO thu được từ nhiệt phân đá vôi dùng để chuyển NH₄Cl thành NH₃.",
        correct: true,
      },
      {
        id: "b",
        label: "b.",
        text: "Phản ứng xảy ra trong tháp carbonate hóa là: 2NaCl(aq) + 2NH₃(aq) + H₂O(l) + CO₂(g) ⇌ Na₂CO₃(s) + 2NH₄Cl(aq).",
        correct: false,
      },
      {
        id: "c",
        label: "c.",
        text: "Nguyên liệu chính ban đầu của quá trình sản xuất soda bằng phương pháp Solvay là: NaCl, NH₃, CaCO₃ và H₂O.",
        correct: true,
      },
      {
        id: "d",
        label: "d.",
        text: "Để tiết kiệm chi phí, có thể thay thế dung dịch NaCl bão hòa bằng nước biển.",
        correct: false,
      },
    ],
    explanation:
      "Đáp án đúng: a, c. Trong quy trình Solvay, CaCO₃ bị nhiệt phân tạo CaO và CO₂; CaO sau đó được chuyển thành Ca(OH)₂ để giải phóng NH₃ từ NH₄Cl. Ở tháp carbonate hóa, chất rắn kết tinh là NaHCO₃ chứ không phải Na₂CO₃. Nước biển không thể thay trực tiếp cho dung dịch NaCl bão hòa vì nồng độ và tạp chất không phù hợp.",
  },
  {
    type: "multi-true-false",
    gameModes: ["arena"],
    arenaRound: 1,
    question:
      `[NAP 2] Vật liệu polymer đã và đang được sử dụng rộng rãi trong rất nhiều lĩnh vực. Với những ưu điểm vượt trội về tính chất, độ bền, ... vật liệu polymer được ứng dụng rộng rãi trong đời sống như làm vật liệu cách điện và đặc biệt là vật liệu xây dựng mới như: sơn chống thấm, bê tông siêu nhẹ, gỗ công nghiệp, ... Các polymer được điều chế bằng phản ứng trùng hợp hoặc trùng ngưng.\n\n`
      + `Cho các phát biểu sau:`,
    statements: [
      {
        id: "a",
        label: "a.",
        text: "Các polymer để sản xuất các chất dẻo đều được điều chế bằng phản ứng trùng hợp.",
        correct: false,
      },
      {
        id: "b",
        label: "b.",
        text: "Nylon-6,6 được sử dụng phổ biến trong ngành dệt may và được điều chế từ phản ứng trùng ngưng.",
        correct: true,
      },
      {
        id: "c",
        label: "c.",
        text: "Sự khác biệt cơ bản giữa hai phản ứng điều chế polymer là: phản ứng trùng ngưng có tạo ra các phân tử nhỏ, còn trùng hợp thì không tạo ra các phân tử nhỏ.",
        correct: true,
      },
      {
        id: "d",
        label: "d.",
        text: "Trùng hợp buta-1,3-diene thu được polymer có cấu trúc tương tự cao su tự nhiên.",
        correct: false,
      },
    ],
    explanation:
      "Đáp án đúng: b, c. Không phải mọi chất dẻo đều được điều chế bằng phản ứng trùng hợp vì có nhiều polymer tạo thành từ trùng ngưng. Nylon-6,6 là sản phẩm trùng ngưng. Phản ứng trùng ngưng thường tạo phân tử nhỏ như H₂O, HCl; còn trùng hợp thì không. Polybutadien không có cấu trúc giống hệt cao su tự nhiên vốn là polyisopren.",
  },
];

async function main() {
  const existingResponse = await fetch(endpoint, {
    headers: { Accept: "application/json" },
  });
  const existingData = await existingResponse.json();
  if (!existingResponse.ok) {
    throw new Error(existingData?.error ?? "Không đọc được ngân hàng câu hỏi hiện tại.");
  }

  const existingByTitle = new Map(
    Array.isArray(existingData?.questions)
      ? existingData.questions
          .filter((question) => question?.type === "multi-true-false" && typeof question?.question === "string")
          .map((question) => [getTitle(question.question), question])
      : [],
  );

  const pending = [];
  const idsToDelete = [];

  for (const question of questions) {
    const title = getTitle(question.question);
    const existing = existingByTitle.get(title);
    if (!existing) {
      pending.push(question);
      continue;
    }

    if (comparableQuestion(existing) !== comparableQuestion(question)) {
      idsToDelete.push(existing.id);
      pending.push(question);
    }
  }

  if (pending.length === 0 && idsToDelete.length === 0) {
    console.log("Không có câu NAP mới cần nạp.");
    return;
  }

  for (const id of idsToDelete) {
    const deleteResponse = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    const deleteData = await deleteResponse.json();
    if (!deleteResponse.ok) {
      throw new Error(deleteData?.error ?? `Không xóa được câu hỏi cũ ${id}.`);
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ questions: pending, user }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? "Không nạp được câu hỏi NAP.");
  }

  console.log(`Da dong bo ${data?.count ?? pending.length} cau hoi NAP rich content.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
