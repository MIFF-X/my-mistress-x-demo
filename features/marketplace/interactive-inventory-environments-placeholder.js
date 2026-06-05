import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const INVENTORY_ENVIRONMENTS = [
  {
    id: "vending-machine",
    label: "Vending Machine",
    icon: "🥤",
    description: "Slot-based storefront for quick-buy items, drops, novelty products, digital unlocks, and limited stock.",
  },
  {
    id: "laundry-hamper",
    label: "Laundry Hamper",
    icon: "🧺",
    description: "Themed inventory space for worn-item style catalogue flows, restocks, collector stickers, and order fulfilment rules.",
  },
  {
    id: "mystery-box",
    label: "Mystery Box",
    icon: "🎁",
    description: "Randomised or curated item box with tier, probability, reveal, fulfilment, and compliance controls.",
  },
  {
    id: "private-vault",
    label: "Private Vault",
    icon: "🗄️",
    description: "Controlled vault for premium, archived, one-of-one, locked, or invitation-only inventory releases.",
  },
  {
    id: "limited-drop",
    label: "Limited Drop",
    icon: "⏳",
    description: "Timed release with countdown, limited quantity, waitlist, purchase lock, and sell-out state.",
  },
  {
    id: "custom-order",
    label: "Custom Order",
    icon: "📝",
    description: "Request-based product flow for approved custom items, quote review, fulfilment notes, and admin checks.",
  },
];

const INVENTORY_STATES = [
  "Draft",
  "Compliance Review",
  "Scheduled",
  "Active",
  "Low Stock",
  "Sold Out",
  "Fulfilment Pending",
  "Shipped / Delivered",
  "Dispute Review",
  "Archived",
];

const INVENTORY_CONTROLS = [
  "Product grid display",
  "Stock quantity / one-of-one logic",
  "Restock schedule",
  "Limited drop countdown",
  "Tiered slot rules",
  "Random dispense probability",
  "Order and fulfilment status",
  "Shipping/compliance review",
  "Matching sticker attachment",
  "Supplier / manual fulfilment notes",
  "Dispute workflow",
  "Admin disable / hide controls",
];

export function createInteractiveInventoryEnvironmentsPlaceholder({ onBack, onCreateInventoryItem } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Marketplace Plugin",
      title: "Interactive Inventory Environments",
      description:
        "Modular marketplace environments for Vending Machine, Laundry Hamper, Mystery Box, Private Vault, limited drops, custom orders, stock, orders, fulfilment, stickers, and compliance review.",
      icon: "🛍️",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Inventory systems captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Environments", value: String(INVENTORY_ENVIRONMENTS.length), helper: "Vending, hamper, mystery, vault, drops, custom", icon: "🛍️", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Stock Backend", value: "Pending", helper: "Quantity, reservations, fulfilment", icon: "📦", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Compliance", value: "Pending", helper: "Allowed categories, shipping, review", icon: "🛡️", progress: 0 }));
  shell.appendChild(stats);

  const itemName = createFormField({ label: "Item name", placeholder: "Limited drop item / vault item / mystery slot" });
  const environment = createFormField({
    label: "Environment",
    type: "select",
    options: INVENTORY_ENVIRONMENTS.map((type) => ({ label: type.label, value: type.id })),
  });
  const price = createFormField({ label: "Price / rule", placeholder: "25 credits / auction / tier unlock / request quote" });
  const quantity = createFormField({ label: "Quantity", type: "number", placeholder: "1" });
  const releaseRule = createFormField({ label: "Release / restock rule", placeholder: "Now / Friday 8pm / monthly / sold-out restock" });
  const compliance = createFormField({
    label: "Compliance status",
    type: "select",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Needs review", value: "needs-review" },
      { label: "Approved placeholder", value: "approved" },
      { label: "Blocked placeholder", value: "blocked" },
    ],
  });
  const submit = createButton({ label: "Create Inventory Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Inventory item setup test form",
      description: "This is a non-saving placeholder. It captures marketplace item structure before stock, wallet, fulfilment, shipping, sticker, and compliance backend wiring are added.",
      fields: [itemName, environment, price, quantity, releaseRule, compliance],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onCreateInventoryItem?.({
      itemName: itemName.control.value,
      environment: environment.control.value,
      price: price.control.value,
      quantity: quantity.control.value,
      releaseRule: releaseRule.control.value,
      compliance: compliance.control.value,
    });
  });
  shell.appendChild(form);

  const environmentGrid = document.createElement("div");
  environmentGrid.className = "mx-grid mx-grid--cards";
  INVENTORY_ENVIRONMENTS.forEach((type) => {
    environmentGrid.appendChild(
      createCard({
        eyebrow: "Inventory Environment",
        title: type.label,
        description: type.description,
        icon: type.icon,
        meta: type.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Inventory Environments",
      title: "Different shop modes for different product experiences",
      description: "Each environment can have its own visual theme, rules, stock behaviour, access rules, and fulfilment path.",
      icon: "🛍️",
    }),
  );
  shell.appendChild(environmentGrid);

  const stateGrid = document.createElement("div");
  stateGrid.className = "mx-grid mx-grid--cards";
  INVENTORY_STATES.forEach((state) => {
    stateGrid.appendChild(
      createCard({
        eyebrow: "Inventory State",
        title: state,
        description: "Placeholder state for future stock, compliance, purchase, fulfilment, dispute, or archive workflow.",
        icon: "📍",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Inventory Lifecycle",
      title: "From draft to fulfilment or archive",
      description: "Marketplace items need clear states so stock, payment, fulfilment, disputes, and compliance review stay in sync.",
      icon: "🔁",
    }),
  );
  shell.appendChild(stateGrid);

  const controlGrid = document.createElement("div");
  controlGrid.className = "mx-grid mx-grid--cards";
  INVENTORY_CONTROLS.forEach((control) => {
    controlGrid.appendChild(
      createCard({
        eyebrow: "Marketplace Control",
        title: control,
        description: "Placeholder control for future inventory, wallet, order, sticker, fulfilment, admin, or compliance wiring.",
        icon: "✅",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Control Map",
      title: "Marketplace systems feeding systems",
      description: "Inventory connects to wallet, orders, stickers, PPV unlocks, chat, notifications, Mistress earnings, Headmistress reports, and compliance review.",
      icon: "🧩",
    }),
  );
  shell.appendChild(controlGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Compliance Rule",
      title: "Physical products need allowed-category and shipping review",
      description:
        "Physical goods must pass allowed-category rules, age/access checks where applicable, safe shipping workflows, dispute review, and admin controls before launch.",
      icon: "🛡️",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Inventory purchase ledger path",
      description:
        "Mistress creates item → compliance status is checked → item appears in selected environment → Sub buys or requests item → wallet ledger records spend → stock is reserved/reduced → order moves through fulfilment → matching sticker, notifications, earnings, and reports update.",
      icon: "📒",
    }),
  );

  return shell;
}
