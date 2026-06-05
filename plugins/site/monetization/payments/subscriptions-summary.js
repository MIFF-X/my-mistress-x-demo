import { paymentStore } from "./payment-store.js";
import { createSubscriptionsScreen } from "./subscriptions-screen.js";

export function createSubscriptionsSummary() {
  const panel = document.createElement("div");
  panel.className = "panel stat-card";
  panel.style.cursor = "pointer";

  const activeSubs = paymentStore.subscriptions.filter((sub) => sub.status === "Active");
  const recurringTotal = activeSubs.reduce((sum, sub) => sum + sub.amount, 0);

  const value = document.createElement("h2");
  value.innerText = `$${recurringTotal}`;

  const label = document.createElement("p");
  label.innerText = `Subscriptions (${activeSubs.length} active)`;

  panel.appendChild(value);
  panel.appendChild(label);

  panel.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createSubscriptionsScreen());
  };

  return panel;
}
