import { paymentStore } from "./payment-store.js";
import { createPaymentsScreen } from "./payments-screen.js";

export function createRecentTopUps() {
  const panel = document.createElement("div");
  panel.className = "panel";

  const title = document.createElement("h3");
  title.innerText = "Recent Top Ups";

  panel.appendChild(title);

  const recent = paymentStore.history
    .filter((entry) => entry.type === "topup")
    .slice()
    .reverse()
    .slice(0, 3);

  if (recent.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No recent top ups.";
    panel.appendChild(empty);
  } else {
    recent.forEach((entry) => {
      const row = document.createElement("p");
      row.innerHTML = `<strong>$${entry.amount}</strong> — ${entry.timestamp}`;
      panel.appendChild(row);
    });
  }

  const openBtn = document.createElement("button");
  openBtn.className = "button-secondary";
  openBtn.innerText = "Open Payments";
  openBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createPaymentsScreen());
  };

  panel.appendChild(openBtn);

  return panel;
}
