export function createAuctionHouse(mistressName) {
    const container = document.createElement("div");
    container.className = "auction-container";

    container.innerHTML = `
        <div class="auction-header">
            <h2>🔨 Elite Auction House</h2>
            <p>Mistress in Command: <span style="color:#ffcc00;">${mistressName}</span></p>
        </div>

        <div class="active-item-panel">
            <div id="item-image" style="font-size:80px; margin-bottom:10px;">🔐</div>
            <h3 id="item-title">30-Minute 1-on-1 Forced Task Session</h3>
            <p id="item-description" style="color:#888;">The winner receives total focused attention and a custom task list.</p>
        </div>

        <div class="bidding-war">
            <div class="current-bid-box">
                <span style="font-size:14px; text-transform:uppercase; color:#888;">Current High Bid</span>
                <div id="current-bid-amount" style="font-size:42px; font-weight:bold; color:#00ff66;">$150.00</div>
                <span id="high-bidder-name" style="color:#ffcc00;">High Bidder: SubZero</span>
            </div>

            <div class="auction-timer">
                <span style="font-size:14px; color:#888;">Time Remaining</span>
                <div id="auction-clock" style="font-size:24px; color:#ff4444; font-family:monospace;">02:45</div>
            </div>
        </div>

        <div class="mistress-controls">
            <button id="btn-add-time" class="auc-btn">➕ Add 1 Min</button>
            <button id="btn-sold" class="auc-btn" style="background:#00ff66; color:black;">🔨 SOLD!</button>
            <button id="btn-cancel" class="auc-btn" style="background:#444;">Cancel</button>
        </div>

        <div class="bid-history">
            <h4 style="border-bottom:1px solid #333; padding-bottom:5px;">Recent Activity</h4>
            <ul id="bid-log" style="list-style:none; padding:0; font-size:14px; height:100px; overflow-y:auto;">
                <li style="color:#888;">[System] Auction Started by ${mistressName}</li>
                <li>SubZero bid $150.00</li>
                <li>SlaveX bid $140.00</li>
            </ul>
        </div>
    `;

    // Logic for the SOLD! button
    container.querySelector("#btn-sold").onclick = () => {
        const winner = container.querySelector("#high-bidder-name").innerText;
        const amount = container.querySelector("#current-bid-amount").innerText;
        alert(`GOING ONCE... GOING TWICE... SOLD to ${winner} for ${amount}!`);
    };

    return container;
}
