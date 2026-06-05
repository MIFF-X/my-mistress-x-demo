export function createDashboardHeader({
  title = "Mistress-X Throne Room Lobby",
  subtitle = "Browse profiles, tributes, messages and roleplay control spaces",
  walletAmount = "$0.00",
  notificationCount = 0,
  onWalletClick = null,
  onNotificationsClick = null,
  onProfileClick = null,
  onBioClick = null,
  onLogoutClick = null
} = {}) {
  const bar = document.createElement("div");
  bar.className = "mmx-topbar";

  const left = document.createElement("div");
  left.className = "mmx-topbar-left-controls";

  const burgerWrap = document.createElement("div");
  burgerWrap.className = "mmx-burger-wrap";

  const burger = document.createElement("button");
  burger.className = "mmx-burger-btn";
  burger.type = "button";
  burger.setAttribute("aria-label", "Open menu");
  burger.textContent = "☰";

  const menu = document.createElement("div");
  menu.className = "mmx-burger-menu hidden";
  menu.innerHTML = `
    <button class="mmx-menu-item" data-action="profile">Update Profile</button>
    <button class="mmx-menu-item" data-action="bio">Update Bio</button>
    <button class="mmx-menu-item" data-action="logout">Logout</button>
  `;

  burger.onclick = () => {
    menu.classList.toggle("hidden");
  };

  document.addEventListener("click", (event) => {
    if (!burgerWrap.contains(event.target)) {
      menu.classList.add("hidden");
    }
  });

  menu.querySelector('[data-action="profile"]').onclick = () => {
    menu.classList.add("hidden");
    if (typeof onProfileClick === "function") onProfileClick();
  };

  menu.querySelector('[data-action="bio"]').onclick = () => {
    menu.classList.add("hidden");
    if (typeof onBioClick === "function") onBioClick();
  };

  menu.querySelector('[data-action="logout"]').onclick = () => {
    menu.classList.add("hidden");
    if (typeof onLogoutClick === "function") onLogoutClick();
  };

  burgerWrap.appendChild(burger);
  burgerWrap.appendChild(menu);

  const bellBtn = document.createElement("button");
  bellBtn.className = `mmx-bell-btn${notificationCount > 0 ? " active" : ""}`;
  bellBtn.type = "button";
  bellBtn.setAttribute("aria-label", "Notifications");
  bellBtn.innerHTML = `
    <span class="mmx-bell-icon">🔔</span>
    ${notificationCount > 0 ? `<span class="mmx-bell-dot"></span>` : ""}
  `;
  bellBtn.onclick = () => {
    if (typeof onNotificationsClick === "function") onNotificationsClick();
  };

  const walletBtn = document.createElement("button");
  walletBtn.className = "mmx-wallet-chip";
  walletBtn.type = "button";
  walletBtn.setAttribute("aria-label", "Wallet");
  walletBtn.innerHTML = `
    <span class="mmx-wallet-icon">👛</span>
    <span class="mmx-wallet-text">${walletAmount}</span>
  `;
  walletBtn.onclick = () => {
    if (typeof onWalletClick === "function") onWalletClick();
  };

  left.appendChild(burgerWrap);
  left.appendChild(bellBtn);
  left.appendChild(walletBtn);

  const center = document.createElement("div");
  center.className = "mmx-topbar-center";
  center.innerHTML = `
    <div class="mmx-page-title">${title}</div>
    <div class="mmx-page-subtitle">${subtitle}</div>
  `;

  const right = document.createElement("div");
  right.className = "mmx-topbar-right-spacer";

  bar.appendChild(left);
  bar.appendChild(center);
  bar.appendChild(right);

  return bar;
}
