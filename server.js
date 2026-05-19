const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/parse', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'No text provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const system = `You parse raw Facebook copy-paste data and return ONLY a valid JSON array. No preamble, no markdown fences, no backticks.

The paste contains markdown-style embedded links:
  [Author Name](https://www.facebook.com/groups/GROUP_ID/user/USER_ID/?params...)
  [timestamp link](https://www.facebook.com/groups/GROUP_ID/posts/POST_ID/ or /search/...)

Extraction rules:
1. "Type": "POST" or "COMMENT"
2. "Date": readable date/time if present, else ""
3. "Author name": text inside the FIRST markdown link bracket e.g. [Chris Garza](...) → "Chris Garza"
4. "Author Profile URL": clean base URL from first markdown link including user ID only: https://www.facebook.com/groups/GROUP/user/USERID/ — strip ALL query params. If no markdown link, extract from raw facebook.com/groups/.../user/USERID URL.
5. "Content": ONLY the actual post text verbatim. Exclude markdown link syntax, URLs, repeated "Facebook" words, garbled timestamp strings, bullet separators.
6. "Post Link": if any URL contains /posts/POST_ID/ extract as https://www.facebook.com/groups/GROUP/posts/POST_ID/ strip query params, else ""
7. "AI Summary Notes": 1-2 sentence neutral summary of the post content.

Extract ALL posts found. Return ONLY the JSON array.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: text }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });

    const raw = (data.content || []).map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();

    try {
      const posts = JSON.parse(clean);
      return res.json({ posts });
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: clean.slice(0, 300) });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
