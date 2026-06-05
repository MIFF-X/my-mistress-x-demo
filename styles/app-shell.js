import "../styles/base.css";

export function createAppShell({
  title = "Mistress-X",
  subtitle = "Global Mistress Network Platform",
  sidebarItems = [],
  actions = [],
  children = [],
  footerText = "Mistress-X App Build",
} = {}) {
  const shell = document.createElement("div");
  shell.className = "mx-app-shell";

  const sidebar = document.createElement("aside");
  sidebar.className = "mx-app-shell__sidebar";

  const brand = document.createElement("div");
  brand.className = "mx-app-shell__brand";
  brand.innerHTML = `
    <span class="mx-app-shell__brand-mark">MX</span>
    <span>
      <strong>MY MISTRESS X</strong>
      <small>App branch</small>
    </span>
  `;
  sidebar.appendChild(brand);

  const nav = document.createElement("nav");
  nav.className = "mx-app-shell__nav";
  nav.setAttribute("aria-label", "Main navigation");

  sidebarItems.forEach((item) => {
    const button = document.createElement("button");
    button.className = "mx-app-shell__nav-item";
    button.type = "button";
    button.innerHTML = `<span>${item.icon || "•"}</span><span>${item.label}</span>`;
    if (item.active) button.setAttribute("aria-current", "page");
    if (typeof item.onClick === "function") button.addEventListener("click", item.onClick);
    nav.appendChild(button);
  });

  sidebar.appendChild(nav);

  const mainWrap = document.createElement("div");
  mainWrap.className = "mx-app-shell__main-wrap";

  const header = document.createElement("header");
  header.className = "mx-app-shell__header";

  const heading = document.createElement("div");
  heading.className = "mx-app-shell__heading";
  heading.innerHTML = `<h1>${title}</h1><p>${subtitle}</p>`;

  const actionRow = document.createElement("div");
  actionRow.className = "mx-app-shell__actions";
  actions.forEach((action) => actionRow.appendChild(action));

  header.appendChild(heading);
  header.appendChild(actionRow);

  const main = document.createElement("main");
  main.className = "mx-app-shell__content";
  children.forEach((child) => main.appendChild(child));

  const footer = document.createElement("footer");
  footer.className = "mx-app-shell__footer";
  footer.textContent = footerText;

  mainWrap.appendChild(header);
  mainWrap.appendChild(main);
  mainWrap.appendChild(footer);

  shell.appendChild(sidebar);
  shell.appendChild(mainWrap);

  return shell;
}

export function createPlaceholderPage({ title, subtitle, sections = [] } = {}) {
  const page = document.createElement("section");
  page.className = "mx-page mx-stack";

  const intro = document.createElement("div");
  intro.className = "mx-stack";
  intro.innerHTML = `<h2>${title || "Placeholder"}</h2><p class="mx-muted">${subtitle || "Starter scaffold ready for wiring."}</p>`;
  page.appendChild(intro);

  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  sections.forEach((section) => {
    const card = document.createElement("article");
    card.className = "mx-card";
    card.innerHTML = `
      <div class="mx-card__eyebrow">${section.status || "Placeholder"}</div>
      <h3>${section.title}</h3>
      <p>${section.description || "Ready for frontend, backend, database, and UI wiring."}</p>
    `;
    grid.appendChild(card);
  });

  page.appendChild(grid);
  return page;
}

const shellStyles = document.createElement("style");
shellStyles.textContent = `
  .mx-app-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: var(--mx-sidebar-width) minmax(0, 1fr);
    background: transparent;
  }

  .mx-app-shell__sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    padding: var(--mx-space-5);
    border-right: 1px solid var(--mx-border);
    background: rgba(8, 7, 13, 0.78);
    backdrop-filter: blur(18px);
  }

  .mx-app-shell__brand {
    display: flex;
    align-items: center;
    gap: var(--mx-space-3);
    margin-bottom: var(--mx-space-6);
  }

  .mx-app-shell__brand-mark {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--mx-border-strong);
    border-radius: 14px;
    background: linear-gradient(135deg, var(--mx-purple), rgba(212, 175, 55, 0.2));
    color: var(--mx-gold);
    font-family: var(--mx-font-display);
    font-weight: 900;
  }

  .mx-app-shell__brand small,
  .mx-app-shell__heading p,
  .mx-app-shell__footer {
    display: block;
    color: var(--mx-text-muted);
  }

  .mx-app-shell__nav {
    display: flex;
    flex-direction: column;
    gap: var(--mx-space-2);
  }

  .mx-app-shell__nav-item {
    display: flex;
    align-items: center;
    gap: var(--mx-space-3);
    width: 100%;
    padding: var(--mx-space-3);
    border: 1px solid transparent;
    border-radius: var(--mx-radius-md);
    background: transparent;
    color: var(--mx-text-muted);
    text-align: left;
    transition: background var(--mx-transition), border-color var(--mx-transition), color var(--mx-transition), transform var(--mx-transition);
  }

  .mx-app-shell__nav-item:hover,
  .mx-app-shell__nav-item[aria-current="page"] {
    border-color: var(--mx-border-strong);
    background: rgba(212, 175, 55, 0.08);
    color: var(--mx-text);
    transform: translateX(2px);
  }

  .mx-app-shell__main-wrap {
    min-width: 0;
  }

  .mx-app-shell__header {
    min-height: var(--mx-header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--mx-space-4);
    padding: var(--mx-space-5) var(--mx-space-6);
    border-bottom: 1px solid var(--mx-border);
    background: rgba(8, 7, 13, 0.42);
    backdrop-filter: blur(16px);
  }

  .mx-app-shell__heading h1 {
    margin: 0;
    font-family: var(--mx-font-display);
    font-size: clamp(1.25rem, 2vw, 2rem);
  }

  .mx-app-shell__heading p {
    margin: 0.25rem 0 0;
  }

  .mx-app-shell__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--mx-space-2);
  }

  .mx-app-shell__content {
    min-height: calc(100vh - var(--mx-header-height));
  }

  .mx-app-shell__footer {
    padding: var(--mx-space-6);
    border-top: 1px solid var(--mx-border);
  }

  @media (max-width: 900px) {
    .mx-app-shell {
      grid-template-columns: 1fr;
    }

    .mx-app-shell__sidebar {
      position: static;
      height: auto;
      border-right: 0;
      border-bottom: 1px solid var(--mx-border);
    }

    .mx-app-shell__nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
  }
`;

document.head.appendChild(shellStyles);
