/* ============================================================
   dashboard.js
   Runs only on index.html. Loads dashboard stats + a preview of
   recent applications, and renders everything into the DOM.
   ============================================================ */

const STATUS_META = [
  { key: 'applied',     label: 'Applied',     color: 'var(--status-applied)' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'var(--status-shortlisted)' },
  { key: 'interviews',  label: 'Interview',   color: 'var(--status-interview)' },
  { key: 'selected',    label: 'Selected',    color: 'var(--status-selected)' },
  { key: 'rejected',    label: 'Rejected',    color: 'var(--status-rejected)' },
];

async function loadDashboard() {
  try {
    const [stats, applications] = await Promise.all([
      JobTrackerAPI.getStats(),
      JobTrackerAPI.getAll(),
    ]);

    renderStatTiles(stats);
    renderChart(stats);
    renderRecent(applications);
  } catch (error) {
    showAlert(error.message || 'Failed to load dashboard data.');
    document.getElementById('statsGrid').innerHTML =
      '<p class="empty-inline">Could not load statistics.</p>';
    document.getElementById('chartContainer').innerHTML =
      '<p class="empty-inline">Could not load chart.</p>';
    document.getElementById('recentList').innerHTML =
      '<p class="empty-inline">Could not load recent applications.</p>';
  }
}

function renderStatTiles(stats) {
  const grid = document.getElementById('statsGrid');

  const tiles = [
    { label: 'Total Applications', value: stats.totalApplications, cls: 'tile-total' },
    { label: 'Applied', value: stats.applied, cls: 'tile-applied' },
    { label: 'Shortlisted', value: stats.shortlisted, cls: 'tile-shortlisted' },
    { label: 'Interviews', value: stats.interviews, cls: 'tile-interview' },
    { label: 'Selected', value: stats.selected, cls: 'tile-selected' },
    { label: 'Rejected', value: stats.rejected, cls: 'tile-rejected' },
    { label: 'Selection Rate', value: `${stats.selectionRate.toFixed(1)}%`, cls: 'tile-rate' },
  ];

  grid.innerHTML = tiles.map(tile => `
    <div class="stat-tile ${tile.cls}">
      <div class="stat-value">${tile.value}</div>
      <div class="stat-label">${tile.label}</div>
    </div>
  `).join('');
}

function renderChart(stats) {
  const container = document.getElementById('chartContainer');
  const maxValue = Math.max(stats.applied, stats.shortlisted, stats.interviews, stats.selected, stats.rejected, 1);

  if (stats.totalApplications === 0) {
    container.innerHTML = '<p class="empty-inline">Add your first application to see the breakdown here.</p>';
    return;
  }

  const valueMap = {
    applied: stats.applied,
    shortlisted: stats.shortlisted,
    interviews: stats.interviews,
    selected: stats.selected,
    rejected: stats.rejected,
  };

  container.innerHTML = STATUS_META.map(meta => {
    const value = valueMap[meta.key];
    const widthPct = Math.round((value / maxValue) * 100);
    return `
      <div class="chart-row">
        <span class="chart-row-label">${meta.label}</span>
        <div class="chart-row-track">
          <div class="chart-row-fill" style="width:${widthPct}%; background:${meta.color};"></div>
        </div>
        <span class="chart-row-count">${value}</span>
      </div>
    `;
  }).join('');
}

function renderRecent(applications) {
  const list = document.getElementById('recentList');

  if (!applications || applications.length === 0) {
    list.innerHTML = '<p class="empty-inline">No applications yet. <a href="applications.html">Add your first one →</a></p>';
    return;
  }

  const recent = [...applications]
    .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
    .slice(0, 5);

  list.innerHTML = recent.map(app => `
    <div class="recent-item">
      <div class="recent-item-main">
        <span class="recent-item-company">${escapeHtml(app.companyName)}</span>
        <span class="recent-item-role">${escapeHtml(app.jobRole)} · ${escapeHtml(app.location)}</span>
      </div>
      ${renderStatusBadge(app.status)}
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadDashboard);
