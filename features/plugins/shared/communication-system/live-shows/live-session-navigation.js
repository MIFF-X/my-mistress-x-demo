export function createLiveSessionBackButton(targetFactory, label = "Back") {
  const button = document.createElement("button");
  button.className = "button-secondary";
  button.type = "button";
  button.innerText = `← ${label}`;
  button.onclick = () => {
    if (typeof targetFactory !== "function") return;

    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(targetFactory());
  };

  return button;
}

export function createLiveSessionTopBar(titleText, targetFactory, backLabel = "Back") {
  const topBar = document.createElement("div");
  topBar.className = "live-session-top-bar";

  const title = document.createElement("h2");
  title.innerText = titleText;

  topBar.appendChild(createLiveSessionBackButton(targetFactory, backLabel));
  topBar.appendChild(title);

  return topBar;
}

export function ensureLiveSessionNavigationStyles() {
  if (document.getElementById("live-session-navigation-styles")) return;

  const style = document.createElement("style");
  style.id = "live-session-navigation-styles";
  style.textContent = `
    .live-session-top-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .live-session-top-bar h2 {
      margin: 0;
    }
  `;
  document.head.appendChild(style);
}
