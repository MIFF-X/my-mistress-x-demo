const BASE = typeof window !== 'undefined'
  ? (window.MISTRESS_X_API_BASE_URL ?? 'http://localhost:3000/api')
  : 'http://localhost:3000/api';

async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined'
    ? (window.__MX_ACCESS_TOKEN__ ?? localStorage.getItem('mx_access_token'))
    : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

export const blogGeneratorApi = {
  generateArticle: (data) => apiFetch('/blog-generator/generate', { method: 'POST', body: JSON.stringify(data) }),
  postNow: (postId) => apiFetch('/blog-generator/post', { method: 'POST', body: JSON.stringify({ postId }) }),
  schedulePost: (postId, scheduledFor) => apiFetch('/blog-generator/schedule', { method: 'POST', body: JSON.stringify({ postId, scheduledFor }) }),
  listPosts: () => apiFetch('/blog-generator/posts'),
  listScheduled: () => apiFetch('/blog-generator/scheduled'),
  cancelScheduled: (id) => apiFetch(`/blog-generator/scheduled/${id}`, { method: 'DELETE' }),
  connectBlogger: (data) => apiFetch('/blog-generator/blogger/connect', { method: 'POST', body: JSON.stringify(data) }),
  getBloggerStatus: () => apiFetch('/blog-generator/blogger/status'),
};
