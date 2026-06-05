export function createTaskGenerator() {
    const container = document.createElement("div");
    container.className = "task-gen-container";

    container.innerHTML = `
        <div style="padding:20px; max-width:500px; margin:auto;">
            <h2 style="color:#00ffaa; text-align:center;">📝 Task Generator</h2>
            <textarea id="task-desc" placeholder="Enter task or punishment..." style="width:100%; height:120px; padding:15px; background:#111; color:#fff; border:1px solid #333; border-radius:10px;"></textarea>
            
            <div style="margin-top:15px; display:flex; gap:10px;">
                <select id="task-duration" style="flex:1; padding:10px; background:#222; color:#fff; border:1px solid #333; border-radius:5px;">
                    <option value="5">5 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                </select>
                <button id="assign-task" style="background:#00ffaa; color:#000; padding:10px 20px; border:none; border-radius:5px; font-weight:bold;">Assign</button>
            </div>

            <div id="task-history" style="margin-top:20px;">
                <h4 style="border-bottom:1px solid #333; padding-bottom:5px;">Assigned Tasks</h4>
                <ul id="history-list" style="list-style:none; padding:0; font-size:14px;"></ul>
            </div>
        </div>
    `;

    const assignBtn = container.querySelector("#assign-task");
    const historyList = container.querySelector("#history-list");

    assignBtn.onclick = () => {
        const desc = container.querySelector("#task-desc").value;
        const duration = container.querySelector("#task-duration").value;
        if (!desc) return alert("Please enter a task.");

        const taskItem = document.createElement("li");
        taskItem.innerHTML = `<strong>[${duration} min]</strong> ${desc}`;
        taskItem.style.padding = "6px 0";
        taskItem.style.borderBottom = "1px dashed #333";
        historyList.prepend(taskItem);

        container.querySelector("#task-desc").value = "";
    };

    return container;
}
