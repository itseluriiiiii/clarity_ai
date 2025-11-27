// Navigation Logic
// No specific JS needed for navigation in MPA mode as we use standard links.


// Analysis Logic
async function analyzeContent() {
    const textInput = document.getElementById('input-text').value;
    const btn = document.getElementById('analyze-btn');
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('btn-loader');
    const resultsArea = document.getElementById('results-area');

    if (!textInput.trim()) {
        alert("Please enter some text to analyze.");
        return;
    }

    // UI Loading State
    btn.disabled = true;
    btnText.classList.add('hidden');
    loader.classList.remove('hidden');
    resultsArea.classList.add('hidden');

    try {
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: textInput })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        renderResults(data);

    } catch (error) {
        console.error("Analysis failed:", error);
        alert("Failed to analyze content. Please check the console or try again.");
    } finally {
        // Reset UI
        btn.disabled = false;
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

function renderResults(data) {
    const resultsArea = document.getElementById('results-area');
    resultsArea.classList.remove('hidden');

    // Score
    const scoreVal = document.getElementById('score-value');
    const scoreCircle = document.getElementById('score-circle');
    scoreVal.innerText = data.misinformation_score;

    // Color coding based on score
    let color = '#10B981'; // Green
    if (data.misinformation_score > 20) color = '#F59E0B'; // Yellow
    if (data.misinformation_score > 50) color = '#E11D48'; // Red

    scoreCircle.style.borderColor = color;
    scoreVal.style.color = color;

    // Metrics
    document.getElementById('metric-emotion').innerText = data.emotional_intensity;
    document.getElementById('metric-credibility').innerText = data.credibility_rating;
    document.getElementById('summary-text').innerText = data.summary;

    // Biases
    const biasList = document.getElementById('bias-list');
    biasList.innerHTML = '';
    if (data.biases && data.biases.length > 0) {
        data.biases.forEach(bias => {
            const li = document.createElement('li');
            li.className = 'bias-item';
            li.innerHTML = `
                <span class="bias-type">${bias.type}</span>
                <p>"${bias.text_snippet}"</p>
                <small>${bias.explanation}</small>
            `;
            biasList.appendChild(li);
        });
    } else {
        biasList.innerHTML = '<li>No significant biases detected.</li>';
    }

    // Recommendations
    const recList = document.getElementById('rec-list');
    recList.innerHTML = '';
    if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.className = 'rec-item';
            li.innerText = rec;
            recList.appendChild(li);
        });
    }
}

// Simple smooth scroll function
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        window.scrollTo({
            top: element.offsetTop - 20, // Small offset from the top
            behavior: 'smooth'
        });
    }
}

// Initialize scroll functionality
document.addEventListener('DOMContentLoaded', () => {
    // Handle click on scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection('dashboard');
        });
    }

    // Handle window scroll event
    window.addEventListener('scroll', function() {
        // This ensures the scroll event isn't being prevented
        console.log('Scrolling...');
    });
});

// Preloader
function initPreloader() {
    const preloader = document.querySelector('.preloader-container');
    if (!preloader) return;

    document.body.classList.add('preloader-active');

    function hidePreloader() {
        if (!preloader) return;

        // Re-enable scrolling immediately to avoid being stuck
        document.body.classList.remove('preloader-active');

        // Small delay for smoother start of transition
        requestAnimationFrame(() => {
            preloader.classList.add('hidden');
        });

        const onTransitionEnd = () => {
            preloader.style.display = 'none';
            preloader.removeEventListener('transitionend', onTransitionEnd);
        };

        preloader.addEventListener('transitionend', onTransitionEnd, { once: true });

        // Fallback in case transitionend fails to fire
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 1200);
    }

    let pageLoaded = false;
    const MIN_LOAD_TIME = 3500;
    const loadStartTime = Date.now();

    function handleLoad() {
        if (pageLoaded) return;
        pageLoaded = true;

        const loadTime = Date.now() - loadStartTime;
        const remainingTime = Math.max(0, MIN_LOAD_TIME - loadTime);

        setTimeout(hidePreloader, remainingTime);
    }

    if (document.readyState === 'complete') {
        setTimeout(handleLoad, 0);
    } else {
        window.addEventListener('load', handleLoad);
    }

    const fallbackTimeout = setTimeout(() => {
        if (!pageLoaded) {
            handleLoad();
        }
    }, MIN_LOAD_TIME + 2000);

    return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(fallbackTimeout);
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloader);
} else {
    initPreloader();
}
