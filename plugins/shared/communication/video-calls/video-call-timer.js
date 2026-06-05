export function formatVideoCallTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function createVideoCallTimer({ durationMinutes = 15, onTick, onComplete } = {}) {
  let remainingSeconds = Math.max(0, Number(durationMinutes) * 60);
  let timerId = null;

  function snapshot() {
    return {
      remainingSeconds,
      display: formatVideoCallTime(remainingSeconds),
      isComplete: remainingSeconds <= 0,
    };
  }

  function stop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    return snapshot();
  }

  function start() {
    if (timerId) return snapshot();

    if (typeof onTick === 'function') {
      onTick(snapshot());
    }

    timerId = setInterval(() => {
      remainingSeconds = Math.max(0, remainingSeconds - 1);
      const current = snapshot();

      if (typeof onTick === 'function') {
        onTick(current);
      }

      if (remainingSeconds <= 0) {
        stop();
        if (typeof onComplete === 'function') {
          onComplete(current);
        }
      }
    }, 1000);

    return snapshot();
  }

  return {
    start,
    stop,
    snapshot,
  };
}
