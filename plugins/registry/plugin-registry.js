/**
 * Mistress-X Plugin Registry
 *
 * This is the frontend/app-side registry for installable platform modules.
 * It is intentionally framework-light so it can be reused while the app moves
 * from frontend simulation into the NestJS API-backed version.
 */

export const PLUGIN_AREAS = Object.freeze({
  MISTRESS: "mistress",
  SUB: "sub",
  HEADMISTRESS: "headmistress",
  SHARED: "shared",
  SITE: "site",
});

export const PLUGIN_STATUS = Object.freeze({
  PLANNED: "planned",
  SCAFFOLDED: "scaffolded",
  ACTIVE: "active",
  DISABLED: "disabled",
});

export const pluginRegistry = [
  {
    id: "wallet-core",
    name: "Wallet Core",
    area: PLUGIN_AREAS.SHARED,
    status: PLUGIN_STATUS.SCAFFOLDED,
    description: "Credits, balance checks, spending events, and 70/30 revenue split foundation.",
    permissions: ["wallet:read", "wallet:spend", "ledger:create"],
    dependencies: [],
  },
  {
    id: "chat-core",
    name: "Chat Core",
    area: PLUGIN_AREAS.SHARED,
    status: PLUGIN_STATUS.SCAFFOLDED,
    description: "Direct chat, grouped chats, message types, stickers, gifts, and contact-card sharing.",
    permissions: ["chat:read", "chat:write", "notification:create"],
    dependencies: [],
  },
  {
    id: "ppv-content",
    name: "PPV Content",
    area: PLUGIN_AREAS.MISTRESS,
    status: PLUGIN_STATUS.PLANNED,
    description: "Mistress uploads content, sets price, duration, buy-to-keep, and bundle access.",
    permissions: ["content:create", "content:price", "wallet:spend"],
    dependencies: ["wallet-core"],
  },
  {
    id: "live-shows",
    name: "Live Shows",
    area: PLUGIN_AREAS.MISTRESS,
    status: PLUGIN_STATUS.PLANNED,
    description: "Ticketed live rooms with chat sidebar, gifts, paid requests, and session controls.",
    permissions: ["live:create", "chat:write", "wallet:spend"],
    dependencies: ["wallet-core", "chat-core"],
  },
  {
    id: "video-calls",
    name: "Video Calls",
    area: PLUGIN_AREAS.MISTRESS,
    status: PLUGIN_STATUS.PLANNED,
    description: "Paid bookings, countdown timers, calendar slots, extensions, and call session billing.",
    permissions: ["booking:create", "call:create", "wallet:spend"],
    dependencies: ["wallet-core", "chat-core"],
  },
  {
    id: "mx-stream-deck",
    name: "MX Stream Deck",
    area: PLUGIN_AREAS.SHARED,
    status: PLUGIN_STATUS.SCAFFOLDED,
    description: "Role-aware command deck for quick replies, game buttons, live prompts, wallet/PPV asks, bookings, stickers, admin checks, personal shortcuts, QR setup, direct admin/live/PPV/gift/booking/SMM/wallet handoff, action retention, and Headmistress evidence controls.",
    icon: "CMD",
    permissions: ["chat:write", "live:control", "wallet:prompt", "plugin:pair-device"],
    dependencies: ["wallet-core", "chat-core"],
  },
  {
    id: "digital-gifts",
    name: "Digital Gifts",
    area: PLUGIN_AREAS.SHARED,
    status: PLUGIN_STATUS.PLANNED,
    description: "Still and animated gifts, chat overlay sends, storage, pockets, and Mistress cash-in flow.",
    permissions: ["gift:send", "gift:own", "wallet:spend"],
    dependencies: ["wallet-core", "chat-core"],
  },
  {
    id: "stickers",
    name: "Sticker Collections",
    area: PLUGIN_AREAS.SHARED,
    status: PLUGIN_STATUS.PLANNED,
    description: "Mistress photo-to-sticker editor, monthly drops, sub sticker book, and Mistress collection book.",
    permissions: ["sticker:create", "sticker:own", "sticker:send"],
    dependencies: ["wallet-core", "chat-core"],
  },
  {
    id: "rolodex-cards",
    name: "Digital Rolodex Cards",
    area: PLUGIN_AREAS.MISTRESS,
    status: PLUGIN_STATUS.PLANNED,
    description: "Pokemon-style sub cards, private notes, colour coding, kink icons, and share/request flow.",
    permissions: ["card:create", "card:share", "card:note"],
    dependencies: ["chat-core"],
  },
  {
    id: "inventory-worlds",
    name: "Interactive Inventory Worlds",
    area: PLUGIN_AREAS.MISTRESS,
    status: PLUGIN_STATUS.PLANNED,
    description: "Vending machine, laundry hamper, locker, mystery box, limited drops, and restock schedules.",
    permissions: ["inventory:create", "inventory:sell", "wallet:spend"],
    dependencies: ["wallet-core"],
  },
  {
    id: "content-worlds",
    name: "Mistress Content Worlds",
    area: PLUGIN_AREAS.MISTRESS,
    status: PLUGIN_STATUS.PLANNED,
    description: "Photo album, Mistress library, video store, live show hub, tiers, bookmarks, and unlocks.",
    permissions: ["content:create", "content:unlock", "wallet:spend"],
    dependencies: ["wallet-core"],
  },
];

export function getPluginsByArea(area) {
  return pluginRegistry.filter((plugin) => plugin.area === area);
}

export function getPluginById(pluginId) {
  return pluginRegistry.find((plugin) => plugin.id === pluginId) || null;
}

export function canActivatePlugin(pluginId, activePluginIds = []) {
  const plugin = getPluginById(pluginId);

  if (!plugin) {
    return { ok: false, reason: "Plugin not found." };
  }

  const missingDependencies = plugin.dependencies.filter(
    (dependencyId) => !activePluginIds.includes(dependencyId),
  );

  if (missingDependencies.length > 0) {
    return {
      ok: false,
      reason: `Missing dependencies: ${missingDependencies.join(", ")}`,
    };
  }

  return { ok: true, reason: "Plugin can be activated." };
}
