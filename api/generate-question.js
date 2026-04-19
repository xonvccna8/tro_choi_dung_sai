import { generateQuestionWithAI } from '../server/aiQuestionGeneratorService.js';

async function fetchGoogleContext(prompt) {
  try {
    const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;
    if (!googleApiKey || !cx) return '';

    const query = `bài tập đúng sai môn học THPT ${prompt}`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=5`;
    const res = await fetch(url);
    if (!res.ok) return '';

    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) return '';

    // Lấy 3 snippet đầu làm ngữ cảnh bổ sung cho GPT
    return items
      .slice(0, 3)
      .map((item) => `- ${item.title}: ${item.snippet}`)
      .join('\n');
  } catch (_err) {
    return '';
  }
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.send(JSON.stringify(payload));
}

function normalizeInput(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('Payload không hợp lệ.');
  }

  const kind = body.kind === 'multi' ? 'multi' : body.kind === 'single' ? 'single' : null;
  if (!kind) {
    throw new Error('Thiếu loại câu hỏi AI cần tạo.');
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    throw new Error('Vui lòng nhập prompt cho AI.');
  }

  if (kind === 'single') {
    return { kind, prompt };
  }

  const statementPrompts = Array.isArray(body.statementPrompts)
    ? body.statementPrompts.map((value) => (typeof value === 'string' ? value.trim() : ''))
    : [];

  if (statementPrompts.length !== 4 || statementPrompts.some((value) => !value)) {
    throw new Error('Vui lòng nhập đủ 4 yêu cầu cho các ý a, b, c, d.');
  }

  return { kind, prompt, statementPrompts };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method không được hỗ trợ.' });
      return;
    }

    const rawBody = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
    const input = normalizeInput(rawBody);

    // Tích hợp Google Search ngầm: tìm bài tập liên quan rồi bổ sung vào prompt
    const googleContext = await fetchGoogleContext(input.prompt);
    if (googleContext) {
      const enrichedPrompt = `${input.prompt}\n\nTham khảo các bài tập thực tế từ Google:\n${googleContext}`;
      input.prompt = enrichedPrompt;
    }

    const result = await generateQuestionWithAI(input);
    sendJson(res, 200, { result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo câu hỏi bằng AI.';
    sendJson(res, 500, { error: message });
  }
}
