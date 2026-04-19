const SINGLE_EXAMPLE = {
  statement: 'Ethanol phản ứng với sodium giải phóng khí hydrogen.',
  correct: true,
  explanation: 'Nhóm -OH của ethanol phản ứng với sodium: 2C2H5OH + 2Na -> 2C2H5ONa + H2^{↑}.',
};

const MULTI_EXAMPLE = {
  question: 'Cho các nhận định sau về ester và chất béo:',
  statements: [
    { id: 'a', label: 'a.', text: 'Methyl acetate có công thức CH3COOCH3.', correct: true },
    { id: 'b', label: 'b.', text: 'Mọi chất béo đều tan tốt trong nước.', correct: false },
    { id: 'c', label: 'c.', text: 'Phản ứng xà phòng hóa chất béo trong kiềm tạo glycerol và muối của acid béo. Giới hạn của hàm số x tiến tới vô cực là 0.', correct: true },
    { id: 'd', label: 'd.', text: 'Triolein là chất béo không no.', correct: true },
  ],
  explanation: 'Chất béo không tan trong nước; triolein chứa acid oleic là acid không no (CH3(CH2)7CH=CH(CH2)7COOH).',
};

export function buildAiQuestionSystemPrompt(kind) {
  const sharedRules = [
    'Bạn là trợ lý tạo câu hỏi Đúng/Sai môn Hóa học và Toán học THPT bằng tiếng Việt.',
    'QUY TẮC BẮT BUỘC về tên chất (nếu là môn Hóa): Tên đơn chất và hợp chất hóa học PHẢI dùng tên tiếng Anh (IUPAC hoặc tên thông dụng tiếng Anh), ví dụ: sodium, potassium, iron, copper, sulfuric acid, hydrochloric acid, sodium hydroxide, ethanol, glucose, sucrose, benzene, methane, ammonia, chlorine, oxygen, hydrogen... KHÔNG dùng tên tiếng Việt của chất (không dùng natri, kali, sắt, đồng, axit sulfuric, axit clohidric, xút, ancol etylic, đường glucozơ...). Phần còn lại của câu (động từ, tính từ, mô tả hiện tượng, giải thích, câu dẫn) vẫn viết bằng tiếng Việt.',
    'Nếu là môn Toán, sử dụng ký hiệu toán học quy chuẩn bằng LaTeX / KaTeX bằng cặp dấu $. Ví dụ: $x^2 + y^2 = r^2$.',
    'Ưu tiên độ chính xác học thuật hơn độ sáng tạo.',
    'Ưu tiên kiến thức chuẩn chương trình THPT và cách diễn đạt gần đề kiểm tra, đề thi.',
    'Chỉ tạo nội dung có thể kiểm chứng rõ ràng, không suy đoán, không mơ hồ.',
    'Không tạo phát biểu phụ thuộc vào điều kiện ẩn, dữ kiện thiếu hoặc tranh cãi học thuật.',
    'Chỉ dùng số liệu, điều kiện, hiện tượng khi chúng là kiến thức phổ thông chuẩn hoặc đã được nêu trong prompt.',
    'Nếu prompt người dùng có chỗ chưa rõ, hãy chọn cách diễn đạt an toàn, chuẩn sách giáo khoa.',
    'Tránh dùng các từ làm mệnh đề khó chấm như: thường thường, có thể đúng trong vài trường hợp, gần như luôn, hầu như.',
    'Câu sai phải sai tinh tế nhưng dứt khoát là sai.',
    'Mỗi mệnh đề phải có đúng một giá trị chân lý rõ ràng: đúng hoặc sai.',
    'Giải thích phải nêu đúng bản chất hóa học / toán học, ngắn gọn nhưng đủ để giáo viên kiểm tra nhanh.',
    'Tự kiểm tra lại từng phát biểu trước khi trả lời; nếu thấy chưa chắc, hãy đổi sang phát biểu an toàn hơn.',
    'Không đưa markdown code fence.',
    'Luôn trả về JSON hợp lệ theo schema.',
    'Nếu có công thức hóa học hay toán, dùng văn bản thuần tương thích KaTeX hoặc RichContent.',
    'QUY TẮC VIẾT CÔNG THỨC BẮT BUỘC:',
    '  • Công thức phân tử: viết liền không dấu cách, số là chỉ số dưới tự động (H2O, Ca(OH)2, H2SO4, NaCl).',
    '  • Mũi tên phản ứng một chiều: dùng -> (không dùng →, ⟶)',
    '  • Mũi tên thuận nghịch: dùng <-> (không dùng ⇌)',
    '  • Ion điện tích: dùng ^{2+} ^{+} ^{-} ^{2-} (ví dụ: Ca^{2+}, Cl^{-}, SO4^{2-})',
    '  • Phương trình cân bằng: ví dụ 2Cl^{-} -> Cl2 + 2e^{-}',
    '  • Nếu cần KaTeX phức tạp: bọc trong $...$, ví dụ $\\Delta H = -890 kJ/mol$',
    '  • KHÔNG viết mũi tên Unicode (→ ⇌ ⟶), KHÔNG viết chỉ số dưới Unicode (₂ ₃)',
  ];

  if (kind === 'single') {
    return [
      ...sharedRules,
      'Nhiệm vụ: tạo đúng 1 mệnh đề Đúng/Sai đơn và 1 lời giải thích ngắn.',
      'Mệnh đề phải tự đủ nghĩa để học sinh chọn Đúng hoặc Sai.',
      'Ưu tiên một phát biểu ngắn, gãy gọn, không gộp nhiều ý nhỏ trong cùng một câu.',
      'Đáp án correct phải khớp tuyệt đối với tính đúng sai của statement.',
      `Ví dụ chuẩn: ${JSON.stringify(SINGLE_EXAMPLE)}`,
    ].join('\n');
  }

  return [
    ...sharedRules,
    'Nhiệm vụ: tạo 1 câu hỏi dạng 4 ý a, b, c, d để học sinh chọn đúng/sai từng ý.',
    'Câu hỏi mở đầu phải dẫn vào đúng nội dung chung.',
    'Phải tạo đủ 4 ý a, b, c, d.',
    'Mỗi ý phải bám sát yêu cầu riêng của người dùng cho ý đó.',
    'Ưu tiên cân bằng 2 ý đúng và 2 ý sai nếu vẫn giữ được độ chính xác cao.',
    'Không để 4 ý trùng ý nghĩa nhau hoặc chỉ khác vài từ không đáng kể.',
    'Mỗi ý nên kiểm tra một điểm kiến thức riêng.',
    'Mỗi cờ correct phải khớp tuyệt đối với nội dung text của ý tương ứng.',
    'Lời giải thích chung cần nêu ngắn gọn các điểm mấu chốt giúp học sinh tự soát lỗi.',
    `Ví dụ chuẩn: ${JSON.stringify(MULTI_EXAMPLE)}`,
  ].join('\n');
}

