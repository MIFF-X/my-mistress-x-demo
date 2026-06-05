import { createDiscoveryScreen } from "./discovery-screen.js";

function openDiscoveryScreen() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(createDiscoveryScreen());
}

export function createDiscoveryShortcutCard() {
  const card = document.createElement("div");
  card.className = "panel discovery-shortcut-card";

  const title = document.createElement("h3");
  title.innerText = "🎡 Live Discovery";

  const copy = document.createElement("p");
  copy.innerText = "Quick preview mode with save, follow, skip, join, and tiered free-preview placeholders.";

  const button = document.createElement("button");
  button.className = "button-primary";
  button.innerText = "Open Discovery";
  button.onclick = openDiscoveryScreen;

  card.appendChild(title);
  card.appendChild(copy);
  card.appendChild(button);

  return card;
}
