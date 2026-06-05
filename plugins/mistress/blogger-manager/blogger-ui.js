export function createBloggerManager(mistressName) {
    const container = document.createElement("div");
    container.className = "blogger-ui";

    container.innerHTML = `
        <h2 style="text-align:center;">📜 Blogger Manager</h2>
        <textarea id="decree-content" placeholder="Type your decree here..." style="width:100%; height:200px; padding:15px; background:#111; color:white; border:1px solid #333; border-radius:10px;"></textarea>
        <div style="display:flex; gap:10px; margin-top:15px;">
            <input id="price-input" type="number" placeholder="$ Price" style="flex:1; padding:10px; background:#111; color:white; border:1px solid #333; border-radius:8px;">
            <button id="publish-btn" style="padding:10px 20px; background:#0088ff; color:white; border:none; border-radius:8px;">Publish Decree</button>
        </div>
        <div id="published-list" style="margin-top:30px;"></div>
    `;

    container.querySelector("#publish-btn").onclick = () => {
        const content = container.querySelector("#decree-content").value;
        const price = container.querySelector("#price-input").value;
        if (!content || !price) return alert("Please enter content and price.");

        const list = container.querySelector("#published-list");
        const post = document.createElement("div");
        post.style.cssText = `
            background: #111; padding: 15px; margin-top: 10px; border-radius: 10px;
            border-left: 4px solid #0088ff;
        `;
        post.innerHTML = `
            <p style="margin:0;"><strong>${mistressName}:</strong> ${content.slice(0,50)}...</p>
            <p style="margin:5px 0 0; font-size:14px; color:#0088ff;">$${price}</p>
        `;
        list.prepend(post);

        container.querySelector("#decree-content").value = "";
        container.querySelector("#price-input").value = "";
    };

    return container;
}
