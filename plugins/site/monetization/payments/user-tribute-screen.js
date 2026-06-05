import { paymentStore } from "./payment-store.js";
import { createUserProfile } from "../users/user-profile.js";

export function createUserTributeScreen(user) {
  const shell = document.createElement("div");
  shell.className = "page-shell";

  const topRow = document.createElement("div");
  topRow.className = "button-row";

  const backBtn = document.createElement("button");
  backBtn.className = "button-secondary";
  backBtn.innerText = "← Back to Profile";
  backBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createUserProfile(user));
  };
  topRow.appendChild(backBtn);

  const title = document.createElement("h2");
  title.innerText = `${user.name} Tributes`;

  const history = paymentStore.history
    .filter((entry) => entry.toUserId === user.id && entry.type === "tribute")
    .slice()
    .reverse();

  const total = history.reduce((sum, entry) => sum + entry.amount, 0);

  const summaryPanel = document.createElement("div");
  summaryPanel.className = "panel";
  summaryPanel.innerHTML = `<h3>Summary</h3><p><strong>Total Tributes:</strong> ${history.length}</p><p><strong>Total Value:</strong> $${total}</p>`;

  const historyPanel = document.createElement("div");
  historyPanel.className = "panel";
  historyPanel.innerHTML = "<h3>Recent Tribute History</h3>";

  if (history.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No tributes sent to this user yet.";
    historyPanel.appendChild(empty);
  } else {
    history.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "panel punishment-item";
      row.innerHTML = `<p><strong>Amount:</strong> $${entry.amount}</p><p><strong>Time:</strong> ${entry.timestamp}</p>`;

      if (index === 0) {
        const buttons = document.createElement("div");
        buttons.className = "button-row";

        const refundBtn = document.createElement("button");
        refundBtn.className = "button-secondary";
        refundBtn.innerText = "Refund Latest Tribute";
        refundBtn.onclick = () => {
          paymentStore.walletBalance += entry.amount;
          paymentStore.history = paymentStore.history.filter((item) => item.id !== entry.id);

          const app = document.getElementById("app");
          app.innerHTML = "";
          app.appendChild(createUserTributeScreen(user));
        };

        buttons.appendChild(refundBtn);
        row.appendChild(buttons);
      }

      historyPanel.appendChild(row);
    });
  }

  shell.appendChild(topRow);
  shell.appendChild(title);
  shell.appendChild(summaryPanel);
  shell.appendChild(historyPanel);

  return shell;
}
