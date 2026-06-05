import { paymentStore } from "./payment-store.js";
import { createPaymentsScreen } from "./payments-screen.js";

export function createSubscriptionsScreen() {
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
  title.innerText = "Subscriptions";

  const summaryPanel = document.createElement("div");
  summaryPanel.className = "panel";

  const activeSubs = paymentStore.subscriptions.filter((sub) => sub.status === "Active");
  const recurringTotal = activeSubs.reduce((sum, sub) => sum + sub.amount, 0);

  summaryPanel.innerHTML = `<h3>Subscription Summary</h3><p><strong>Active Plans:</strong> ${activeSubs.length}</p><p><strong>Recurring Total:</strong> $${recurringTotal}</p>`;

  const plansPanel = document.createElement("div");
  plansPanel.className = "panel";

  const plansTitle = document.createElement("h3");
  plansTitle.innerText = "Available Plans";
  plansPanel.appendChild(plansTitle);

  paymentStore.subscriptions.forEach((sub) => {
    const row = document.createElement("div");
    row.className = "panel punishment-item";

    const name = document.createElement("h3");
    name.innerText = sub.label;

    const amount = document.createElement("p");
    amount.innerHTML = `<strong>Amount:</strong> $${sub.amount}`;

    const status = document.createElement("p");
    status.innerHTML = `<strong>Status:</strong> ${sub.status}`;

    const buttons = document.createElement("div");
    buttons.className = "button-row";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = sub.status === "Active" ? "button-secondary" : "button-primary";
    toggleBtn.innerText = sub.status === "Active" ? "Cancel Plan" : "Activate Plan";
    toggleBtn.onclick = () => {
      sub.status = sub.status === "Active" ? "Available" : "Active";

      const app = document.getElementById("app");
      app.innerHTML = "";
      app.appendChild(createSubscriptionsScreen());
    };

    buttons.appendChild(toggleBtn);

    row.appendChild(name);
    row.appendChild(amount);
    row.appendChild(status);
    row.appendChild(buttons);

    plansPanel.appendChild(row);
  });

  shell.appendChild(topRow);
  shell.appendChild(title);
  shell.appendChild(summaryPanel);
  shell.appendChild(plansPanel);

  return shell;
}
