import { createMistressDashboard } from "../../features/mistress/mistress-dashboard.js";
import { createSubDashboard } from "../../features/sub/sub-dashboard.js";

export function createRolePicker() {
  const wrapper = document.createElement("div");
  wrapper.className = "role-picker";

  const title = document.createElement("h2");
  title.innerText = "Choose Your Role";

  const text = document.createElement("p");
  text.innerText = "Select how you want to enter the platform.";

  const buttons = document.createElement("div");
  buttons.className = "role-buttons";

  const mistressBtn = document.createElement("button");
  mistressBtn.innerText = "Mistress";
  mistressBtn.className = "button-primary";

  mistressBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createMistressDashboard());
  };

  const subBtn = document.createElement("button");
  subBtn.innerText = "Sub";
  subBtn.className = "button-secondary";

  subBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createSubDashboard());
  };

  buttons.appendChild(mistressBtn);
  buttons.appendChild(subBtn);

  wrapper.appendChild(title);
  wrapper.appendChild(text);
  wrapper.appendChild(buttons);

  return wrapper;
}
