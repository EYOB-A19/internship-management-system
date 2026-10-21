let authToken = localStorage.getItem('ethiointern_token') || null;

export function setApiToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('ethiointern_token', token);
  } else {
    localStorage.removeItem('ethiointern_token');
  }
}

export function getApiToken() {
  return authToken;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
    body:
      options.body && !(options.body instanceof FormData) && typeof options.body === 'object'
        ? JSON.stringify(options.body)
        : options.body,
  });

  const payload = await response.json().catch(() => ({
    success: false,
    message: 'Unexpected server response',
  }));

  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || 'Request failed');
    error.statusCode = response.status;
    error.errorCode = payload.errorCode || 'API_ERROR';
    error.errors = payload.errors || null;
    throw error;
  }

  return payload;
}
