/* ============================================================
   applications.js
   Runs only on applications.html. Owns:
   - loading + rendering the applications table
   - search / filter / sort (dynamic, client-triggers-server query)
   - the Add/Edit modal + form validation
   - the View Details modal
   - the Delete confirmation modal
   ============================================================ */

let currentApplications = [];
let pendingDeleteId = null;

// ---------- DOM references ----------
const tableBody = document.getElementById('applicationsBody');
const emptyState = document.getElementById('emptyState');
const tableScroll = document.querySelector('.table-scroll');

const formModalOverlay = document.getElementById('formModalOverlay');
const applicationForm = document.getElementById('applicationForm');
const formModalTitle = document.getElementById('formModalTitle');

const viewModalOverlay = document.getElementById('viewModalOverlay');
const viewModalBody = document.getElementById('viewModalBody');

const deleteModalOverlay = document.getElementById('deleteModalOverlay');

// ============================================================
// Initial load + filter wiring
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadApplications();
  wireToolbar();
  wireAddButtons();
  wireFormModal();
  wireViewModal();
  wireDeleteModal();

  // Support the "Add Application" shortcut link from the dashboard sidebar
  const params = new URLSearchParams(window.location.search);
  if (params.get('openAdd') === 'true') {
    openAddModal();
  }
});

function wireToolbar() {
  const debouncedSearch = debounce(applyFilters, 350);

  document.getElementById('searchCompany').addEventListener('input', debouncedSearch);
  document.getElementById('searchRole').addEventListener('input', debouncedSearch);
  document.getElementById('filterLocation').addEventListener('input', debouncedSearch);
  document.getElementById('filterStatus').addEventListener('change', applyFilters);
  document.getElementById('filterJobType').addEventListener('change', applyFilters);
  document.getElementById('sortBy').addEventListener('change', applyFilters);

  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    document.getElementById('searchCompany').value = '';
    document.getElementById('searchRole').value = '';
    document.getElementById('filterLocation').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterJobType').value = '';
    document.getElementById('sortBy').value = 'applicationDate';
    applyFilters();
  });
}

function wireAddButtons() {
  document.getElementById('openAddBtn').addEventListener('click', openAddModal);
  document.getElementById('sidebarAddBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openAddModal();
  });
  document.getElementById('emptyStateAddBtn').addEventListener('click', openAddModal);
}

// ============================================================
// Loading + rendering the table
// ============================================================
async function loadApplications() {
  tableBody.innerHTML = '<tr><td colspan="7" class="empty-inline">Loading applications…</td></tr>';
  emptyState.hidden = true;

  try {
    const applications = await JobTrackerAPI.getAll();
    currentApplications = applications;
    renderTable(applications);
    hideAlert();
  } catch (error) {
    tableBody.innerHTML = '';
    showAlert(error.message || 'Failed to load applications.');
    emptyState.hidden = false;
  }
}

async function applyFilters() {
  const filters = {
    company: document.getElementById('searchCompany').value.trim(),
    role: document.getElementById('searchRole').value.trim(),
    location: document.getElementById('filterLocation').value.trim(),
    status: document.getElementById('filterStatus').value,
    jobType: document.getElementById('filterJobType').value,
    sortBy: document.getElementById('sortBy').value,
    sortDirection: 'asc',
  };

  try {
    const applications = await JobTrackerAPI.search(filters);
    currentApplications = applications;
    renderTable(applications);
    hideAlert();
  } catch (error) {
    showAlert(error.message || 'Failed to filter applications.');
  }
}

