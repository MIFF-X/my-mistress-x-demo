export function createLeaderboardBoard(entries = [], options = {}) {
  const sortedEntries = [...entries]
    .map((entry, index) => ({
      id: entry.id ?? `leader-${index + 1}`,
      label: entry.label ?? entry.name ?? 'Unnamed member',
      score: Number(entry.score ?? entry.credits ?? 0),
      role: entry.role ?? 'member',
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    id: options.id ?? 'shared-leaderboard',
    title: options.title ?? 'Shared Leaderboard',
    scope: options.scope ?? 'shared',
    entries: sortedEntries,
  };
}
