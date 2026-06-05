export function createShamePost(input = {}) {
  return {
    id: input.id || `shame-post-${Date.now()}`,
    title: input.title || 'Wall of Shame post',
    body: input.body || '',
    status: input.status || 'draft',
    createdAt: input.createdAt || new Date().toISOString(),
  };
}
