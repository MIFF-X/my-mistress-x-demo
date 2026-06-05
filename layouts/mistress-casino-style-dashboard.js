export function createMistressCasinoStyleDashboard() {
  const app = document.createElement("div");

  app.appendChild(createSidebar());
  app.appendChild(createMain());

  return app;
}

function createSidebar() {
  const sidebar = document.createElement("div");
  sidebar.className = "mmx-sidebar";

  sidebar.innerHTML = `
    <div class="mmx-logo">MY-MISTRESS-X</div>

    <button class="mmx-auth-btn primary">JOIN</button>
    <button class="mmx-auth-btn secondary">LOGIN</button>

    <div class="mmx-side-item"><span class="mmx-side-icon">👑</span>All</div>
    <div class="mmx-side-item"><span class="mmx-side-icon">💬</span>Messages</div>
    <div class="mmx-side-item"><span class="mmx-side-icon">💸</span>Tributes</div>
    <div class="mmx-side-item"><span class="mmx-side-icon">⚡</span>Online</div>
  `;

  return sidebar;
}

function createMain() {
  const main = document.createElement("div");
  main.className = "mmx-main";

  const grid = document.createElement("div");
  grid.className = "mmx-card-grid";

  const profiles = [
    "Lady Noir",
    "Scarlet",
    "Mistress V",
    "Luna"
  ];

  profiles.forEach(name => {
    const card = document.createElement("div");
    card.className = "mmx-card";

    card.innerHTML = `
      <img src="https://picsum.photos/200/300?random=${Math.random()}">
      <div class="mmx-card-info">
        <strong>${name}</strong>
        <button class="mmx-small-btn">Enter</button>
      </div>
    `;

    grid.appendChild(card);
  });

  main.appendChild(grid);

  return main;
}
