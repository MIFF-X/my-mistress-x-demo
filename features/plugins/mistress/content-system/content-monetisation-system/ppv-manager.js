export function createPPVManager() {
    const div = document.createElement("div");
    div.className = "plugin-ppv-manager";
    div.innerHTML = `
        <div style="background:#1b1b1b; padding:20px; border-radius:12px; color: white;">
            <h3>💰 PPV Content Manager</h3>
            <div style="margin-bottom: 10px;">
                <label>Content Title:</label><br>
                <input id="ppv-title" type="text" placeholder="e.g., Exclusive Photo Set" style="width: 100%;">
            </div>
            <div style="margin-bottom: 10px;">
                <label>Price (Credits):</label><br>
                <input id="ppv-price" type="number" placeholder="e.g., 50" style="width: 100%;">
            </div>
            <div style="margin-bottom: 10px;">
                <label>Access Type:</label><br>
                <select id="ppv-type" style="width: 100%; padding: 8px;">
                    <option value="keep">Buy to Keep</option>
                    <option value="timed">24 Hour Access</option>
                    <option value="subscription">Add to Subscription Bundle</option>
                </select>
            </div>
            <div style="margin-bottom: 15px;">
                <label>Duration of Viewing (if timed):</label><br>
                <input id="ppv-duration" type="text" placeholder="e.g., 24 hours" style="width: 100%;">
            </div>
            <button id="upload-ppv" class="button-primary">Create & Load PPV</button>
        </div>
    `;

    div.querySelector("#upload-ppv").onclick = () => {
        const title = document.getElementById("ppv-title").value;
        const price = document.getElementById("ppv-price").value;
        const type = document.getElementById("ppv-type").value;
        const duration = document.getElementById("ppv-duration").value;
        
        // In a real app, this would send data to your backend
        alert(`PPV Created!\nTitle: ${title}\nPrice: ${price}\nType: ${type}\nDuration: ${duration}`);
    };

    return div;
}
