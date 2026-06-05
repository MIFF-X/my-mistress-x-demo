export const DEFAULT_ACCESS_TIMER_MINUTES = 15;

export function createAccessTimerConfig({
  id = 'site-access-timer',
  label = 'Site Access Timer',
  durationMinutes = DEFAULT_ACCESS_TIMER_MINUTES,
  graceMinutes = 0,
  startsAt = null,
  expiresAt = null,
} = {}) {
  return {
    id,
    label,
    durationMinutes: Number(durationMinutes),
    graceMinutes: Number(graceMinutes),
    startsAt,
    expiresAt,
  };
}

export function getAccessTimerState(config = createAccessTimerConfig(), now = new Date()) {
  if (!config.expiresAt) {
    return { status: 'not-started', remainingSeconds: null };
  }

  const expiresAt = new Date(config.expiresAt).getTime();
  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const remainingSeconds = Math.max(0, Math.ceil((expiresAt - currentTime) / 1000));

  return {
    status: remainingSeconds > 0 ? 'active' : 'expired',
    remainingSeconds,
  };
}
