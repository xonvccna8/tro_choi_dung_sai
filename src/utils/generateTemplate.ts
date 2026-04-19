import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  Packer,
  PageOrientation,
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";

/**
 * Tạo file Word mẫu (.docx) đẹp, khoa học, dễ soạn câu hỏi Đúng/Sai Hóa 12.
 * Giao viên chỉ cần tải về, soạn theo format rồi tải lên.
 */
export async function downloadWordTemplate() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 26 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [
          // ═══ TIÊU ĐỀ ═══
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "MẪU SOẠN CÂU HỎI ĐÚNG/SAI – TOÁN HỌC 12",
                bold: true,
                size: 32,
                color: "4A148C",
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Trò Chơi Học Thuật – Ôn tập Toán học hiệu quả",
                italics: true,
                size: 24,
                color: "7B1FA2",
              }),
            ],
          }),

          // ═══ HƯỚNG DẪN SỬ DỤNG ═══
          createSectionHeader("📌 HƯỚNG DẪN SỬ DỤNG"),
          createBullet("Soạn câu hỏi theo một trong 3 format bên dưới."),
          createBullet("Lưu file giữ nguyên định dạng .docx (Word)."),
          createBullet("Tải file lên trang Tạo Câu Hỏi → hệ thống tự nhận dạng format."),
          createBullet("[Format 1] Câu đơn: mỗi dòng [ĐÚNG] hoặc [SAI] + mệnh đề + | + giải thích."),
          createBullet("[Format 2] Câu 4 ý cũ: mỗi câu nằm giữa 2 dòng gạch ngang ---"),
          createBullet("[Format 3 MỚI] Câu 4 ý có ngữ cảnh: bắt đầu bằng 'Câu 1.' + phần 'Giải thích:' ở cuối."),
          emptyLine(),

          // ═══ BẢNG QUY ƯỚC FORMAT ═══
          createSectionHeader("📋 QUY ƯỚC FORMAT"),
          createFormatTable(),
          emptyLine(),

          // ═══ CÔNG THỨC TOÁN HỌC ═══
          createSectionHeader("🧪 CÁCH GÕ CÔNG THỨC TOÁN HỌC (KaTeX)"),
          createBullet("Đặt toàn bộ công thức vào cặp ký hiệu $...$"),
          createBullet("Phân số: gõ $\\frac{a}{b}$"),
          createBullet("Mũ/Lũy thừa: gõ $x^2$, $e^x$"),
          createBullet("Căn bậc hai: gõ $\\sqrt{x^2 + 1}$"),
          createBullet("Tích phân: gõ $\\int_0^1 f(x)dx$"),
          createBullet("Giới hạn: gõ $\\lim_{x \\to \\infty}$"),
          createBullet("Vô cùng: gõ $+\\infty$ hoặc $-\\infty$"),
          emptyLine(),

          // ═══ MẸO SOẠN CÂU HỎI CHẤT LƯỢNG ═══
          createSectionHeader("💡 MẸO SOẠN CÂU HỎI CHẤT LƯỢNG"),
          createNumberedItem("1", "Mỗi ý chỉ chứa MỘT nội dung kiến thức, tránh ghép 2 ý vào 1."),
          createNumberedItem("2", "Câu SAI nên sai ở điểm tinh tế, tránh sai quá rõ ràng."),
          createNumberedItem("3", "Dùng từ khóa bẫy: 'chỉ', 'luôn luôn', 'tất cả', 'duy nhất', 'không bao giờ'."),
          createNumberedItem("4", "Nên có 2 ý Đúng + 2 ý Sai trong mỗi câu 4 ý (cân bằng)."),
          createNumberedItem("5", "Luôn viết Giải thích để học sinh hiểu khi ôn sai."),
          createNumberedItem("6", "Bám sát SGK Toán 12 và đề thi tham khảo Bộ GD&ĐT 2025."),
          emptyLine(),

          // ═══════════════════════════════════════════════
          // PHẦN 1: CÂU ĐƠN ĐÚNG/SAI
          // ═══════════════════════════════════════════════
          createSectionHeader("═══ PHẦN 1: CÂU ĐƠN ĐÚNG/SAI ═══"),
          createNote("Mỗi dòng: [ĐÚNG] hoặc [SAI] + mệnh đề + | + giải thích"),
          emptyLine(),

          // ── CHƯƠNG: ESTER – LIPID ──
          createChapterHeader("CHƯƠNG 1: ESTER – LIPID"),
          createTfLine(true, "Ester là sản phẩm của phản ứng giữa acid và alcohol.", "Ester tạo thành khi acid (hữu cơ hoặc vô cơ) phản ứng với alcohol, loại nước."),
          createTfLine(false, "Phản ứng thủy phân ester trong môi trường acid là phản ứng một chiều.", "Thủy phân ester trong acid là phản ứng thuận nghịch, trong kiềm (xà phòng hóa) mới là một chiều."),
          createTfLine(true, "Chất béo là triester của glycerol với acid béo.", "Chất béo = triester của glycerol + 3 acid béo (acid cacboxylic có mạch C dài, không phân nhánh)."),
          createTfLine(false, "Tất cả các ester đều có mùi thơm.", "Nhiều ester có mùi thơm (isoamyl acetat mùi chuối), nhưng không phải tất cả."),
          createTfLine(true, "Xà phòng hóa chất béo thu được glycerol và muối của acid béo.", "Chất béo + NaOH → Glycerol + Muối Na của acid béo (xà phòng)."),
          emptyLine(),

          // ── CHƯƠNG: CARBOHYDRATE ──
          createChapterHeader("CHƯƠNG 2: CARBOHYDRATE"),
          createTfLine(true, "Glucose có phản ứng tráng bạc vì có nhóm -CHO.", "Glucose là aldose, chứa nhóm -CHO nên có tính khử, phản ứng tráng bạc."),
          createTfLine(false, "Fructose không phản ứng với dung dịch AgNO3/NH3.", "Fructose trong môi trường kiềm chuyển hóa thành glucose nên VẪN phản ứng tráng bạc."),
          createTfLine(true, "Saccharose không có tính khử.", "Saccharose không có nhóm -CHO tự do nên không có tính khử."),
          createTfLine(false, "Tinh bột và cellulose đều có phản ứng thủy phân tạo glucose.", "Đúng cả hai đều thủy phân cho glucose, nhưng câu ĐÚNG → đổi thành SAI: Tinh bột hòa tan trong nước nóng tạo dung dịch → SAI vì tinh bột chỉ tạo hồ tinh bột."),
          createTfLine(true, "Cellulose có cấu trúc mạch không phân nhánh.", "Cellulose gồm các mắt xích β-glucose liên kết 1,4-glycosid tạo mạch thẳng."),
          emptyLine(),

          // ── CHƯƠNG: AMINE – AMINO ACID ──
          createChapterHeader("CHƯƠNG 3: AMINE – AMINO ACID – PROTEIN"),
          createTfLine(true, "Amine bậc I có công thức tổng quát R-NH2.", "Amine bậc I: nguyên tử N liên kết với 1 gốc hydrocarbon và 2 H."),
          createTfLine(false, "Tất cả các amine đều làm quỳ tím hóa xanh.", "Aniline (C6H5NH2) là amine nhưng không làm quỳ tím đổi màu do tính base yếu."),
          createTfLine(true, "Amino acid có tính chất lưỡng tính.", "Amino acid chứa cả nhóm -NH2 (base) và -COOH (acid) nên lưỡng tính."),
          createTfLine(false, "Protein chỉ được tạo thành từ các α-amino acid.", "Protein tạo từ α-amino acid, nhưng từ 'chỉ' quá tuyệt đối – một số peptide đặc biệt có thể chứa amino acid khác."),
          createTfLine(true, "Phản ứng biuret cho màu tím với protein có từ 2 liên kết peptide trở lên.", "Cu(OH)2 + peptide ≥ 2 liên kết peptide → màu tím đặc trưng."),
          emptyLine(),

          // ── CHƯƠNG: POLYMER ──
          createChapterHeader("CHƯƠNG 4: POLYMER"),
          createTfLine(true, "Polietilen (PE) được điều chế bằng phản ứng trùng hợp etilen.", "nCH2=CH2 → (-CH2-CH2-)n: phản ứng trùng hợp."),
          createTfLine(false, "Tơ nilon-6,6 được tạo bằng phản ứng trùng hợp.", "Tơ nilon-6,6 tạo bằng phản ứng trùng ngưng (hexametylendiamine + acid adipic), không phải trùng hợp."),
          createTfLine(true, "Cao su thiên nhiên là polymer của isopren.", "Cao su thiên nhiên = polyisopren: (-CH2-C(CH3)=CH-CH2-)n."),
          emptyLine(),

          // ═══════════════════════════════════════════════
          // PHẦN 2: CÂU 4 Ý ĐÚNG/SAI (GIỐNG ĐỀ THI)
          // ═══════════════════════════════════════════════
          createSectionHeader("═══ PHẦN 2: CÂU 4 Ý ĐÚNG/SAI (GIỐNG ĐỀ THI) ═══"),
          createNote("Format 2 (cũ): Mỗi câu nằm giữa 2 dòng --- | Có đúng 4 ý a, b, c, d"),
          createNote("Format 3 (MỚI): Câu 1. Tiêu đề → ngữ cảnh → a/b/c/d → Giải thích: → Câu 2. ..."),
          createNote("Nếu file dùng format 'Câu X.' thì HỆ THỐNG TỰ CHỌN format 3 (không cần ---)"),
          emptyLine(),
          createChapterHeader("MẪU FORMAT 3 (MỚI – 'Câu X.' + ngữ cảnh)"),
          ...createCauXFormat(
            "1. Glucose trong dung dịch truyền",
            ["Trong y học, dung dịch glucose 5% thường được dùng để bổ sung dịch và cung cấp năng lượng."],
            [
              { label: "a", correct: true, text: "Glucose là monosaccharide có công thức phân tử C6H12O6." },
              { label: "b", correct: false, text: "Glucose và fructose là cùng một chất vì có cùng công thức phân tử." },
              { label: "c", correct: false, text: "Trong nước, glucose tồn tại chủ yếu ở dạng mạch hở." },
              { label: "d", correct: true, text: "Glucose có thể đi vào các con đường chuyển hóa để cung cấp năng lượng." },
            ],
            "a đúng vì glucose là monosaccharide 6 carbon. b sai vì glucose và fructose chỉ là đồng phân. c sai vì trong nước, glucose tồn tại chủ yếu ở dạng vòng. d đúng vì glucose là nguồn năng lượng trung tâm."
          ),
          emptyLine(),
          createChapterHeader("MẪU FORMAT 2 CŨ (--- markers)"),
          ...createRichStemMultiQuestion(
            [
              "NAP 3: Thép là hợp kim của iron (Fe) và carbon, vốn dễ bị ăn mòn khi tiếp xúc với nước biển giàu oxygen và muối. Để bảo vệ thép, người ta thường dùng phương pháp điện hóa (gắn khối Mg làm vật hi sinh) hoặc sơn phủ bề mặt.",
              "Tuy nhiên, các loại sơn truyền thống chứa lead (Pb) hoặc chromium (Cr) thường gây độc và tích tụ sinh học trong sinh vật biển. Do đó, xu hướng hiện nay là phát triển sơn bio-polymer từ nguyên liệu tái tạo kết hợp với nano silica SiO2. Loại sơn mới này vừa thân thiện với môi trường, vừa tạo lớp màng ngăn cách có độ bám dính và độ kín khít cao, giúp bảo vệ công trình bền vững hơn.",
              "Bảng. Thế điện cực chuẩn của một số cặp oxi hóa - khử:",
              "Cặp oxi hóa - khử | Mg^{2+}/Mg | Fe^{2+}/Fe | Sn^{2+}/Sn",
              "E^0 (V) | -2,37 | -0,44 | -0,14",
            ],
            [
              { label: "a", correct: false, text: "Khi gắn khối Mg vào chân giàn khoan bằng thép, nó sẽ đóng vai trò là cathode và bị oxi hóa thay cho iron (Fe)." },
              { label: "b", correct: false, text: "Phương pháp bảo vệ bề mặt làm thay đổi thế điện cực chuẩn của kim loại, từ đó hạn chế quá trình oxi hóa xảy ra trên bề mặt kim loại." },
              { label: "c", correct: false, text: "Gắn thiếc (Sn) lên vỏ tàu thép được xem là phương pháp bảo vệ điện hóa giúp ngăn ngừa quá trình ăn mòn kim loại." },
              { label: "d", correct: true, text: "Việc lựa chọn sơn bio-polymer nano thay thế cho các dòng sơn chứa lead hay chromium là một phương án đề xuất phù hợp nhằm giải quyết vấn đề ô nhiễm thứ cấp từ kim loại nặng trong môi trường biển." },
            ],
            "a sai vì Mg là anode hi sinh, bị oxi hóa thay cho iron. b sai vì sơn phủ chỉ cách ly kim loại khỏi môi trường, không làm thay đổi thế điện cực chuẩn. c sai vì Sn có E^0 lớn hơn Fe nên khi lớp phủ bị trầy xước, iron bị ăn mòn nhanh hơn. d đúng vì sơn bio-polymer nano giúp giảm nguy cơ phát tán kim loại nặng độc hại ra môi trường biển."
          ),
          emptyLine(),

          // Câu 1
          ...createMultiQuestion(
            "Cho các nhận định sau về ester:",
            [
              { label: "a", correct: true, text: "Ester có nhiệt độ sôi thấp hơn acid và alcohol có cùng số carbon." },
              { label: "b", correct: false, text: "Phản ứng xà phòng hóa ester là phản ứng thuận nghịch." },
              { label: "c", correct: true, text: "Ester thường ít tan trong nước." },
              { label: "d", correct: false, text: "Thủy phân ester luôn tạo ra acid cacboxylic." },
            ],
            "b sai vì xà phòng hóa là phản ứng một chiều. d sai vì thủy phân trong kiềm tạo muối chứ không phải acid."
          ),

          // Câu 2
          ...createMultiQuestion(
            "Cho các nhận định sau về carbohydrate:",
            [
              { label: "a", correct: true, text: "Glucose và fructose là đồng phân của nhau." },
              { label: "b", correct: true, text: "Saccharose thủy phân tạo glucose và fructose." },
              { label: "c", correct: false, text: "Tinh bột có phản ứng tráng bạc." },
              { label: "d", correct: false, text: "Cellulose tan trong nước nóng." },
            ],
            "c sai vì tinh bột không có nhóm -CHO tự do. d sai vì cellulose không tan trong nước."
          ),

          // Câu 3
          ...createMultiQuestion(
            "Cho các nhận định sau về amine và amino acid:",
            [
              { label: "a", correct: true, text: "Metylamine có tính base mạnh hơn aniline." },
              { label: "b", correct: false, text: "Amino acid là chất lỏng ở điều kiện thường." },
              { label: "c", correct: true, text: "Glycine (H2N-CH2-COOH) là amino acid đơn giản nhất." },
              { label: "d", correct: false, text: "Protein đều bị thủy phân trong môi trường trung tính." },
            ],
            "b sai vì amino acid là chất rắn kết tinh. d sai vì protein cần enzyme hoặc acid/kiềm để thủy phân."
          ),

          // Câu 4
          ...createMultiQuestion(
            "Cho các nhận định sau về polymer:",
            [
              { label: "a", correct: true, text: "PVC được điều chế bằng phản ứng trùng hợp vinyl clorua." },
              { label: "b", correct: true, text: "Tơ tằm là polymer thiên nhiên." },
              { label: "c", correct: false, text: "Tất cả polymer đều bền với nhiệt." },
              { label: "d", correct: false, text: "Cao su lưu hóa có tính đàn hồi kém hơn cao su thô." },
            ],
            "c sai vì nhiều polymer kém bền nhiệt (PE, PP nóng chảy ở ~100-200°C). d sai vì lưu hóa tăng tính đàn hồi."
          ),

          // Câu 5
          ...createMultiQuestion(
            "Cho các nhận định sau về chất béo và xà phòng:",
            [
              { label: "a", correct: true, text: "Chất béo nhẹ hơn nước." },
              { label: "b", correct: false, text: "Dầu ăn và mỡ động vật đều là chất béo rắn." },
              { label: "c", correct: true, text: "Xà phòng là muối natri hoặc kali của acid béo." },
              { label: "d", correct: true, text: "Chất béo lỏng chứa chủ yếu gốc acid béo không no." },
            ],
            "b sai vì dầu ăn là chất béo LỎNG (chứa acid béo không no), mỡ mới là rắn."
          ),

          emptyLine(),
          // ═══ GHI CHÚ CUỐI ═══
          createSectionHeader("📝 GHI CHÚ"),
          createBullet("Bạn có thể thêm bao nhiêu câu tùy ý vào file này."),
          createBullet("Xóa các câu mẫu khi soạn xong câu hỏi của riêng bạn."),
          createBullet("Giữ nguyên format [ĐÚNG], [SAI], --- để hệ thống nhận dạng."),
          createBullet("File hỗ trợ tiếng Việt có dấu đầy đủ."),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Mau_Cau_Hoi_Dung_Sai_Hoa_12.docx");
}