function renderTable(applications) {
  if (!applications || applications.length === 0) {
    tableBody.innerHTML = '';
    tableScroll.hidden = true;
    emptyState.hidden = false;
    return;
  }

  tableScroll.hidden = false;
  emptyState.hidden = true;

  tableBody.innerHTML = applications.map(app => `
    <tr data-id="${app.id}">
      <td class="company-cell">${escapeHtml(app.companyName)}</td>
      <td>${escapeHtml(app.jobRole)}</td>
      <td>${escapeHtml(app.location)}</td>
      <td>${formatDate(app.applicationDate)}</td>
      <td>${renderStatusBadge(app.status)}</td>
      <td>${formatDate(app.interviewDate)}</td>
      <td class="col-actions">
        <button class="btn-icon" data-action="view" data-id="${app.id}">View</button>
        <button class="btn-icon" data-action="edit" data-id="${app.id}">Edit</button>
        <button class="btn-icon danger" data-action="delete" data-id="${app.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  // Event delegation: one listener handles all row action buttons
  tableBody.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', handleRowAction);
  });
}

function handleRowAction(event) {
  const id = Number(event.currentTarget.dataset.id);
  const action = event.currentTarget.dataset.action;
  const application = currentApplications.find(a => a.id === id);
  if (!application) return;

  if (action === 'view') openViewModal(application);
  if (action === 'edit') openEditModal(application);
  if (action === 'delete') openDeleteModal(id);
}

// ============================================================
// Add / Edit modal
// ============================================================
function wireFormModal() {
  document.getElementById('formModalClose').addEventListener('click', closeFormModal);
  document.getElementById('cancelFormBtn').addEventListener('click', closeFormModal);
  formModalOverlay.addEventListener('click', (e) => {
    if (e.target === formModalOverlay) closeFormModal();
  });

  applicationForm.addEventListener('submit', handleFormSubmit);
}

function openAddModal() {
  applicationForm.reset();
  document.getElementById('appId').value = '';
  document.getElementById('status').value = 'Applied';
  formModalTitle.textContent = 'Add Application';
  clearFormErrors();
  formModalOverlay.hidden = false;
  document.getElementById('companyName').focus();
}

function openEditModal(application) {
  applicationForm.reset();
  clearFormErrors();

  document.getElementById('appId').value = application.id;
  document.getElementById('companyName').value = application.companyName;
  document.getElementById('jobRole').value = application.jobRole;
  document.getElementById('location').value = application.location;
  document.getElementById('jobType').value = application.jobType;
  document.getElementById('applicationDate').value = application.applicationDate;
  document.getElementById('status').value = application.status;
  document.getElementById('interviewDate').value = application.interviewDate || '';
  document.getElementById('jobUrl').value = application.jobUrl || '';
  document.getElementById('notes').value = application.notes || '';

  formModalTitle.textContent = 'Edit Application';
  formModalOverlay.hidden = false;
}

function closeFormModal() {
  formModalOverlay.hidden = true;
}

/** Client-side validation mirroring the backend's @NotBlank/@NotNull rules,
 *  so the user gets instant feedback without a round trip. The backend
 *  still re-validates everything - this is just for UX. */
function validateForm() {
  clearFormErrors();
  let isValid = true;

  const requiredFields = [
    ['companyName', 'Company name is required'],
    ['jobRole', 'Job role is required'],
    ['location', 'Job location is required'],
    ['jobType', 'Please select a job type'],
    ['applicationDate', 'Application date is required'],
    ['status', 'Please select a status'],
  ];

  requiredFields.forEach(([id, message]) => {
    const field = document.getElementById(id);
    if (!field.value.trim()) {
      setFieldError(id, message);
      isValid = false;
    }
  });

  // If an interview date is given, it shouldn't be before the application date
  const applicationDate = document.getElementById('applicationDate').value;
  const interviewDate = document.getElementById('interviewDate').value;
  if (interviewDate && applicationDate && interviewDate < applicationDate) {
    setFieldError('interviewDate', 'Interview date cannot be before the application date');
    isValid = false;
  }

  return isValid;
}

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.closest('.form-row').classList.add('has-error');
  const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (errorEl) errorEl.textContent = message;
}

function clearFormErrors() {
  document.querySelectorAll('.form-row.has-error').forEach(row => row.classList.remove('has-error'));
  document.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
}

async function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) return;

  const id = document.getElementById('appId').value;
  const payload = {
    companyName: document.getElementById('companyName').value.trim(),
    jobRole: document.getElementById('jobRole').value.trim(),
    location: document.getElementById('location').value.trim(),
    jobType: document.getElementById('jobType').value,
    applicationDate: document.getElementById('applicationDate').value,
    status: document.getElementById('status').value,
    interviewDate: document.getElementById('interviewDate').value || null,
    jobUrl: document.getElementById('jobUrl').value.trim() || null,
    notes: document.getElementById('notes').value.trim() || null,
  };

  const submitBtn = document.getElementById('submitFormBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  try {
    if (id) {
      await JobTrackerAPI.update(id, payload);
      showToast('Application updated successfully.');
    } else {
      await JobTrackerAPI.create(payload);
      showToast('Application added successfully.');
    }
    closeFormModal();
    await loadApplications();
  } catch (error) {
    if (error.fieldErrors) {
      // Map backend field errors (companyName, jobRole, ...) onto the form
      Object.entries(error.fieldErrors).forEach(([field, message]) => setFieldError(field, message));
    } else {
      showToast(error.message || 'Failed to save application.', 'error');
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Application';
  }
}

// ============================================================
// View Details modal
// ============================================================
function wireViewModal() {
  document.getElementById('viewModalClose').addEventListener('click', closeViewModal);
  document.getElementById('closeViewBtn').addEventListener('click', closeViewModal);
  viewModalOverlay.addEventListener('click', (e) => {
    if (e.target === viewModalOverlay) closeViewModal();
  });
}

function openViewModal(app) {
  viewModalBody.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">Company</span>
        <span class="detail-value">${escapeHtml(app.companyName)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Job role</span>
        <span class="detail-value">${escapeHtml(app.jobRole)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Location</span>
        <span class="detail-value">${escapeHtml(app.location)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Job type</span>
        <span class="detail-value">${escapeHtml(app.jobType)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Application date</span>
        <span class="detail-value">${formatDate(app.applicationDate)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status</span>
        <span class="detail-value">${renderStatusBadge(app.status)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Interview date</span>
        <span class="detail-value">${formatDate(app.interviewDate)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Job URL</span>
        <span class="detail-value">${app.jobUrl ? `<a href="${escapeHtml(app.jobUrl)}" target="_blank" rel="noopener">${escapeHtml(app.jobUrl)}</a>` : '—'}</span>
      </div>
      <div class="detail-item detail-full">
        <span class="detail-label">Notes</span>
        <span class="detail-value">${app.notes ? escapeHtml(app.notes) : '—'}</span>
      </div>
    </div>
  `;
  viewModalOverlay.hidden = false;
}

function closeViewModal() {
  viewModalOverlay.hidden = true;
}

// ============================================================
// Delete confirmation modal
// ============================================================
function wireDeleteModal() {
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
  deleteModalOverlay.addEventListener('click', (e) => {
    if (e.target === deleteModalOverlay) closeDeleteModal();
  });
}

function openDeleteModal(id) {
  pendingDeleteId = id;
  deleteModalOverlay.hidden = false;
}

function closeDeleteModal() {
  pendingDeleteId = null;
  deleteModalOverlay.hidden = true;
}

async function confirmDelete() {
  if (pendingDeleteId === null) return;

  const confirmBtn = document.getElementById('confirmDeleteBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting…';

  try {
    await JobTrackerAPI.remove(pendingDeleteId);
    showToast('Application deleted.');
    closeDeleteModal();
    await loadApplications();
  } catch (error) {
    showToast(error.message || 'Failed to delete application.', 'error');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Delete';
  }
}
