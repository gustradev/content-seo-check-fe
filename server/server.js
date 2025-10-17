// server/server.js

require('dotenv').config();
const path = require('path');
const express = require('express');
const axios = require('axios');

// FIX: Initialize the Express application instance
const app = express();

// Middleware
app.use(express.json());

// Set up static file serving
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Health check route
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API route: analyze content or URL (mock or proxy)
app.post('/api/analyze', async (req, res) => {
    const { content, url } = req.body;
    
    if (!content && !url) {
        return res.status(400).json({ error: 'Missing content or URL in the request.' });
    }

    const coreUrl = process.env.CORE_ENGINE_URL;
    const isUrlAnalysis = !!url;
    const MOCK_DELAY = 4500; // 4.5 seconds delay

    // --- Production Proxy (V2) ---
    if (coreUrl) {
        try {
            console.log(`📡 Forwarding analysis request to core engine (${isUrlAnalysis ? 'URL' : 'Text'})...`);

            const payload = {
                content: content,
                // Ensure URL is encoded for robustness when passing to backend
                url: url ? encodeURI(url) : undefined 
            };
            
            const resp = await axios.post(coreUrl, payload, { timeout: 30_000 });
            return res.json(resp.data);
            
        } catch (err) {
            console.error('❌ Core engine error:', err.message);
            
            const statusCode = err.response ? err.response.status : 503;
            const statusText = err.response ? err.response.statusText : 'Service Unavailable';

            if (err.code === 'ECONNREFUSED') {
                 return res.status(503).json({ error: 'Core engine is offline or unreachable.', status: 503 });
            }
            if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
                return res.status(504).json({ error: 'Core engine request timed out (30s limit).', status: 504 });
            }
            return res.status(statusCode).json({ 
                error: `Core engine failed (${statusText}).`,
                details: err.response?.data?.message || 'Check server logs for details.'
            });
        }
    }

    // --- Mock fallback analysis (V1) ---
    console.log(`🤖 Running Mock Analysis for ${isUrlAnalysis ? 'URL' : 'Text'} mode.`);

    // 1. Determine text and mock version
    let textToAnalyze = '';
    let mockVersion = 'mock-v1';

    if (isUrlAnalysis) {
        textToAnalyze = `Analysis requested for URL: ${url}. The core engine would scrape and analyze this.`;
        mockVersion = 'mock-v1-url-mode';
    } else {
        textToAnalyze = content;
        mockVersion = 'mock-v1-text-mode';
    }

    // 2. Mock Keyword Extraction
    const keywords = Array.from(
      new Set(
        textToAnalyze
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3)
          .slice(0, 10)
      )
    ).slice(0, 5); 

    // 3. Mock Response Structure (VISUAL DIFFERENCE)
    const response = {
        version: mockVersion,
        keywords: isUrlAnalysis ? [`url-audit`, keywords[0] || 'analysis', url.split('/')[2].replace('www.', '')] : keywords,
        readability: isUrlAnalysis ? 55 : 85, 
        semantic_score: isUrlAnalysis ? 0.52 : 0.88,
        recommendations: isUrlAnalysis ? [
            `https://en.wikipedia.org/wiki/Mode_%28statistics%29 Check server logs for scraping success on: ${url}`,
            `[GEO Tip] Ensure the URL's structure is short and descriptive.`,
            `[SEO Tip] Primary content appears shallow; increase content depth.`,
        ] : [
            `[Text Mode] Optimize your content for a stronger HEO score.`,
            `[SEO Tip] Use LSI keywords (e.g., semantic analysis) more frequently.`,
            `[GEO Tip] Improve the clarity of introductory paragraphs.`,
        ]
    };

    // Simulate the necessary delay for the client-side progress bar
    setTimeout(() => {
        res.json(response);
    }, MOCK_DELAY);

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