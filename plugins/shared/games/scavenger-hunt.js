export function createScavengerHunt(input = {}) {
  const clues = Array.isArray(input.clues) ? input.clues : [];

  return {
    id: input.id || `scavenger-hunt-${Date.now()}`,
    title: input.title || 'Scavenger Hunt',
    status: input.status || 'draft',
    clues: clues.map((clue, index) => ({
      id: clue.id || `clue-${index + 1}`,
      title: clue.title || `Clue ${index + 1}`,
      completed: Boolean(clue.completed),
    })),
  };
}

export function completeScavengerClue(hunt, clueId) {
  return {
    ...hunt,
    clues: hunt.clues.map((clue) => (
      clue.id === clueId ? { ...clue, completed: true } : clue
    )),
  };
}

export function getScavengerProgress(hunt) {
  const completed = hunt.clues.filter((clue) => clue.completed).length;
  const total = hunt.clues.length;

  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}
