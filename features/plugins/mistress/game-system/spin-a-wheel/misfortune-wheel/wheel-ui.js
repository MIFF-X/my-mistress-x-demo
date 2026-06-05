export function createWheelOfMisfortune() {
    const container = document.createElement("div");
    container.className = "wheel-plugin-container";
    
    const outcomes = [
        "Write 100 Lines", "Send $10 Tribute", "5 Min Silence", 
        "Double your PPM", "Post Wall of Shame", "Nothing (Lucky)"
    ];

    container.innerHTML = `
        <div style="text-align:center; padding:30px;">
            <h2 style="color:#ff8800;">🎡 Wheel of Misfortune</h2>
            <p style="color:#888;">One spin: $5.00</p>
            
            <div id="status-display" style="font-size:24px; font-weight:bold; height:50px; margin:20px 0; color:#fff;">
                Ready to Spin...
            </div>

            <div id="visual-wheel" style="width:250px; height:250px; border-radius:50%; border:5px solid #444; margin:0 auto; position:relative; overflow:hidden; background:conic-gradient(#ff4444 0% 16%, #222 16% 33%, #ff8800 33% 50%, #222 50% 66%, #ff4444 66% 83%, #222 83% 100%);">
                <div id="wheel-pointer" style="position:absolute; top:0; left:50%; transform:translateX(-50%); width:0; height:0; border-left:15px solid transparent; border-right:15px solid transparent; border-top:30px solid #fff; z-index:10;"></div>
            </div>

            <button id="spin-btn" style="margin-top:30px; background:#ff8800; color:black; padding:15px 40px; border:none; border-radius:30px; font-weight:bold; cursor:pointer;">PAY $5 & SPIN</button>
        </div>
    `;

    const spinBtn = container.querySelector("#spin-btn");
    const status = container.querySelector("#status-display");
    const wheel = container.querySelector("#visual-wheel");

    spinBtn.onclick = () => {
        status.innerText = "🌀 SPINNING...";
        const randomDeg = Math.floor(Math.random() * 3600) + 720; // At least 2 full rotations
        wheel.style.transition = "transform 4s cubic-bezier(0.15, 0, 0.15, 1)";
        wheel.style.transform = `rotate(${randomDeg}deg)`;

        setTimeout(() => {
            const finalOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            status.innerText = `Result: ${finalOutcome}`;
            status.style.color = "#ff8800";
        }, 4000);
    };

    return container;
}
