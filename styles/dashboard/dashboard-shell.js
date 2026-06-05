export function createDashboardShell({ title = "Dashboard", subtitle = "", content = [] } = {}) {
  const shell = document.createElement("div");
  shell.className = "page-shell dashboard-shell";

  const header = document.createElement("header");
  header.className = "dashboard-shell-header";

  const heading = document.createElement("h1");
  heading.innerText = title;
  header.appendChild(heading);

  if (subtitle) {
    const copy = document.createElement("p");
    copy.innerText = subtitle;
    header.appendChild(copy);
  }

  const body = document.createElement("main");
  body.className = "dashboard-shell-body";

  const children = Array.isArray(content) ? content : [content];
  children.filter(Boolean).forEach((child) => body.appendChild(child));

  shell.appendChild(header);
  shell.appendChild(body);

  return shell;
}
