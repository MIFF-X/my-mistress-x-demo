export function createAccessTimer({ durationSeconds = 300, now = Date.now(), label = 'Timed access' } = {}) {
  const expiresAt = now + durationSeconds * 1000;

  return {
    label,
    startedAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    getRemainingSeconds(currentTime = Date.now()) {
      return Math.max(0, Math.ceil((expiresAt - currentTime) / 1000));
    },
    isExpired(currentTime = Date.now()) {
      return currentTime >= expiresAt;
    },
  };
}

export function formatAccessTimer(timer, currentTime = Date.now()) {
  const remaining = timer.getRemainingSeconds(currentTime);
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}
