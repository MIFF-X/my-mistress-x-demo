export function createDashboardSidebar({
  role = "public",
  onJoinClick = null,
  onLoginClick = null,
  onMessagesClick = null,
  onMenuClick = null
} = {}) {
  const sidebar = document.createElement("aside");
  sidebar.className = "mmx-sidebar";

  const logo = document.createElement("div");
  logo.className = "mmx-logo";
  logo.innerHTML = `MY-<span>MISTRESS-X</span>`;
  sidebar.appendChild(logo);

  if (role === "public") {
    const authBox = document.createElement("div");
    authBox.className = "mmx-auth-box";

    const joinBtn = document.createElement("button");
    joinBtn.className = "mmx-auth-btn primary";
    joinBtn.textContent = "JOIN";
    joinBtn.onclick = () => {
      if (typeof onJoinClick === "function") onJoinClick();
    };

    const loginBtn = document.createElement("button");
    loginBtn.className = "mmx-auth-btn secondary";
    loginBtn.textContent = "LOGIN";
    loginBtn.onclick = () => {
      if (typeof onLoginClick === "function") onLoginClick();
    };

    authBox.appendChild(joinBtn);
    authBox.appendChild(loginBtn);
    sidebar.appendChild(authBox);
  }

  const nav = document.createElement("div");
  nav.className = "mmx-side-nav";

  const publicItems = [
    { icon: "👑", label: "ALL", key: "all", active: true },
    { icon: "💬", label: "MESSAGES", key: "messages", dot: true },
    { icon: "💸", label: "TRIBUTES", key: "tributes" },
    { icon: "⚡", label: "ONLINE", key: "online" },
    { icon: "✨", label: "NEW", key: "new" },
    { icon: "🏆", label: "TOP", key: "top" },
    { icon: "🎥", label: "LIVE", key: "live" },
    { icon: "⚙️", label: "SETTINGS", key: "settings" }
  ];

  const subItems = [
    { icon: "🏠", label: "DASHBOARD", key: "dashboard", active: true },
    { icon: "🔍", label: "FIND", key: "find" },
    { icon: "💬", label: "MESSAGES", key: "messages", dot: true },
    { icon: "❤️", label: "FAVOURITES", key: "favourites" },
    { icon: "💰", label: "WALLET", key: "wallet" },
    { icon: "🎁", label: "REDEMPTION", key: "redemption", dot: true },
    { icon: "🎮", label: "GAMES", key: "games" },
    { icon: "🏆", label: "LEADERBOARD", key: "leaderboard" },
    { icon: "📅", label: "CALENDAR", key: "calendar" },
    { icon: "💡", label: "SUGGEST", key: "suggest" }
  ];

  const mistressItems = [
    { icon: "🏠", label: "DASHBOARD", key: "dashboard", active: true },
    { icon: "🔍", label: "FIND SUB", key: "find" },
    { icon: "💬", label: "MESSAGES", key: "messages", dot: true },
    { icon: "👥", label: "ACTIVE SUBS", key: "subs" },
    { icon: "💰", label: "EARNINGS", key: "earnings" },
    { icon: "🧾", label: "REQUESTS", key: "requests", dot: true },
    { icon: "🎮", label: "GAMES", key: "games" },
    { icon: "🏆", label: "LEADERBOARD", key: "leaderboard" },
    { icon: "📅", label: "CALENDAR", key: "calendar" },
    { icon: "💡", label: "SUGGEST", key: "suggest" }
  ];

  const items =
    role === "sub" ? subItems :
    role === "mistress" ? mistressItems :
    publicItems;

  items.forEach((item) => {
    const button = document.createElement("button");
    button.className = `mmx-side-item${item.active ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="mmx-side-icon-wrap">
        <span class="mmx-side-icon">${item.icon}</span>
        ${item.dot ? `<span class="mmx-side-dot"></span>` : ""}
      </span>
      <span class="mmx-side-label">${item.label}</span>
      <span class="mmx-side-arrow">▾</span>
    `;

    button.onclick = () => {
      if (item.key === "messages" && typeof onMessagesClick === "function") {
        onMessagesClick();
        return;
      }

      if (typeof onMenuClick === "function") {
        onMenuClick(item.key);
      }
    };

    nav.appendChild(button);
  });

  sidebar.appendChild(nav);
  return sidebar;
}
