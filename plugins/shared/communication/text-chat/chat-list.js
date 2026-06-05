import { chatStore } from "./chat-store.js";
import { getActiveChatThreadUnlocks } from "./chat-thread-unlocks-store.js";
import { renderMessages } from "./chat-window.js";
import { userStore } from "../../../../features/users/user-store.js";
import { punishmentStore } from "../../../site/integrations/punishment-store.js";
import { createUserProfile } from "../../../site/monetization/users/user-profile.js";

function openConversation(chatWindow, conversationName, userItem) {
  chatStore.currentConversation = conversationName;

  const chatTitle = chatWindow.querySelector(".chat-window-title");
  const messages = chatWindow.querySelector("#chat-messages");

  chatTitle.innerText = conversationName;
  renderMessages(messages, conversationName);

  document.querySelectorAll(".chat-user").forEach((item) => {
    item.classList.remove("active");
  });
  userItem.classList.add("active");
}

function createUnlockedThreadItem(chatWindow, unlock) {
  const item = document.createElement("div");
  item.className = "chat-user chat-user-unlocked";
  item.innerHTML = `
    ${unlock.conversationName}<br>
    <small>🔓 ${unlock.label || "After-show private message access"}</small>
  `;
  item.onclick = () => openConversation(chatWindow, unlock.conversationName, item);
  return item;
}

export function createChatList(chatWindow, role = "mistress") {
  const list = document.createElement("div");
  list.className = "chat-list";

  const heading = document.createElement("h3");
  heading.innerText = "Conversations";
  list.appendChild(heading);

  const unlockedThreads = getActiveChatThreadUnlocks();
  if (unlockedThreads.length) {
    const unlockedHeading = document.createElement("p");
    unlockedHeading.className = "chat-list-section-label";
    unlockedHeading.innerText = "After-show unlocked";
    list.appendChild(unlockedHeading);
    unlockedThreads.forEach((unlock) => list.appendChild(createUnlockedThreadItem(chatWindow, unlock)));
  }

  const currentUser = userStore.currentUser || userStore.users.find((u) => u.role === role);

  const visibleUsers = userStore.users.filter((user) => {
    const isBlocked = userStore.blocked.includes(user.id);
    const isDifferentRole = user.role !== currentUser.role;
    const isExtinguished = punishmentStore.active.some(
      (item) => item.userId === user.id && item.presetId === "extinguish"
    );

    return isDifferentRole && !isBlocked && !isExtinguished;
  });

  const regularHeading = document.createElement("p");
  regularHeading.className = "chat-list-section-label";
  regularHeading.innerText = "All conversations";
  list.appendChild(regularHeading);

  visibleUsers.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className = "chat-user";
    userItem.innerHTML = `${user.name}<br><small>${user.status}</small>`;

    userItem.onclick = () => openConversation(chatWindow, user.name, userItem);

    userItem.ondblclick = () => {
      const app = document.getElementById("app");
      app.innerHTML = "";
      app.appendChild(createUserProfile(user));
    };

    list.appendChild(userItem);
  });

  return list;
}
