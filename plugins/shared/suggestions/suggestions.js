export function createSuggestion(input = {}) {
  return {
    id: input.id || `suggestion-${Date.now()}`,
    title: input.title || 'Suggestion',
    body: input.body || '',
    authorId: input.authorId || 'anonymous',
    category: input.category || 'general',
    status: input.status || 'new',
    votes: Number(input.votes || 0),
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export function updateSuggestionStatus(suggestion, status, reviewerId = 'system') {
  return {
    ...suggestion,
    status,
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
  };
}

export function summarizeSuggestions(suggestions = []) {
  return suggestions.reduce((summary, suggestion) => {
    const status = suggestion.status || 'new';
    return {
      ...summary,
      total: summary.total + 1,
      byStatus: {
        ...summary.byStatus,
        [status]: (summary.byStatus[status] || 0) + 1,
      },
    };
  }, { total: 0, byStatus: {} });
}
