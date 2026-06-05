import { createRolePicker } from "../../styles/dashboard/dashboard-role-picker.js";
import { userStore } from "../users/user-store.js";

export function createLoginForm() {
  const container = document.createElement("div");
  container.style.maxWidth = "300px";
  container.style.margin = "80px auto";
  container.style.padding = "20px";
  container.style.background = "#1b1b1b";
  container.style.borderRadius = "12px";

  const title = document.createElement("h2");
  title.innerText = "Mistress-X Login";

  const email = document.createElement("input");
  email.placeholder = "Email";

  const password = document.createElement("input");
  password.placeholder = "Password";
  password.type = "password";

  const button = document.createElement("button");
  button.innerText = "Enter";
  button.className = "button-primary";
  button.onclick = () => {
    userStore.currentUser = userStore.users.find((user) => user.role === "mistress") || null;
    window.currentRole = userStore.currentUser?.role || "mistress";

    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = "";
    app.appendChild(createRolePicker());
  };

  container.appendChild(title);
  container.appendChild(email);
  container.appendChild(password);
  container.appendChild(button);

  return container;
}
