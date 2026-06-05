export function createPoll(input = {}) {
  const options = Array.isArray(input.options) ? input.options : [];

  return {
    id: input.id || `poll-${Date.now()}`,
    question: input.question || 'Poll question',
    status: input.status || 'draft',
    options: options.map((option, index) => ({
      id: option.id || `option-${index + 1}`,
      label: option.label || String(option),
      votes: Number(option.votes || 0),
    })),
  };
}

export function votePoll(poll, optionId) {
  return {
    ...poll,
    options: poll.options.map((option) => (
      option.id === optionId ? { ...option, votes: option.votes + 1 } : option
    )),
  };
}

export function getPollResults(poll) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return poll.options.map((option) => ({
    ...option,
    percent: totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0,
  }));
}
