export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm.' });
  }

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    return res.status(500).json({ error: 'Chưa cấu hình Google Search API trên server.' });
  }

  const query = `bài tập đúng sai THPT ${String(q).trim()}`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=8`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `Google API lỗi: ${response.status}`, detail: errText });
    }

    const data = await response.json();
    const items = (data.items || []).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    }));

    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ error: `Lỗi kết nối Google Search: ${err.message}` });
  }
}
