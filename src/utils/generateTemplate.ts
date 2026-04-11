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
                text: "MẪU SOẠN CÂU HỎI ĐÚNG/SAI – HÓA HỌC 12",
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
                text: "Trò Chơi Đúng Sai – Ôn tập Hóa học hiệu quả",
                italics: true,
                size: 24,
                color: "7B1FA2",
              }),
            ],
          }),

          // ═══ HƯỚNG DẪN SỬ DỤNG ═══
          createSectionHeader("📌 HƯỚNG DẪN SỬ DỤNG"),
          createBullet("Soạn câu hỏi theo đúng format bên dưới."),
          createBullet("Lưu file giữ nguyên định dạng .docx (Word)."),
          createBullet("Tải file lên trang Tạo Câu Hỏi → hệ thống tự nhận dạng."),
          createBullet("Mỗi dòng bắt đầu bằng [ĐÚNG] hoặc [SAI] sẽ được nhận dạng tự động."),
          createBullet("Câu 4 ý phải nằm giữa 2 dòng gạch ngang: ---"),
          emptyLine(),

          // ═══ BẢNG QUY ƯỚC FORMAT ═══
          createSectionHeader("📋 QUY ƯỚC FORMAT"),
          createFormatTable(),
          emptyLine(),

          // ═══ CÔNG THỨC HÓA HỌC ═══
          createSectionHeader("🧪 CÁCH GÕ CÔNG THỨC HÓA HỌC"),
          createBullet("Chỉ số dưới: gõ bình thường → H2SO4, C6H12O6 (hệ thống tự chuyển)"),
          createBullet("Chỉ số trên (ion): dùng ^{...} → Fe^{2+}, SO4^{2-}, Cu^{2+}"),
          createBullet("Mũi tên phản ứng: dùng -> (thuận) hoặc <-> (thuận nghịch)"),
          createBullet("Nhiệt độ: (delta) → Δ  |  (deg) → °  |  (xt) → xúc tác"),
          emptyLine(),

          // ═══ MẸO SOẠN CÂU HỎI CHẤT LƯỢNG ═══
          createSectionHeader("💡 MẸO SOẠN CÂU HỎI CHẤT LƯỢNG"),
          createNumberedItem("1", "Mỗi ý chỉ chứa MỘT nội dung kiến thức, tránh ghép 2 ý vào 1."),
          createNumberedItem("2", "Câu SAI nên sai ở điểm tinh tế, tránh sai quá rõ ràng."),
          createNumberedItem("3", "Dùng từ khóa bẫy: 'chỉ', 'luôn luôn', 'tất cả', 'duy nhất', 'không bao giờ'."),
          createNumberedItem("4", "Nên có 2 ý Đúng + 2 ý Sai trong mỗi câu 4 ý (cân bằng)."),
          createNumberedItem("5", "Luôn viết Giải thích để học sinh hiểu khi ôn sai."),
          createNumberedItem("6", "Bám sát SGK Hóa 12 và đề thi tham khảo Bộ GD&ĐT."),
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
          createNote("Mỗi câu nằm giữa 2 dòng --- | Có đúng 4 ý a, b, c, d"),
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
