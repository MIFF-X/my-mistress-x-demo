import { paymentStore } from "./payment-store.js";
import { createPaymentsScreen } from "./payments-screen.js";

export function createPaymentSummary() {
  const card = document.createElement("div");
  card.className = "panel stat-card";
  card.style.cursor = "pointer";
  card.innerHTML = `<h2>$${paymentStore.walletBalance}</h2><p>Wallet Balance</p>`;

  card.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createPaymentsScreen());
  };

  return card;
}
