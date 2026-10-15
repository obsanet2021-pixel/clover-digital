/**
 * CLOVER DIGITAL — HTML Escape Utility
 * Shared sanitization function for XSS prevention
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
