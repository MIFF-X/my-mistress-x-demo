import { createChatList } from "./chat-list.js";
import { createChatWindow } from "./chat-window.js";
import { createChatInput } from "./chat-input.js";
import { createRolePicker } from "../../../../styles/dashboard/dashboard-role-picker.js";

export function createChatScreen() {
  const page = document.createElement("div");
  page.className = "chat-page";

  const topBar = document.createElement("div");
  topBar.className = "chat-topbar";

  const backBtn = document.createElement("button");
  backBtn.innerText = "Back";
  backBtn.className = "button-secondary";
  backBtn.onclick = () => {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = "";
    app.appendChild(createRolePicker());
  };

  const title = document.createElement("h1");
  title.innerText = "Messages";
  title.className = "chat-page-title";

  topBar.appendChild(backBtn);
  topBar.appendChild(title);

  const layout = document.createElement("div");
  layout.className = "chat-layout";

  const chatWindow = createChatWindow();
  const chatList = createChatList(chatWindow, window.currentRole || "mistress");
  const chatInput = createChatInput();

  const rightSide = document.createElement("div");
  rightSide.className = "chat-right";
  rightSide.appendChild(chatWindow);
  rightSide.appendChild(chatInput);

  layout.appendChild(chatList);
  layout.appendChild(rightSide);

  page.appendChild(topBar);
  page.appendChild(layout);

  return page;
}
