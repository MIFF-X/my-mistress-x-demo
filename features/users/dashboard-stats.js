import { userStore } from "./user-store.js";
import { punishmentStore } from "../../plugins/mistress/punishment-system/punishment-store.js";
import { createPunishedUsersScreen } from "../../plugins/mistress/punishment-system/punished-users-screen.js";

export function createDashboardStats(visibleUsers = []) {
  const currentUser = userStore.currentUser || { role: window.currentRole || "mistress" };

  const cards = [
    {
      label: currentUser.role === "mistress" ? "Visible Subs" : "Visible Mistresses",
      value: visibleUsers.length,
      action: null
    },
    { label: "Favourites", value: userStore.favourites.length, action: null },
    { label: "Blocked", value: userStore.blocked.length, action: null },
    { label: "Notifications", value: userStore.notifications.length, action: null },
    { label: "Punishments", value: punishmentStore.active.length, action: createPunishedUsersScreen }
  ];

  const row = document.createElement("div");
  row.className = "button-row";

  cards.forEach((cardData) => {
    const card = document.createElement("button");
    card.className = "button-secondary";
    card.innerText = `${cardData.label}: ${cardData.value}`;
    if (cardData.action) {
      card.onclick = () => {
        const app = document.getElementById("app");
        app.innerHTML = "";
        app.appendChild(cardData.action());
      };
    }
    row.appendChild(card);
  });

  return row;
}
