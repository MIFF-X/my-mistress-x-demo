export const MISTRESS_FEED_ITEMS = [
  {
    id: "live-room",
    title: "Live room update",
    audience: "Followers",
    status: "ready",
    detail: "Promote staged live shows, after-show offers, and viewer-safe room highlights.",
  },
  {
    id: "ppv-drop",
    title: "PPV drop",
    audience: "Subscribers",
    status: "queued",
    detail: "Announce paid content without granting access outside the owned entitlement flow.",
  },
  {
    id: "reward-callout",
    title: "Reward callout",
    audience: "Private",
    status: "draft",
    detail: "Mention tributes, title holders, or loyal Subs while respecting private labels.",
  },
  {
    id: "booking-window",
    title: "Booking window",
    audience: "Approved Subs",
    status: "ready",
    detail: "Share call, video, or follow-up availability connected to the booking inbox.",
  },
];

export function getMistressFeedItems(overrides = []) {
  return overrides.length > 0 ? overrides : MISTRESS_FEED_ITEMS;
}

function createFeedItemCard(item) {
  const card = document.createElement("article");
  card.className = "panel stat-card mistress-feed-item";
  card.dataset.feedItemId = item.id;

  const title = document.createElement("h3");
  title.innerText = item.title;

  const meta = document.createElement("p");
  meta.innerText = `${item.audience} - ${item.status}`;

  const detail = document.createElement("p");
  detail.innerText = item.detail;

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(detail);

  return card;
}

export function createMistressFeedPanel({ items = MISTRESS_FEED_ITEMS } = {}) {
  const panel = document.createElement("section");
  panel.className = "panel mistress-feed-panel";

  const title = document.createElement("h2");
  title.innerText = "Mistress Feed";

  const intro = document.createElement("p");
  intro.innerText = "Creator-owned updates for public, follower, subscriber, and private audiences.";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid mistress-feed-list";

  getMistressFeedItems(items).forEach((item) => {
    grid.appendChild(createFeedItemCard(item));
  });

  panel.appendChild(title);
  panel.appendChild(intro);
  panel.appendChild(grid);

  return panel;
}
