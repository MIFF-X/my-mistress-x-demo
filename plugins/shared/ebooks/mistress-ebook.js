export const MISTRESS_EBOOK = {
  slug: "mistress-ebook",
  title: "Mistress Ebook",
  audience: "Mistress",
  status: "ebook-canonical",
  summary: "A plugin-ready guide lane for Mistress training, sales, content, and platform operations.",
};

export function createMistressEbookCard() {
  const card = document.createElement("article");
  card.className = "ebook-card ebook-card--mistress";

  const title = document.createElement("h3");
  title.innerText = MISTRESS_EBOOK.title;

  const summary = document.createElement("p");
  summary.innerText = MISTRESS_EBOOK.summary;

  card.appendChild(title);
  card.appendChild(summary);

  return card;
}
