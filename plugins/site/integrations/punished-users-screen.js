import { punishmentStore } from "./punishment-store.js";
import { userStore } from "../users/user-store.js";
import { createRolePicker } from "../../styles/dashboard/dashboard-role-picker.js";
import { createUserProfile } from "../users/user-profile.js";
import { clearAllPunishmentsForUser } from "./apply-punishment.js";

export function createPunishedUsersScreen(filter = "all") {
  const shell = document.createElement("div");
  shell.className = "page-shell";

  const topRow = document.createElement("div");
  topRow.className = "button-row";

  const backBtn = document.createElement("button");
  backBtn.className = "button-secondary";
  backBtn.innerText = "← Back";
  backBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createRolePicker());
  };

  topRow.appendChild(backBtn);

  const title = document.createElement("h2");
  title.innerText = "Punished Users";

  const filterRow = document.createElement("div");
  filterRow.className = "button-row";

  const allBtn = document.createElement("button");
  allBtn.className = "button-secondary";
  allBtn.innerText = "All";
  allBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createPunishedUsersScreen("all"));
  };

  const highBtn = document.createElement("button");
  highBtn.className = "button-secondary";
  highBtn.innerText = "High/Critical";
  highBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createPunishedUsersScreen("high"));
  };

  const lowBtn = document.createElement("button");
  lowBtn.className = "button-secondary";
  lowBtn.innerText = "Low/Medium";
  lowBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createPunishedUsersScreen("low"));
  };

  filterRow.appendChild(allBtn);
  filterRow.appendChild(highBtn);
  filterRow.appendChild(lowBtn);

  const grid = document.createElement("div");
  grid.className = "users-grid";

  const punishedUserIds = [...new Set(punishmentStore.active.map((item) => item.userId))];
  let punishedUsers = userStore.users.filter((user) => punishedUserIds.includes(user.id));

  if (filter === "high") {
    punishedUsers = punishedUsers.filter((user) =>
      punishmentStore.active.some(
        (item) =>
          item.userId === user.id &&
          (item.severity === "High" || item.severity === "Critical")
      )
    );
  }

  if (filter === "low") {
    punishedUsers = punishedUsers.filter((user) =>
      punishmentStore.active.some(
        (item) =>
          item.userId === user.id &&
          (item.severity === "Low" || item.severity === "Medium")
      )
    );
  }

  if (punishedUsers.length === 0) {
    const empty = document.createElement("div");
    empty.className = "panel";
    empty.innerText = "No users currently punished in this filter.";
    grid.appendChild(empty);
  } else {
    punishedUsers.forEach((user) => {
      const card = document.createElement("div");
      card.className = "panel";

      const name = document.createElement("h3");
      name.innerText = user.name;

      const info = document.createElement("p");
      info.innerText = `${user.role} • ${user.status} • ${user.location}`;

      const active = punishmentStore.active.filter((item) => item.userId === user.id);

      const summary = document.createElement("div");
      active.forEach((entry) => {
        const tag = document.createElement("span");
        tag.className = `severity-tag severity-${entry.severity.toLowerCase()}`;
        tag.innerText = `${entry.presetName} • ${entry.severity}`;
        summary.appendChild(tag);
      });

      const buttons = document.createElement("div");
      buttons.className = "button-row";

      const viewBtn = document.createElement("button");
      viewBtn.className = "button-primary";
      viewBtn.innerText = "View Profile";
      viewBtn.onclick = () => {
        const app = document.getElementById("app");
        app.innerHTML = "";
        app.appendChild(createUserProfile(user));
      };

      const clearBtn = document.createElement("button");
      clearBtn.className = "button-secondary";
      clearBtn.innerText = "Clear All Punishments";
      clearBtn.onclick = () => {
        clearAllPunishmentsForUser(user.id);
        const app = document.getElementById("app");
        app.innerHTML = "";
        app.appendChild(createPunishedUsersScreen(filter));
      };

      buttons.appendChild(viewBtn);
      buttons.appendChild(clearBtn);

      card.appendChild(name);
      card.appendChild(info);
      card.appendChild(summary);
      card.appendChild(buttons);

      grid.appendChild(card);
    });
  }

  shell.appendChild(topRow);
  shell.appendChild(title);
  shell.appendChild(filterRow);
  shell.appendChild(grid);

  return shell;
}
