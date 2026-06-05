import { createCard } from "../ui/card.js";
import { createButton } from "../ui/button.js";

export const placeholderProducts = [
  { id: "store-001", title: "Digital Gift", type: "DIGITAL", price: 5, icon: "🎁" },
  { id: "store-002", title: "PPV Unlock", type: "CONTENT", price: 25, icon: "🎬" },
  { id: "store-003", title: "Sticker Pack", type: "COLLECTIBLE", price: 10, icon: "🏷️" },
  { id: "store-004", title: "Keeper Agreement", type: "ACCESS", price: 100, icon: "🔐" },
];

export function createProductGridPlaceholder({ products = placeholderProducts, onSelect } = {}) {
  const wrap = document.createElement("section");
  wrap.className = "mx-page mx-stack";

  const header = createCard({
    eyebrow: "Marketplace / Product Grid",
    title: "Product listing placeholder",
    description: "Starter grid for store, hamper, vending, PPV, sticker packs, subscriptions, and future paid add-ons.",
    icon: "🛍️",
  });

  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";
  products.forEach((product) => {
    grid.appendChild(
      createCard({
        eyebrow: product.type,
        title: product.title,
        description: `${product.price} credits`,
        icon: product.icon,
        actions: [
          createButton({ label: "View", variant: "secondary", onClick: () => onSelect?.(product) }),
          createButton({ label: "Buy", variant: "gold", onClick: () => onSelect?.(product) }),
        ],
      }),
    );
  });

  wrap.appendChild(header);
  wrap.appendChild(grid);
  return wrap;
}
