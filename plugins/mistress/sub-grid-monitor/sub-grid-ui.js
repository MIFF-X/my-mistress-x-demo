export function createSubGridMonitor(subList = []) {
    const container = document.createElement("div");
    container.className = "sub-grid-container";

    container.innerHTML = `
        <h2 style="text-align:center; margin-bottom:20px;">👁️‍🗨️ Sub Grid Monitor</h2>
        <div class="grid-cards"></div>
        <button id="close-grid" style="display:block; margin:20px auto; padding:10px 20px; background:#ff4444; color:white; border:none; border-radius:8px;">Close Grid</button>
    `;

    const grid = container.querySelector(".grid-cards");
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
    `;

    subList.forEach(sub => {
        const card = document.createElement("div");
        card.className = "sub-card";
        card.innerHTML = `
            <div style="font-size:40px;">👤</div>
            <p style="margin:5px 0;font-weight:bold;">${sub.name}</p>
            <p style="margin:0;font-size:12px;color:#888;">${sub.status}</p>
            <div style="margin-top:8px;font-size:14px;color:#ff4444;">$${sub.timer}</div>
        `;
        card.style.cssText = `
            background: #111;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #333;
        `;
        grid.appendChild(card);
    });

    container.querySelector("#close-grid").onclick = () => {
        container.remove();
    };

    return container;
}
