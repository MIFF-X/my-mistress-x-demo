import { paymentStore } from "./payment-store.js";
import { createPaymentsScreen } from "./payments-screen.js";
import { createTopContributorsScreen } from "./top-contributors-screen.js";

export function createRecentTributes() {
  const panel = document.createElement("div");
  panel.className = "panel";

  const title = document.createElement("h3");
  title.innerText = "Recent Tributes";
  panel.appendChild(title);

  const recent = paymentStore.history
    .filter((entry) => entry.type === "tribute")
    .slice()
    .reverse()
    .slice(0, 3);

  if (recent.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No recent tributes yet.";
    panel.appendChild(empty);
  } else {
    recent.forEach((entry) => {
      const row = document.createElement("p");
      row.innerHTML = `<strong>${entry.toUserName}</strong> — $${entry.amount}`;
      panel.appendChild(row);
    });
  }

  const topBtn = document.createElement("button");
  topBtn.className = "button-secondary";
  topBtn.innerText = "Top Targets";
  topBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createTopContributorsScreen());
  };
  panel.appendChild(topBtn);

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
