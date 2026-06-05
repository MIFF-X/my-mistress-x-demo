import { paymentStore } from "./payment-store.js";
import { userStore } from "../users/user-store.js";
import { createPaymentsScreen } from "./payments-screen.js";

export function createPaymentsByUserScreen() {
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
  title.innerText = "Payments by User";

  const grid = document.createElement("div");
  grid.className = "users-grid";

  const usersWithTributes = userStore.users.filter((user) =>
    paymentStore.history.some(
      (entry) => entry.type === "tribute" && entry.toUserId === user.id
    )
  );

  if (usersWithTributes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "panel";
    empty.innerText = "No tribute history by user yet.";
    grid.appendChild(empty);
  } else {
    usersWithTributes.forEach((user) => {
      const history = paymentStore.history.filter(
        (entry) => entry.type === "tribute" && entry.toUserId === user.id
      );

      const total = history.reduce((sum, entry) => sum + entry.amount, 0);

      const card = document.createElement("div");
      card.className = "panel";

      const name = document.createElement("h3");
      name.innerText = user.name;

      const totalText = document.createElement("p");
      totalText.innerHTML = `<strong>Total:</strong> $${total}`;

      const countText = document.createElement("p");
      countText.innerHTML = `<strong>Count:</strong> ${history.length}`;

      card.appendChild(name);
      card.appendChild(totalText);
      card.appendChild(countText);

      grid.appendChild(card);
    });
  }

  shell.appendChild(topRow);
  shell.appendChild(title);
  shell.appendChild(grid);

  return shell;
}
