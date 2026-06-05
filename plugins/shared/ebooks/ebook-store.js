import { MISTRESS_EBOOK } from "./mistress-ebook.js";
import { SUB_SERVITUDE_GUIDE } from "./sub-servitude-guide.js";

export const EBOOK_CATALOG = [MISTRESS_EBOOK, SUB_SERVITUDE_GUIDE];

export function listEbooks() {
  return EBOOK_CATALOG.map((ebook) => ({ ...ebook }));
}

export function findEbookBySlug(slug) {
  return EBOOK_CATALOG.find((ebook) => ebook.slug === slug) ?? null;
}

export function createEbookStoreCard(ebook) {
  const card = document.createElement("article");
  card.className = "ebook-store-card";
  card.dataset.ebookSlug = ebook.slug;

  const title = document.createElement("h3");
  title.innerText = ebook.title;

  const summary = document.createElement("p");
  summary.innerText = ebook.summary;

  const meta = document.createElement("p");
  meta.className = "ebook-store-card__meta";
  meta.innerText = `${ebook.audience} | ${ebook.status}`;

  card.appendChild(title);
  card.appendChild(summary);
  card.appendChild(meta);

  return card;
}
