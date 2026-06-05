export function createLeaderboard() {
    const container = document.createElement("div");
    container.className = "leaderboard-container";

    const subData = [
        { name: "SlaveX", score: 98, money: "$240" },
        { name: "SubZero", score: 85, money: "$180" },
        { name: "Petual", score: 75, money: "$90" },
        { name: "Fawn", score: 65, money: "$50" },
    ];

    container.innerHTML = `
        <div style="padding:20px; max-width:500px; margin:auto; text-align:center;">
            <h2 style="color:#ffcc00;">🏆 Obedience Leaderboard</h2>
            <div id="board-list" style="margin-top:20px;"></div>
        </div>
    `;

    const board = container.querySelector("#board-list");
    subData.forEach((sub, i) => {
        const entry = document.createElement("div");
        entry.style.cssText = `
            display:flex; justify-content:space-between; align-items:center;
            padding:12px; background:#111; border-radius:10px; margin-bottom:10px;
            border-left: 4px solid ${i === 0 ? "#ffcc00" : "#444"};
        `;
        entry.innerHTML = `
            <span style="font-weight:bold;">#${i+1} ${sub.name}</span>
            <div>
                <span style="color:#00ffaa;">Score: ${sub.score}%</span> • 
                <span style="color:#ff4444;">Spent: ${sub.money}</span>
            </div>
        `;
        board.appendChild(entry);
    });

    return container;
}
