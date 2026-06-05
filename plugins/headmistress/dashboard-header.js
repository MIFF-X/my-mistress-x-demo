export function createDashboardHeader() {
  const header = document.createElement("div");
  header.className = "dashboard-header";

  const title = document.createElement("h1");
  title.innerText = "Mistress-X Dashboard";

  header.appendChild(title);

  return header;
}
