export function createPPMVoiceService(config) {
    let callActive = false;
    let secondsElapsed = 0;
    let sessionCost = 0;
    let timerInterval = null;
    let currentMultiplier = 1;

    const baseRatePerMinute = config.rate || 5.00;
    let subWalletBalance = config.subWallet || 100.00; // Simulated wallet

    return {
        startCall: (onUpdate, onEnd) => {
            callActive = true;
            timerInterval = setInterval(() => {
                secondsElapsed++;
                
                // Calculate per-second cost with the current multiplier
                const effectiveRatePerSec = (baseRatePerMinute / 60) * currentMultiplier;
                
                sessionCost += effectiveRatePerSec;
                subWalletBalance -= effectiveRatePerSec;

                onUpdate({
                    time: formatTime(secondsElapsed),
                    cost: sessionCost.toFixed(2),
                    balance: subWalletBalance.toFixed(2),
                    multiplier: currentMultiplier
                });

                if (subWalletBalance <= 0) {
                    clearInterval(timerInterval);
                    onEnd(sessionCost.toFixed(2), "Insufficient Funds");
                }
            }, 1000);
        },
        setMultiplier: (val) => {
            currentMultiplier = val;
        },
        stopCall: (onEnd) => {
            clearInterval(timerInterval);
            callActive = false;
            onEnd(sessionCost.toFixed(2), "User Ended");
        }
    };
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
