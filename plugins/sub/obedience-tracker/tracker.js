export function createObedienceTracker() {
    const container = document.createElement("div");
    container.className = "tracker-container";

    container.innerHTML = `
        <div style="padding:20px; max-width:500px; margin:auto;">
            <h2 style="color:#00aaff; text-align:center;">📊 Obedience Tracker</h2>
            
            <div style="background:#111; padding:15px; border-radius:10px; margin-bottom:15px;">
                <h3 style="margin:0 0 10px;">Sub: SlaveX</h3>
                <p>Obedience Level: <strong style="color:#00ff66;">Good</strong></p>
                <div style="width:100%; background:#333; border-radius:5px; height:10px; margin-top:10px;">
                    <div style="width:82%; background:#00ff66; height:100%; border-radius:5px;"></div>
                </div>
            </div>

            <textarea id="tracker-notes" placeholder="Add notes about behavior..." style="width:100%; height:100px; padding:10px; background:#111; color:#fff; border:1px solid #333; border-radius:10px;"></textarea>
            <button id="save-notes" style="margin-top:10px; background:#00aaff; color:#fff; padding:8px 15px; border:none; border-radius:5px; cursor:pointer;">Save Notes</button>
        </div>
    `;

    container.querySelector("#save-notes").onclick = () => {
        alert("Notes saved for SlaveX.");
    };

    return container;
}
