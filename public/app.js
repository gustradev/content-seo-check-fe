// public/app.js

// --- Global DOM Selectors ---
const analyzeBtn = document.getElementById('analyzeBtn');
const contentInput = document.getElementById('contentInput');
const urlInput = document.getElementById('urlInput');
const resultBox = document.getElementById('result');
const resultContent = document.getElementById('resultContent');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const progressBarInner = document.getElementById('progress'); // inner div for width
const modeRadios = document.querySelectorAll('input[name="mode"]');
const textWrapper = document.getElementById('text-input');
const urlWrapper = document.getElementById('url-input');

// --- Utility Functions ---
function isValidUrl(string) {
    try {
        new URL(string);
        return string.startsWith('http://') || string.startsWith('https://');
    } catch (e) {
        return false;
    }
}

function displayError(message, details) {
    resultContent.innerHTML = `
        <div style="color:var(--text); background:#fef2f2; border:1px solid #fee2e2; padding:15px; border-radius:0.75rem;">
            <p style="font-weight:600; color:#dc2626;">❌ Analysis Failed: ${message}</p>
            ${details ? `<p style="margin-top:8px; font-size:0.9em; color:#ef4444;">Details: ${details}</p>` : ''}
        </div>
    `;
    resultBox.classList.remove('hidden');
    resultContent.classList.add('visible');
    loader.classList.add('hidden');
    progressBar.classList.add('hidden');
}

// --- Mode Toggle ---
modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        textWrapper.style.display = radio.value === 'text' ? 'block' : 'none';
        urlWrapper.style.display = radio.value === 'url' ? 'block' : 'none';
        resultContent.classList.remove('visible');
        resultContent.innerHTML = '';
        resultBox.classList.add('hidden');
    });
});

// --- Progress Animation (CSP-safe) ---
function startProgress() {
    progressBar.classList.remove('hidden');
    loader.classList.remove('hidden');
    progressBarInner.style.width = '0%';

    return new Promise(resolve => {
        let width = 0;
        const step = 2;
        const intervalMs = 3000 / 45;
        const intervalId = setInterval(() => {
            if (width >= 90) {
                clearInterval(intervalId);
                resolve();
            } else {
                width += step;
                progressBarInner.style.width = width + '%';
            }
        }, intervalMs);
    });
}

// --- Main Analysis ---
analyzeBtn.addEventListener('click', async () => {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    let payload = {};

    if (mode === 'text') {
        const content = contentInput.value.trim();
        if (content.length < 50) return alert('Please enter at least 50 characters of content for a valid audit.');
        payload.content = content;
    } else {
        const url = urlInput.value.trim();
        if (!url) return alert('Please enter a URL first!');
        if (!isValidUrl(url)) return alert('Invalid URL. Ensure it starts with http:// or https://');
        payload.url = url;
    }

    resultBox.classList.remove('hidden');
    resultContent.classList.remove('visible');
    resultContent.innerHTML = '';
    analyzeBtn.disabled = true;

    await startProgress();

    try {
        const res = await fetch('https://web-production-ecfc0.up.railway.app/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Parse JSON safely
        const data = await res.json();

        if (!res.ok || data.error) {
            throw { 
                message: data.error || `Server returned status ${res.status}.`, 
                details: data.details || null 
            };
        }

        loader.classList.add('hidden');
        progressBar.classList.add('hidden');

        // --- Build Result Table with Coloring ---
        resultContent.innerHTML = `
            <h2>Analysis Report</h2>
            <div class="report-meta">
                <div><strong>Version:</strong> ${data.version ?? 'N/A'}</div>
                <div><strong>Mode:</strong> ${data.mode ?? 'N/A'}</div>
                <div><strong>Factors Analyzed:</strong> ${data.factors_analyzed ?? 0}</div>
                <div><strong>Readability:</strong> ${data.readability ?? 'N/A'}%</div>
                <div><strong>Semantic Score:</strong> ${data.semantic_score ?? 'N/A'}%</div>
            </div>

            <h3 style="margin-top:20px;">Detailed Results:</h3>
            <table class="result-table">
                <thead>
                    <tr>
                        <th>Factor</th>
                        <th>Value</th>
                        <th>Suggested</th>
                        <th>Score</th>
                        <th>Suggestion</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.results.map(r => {
                        let deviation = r.suggestion_value && !isNaN(r.suggestion_value) ? Math.abs(r.value - r.suggestion_value) / r.suggestion_value : 0;
                        let rowColor = deviation <= 0.05 ? '#d1fae5' // green
                                     : deviation <= 0.2 ? '#fef9c3' // yellow
                                     : '#fee2e2'; // red

                        let suggestionText = r.suggestion ?? '';

                        return `
                            <tr style="background-color:${rowColor};">
                                <td>${r.factor ?? ''}</td>
                                <td>${r.value ?? 0}</td>
                                <td>${r.suggestion_value ?? 'N/A'}</td>
                                <td>${r.score ?? 0}</td>
                                <td>${suggestionText}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        setTimeout(() => resultContent.classList.add('visible'), 50);

    } catch (err) {
        displayError(err.message || 'An unknown error occurred.', err.details || null);
    } finally {
        analyzeBtn.disabled = false;
    }
});
