import { createButton } from "../ui/button.js";
import { createCard } from "../ui/card.js";
import { getStylingPacks } from "./styling-pack-registry.js";

export function createStylingMarketplacePlaceholder({ packs = getStylingPacks(), onInstall, onPreview } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Styling Plugin Marketplace",
      title: "Installable visual packs",
      description: "Placeholder marketplace for brand marks, icons, badges, card decks, House themes, fonts, seals, stamps, and favicon packs.",
      icon: "🎨",
    }),
  );

  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  packs.forEach((pack) => {
    grid.appendChild(
      createCard({
        eyebrow: `${pack.tier} · ${pack.status}`,
        title: pack.name,
        description: pack.description,
        icon: pack.type === "gif_decks" ? "🃏" : pack.type === "badges" ? "🏆" : pack.type === "icons" ? "✨" : "👑",
        meta: pack.priceCredits ? `${pack.priceCredits} credits` : "Included",
        actions: [
          createButton({ label: "Preview", variant: "secondary", onClick: () => onPreview?.(pack) }),
          createButton({ label: pack.priceCredits ? "Buy / Install" : "Install", variant: "gold", onClick: () => onInstall?.(pack) }),
        ],
      }),
    );
  });

  shell.appendChild(grid);
  return shell;
}
