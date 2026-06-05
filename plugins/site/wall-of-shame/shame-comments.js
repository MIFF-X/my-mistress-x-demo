export function createShameComment(input = {}) {
  return {
    id: input.id || `shame-comment-${Date.now()}`,
    postId: input.postId || 'pending-post',
    authorId: input.authorId || 'anonymous',
    body: input.body || '',
    createdAt: input.createdAt || new Date().toISOString(),
  };
}