/* ─── Helper functions ─── */

function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: "4A148C",
        font: "Times New Roman",
      }),
    ],
  });
}

function createChapterHeader(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    shading: { type: ShadingType.CLEAR, fill: "E8EAF6" },
    children: [
      new TextRun({
        text: `  📘 ${text}`,
        bold: true,
        size: 26,
        color: "283593",
        font: "Times New Roman",
      }),
    ],
  });
}

function createBullet(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: "   • ", bold: true, size: 24, color: "7B1FA2" }),
      new TextRun({ text, size: 24 }),
    ],
  });
}

function createNumberedItem(num: string, text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: `   ${num}. `, bold: true, size: 24, color: "E65100" }),
      new TextRun({ text, size: 24 }),
    ],
  });
}

function createNote(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    shading: { type: ShadingType.CLEAR, fill: "FFF8E1" },
    children: [
      new TextRun({ text: `   ⚡ ${text}`, italics: true, size: 22, color: "E65100" }),
    ],
  });
}

function emptyLine(): Paragraph {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

function createTfLine(correct: boolean, statement: string, explanation: string): Paragraph {
  const tag = correct ? "[ĐÚNG]" : "[SAI]";
  const tagColor = correct ? "2E7D32" : "C62828";
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${tag} `, bold: true, size: 24, color: tagColor }),
      new TextRun({ text: statement, size: 24 }),
      new TextRun({ text: " | ", bold: true, size: 24, color: "9E9E9E" }),
      new TextRun({ text: explanation, italics: true, size: 22, color: "616161" }),
    ],
  });
}

function createMultiQuestion(
  question: string,
  statements: { label: string; correct: boolean; text: string }[],
  explanation: string,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Opening ---
  paragraphs.push(
    new Paragraph({
      spacing: { before: 100 },
      children: [new TextRun({ text: "---", bold: true, size: 24, color: "9E9E9E" })],
    }),
  );

  // Question line
  paragraphs.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: question, bold: true, size: 24 })],
    }),
  );

  // Statements a, b, c, d
  for (const s of statements) {
    const tag = s.correct ? "[ĐÚNG]" : "[SAI]";
    const tagColor = s.correct ? "2E7D32" : "C62828";
    paragraphs.push(
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({ text: `${s.label}. `, bold: true, size: 24, color: "4A148C" }),
          new TextRun({ text: `${tag} `, bold: true, size: 24, color: tagColor }),
          new TextRun({ text: s.text, size: 24 }),
        ],
      }),
    );
  }

  // Explanation
  paragraphs.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Giải thích: ", bold: true, size: 22, color: "E65100" }),
        new TextRun({ text: explanation, italics: true, size: 22, color: "616161" }),
      ],
    }),
  );

  // Closing ---
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "---", bold: true, size: 24, color: "9E9E9E" })],
    }),
  );

  return paragraphs;
}

function createRichStemMultiQuestion(
  stemLines: string[],
  statements: { label: string; correct: boolean; text: string }[],
  explanation: string,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      spacing: { before: 100 },
      children: [new TextRun({ text: "---", bold: true, size: 24, color: "9E9E9E" })],
    }),
  );

  stemLines.forEach((line, index) => {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({
            text: line,
            bold: index === 0,
            italics: index === 2,
            size: 24,
            color: index === 2 ? "1565C0" : undefined,
          }),
        ],
      }),
    );
  });

  for (const s of statements) {
    const tag = s.correct ? "[ĐÚNG]" : "[SAI]";
    const tagColor = s.correct ? "2E7D32" : "C62828";
    paragraphs.push(
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({ text: `${s.label}. `, bold: true, size: 24, color: "1565C0" }),
          new TextRun({ text: `${tag} `, bold: true, size: 24, color: tagColor }),
          new TextRun({ text: s.text, size: 24 }),
        ],
      }),
    );
  }

  paragraphs.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Giải thích: ", bold: true, size: 22, color: "E65100" }),
        new TextRun({ text: explanation, italics: true, size: 22, color: "616161" }),
      ],
    }),
  );

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "---", bold: true, size: 24, color: "9E9E9E" })],
    }),
  );

  return paragraphs;
}

function createCauXFormat(
  cauTitle: string,
  contextLines: string[],
  statements: { label: string; correct: boolean; text: string }[],
  explanation: string,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // "Câu X. Title" line
  paragraphs.push(
    new Paragraph({
      spacing: { before: 140, after: 40 },
      children: [
        new TextRun({ text: `Câu ${cauTitle}`, bold: true, size: 26, color: "1A237E" }),
      ],
    }),
  );

  // Context lines
  for (const ctxLine of contextLines) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 30 },
        children: [new TextRun({ text: ctxLine, italics: true, size: 22, color: "424242" })],
      }),
    );
  }

  // a/b/c/d statements
  for (const s of statements) {
    const tag = s.correct ? "[ĐÚNG]" : "[SAI]";
    const tagColor = s.correct ? "2E7D32" : "C62828";
    paragraphs.push(
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({ text: `${s.label}. `, bold: true, size: 24, color: "4A148C" }),
          new TextRun({ text: `${tag} `, bold: true, size: 24, color: tagColor }),
          new TextRun({ text: s.text, size: 24 }),
        ],
      }),
    );
  }

  // Explanation
  paragraphs.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Giải thích: ", bold: true, size: 22, color: "E65100" }),
        new TextRun({ text: explanation, italics: true, size: 22, color: "616161" }),
      ],
    }),
  );

  return paragraphs;
}

function createFormatTable(): Table {
  const headerStyle = { bold: true, size: 22, color: "FFFFFF", font: "Times New Roman" as const };
  const cellStyle = { size: 22, font: "Times New Roman" as const };
  const headerShading = { type: ShadingType.CLEAR, fill: "4A148C" };
  const cellShading = { type: ShadingType.CLEAR, fill: "F3E5F5" };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: headerShading,
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ ...headerStyle, text: "Loại" })] })],
          }),
          new TableCell({
            shading: headerShading,
            width: { size: 40, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ ...headerStyle, text: "Format" })] })],
          }),
          new TableCell({
            shading: headerShading,
            width: { size: 35, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ ...headerStyle, text: "Ví dụ" })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: cellShading,
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "Câu đơn Đúng" })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "[ĐÚNG] mệnh đề | giải thích" })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "[ĐÚNG] H2O là nước. | Công thức phân tử." })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: cellShading,
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "Câu đơn Sai" })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "[SAI] mệnh đề | giải thích" })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "[SAI] NaCl là acid. | NaCl là muối." })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: cellShading,
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "Câu 4 ý" })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "--- (mở)\ncâu hỏi\na. [ĐÚNG/SAI] ...\nb. ...\nc. ...\nd. ...\nGiải thích: ...\n--- (đóng)" })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ ...cellStyle, text: "Xem phần 2 bên dưới" })] })],
          }),
        ],
      }),
    ],
  });
}
