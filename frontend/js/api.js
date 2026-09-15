/* ============================================================
   api.js
   Thin wrapper around fetch() for talking to the Spring Boot
   REST API. Keeping every network call in one file means the
   rest of the frontend never touches fetch() or URLs directly.
   ============================================================ */

const API_BASE_URL = 'http://localhost:8080/api/applications';

/**
 * Core request helper. Throws an Error with a readable message on
 * failure so callers can catch() it and show a toast/alert.
 */
async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkError) {
    // fetch() itself throws when the server is unreachable (e.g. backend not running)
    throw new Error('Could not reach the server. Is the backend running on port 8080?');
  }

  // 204 No Content (DELETE) has no JSON body to parse
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && data.message ? data.message : `Request failed (HTTP ${response.status})`;
    const error = new Error(message);
    error.fieldErrors = data ? data.fieldErrors : null;
    error.status = response.status;
    throw error;
  }

  return data;
}

const JobTrackerAPI = {
  getAll() {
    return apiRequest('');
  },

  getById(id) {
    return apiRequest(`/${id}`);
  },

  create(application) {
    return apiRequest('', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  },

  update(id, application) {
    return apiRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(application),
    });
  },

  remove(id) {
    return apiRequest(`/${id}`, { method: 'DELETE' });
  },

  getStats() {
    return apiRequest('/stats');
  },

  /**
   * Builds a query string from a filters object and calls the search
   * endpoint. Empty/undefined values are skipped entirely.
   */
  search(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const query = params.toString();
    return apiRequest(query ? `?${query}` : '');
  },
};
