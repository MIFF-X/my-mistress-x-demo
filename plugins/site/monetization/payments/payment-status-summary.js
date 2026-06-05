import { paymentStore } from "./payment-store.js";
import { createPaymentActivityScreen } from "./payment-activity-screen.js";

export function createPaymentStatusSummary() {
  const panel = document.createElement("div");
  panel.className = "panel stat-card";
  panel.style.cursor = "pointer";

  const tributes = paymentStore.history.filter((item) => item.type === "tribute").length;
  const topups = paymentStore.history.filter((item) => item.type === "topup").length;

  const value = document.createElement("h2");
  value.innerText = `${tributes + topups}`;

  const label = document.createElement("p");
  label.innerText = `Payment Events (${tributes} tributes / ${topups} top ups)`;

  panel.appendChild(value);
  panel.appendChild(label);

  panel.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createPaymentActivityScreen());
  };

  return panel;
}
