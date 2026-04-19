function uniqueNonEmpty(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function stripDiacritics(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extractTopicFallback(value) {
  const normalized = stripDiacritics(String(value || '').toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(tim|bai|tap|dung|sai|cho|phan|ve|noi|dung|cau|hoi|hoa|hoc|thpt|mon|chu|de|giup|nhe|nha|voi|phan|phat|bieu)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return '';

  const tokens = normalized.split(' ');
  return tokens.slice(-4).join(' ');
}

async function runGoogleSearch(googleApiKey, cx, query) {
  const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`;
  const googleRes = await fetch(googleUrl);
  if (!googleRes.ok) {
    const errText = await googleRes.text();
    throw new Error(`Google API lỗi: ${googleRes.status} ${errText}`);
  }

  const googleData = await googleRes.json();
  const rawItems = (googleData.items || []).map((item, idx) => ({
    index: idx + 1,
    title: item.title,
    snippet: item.snippet,
    link: item.link,
  }));

  return {
    rawItems,
    correctedQuery: typeof googleData.spelling?.correctedQuery === 'string' ? googleData.spelling.correctedQuery.trim() : '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm.' });
  }

  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!googleApiKey || !cx) {
    return res.status(500).json({ error: 'Chưa cấu hình Google Search API trên server.' });
  }
  if (!openaiKey) {
    return res.status(500).json({ error: 'Chưa cấu hình OPENAI_API_KEY trên server.' });
  }

  // Dùng GPT làm sạch query trước khi gọi Google
  let cleanQuery = String(q).trim();
  try {
    const cleanRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 30,
        messages: [
          { role: 'system', content: 'Trích xuất TÊN CHỦ ĐỀ NGẮN GỌN (Ví dụ: "Hóa hữu cơ", "Giải tích", "Tích phân", 1-4 từ) từ câu sau. Chỉ trả về tên chủ đề, không giải thích.' },
          { role: 'user', content: cleanQuery },
        ],
      }),
    });
    if (cleanRes.ok) {
      const d = await cleanRes.json();
      cleanQuery = d.choices[0].message.content.trim().replace(/["""]/g, '');
    }
  } catch (_) {}

  const fallbackTopic = extractTopicFallback(q);
  const candidateQueries = uniqueNonEmpty([
    `bài tập ${cleanQuery} đúng sai`,
    `bài tập ${fallbackTopic} đúng sai`,
    `câu hỏi đúng sai ${cleanQuery}`,
    `câu hỏi đúng sai ${fallbackTopic}`,
    String(q).trim(),
  ]);

  // Step 1: Google Search with retry/fallback
  let rawItems = [];
  try {
    let correctedCandidates = [];

    for (const candidateQuery of candidateQueries) {
      const result = await runGoogleSearch(googleApiKey, cx, candidateQuery);
      if (result.rawItems.length > 0) {
        rawItems = result.rawItems;
        break;
      }
      if (result.correctedQuery) {
        correctedCandidates.push(result.correctedQuery);
      }
    }

    if (rawItems.length === 0) {
      for (const correctedQuery of uniqueNonEmpty(correctedCandidates)) {
        const result = await runGoogleSearch(googleApiKey, cx, correctedQuery);
        if (result.rawItems.length > 0) {
          rawItems = result.rawItems;
          break;
        }
      }
    }
  } catch (err) {
    return res.status(500).json({ error: `Lỗi kết nối Google: ${err.message}` });
  }

  if (rawItems.length === 0) {
    return res.status(200).json({ items: [] });
  }

  // Step 2: GPT curation
  const itemsText = rawItems
    .map((item) => `[${item.index}] ${item.title}\n${item.snippet}\nURL: ${item.link}`)
    .join('\n\n');

  const systemPrompt = `Bạn là trợ lý chọn lọc nguồn bài tập giáo dục.
Nhiệm vụ: Từ danh sách kết quả tìm kiếm, hãy chọn tối đa 4 kết quả HỮU ÍCH NHẤT để giáo viên tạo câu hỏi Đúng/Sai (Đặc biệt là thi THPT môn Hóa học, Toán học).
Tiêu chí chọn:
- Có nội dung bài tập thực sự (không chỉ là quảng cáo, trang mục lục, hoặc nội dung chung chung)
- Phù hợp chương trình THPT Việt Nam
- Snippet có đủ thông tin để giáo viên tham khảo
Với mỗi kết quả được chọn, viết 1 câu ghi chú ngắn bằng tiếng Việt giải thích vì sao hữu ích.
Trả về JSON với format: { "selected": [ { "index": number, "note": string } ] }`;

  let curatedIndices;
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Từ khóa tìm kiếm: "${String(q).trim()}"\n\nDanh sách kết quả:\n${itemsText}` },
        ],
      }),
    });

    if (!openaiRes.ok) {
      // GPT failed — fallback to top 4 raw results without notes
      curatedIndices = rawItems.slice(0, 4).map((item) => ({ index: item.index, note: '' }));
    } else {
      const openaiData = await openaiRes.json();
      const parsed = JSON.parse(openaiData.choices[0].message.content);
      curatedIndices = Array.isArray(parsed.selected) ? parsed.selected : [];
    }
  } catch (_err) {
    curatedIndices = rawItems.slice(0, 4).map((item) => ({ index: item.index, note: '' }));
  }

  // Step 3: Build final result
  const indexMap = Object.fromEntries(rawItems.map((item) => [item.index, item]));
  const finalItems = curatedIndices
    .filter((c) => indexMap[c.index])
    .map((c) => ({
      title: indexMap[c.index].title,
      snippet: indexMap[c.index].snippet,
      link: indexMap[c.index].link,
      note: c.note || '',
    }));

  return res.status(200).json({ items: finalItems });
}
