/**
 * app.js — Main Page Logic
 * --------------------------
 * Handles the URL shortening form:
 *  - Validates user input on the client side
 *  - Sends POST request to /api/url/shorten
 *  - Displays the resulting short URL with a copy button
 */

// ---- DOM Element References ----
const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const errorMsg = document.getElementById('errorMsg');
const resultCard = document.getElementById('resultCard');
const shortUrlLink = document.getElementById('shortUrlLink');
const originalUrlDisplay = document.getElementById('originalUrlDisplay');
const copyBtn = document.getElementById('copyBtn');
const copyIcon = document.getElementById('copyIcon');
const shortenBtn = document.getElementById('shortenBtn');

/**
 * Basic client-side URL validation.
 * Checks if the input begins with http:// or https:// and has a valid structure.
 * @param {string} str - The URL string to validate
 * @returns {boolean} Whether the string looks like a valid URL
 */
function isValidUrl(str) {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Show an error message below the input field.
 * @param {string} message - Error text to display
 */
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('visible');
    urlInput.classList.add('input-error');
}

/** Clear any visible error messages. */
function clearError() {
    errorMsg.textContent = '';
    errorMsg.classList.remove('visible');
    urlInput.classList.remove('input-error');
}

/**
 * Display the result card with the shortened URL.
 * @param {object} data - API response data containing shortUrl and originalUrl
 */
function showResult(data) {
    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = data.shortUrl;
    originalUrlDisplay.textContent = data.originalUrl;
    resultCard.classList.remove('hidden');
    resultCard.classList.add('show');
}

// ---- Form Submit Handler ----
urlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const url = urlInput.value.trim();

    // Client-side validation
    if (!url) {
        showError('Please enter a URL.');
        return;
    }
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL starting with http:// or https://');
        return;
    }

    // Set loading state on button
    const btnText = shortenBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = 'Shortening...';
    shortenBtn.disabled = true;

    try {
        // Send the URL to the API
        const response = await fetch('/api/url/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            showError(result.error || 'Something went wrong. Please try again.');
            return;
        }

        // Display the result
        showResult(result.data);
        urlInput.value = '';
    } catch (err) {
        console.error('Fetch error:', err);
        showError('Network error. Please check your connection and try again.');
    } finally {
        // Reset button state
        btnText.textContent = originalText;
        shortenBtn.disabled = false;
    }
});

// ---- Copy to Clipboard Handler ----
copyBtn.addEventListener('click', async () => {
    const shortUrl = shortUrlLink.textContent;

    try {
        await navigator.clipboard.writeText(shortUrl);
        copyIcon.textContent = '✅';
        setTimeout(() => {
            copyIcon.textContent = '📋';
        }, 2000);
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shortUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyIcon.textContent = '✅';
        setTimeout(() => {
            copyIcon.textContent = '📋';
        }, 2000);
    }
});

// ---- Clear errors when user starts typing ----
urlInput.addEventListener('input', clearError);