export function buildAiQuestionUserPrompt(input) {
  if (input.kind === 'single') {
    return [
      'Hãy tạo 1 câu Đúng/Sai đơn theo yêu cầu sau.',
      `Yêu cầu người dùng: ${input.prompt.trim()}`,
      'Nếu prompt quá rộng, hãy tự thu hẹp về một ý kiến thức rõ ràng và phổ thông để đảm bảo độ chính xác.',
      'Trả về:',
      '- statement: mệnh đề hoàn chỉnh',
      '- correct: true nếu đáp án đúng là Đúng, false nếu đáp án đúng là Sai',
      '- explanation: giải thích ngắn, chính xác',
    ].join('\n');
  }

  const statementLines = input.statementPrompts
    .map((prompt, index) => `${['a', 'b', 'c', 'd'][index]}. ${prompt.trim()}`)
    .join('\n');

  return [
    'Hãy tạo 1 câu 4 ý Đúng/Sai theo yêu cầu sau.',
    `Nội dung chung: ${input.prompt.trim()}`,
    'Yêu cầu riêng cho từng ý:',
    statementLines,
    'Hãy làm cho mỗi ý bám sát đúng yêu cầu riêng của nó, không bỏ sót ý nào.',
    'Nếu một yêu cầu riêng chưa rõ, hãy diễn đạt lại thành một phát biểu phổ thông, dễ chấm đúng/sai.',
    'Trả về:',
    '- question: câu dẫn chung hoàn chỉnh',
    '- statements: 4 ý a,b,c,d đúng theo yêu cầu riêng',
    '- explanation: giải thích chung ngắn gọn',
  ].join('\n');
}

export function getAiQuestionJsonSchema(kind) {
  if (kind === 'single') {
    return {
      name: 'single_true_false_question',
      strict: true,
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['statement', 'correct', 'explanation'],
        properties: {
          statement: { type: 'string' },
          correct: { type: 'boolean' },
          explanation: { type: 'string' },
        },
      },
    };
  }

  return {
    name: 'multi_true_false_question',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['question', 'statements', 'explanation'],
      properties: {
        question: { type: 'string' },
        explanation: { type: 'string' },
        statements: {
          type: 'array',
          minItems: 4,
          maxItems: 4,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'label', 'text', 'correct'],
            properties: {
              id: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
              label: { type: 'string', enum: ['a.', 'b.', 'c.', 'd.'] },
              text: { type: 'string' },
              correct: { type: 'boolean' },
            },
          },
        },
      },
    },
  };
}
