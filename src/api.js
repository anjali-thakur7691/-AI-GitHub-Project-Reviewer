async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

export const getDefaultAnalysis = () => request('/api/analysis');

export const getBackendHealth = () => request('/api/health');

export const analyzeRepository = (url) => request('/api/analyze-repo', {
  method: 'POST',
  body: JSON.stringify({ url }),
});

export const sendAssistantMessage = ({ url, context, message }) => request('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ url, context, message }),
});

export const registerAccount = ({ name, email, password }) => request('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name, email, password }),
});

export const loginAccount = ({ email, password }) => request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

export const logoutAccount = () => request('/api/auth/logout', { method: 'POST' });

export const getCurrentUser = () => request('/api/auth/me');

export const getAnalysisHistory = () => request('/api/analysis-history');
