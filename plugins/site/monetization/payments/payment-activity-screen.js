import { paymentStore } from "./payment-store.js";
import { createPaymentsScreen } from "./payments-screen.js";

export function createPaymentActivityScreen() {
  const shell = document.createElement("div");
  shell.className = "page-shell";

  const topRow = document.createElement("div");
  topRow.className = "button-row";

  const backBtn = document.createElement("button");
  backBtn.className = "button-secondary";
  backBtn.innerText = "← Back to Payments";
  backBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createPaymentsScreen());
  };

  topRow.appendChild(backBtn);

  const title = document.createElement("h2");
  title.innerText = "Payment Activity";

  const panel = document.createElement("div");
  panel.className = "panel";

  const activity = paymentStore.history.slice().reverse();

  if (activity.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No payment activity yet.";
    panel.appendChild(empty);
  } else {
    activity.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "panel punishment-item";

      row.innerHTML = `<p><strong>Type:</strong> ${entry.type}</p><p><strong>Target:</strong> ${entry.toUserName}</p><p><strong>Amount:</strong> $${entry.amount}</p><p><strong>Time:</strong> ${entry.timestamp}</p>`;

      panel.appendChild(row);
    });
  }

  shell.appendChild(topRow);
  shell.appendChild(title);
  shell.appendChild(panel);

  return shell;
}
