function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function createPPMVoiceService(config = {}) {
  let callActive = false;
  let secondsElapsed = 0;
  let sessionCost = 0;
  let timerInterval = null;
  let currentMultiplier = 1;
  let subWalletBalance = Number(config.subWallet ?? 100);

  const baseRatePerMinute = Number(config.rate ?? 5);

  function getSnapshot() {
    return {
      active: callActive,
      time: formatTime(secondsElapsed),
      cost: sessionCost.toFixed(2),
      balance: subWalletBalance.toFixed(2),
      multiplier: currentMultiplier,
    };
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  return {
    startCall(onUpdate = () => {}, onEnd = () => {}) {
      if (callActive) return getSnapshot();

      callActive = true;
      onUpdate(getSnapshot());

      timerInterval = setInterval(() => {
        secondsElapsed += 1;

        const effectiveRatePerSecond = (baseRatePerMinute / 60) * currentMultiplier;
        sessionCost += effectiveRatePerSecond;
        subWalletBalance -= effectiveRatePerSecond;

        onUpdate(getSnapshot());

        if (subWalletBalance <= 0) {
          stopTimer();
          callActive = false;
          onEnd(sessionCost.toFixed(2), 'Insufficient funds');
        }
      }, 1000);

      return getSnapshot();
    },

    setMultiplier(value) {
      currentMultiplier = Number(value) || 1;
      return getSnapshot();
    },

    stopCall(onEnd = () => {}) {
      stopTimer();
      callActive = false;
      onEnd(sessionCost.toFixed(2), 'User ended');
      return getSnapshot();
    },

    getSnapshot,
  };
}
