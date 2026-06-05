import { punishmentStore } from "../../plugins/mistress/punishment-system/punishment-store.js";
import { createUserProfile } from "./user-profile.js";

export function createUserCard(user) {
  const card = document.createElement("div");
  card.className = "panel";

  const top = document.createElement("h3");
  top.innerText = user.name;

  const meta = document.createElement("p");
  meta.className = "user-card-meta";
  meta.innerHTML = `<strong>${user.role}</strong> • ${user.status || "unknown"} • ${user.location || "No location"}`;

  const bio = document.createElement("p");
  bio.innerText = user.bio || "No bio added yet.";

  const activePunishments = punishmentStore.active.filter((item) => item.userId === user.id);
  const punishmentBadge = document.createElement("p");
  punishmentBadge.className = "punishment-badge";

  if (activePunishments.length === 0) {
    punishmentBadge.innerHTML = "<strong>Punishments:</strong> None";
  } else {
    punishmentBadge.innerHTML = `<strong>Punishments (${activePunishments.length}):</strong> ${activePunishments
      .map((punishment) => punishment.presetName)
      .join(", ")}`;
  }

  const actions = document.createElement("div");
  actions.className = "button-row";

  const viewBtn = document.createElement("button");
  viewBtn.className = "button-primary";
  viewBtn.innerText = "View Profile";
  viewBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createUserProfile(user));
  };

  actions.appendChild(viewBtn);

  card.appendChild(top);
  card.appendChild(meta);
  card.appendChild(bio);
  card.appendChild(punishmentBadge);
  card.appendChild(actions);

  return card;
}
