/* ============================================================
   utils.js
   Small shared helpers used by both dashboard.js and applications.js.
   ============================================================ */

/** Maps a status string to the CSS class suffix used for badges/tiles/chart bars. */
function statusToSlug(status) {
  return status.toLowerCase();
}

/** Formats an ISO date (yyyy-MM-dd) as "12 Sep 2026". Returns "—" for empty values. */
function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Escapes text before inserting into innerHTML, to avoid accidental HTML injection from notes/URLs. */
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

/** Returns the <span class="badge badge-x"> markup for a given status. */
function renderStatusBadge(status) {
  return `<span class="badge badge-${statusToSlug(status)}">${escapeHtml(status)}</span>`;
}

/** Shows a short-lived toast notification in the bottom-right corner. */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.hidden = false;

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

/** Shows a dismissible banner-style alert at the top of the page (used for load failures). */
function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alertBox');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `alert-box ${type}`;
  alertBox.hidden = false;
}

function hideAlert() {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) alertBox.hidden = true;
}

/** Debounce helper so search inputs don't fire a request on every keystroke. */
function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
