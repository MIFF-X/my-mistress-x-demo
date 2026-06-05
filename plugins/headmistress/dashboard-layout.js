import { createDashboardHeader } from "./dashboard-header.js";
import { createRolePicker } from "./dashboard-role-picker.js";

export function createDashboardLayout() {
  const page = document.createElement("div");
  page.className = "dashboard-page";

  const container = document.createElement("div");
  container.className = "dashboard-container";

  const header = createDashboardHeader();
  const rolePicker = createRolePicker();

  container.appendChild(header);
  container.appendChild(rolePicker);
  page.appendChild(container);

  return page;
}
