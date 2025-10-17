// public/app.js

// --- Global DOM Selectors ---
const analyzeBtn = document.getElementById('analyzeBtn');
const contentInput = document.getElementById('contentInput');
const urlInput = document.getElementById('urlInput');
const resultBox = document.getElementById('result');
const resultContent = document.getElementById('resultContent');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const textWrapper = document.getElementById('text-input');
const urlWrapper = document.getElementById('url-input');


// --- Utility Functions ---

/**
 * Robustly checks if a string is a valid URL.
 */
function isValidUrl(string) {
    try {
      new URL(string);
      return string.startsWith('http://') || string.startsWith('https://');
    } catch (e) {
      return false;
    }
}

/**
 * Displays an error message in the results area.
 */
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


// --- UX and Animation Logic ---

// Toggle input fields based on mode
modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'text') {
            textWrapper.style.display = 'block';
            urlWrapper.style.display = 'none';
        } else {
            textWrapper.style.display = 'none';
            urlWrapper.style.display = 'block';
        }

        // Clear previous results and trigger mini loader for UX
        resultContent.classList.remove('visible');
        resultContent.innerHTML = '';
        resultBox.classList.add('hidden');
        
        loader.classList.remove('hidden');
        progressBar.classList.remove('hidden');
        
        setTimeout(() => {
            loader.classList.add('hidden');
            progressBar.classList.add('hidden');
            resultBox.classList.remove('hidden');
        }, 400); 
    });
});


// Mock progress bar animation
function startProgress() {
    progressBar.classList.remove('hidden');
    loader.classList.remove('hidden');
    progressBar.querySelector('#progress').style.width = '0%';
    
    // Animation runs up to 90%
    const MOCK_ANIMATION_TIME_MS = 3000; 

    return new Promise(resolve => {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) { 
                clearInterval(interval);
                resolve();
            } else {
                width += 2;
                progressBar.querySelector('#progress').style.width = width + '%';
            }
        }, MOCK_ANIMATION_TIME_MS / 45);
    });
}


// --- Main Analysis Logic ---

analyzeBtn.addEventListener('click', async () => {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    let payload = {};

    // 1. Validation
    if (mode === 'text') {
        const content = contentInput.value.trim();
        if (content.length < 50) return alert('Please enter at least 50 characters of content for a valid audit.');
        payload.content = content;
    } else {
        const url = urlInput.value.trim();
        if (!url) return alert('Please enter a URL first!');
        if (!isValidUrl(url)) return alert('Invalid URL. Please ensure it starts with http:// or https:// and is correctly formatted.');
        payload.url = url;
    }

    // 2. UI State Reset
    resultBox.classList.remove('hidden');
    resultContent.classList.remove('visible');
    resultContent.innerHTML = '';
    analyzeBtn.disabled = true;

    // 3. Start Animation
    await startProgress();

    try {
        // 4. API Call
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        // 5. Handle server errors (non-200 status codes or error in JSON)
        if (!res.ok || data.error) {
            throw { 
                message: data.error || `Server returned status ${res.status}.`, 
                details: data.details || null 
            };
        }

        // 6. Stop Loader
        loader.classList.add('hidden');
        progressBar.classList.add('hidden');

        // 7. Display Results (SUCCESS)
        resultContent.innerHTML = `
            <h2>Analysis Report</h2>
            <div><strong>Version:</strong> ${data.version}</div>
            <div><strong>Keywords:</strong> ${data.keywords.join(', ')}</div>
            <div><strong>Readability:</strong> ${data.readability}%</div>
            <div><strong>Semantic Score:</strong> ${(data.semantic_score * 100).toFixed(1)}%</div>
            <h3>Recommendations:</h3>
            <ul>
                ${data.recommendations.map((r, i) => `<li style="--i:${i}">${r}</li>`).join('')}
            </ul>
        `;

        // Trigger fade-in
        setTimeout(() => resultContent.classList.add('visible'), 50);

    } catch (err) {
        // 8. Error Handling
        const message = err.message || 'An unknown error occurred.';
        const details = err.details || null;
        displayError(message, details);

    } finally {
        // 9. Final UI Cleanup
        analyzeBtn.disabled = false;
    }
});