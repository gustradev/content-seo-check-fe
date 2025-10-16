// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const axios = require('axios');

const app = express();

// Middleware
app.use(express.json());

// server/server.js
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));


// Health check route
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API route: analyze content (mock or proxy)
app.post('/api/analyze', async (req, res) => {
  const content = req.body.content || '';
  const coreUrl = process.env.CORE_ENGINE_URL;

  if (coreUrl) {
    try {
      const resp = await axios.post(coreUrl, { content }, { timeout: 30_000 });
      return res.json(resp.data);
    } catch (err) {
      console.error('❌ Core engine error:', err.message);
      return res.status(502).json({ error: 'Core engine request failed' });
    }
  }

  // --- Mock fallback analysis ---
  const keywords = Array.from(
    new Set(
      content
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 10)
    )
  );

  const response = {
    version: 'mock-v1',
    keywords,
    readability: 75,
    semantic_score: 0.72,
    recommendations: [
      'Add a clear H1 heading',
      'Use the primary keyword in the first 100 words',
      'Add internal links to cornerstone content'
    ]
  };

  res.json(response);
});

// fallback for SPA routes
app.use((req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 content-seo-check-fe running at http://localhost:${PORT}`);
});
