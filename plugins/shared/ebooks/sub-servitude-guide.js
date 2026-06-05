export const SUB_SERVITUDE_GUIDE = {
  slug: "sub-servitude-guide",
  title: "Sub Servitude Guide",
  audience: "Sub",
  status: "ebook-canonical",
  summary: "A plugin-ready guide lane for Sub onboarding, rituals, service expectations, and progress reading.",
};

export function createSubServitudeGuideCard() {
  const card = document.createElement("article");
  card.className = "ebook-card ebook-card--sub";

  const title = document.createElement("h3");
  title.innerText = SUB_SERVITUDE_GUIDE.title;

  const summary = document.createElement("p");
  summary.innerText = SUB_SERVITUDE_GUIDE.summary;

  card.appendChild(title);
  card.appendChild(summary);

  return card;
}
