export function createVideoCallInterface(durationMinutes) {
    const div = document.createElement("div");
    div.className = "plugin-video-interface";
    div.style.height = "80vh";
    div.style.background = "#000";
    div.style.position = "relative";
    div.style.color = "white";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";

    div.innerHTML = `
        <div id="video-stream-main">📹 [ ACTIVE VIDEO CALL ]</div>
        
        <!-- Countdown Timer -->
        <div id="call-timer" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,0,0,0.7); padding: 10px 20px; border-radius: 30px; font-weight: bold; font-size: 20px;">
            Time Remaining: <span id="timer-display">${durationMinutes}:00</span>
        </div>
        
        <!-- Call Controls -->
        <div style="position: absolute; bottom: 30px; display: flex; gap: 20px;">
            <button class="button-secondary" style="background: #444;">🔇 Mute</button>
            <button class="button-secondary" style="background: #cc0000; color: white;">📞 End Call</button>
            <button class="button-primary">💸 Request Tip</button>
        </div>
    `;

    // Logic for the countdown timer...
    let time = durationMinutes * 60;
    const timerDisplay = div.querySelector("#timer-display");
    
    const countdown = setInterval(() => {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        timerDisplay.innerHTML = `${minutes}:${seconds}`;
        time--;
        if (time < 0) {
            clearInterval(countdown);
            alert("Call session time ended.");
        }
    }, 1000);

    return div;
}
