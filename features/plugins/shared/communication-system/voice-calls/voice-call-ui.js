import { createPPMVoiceService } from "./voice-call-ppm.js";

export function createVoiceCallInterface(mistressName, rate) {
    const container = document.createElement("div");
    container.className = "ppm-voice-ui";
    container.style.cssText = `
        background: radial-gradient(circle, #222, #000);
        color: white; padding: 40px; border-radius: 20px;
        text-align: center; border: 2px solid #ff4444;
        max-width: 500px; margin: 50px auto; box-shadow: 0 0 30px rgba(255,0,0,0.3);
    `;

    container.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 10px;">🎙️</div>
        <h2 style="letter-spacing: 2px;">LIVE VOICE CONTROL</h2>
        <p style="color: #888;">Connected to: <span style="color: #ff4444;">${mistressName}</span></p>
        
        <div style="background: #111; border: 1px solid #333; padding: 30px; border-radius: 15px; margin: 20px 0;">
            <div id="ppm-timer" style="font-size: 48px; font-family: monospace; color: #00ff00;">0:00</div>
            <div id="ppm-cost" style="font-size: 32px; font-weight: bold; margin-top: 10px;">$0.00</div>
            <div id="ppm-multiplier-tag" style="background: #440000; display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin-top: 10px;">RATE: 1x (NORMAL)</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
            <button id="btn-punish" style="background: #ff8800; border: none; color: black; padding: 10px; font-weight: bold; cursor: pointer;">PUNISH (2x RATE)</button>
            <button id="btn-mercy" style="background: #444; border: none; color: white; padding: 10px; font-weight: bold; cursor: pointer;">NORMAL RATE</button>
        </div>

        <button id="btn-end-call" style="background: #ff4444; width: 100%; padding: 20px; border: none; border-radius: 10px; color: white; font-weight: bold; cursor: pointer; font-size: 18px;">TERMINATE SESSION</button>
    `;

    const service = createPPMVoiceService({ rate: rate, subWallet: 150.00 });

    const timerEl = container.querySelector("#ppm-timer");
    const costEl = container.querySelector("#ppm-cost");
    const tagEl = container.querySelector("#ppm-multiplier-tag");

    service.startCall(
        (data) => {
            timerEl.innerText = data.time;
            costEl.innerText = `$${data.cost}`;
            tagEl.innerText = data.multiplier > 1 ? `🚨 PUNISHMENT MODE: ${data.multiplier}x RATE` : `RATE: 1x (NORMAL)`;
            tagEl.style.background = data.multiplier > 1 ? "#ff0000" : "#440000";
        },
        (finalCost, reason) => {
            alert(`Session Terminated: ${reason}\nTotal Billed: $${finalCost}`);
            location.reload(); 
        }
    );

    container.querySelector("#btn-punish").onclick = () => service.setMultiplier(2);
    container.querySelector("#btn-mercy").onclick = () => service.setMultiplier(1);
    container.querySelector("#btn-end-call").onclick = () => service.stopCall((final) => {
        alert(`Final Session Cost: $${final}`);
        location.reload();
    });

    return container;
}
