import { punishmentStore } from "../../plugins/mistress/punishment-system/punishment-store.js";
import { createDashboardStats } from "./dashboard-stats.js";
import { createUserCard } from "./user-card.js";
import { userStore } from "./user-store.js";

export function createUsersGrid() {
  const shell = document.createElement("div");
  shell.className = "page-shell";

  const currentRole = window.currentRole || "mistress";
  const currentUser = userStore.currentUser || userStore.users.find((user) => user.role === currentRole);

  const visibleUsers = userStore.users.filter((user) => {
    const isBlocked = userStore.blocked.includes(user.id);
    const isDifferentRole = currentUser ? user.role !== currentUser.role : user.role !== currentRole;
    const isExtinguished = punishmentStore.active.some((item) => item.userId === user.id && item.presetId === "extinguish");
    return isDifferentRole && !isBlocked && !isExtinguished;
  });

  shell.appendChild(createDashboardStats(visibleUsers));

  const grid = document.createElement("div");
  grid.className = "users-grid";
  visibleUsers.forEach((user) => grid.appendChild(createUserCard(user)));
  shell.appendChild(grid);

  return shell;
}
