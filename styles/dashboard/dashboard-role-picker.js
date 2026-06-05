import { createMistressDashboard } from "../../features/mistress/mistress-dashboard.js";
import { createSubDashboard } from "../../features/sub/sub-dashboard.js";
import { userStore } from "../../features/users/user-store.js";

function mountScreen(factory) {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  app.appendChild(factory());
}

function setDemoRole(role) {
  window.currentRole = role;
  userStore.currentUser = userStore.users.find((user) => user.role === role) || null;
}

export function createRolePicker() {
  const container = document.createElement("div");
  container.className = "role-picker";

  const title = document.createElement("h2");
  title.innerText = "Choose Your Role";

  const text = document.createElement("p");
  text.innerText = "Select how you want to enter the platform.";

  const buttons = document.createElement("div");
  buttons.className = "button-row";

  const mistressBtn = document.createElement("button");
  mistressBtn.innerText = "Mistress";
  mistressBtn.className = "button-primary";
  mistressBtn.onclick = () => {
    setDemoRole("mistress");
    mountScreen(createMistressDashboard);
  };

  const subBtn = document.createElement("button");
  subBtn.innerText = "Sub";
  subBtn.className = "button-secondary";
  subBtn.onclick = () => {
    setDemoRole("sub");
    mountScreen(createSubDashboard);
  };

  buttons.appendChild(mistressBtn);
  buttons.appendChild(subBtn);

  container.appendChild(title);
  container.appendChild(text);
  container.appendChild(buttons);

  return container;
}
