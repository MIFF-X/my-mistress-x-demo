import { createRolePicker } from "../../styles/dashboard/dashboard-role-picker.js";
import { userStore } from "./user-store.js";
import { punishmentStore } from "../../plugins/mistress/punishment-system/punishment-store.js";
import { applyPunishment, removePunishment } from "../../plugins/mistress/punishment-system/apply-punishment.js";
import { paymentStore } from "../payments/payment-store.js";
import { sendTribute } from "../payments/send-tribute.js";
import { createUserTributeScreen } from "../payments/user-tribute-screen.js";

function mountScreen(factory) {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  app.appendChild(factory());
}

export function createUserProfile(user) {
  const shell = document.createElement("div");
  shell.className = "page-shell";

  const topRow = document.createElement("div");
  topRow.className = "button-row";

  const backBtn = document.createElement("button");
  backBtn.className = "button-secondary";
  backBtn.innerText = "Back";
  backBtn.onclick = () => mountScreen(createRolePicker);

  const messageBtn = document.createElement("button");
  messageBtn.className = "button-primary";
  messageBtn.innerText = "Message";

  topRow.appendChild(backBtn);
  topRow.appendChild(messageBtn);

  const panel = document.createElement("div");
  panel.className = "panel";

  const name = document.createElement("h2");
  name.innerText = user.name;

  const bio = document.createElement("p");
  bio.innerText = user.bio;

  const tributeHistory = paymentStore.history.filter(
    (entry) => entry.toUserId === user.id && entry.type === "tribute"
  );

  const tributeSummary = document.createElement("p");
  if (tributeHistory.length === 0) {
    tributeSummary.innerHTML = "<strong>Tributes:</strong> None";
  } else {
    const total = tributeHistory.reduce((sum, entry) => sum + entry.amount, 0);
    tributeSummary.innerHTML = `<strong>Tributes:</strong> ${tributeHistory.length} sent - Total $${total}`;
  }

  const activeForUser = punishmentStore.active.filter((item) => item.userId === user.id);
  const historyForUser = punishmentStore.history.filter((item) => item.userId === user.id);

  const punishmentSummary = document.createElement("p");
  if (activeForUser.length === 0) {
    punishmentSummary.innerHTML = "<strong>Punishments:</strong> None";
  } else {
    punishmentSummary.innerHTML = `<strong>Punishments (${activeForUser.length}):</strong> ${activeForUser.map((p) => p.presetName).join(", ")}`;
  }

  const punishmentHistory = document.createElement("div");
  punishmentHistory.className = "panel";
  punishmentHistory.innerHTML = "<h3>Punishment History</h3>";
  if (historyForUser.length === 0) {
    const none = document.createElement("p");
    none.innerText = "No punishment history for this user.";
    punishmentHistory.appendChild(none);
  } else {
    historyForUser.slice().reverse().forEach((entry) => {
      const row = document.createElement("p");
      row.innerHTML = `<strong>${entry.type.toUpperCase()}</strong> - ${entry.presetName} (${entry.timestamp})`;
      punishmentHistory.appendChild(row);
    });
  }

  const actions = document.createElement("div");
  actions.className = "button-row";

  const tributeBtn = document.createElement("button");
  tributeBtn.className = "button-primary";
  tributeBtn.innerText = "Send Tribute";
  tributeBtn.onclick = () => {
    const tributeList = paymentStore.tributeOptions
      .map((item, index) => `${index + 1}. ${item.label}`)
      .join("\n");

    const choice = prompt(`Choose a tribute amount:\n${tributeList}`);
    const selected = paymentStore.tributeOptions[Number(choice) - 1];

    if (!selected) return;
    if (paymentStore.walletBalance < selected.amount) {
      alert("Not enough balance.");
      return;
    }

    sendTribute(user, selected.amount);
    mountScreen(() => createUserProfile(user));
  };

  const tributeHistoryBtn = document.createElement("button");
  tributeHistoryBtn.className = "button-secondary";
  tributeHistoryBtn.innerText = "Tribute History";
  tributeHistoryBtn.onclick = () => mountScreen(() => createUserTributeScreen(user));

  const favouriteBtn = document.createElement("button");
  favouriteBtn.className = "button-secondary";
  favouriteBtn.innerText = userStore.favourites.includes(user.id) ? "Unfavourite" : "Favourite";
  favouriteBtn.onclick = () => {
    if (userStore.favourites.includes(user.id)) {
      userStore.favourites = userStore.favourites.filter((id) => id !== user.id);
    } else {
      userStore.favourites.push(user.id);
    }
    mountScreen(() => createUserProfile(user));
  };

  const blockBtn = document.createElement("button");
  blockBtn.className = "button-secondary";
  blockBtn.innerText = userStore.blocked.includes(user.id) ? "Unblock" : "Block";
  blockBtn.onclick = () => {
    if (userStore.blocked.includes(user.id)) {
      userStore.blocked = userStore.blocked.filter((id) => id !== user.id);
    } else {
      userStore.blocked.push(user.id);
    }
    mountScreen(() => createUserProfile(user));
  };

  const punishBtn = document.createElement("button");
  punishBtn.className = "button-secondary";
  punishBtn.innerText = "Punish";
  punishBtn.onclick = () => {
    const presetNames = punishmentStore.presets.map((preset, index) => `${index + 1}. ${preset.name}`).join("\n");
    const choice = prompt(`Choose a punishment:\n${presetNames}`);
    const preset = punishmentStore.presets[Number(choice) - 1];
    if (!preset) return;
    applyPunishment(user, preset);
    mountScreen(() => createUserProfile(user));
  };

  let unpunishBtn = null;
  if (activeForUser.length > 0) {
    unpunishBtn = document.createElement("button");
    unpunishBtn.className = "button-secondary";
    unpunishBtn.innerText = "Remove Latest Punishment";
    unpunishBtn.onclick = () => {
      const latest = activeForUser[activeForUser.length - 1];
      removePunishment(latest.id);
      mountScreen(() => createUserProfile(user));
    };
  }

  actions.appendChild(tributeBtn);
  actions.appendChild(tributeHistoryBtn);
  actions.appendChild(favouriteBtn);
  actions.appendChild(blockBtn);
  actions.appendChild(punishBtn);
  if (unpunishBtn) actions.appendChild(unpunishBtn);

  panel.appendChild(name);
  panel.appendChild(bio);
  panel.appendChild(tributeSummary);
  panel.appendChild(punishmentSummary);
  panel.appendChild(punishmentHistory);
  panel.appendChild(actions);

  shell.appendChild(topRow);
  shell.appendChild(panel);

  return shell;
}
