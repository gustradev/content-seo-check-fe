const analyzeBtn = document.getElementById('analyzeBtn');
const contentInput = document.getElementById('contentInput');
const resultBox = document.getElementById('result');
const resultContent = document.getElementById('resultContent');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');

analyzeBtn.addEventListener('click', async () => {
    const content = contentInput.value.trim();
    if (!content) return alert('Please paste some content first!');

    // UI: show loading
    resultBox.classList.remove('hidden');
    resultContent.innerHTML = '';
    loader.classList.remove('hidden');
    progressBar.classList.remove('hidden');

    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        const data = await res.json();

        // Stop loading
        loader.classList.add('hidden');
        progressBar.classList.add('hidden');

        // Display results
        // Stop loading
        loader.classList.add('hidden');
        progressBar.classList.add('hidden');

        // Display results with animation
        resultContent.innerHTML = `
  <h2>Analysis Result</h2>
  <div><strong>Version:</strong> ${data.version}</div>
  <div><strong>Keywords:</strong> ${data.keywords.join(', ')}</div>
  <div><strong>Readability:</strong> ${data.readability}%</div>
  <div><strong>Semantic Score:</strong> ${(data.semantic_score * 100).toFixed(1)}%</div>
  <h3>Recommendations:</h3>
  <ul>
    ${data.recommendations
                .map((r, i) => `<li style="--i:${i}">${r}</li>`)
                .join('')}
  </ul>
`;

        // Trigger fade-in
        setTimeout(() => resultContent.classList.add('visible'), 50);

    } catch (err) {
        loader.classList.add('hidden');
        progressBar.classList.add('hidden');
        resultContent.innerHTML = `<p style="color:red;">❌ Error analyzing content. Please try again.</p>`;
        console.error(err);
    }
});
