/**
 * dashboard.js — Dashboard Page Logic
 * --------------------------------------
 * Fetches all stored URLs from the API and renders them
 * in the analytics table. Also calculates summary stats.
 */

// ---- DOM Element References ----
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const tableWrapper = document.getElementById('tableWrapper');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinksEl = document.getElementById('totalLinks');
const totalClicksEl = document.getElementById('totalClicks');

/**
 * Truncate a long URL for display purposes.
 * @param {string} url - Full URL string
 * @param {number} maxLen - Maximum character length
 * @returns {string} Truncated URL with ellipsis if needed
 */
function truncateUrl(url, maxLen = 50) {
    if (url.length <= maxLen) return url;
    return url.substring(0, maxLen) + '...';
}

/**
 * Format a date string into a human-readable format.
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date like "Mar 9, 2026"
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Animate a number counting up from 0 to the target value.
 * @param {HTMLElement} el - Element to update
 * @param {number} target - Target number
 */
function animateCount(el, target) {
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = current.toLocaleString();
    }, 30);
}

/**
 * Fetch all URLs from the API and render the dashboard.
 */
async function loadDashboard() {
    try {
        const response = await fetch('/api/url/all');
        const result = await response.json();

        // Hide loading spinner
        loadingState.classList.add('hidden');

        if (!result.success || !result.data || result.data.length === 0) {
            // Show empty state if no URLs exist
            emptyState.classList.remove('hidden');
            return;
        }

        const urls = result.data;

        // ---- Update Summary Stats ----
        const totalClicksValue = urls.reduce((sum, url) => sum + url.clicks, 0);
        animateCount(totalLinksEl, urls.length);
        animateCount(totalClicksEl, totalClicksValue);

        // ---- Render Table Rows ----
        linksTableBody.innerHTML = '';

        urls.forEach((url, index) => {
            const row = document.createElement('tr');
            row.style.animationDelay = `${index * 0.05}s`;
            row.classList.add('fade-in-row');

            row.innerHTML = `
        <td class="row-number">${index + 1}</td>
        <td class="original-url-cell" title="${url.originalUrl}">
          <a href="${url.originalUrl}" target="_blank" rel="noopener noreferrer">
            ${truncateUrl(url.originalUrl)}
          </a>
        </td>
        <td class="short-url-cell">
          <a href="${url.shortUrl}" target="_blank" rel="noopener noreferrer">
            ${url.shortUrl}
          </a>
        </td>
        <td class="clicks-cell">
          <span class="click-badge">${url.clicks.toLocaleString()}</span>
        </td>
        <td class="date-cell">${formatDate(url.createdAt)}</td>
        <td class="actions-cell">
          <button class="action-btn edit-btn" onclick="editLink('${url.id}', this)" title="Edit URL">✏️</button>
          <button class="action-btn delete-btn" onclick="deleteLink('${url.id}')" title="Delete Link">🗑️</button>
        </td>
      `;

            linksTableBody.appendChild(row);
        });

        // Show the table
        tableWrapper.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        loadingState.innerHTML = `
      <div class="empty-icon">⚠️</div>
      <h3>Failed to load data</h3>
      <p>Please check your connection and <a href="/dashboard.html">try again</a>.</p>
    `;
    }
}

/**
 * Delete a link after confirmation.
 * @param {string} id - Database ID of the link
 */
async function deleteLink(id) {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
        const response = await fetch(`/api/url/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            loadDashboard(); // Refresh the table
        } else {
            alert(result.error || 'Failed to delete link.');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Network error while deleting.');
    }
}

/**
 * Toggle edit mode for a row.
 * @param {string} id - Database ID of the link
 * @param {HTMLElement} btn - The edit button clicked
 */
function editLink(id, btn) {
    const row = btn.closest('tr');
    const urlCell = row.querySelector('.original-url-cell');
    const originalLink = urlCell.querySelector('a').href;

    if (row.classList.contains('editing')) return;

    row.classList.add('editing');

    // Create edit interface
    const currentContent = urlCell.innerHTML;
    urlCell.innerHTML = `
    <div class="edit-group">
      <input type="text" class="edit-input" value="${originalLink}" />
      <div class="edit-actions" style="margin-top: 5px; display: flex; gap: 5px;">
        <button class="save-btn">Save</button>
        <button class="cancel-btn">Cancel</button>
      </div>
    </div>
  `;

    const input = urlCell.querySelector('.edit-input');
    input.focus();

    // Save handler
    urlCell.querySelector('.save-btn').onclick = async () => {
        const newUrl = input.value.trim();
        if (!newUrl) return alert('URL cannot be empty.');

        try {
            const response = await fetch(`/api/url/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newUrl }),
            });
            const result = await response.json();

            if (result.success) {
                loadDashboard();
            } else {
                alert(result.error || 'Failed to update URL.');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Network error while updating.');
        }
    };

    // Cancel handler
    urlCell.querySelector('.cancel-btn').onclick = () => {
        urlCell.innerHTML = currentContent;
        row.classList.remove('editing');
    };
}

// ---- Initialize Dashboard on Page Load ----
document.addEventListener('DOMContentLoaded', loadDashboard);
