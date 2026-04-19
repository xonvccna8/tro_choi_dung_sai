import {
  buildAiQuestionSystemPrompt,
  buildAiQuestionUserPrompt,
  getAiQuestionJsonSchema,
} from './aiQuestionGeneratorPrompts.js';

const OPENAI_MODEL = 'gpt-5.4-mini';

function ensureNonEmptyText(value, fallbackMessage) {
  if (!value || !String(value).trim()) {
    throw new Error(fallbackMessage);
  }
  return String(value).trim();
}

function extractMessageContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item?.text === 'string') return item.text;
        return '';
      })
      .join('')
      .trim();
  }
  return '';
}

function normalizeSingleResult(value) {
  return {
    statement: typeof value?.statement === 'string' ? value.statement.trim() : '',
    correct: Boolean(value?.correct),
    explanation: typeof value?.explanation === 'string' ? value.explanation.trim() : '',
  };
}

function normalizeMultiResult(value) {
  const labels = ['a', 'b', 'c', 'd'];
  return {
    question: typeof value?.question === 'string' ? value.question.trim() : '',
    explanation: typeof value?.explanation === 'string' ? value.explanation.trim() : '',
    statements: Array.isArray(value?.statements)
      ? value.statements.slice(0, 4).map((item, index) => ({
          id: item?.id === labels[index] ? item.id : labels[index],
          label: item?.label === `${labels[index]}.` ? item.label : `${labels[index]}.`,
          text: typeof item?.text === 'string' ? item.text.trim() : '',
          correct: Boolean(item?.correct),
        }))
      : [],
  };
}

function validateSingleResult(result) {
  ensureNonEmptyText(result.statement, 'AI tạo ra mệnh đề trống cho câu Đúng/Sai đơn.');
  ensureNonEmptyText(result.explanation, 'AI tạo ra giải thích trống cho câu Đúng/Sai đơn.');
  if (result.statement.length < 12) {
    throw new Error('AI tạo ra mệnh đề quá ngắn cho câu Đúng/Sai đơn.');
  }
}

function validateMultiResult(result) {
  ensureNonEmptyText(result.question, 'AI tạo ra câu dẫn trống cho câu 4 ý.');
  ensureNonEmptyText(result.explanation, 'AI tạo ra giải thích trống cho câu 4 ý.');
  if (!Array.isArray(result.statements) || result.statements.length !== 4) {
    throw new Error('AI không trả về đủ 4 ý a, b, c, d.');
  }

  const ids = result.statements.map((statement) => statement.id);
  const texts = result.statements.map((statement) => ensureNonEmptyText(statement.text, 'AI tạo ra một ý trống trong câu 4 ý.'));
  if (ids.join(',') !== 'a,b,c,d') {
    throw new Error('AI trả về sai thứ tự hoặc sai nhãn a, b, c, d.');
  }

  const distinctTexts = new Set(texts.map((text) => text.toLowerCase()));
  if (distinctTexts.size < 4) {
    throw new Error('AI tạo các ý bị trùng hoặc quá giống nhau trong câu 4 ý.');
  }
}

export async function generateQuestionWithAI(input) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa cấu hình OPENAI_API_KEY trên server nên chưa thể dùng AI tạo câu hỏi.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.05,
      messages: [
        { role: 'system', content: buildAiQuestionSystemPrompt(input.kind) },
        { role: 'user', content: buildAiQuestionUserPrompt(input) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: getAiQuestionJsonSchema(input.kind),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API lỗi ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = extractMessageContent(data?.choices?.[0]?.message?.content);
  if (!content) {
    throw new Error('AI không trả về dữ liệu câu hỏi.');
  }

  const parsed = JSON.parse(content);
  if (input.kind === 'single') {
    const result = normalizeSingleResult(parsed);
    validateSingleResult(result);
    return result;
  }

  const result = normalizeMultiResult(parsed);
  validateMultiResult(result);
  return result;
}
