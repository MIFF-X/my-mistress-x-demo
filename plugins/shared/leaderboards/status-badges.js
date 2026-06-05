export function getLeaderboardStatusBadge(rank, status = 'active') {
  if (status === 'hidden') {
    return { label: 'Hidden', tone: 'muted' };
  }

  if (rank === 1) {
    return { label: 'Crown', tone: 'gold' };
  }

  if (rank <= 3) {
    return { label: 'Top 3', tone: 'highlight' };
  }

  if (rank <= 10) {
    return { label: 'Top 10', tone: 'steady' };
  }

  return { label: 'Ranked', tone: 'neutral' };
}
