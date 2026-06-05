export function createCard({
  eyebrow = "",
  title = "Card title",
  description = "Starter card description.",
  icon = "",
  meta = "",
  actions = [],
  children = [],
  variant = "default",
} = {}) {
  const card = document.createElement("article");
  card.className = `mx-card mx-card--${variant}`;

  const header = document.createElement("header");
  header.className = "mx-card__header";

  const textWrap = document.createElement("div");
  textWrap.className = "mx-card__text";

  if (eyebrow) {
    const eyebrowEl = document.createElement("div");
    eyebrowEl.className = "mx-card__eyebrow";
    eyebrowEl.textContent = eyebrow;
    textWrap.appendChild(eyebrowEl);
  }

  const heading = document.createElement("h3");
  heading.textContent = title;
  textWrap.appendChild(heading);

  if (description) {
    const body = document.createElement("p");
    body.textContent = description;
    textWrap.appendChild(body);
  }

  if (icon) {
    const iconEl = document.createElement("div");
    iconEl.className = "mx-card__icon";
    iconEl.setAttribute("aria-hidden", "true");
    iconEl.textContent = icon;
    header.appendChild(iconEl);
  }

  header.appendChild(textWrap);
  card.appendChild(header);

  children.forEach((child) => card.appendChild(child));

  if (meta || actions.length) {
    const footer = document.createElement("footer");
    footer.className = "mx-card__footer";

    const metaEl = document.createElement("span");
    metaEl.className = "mx-card__meta";
    metaEl.textContent = meta;
    footer.appendChild(metaEl);

    const actionWrap = document.createElement("div");
    actionWrap.className = "mx-card__actions";
    actions.forEach((action) => actionWrap.appendChild(action));
    footer.appendChild(actionWrap);

    card.appendChild(footer);
  }

  return card;
}

export function createStatCard({ label, value, helper = "", icon = "", progress = null } = {}) {
  const progressEl = document.createElement("div");
  if (typeof progress === "number") {
    const safeProgress = Math.max(0, Math.min(100, progress));
    progressEl.className = "mx-progress-track";
    progressEl.innerHTML = `<div class="mx-progress-fill" style="width:${safeProgress}%"></div>`;
  }

  return createCard({
    eyebrow: label,
    title: value,
    description: helper,
    icon,
    variant: "stat",
    children: typeof progress === "number" ? [progressEl] : [],
  });
}

const cardStyles = document.createElement("style");
cardStyles.textContent = `
  .mx-card {
    position: relative;
    overflow: hidden;
    padding: var(--mx-space-5);
    border: 1px solid var(--mx-border);
    border-radius: var(--mx-radius-lg);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035));
    box-shadow: var(--mx-shadow-soft);
  }

  .mx-card::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.12), transparent 14rem);
  }

  .mx-card__header {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--mx-space-4);
  }

  .mx-card__icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    border-radius: var(--mx-radius-md);
    border: 1px solid var(--mx-border-strong);
    background: rgba(212, 175, 55, 0.08);
    font-size: 1.35rem;
  }

  .mx-card__text {
    min-width: 0;
  }

  .mx-card__eyebrow {
    margin-bottom: var(--mx-space-2);
    color: var(--mx-gold);
    font-size: var(--mx-text-xs);
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .mx-card h3 {
    margin: 0;
    font-size: var(--mx-text-lg);
  }

  .mx-card p {
    margin: var(--mx-space-2) 0 0;
    color: var(--mx-text-muted);
    line-height: 1.55;
  }

  .mx-card__footer {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--mx-space-3);
    margin-top: var(--mx-space-5);
  }

  .mx-card__meta {
    color: var(--mx-text-soft);
    font-size: var(--mx-text-xs);
  }

  .mx-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mx-space-2);
  }

  .mx-card--stat h3 {
    font-size: var(--mx-text-2xl);
    color: var(--mx-text);
  }

  .mx-card--warning {
    border-color: rgba(255, 176, 32, 0.44);
  }

  .mx-card--danger {
    border-color: rgba(216, 90, 48, 0.44);
  }
`;

document.head.appendChild(cardStyles);
