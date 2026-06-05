export const MISTRESS_UTILITY_TILE_STATUS = {
  PLANNED: "planned",
  SCAFFOLDED: "scaffolded",
  SAFETY_GATED: "safety_gated",
};

export const mistressUtilityTiles = [
  {
    id: "quick-check-zone",
    title: "Quick Check Zone",
    icon: "⚡",
    routeKey: "backend",
    status: MISTRESS_UTILITY_TILE_STATUS.PLANNED,
    priority: "now",
    description: "One creator inbox for messages, bookings, requests, confessions, affirmations, secrets, contracts, contributions, Rolodex review, and fulfilment alerts.",
    firstBuild: "Create a safe placeholder panel with counts, attention badges, and source lanes before live inbox data wiring.",
  },
  {
    id: "mistress-rolodex",
    title: "Mistress Rolodex",
    icon: "🗂️",
    routeKey: "rolodex",
    status: MISTRESS_UTILITY_TILE_STATUS.SAFETY_GATED,
    priority: "now",
    description: "Mistress-only collected Sub cards, private notes, groups, tags, colour coding, relationship history, and quick visual markers.",
    firstBuild: "Keep data role-scoped to the Mistress owner and separate private Mistress notes from Sub-submitted card fields.",
  },
  {
    id: "booking-requests",
    title: "Booking Requests",
    icon: "📅",
    routeKey: "calls",
    status: MISTRESS_UTILITY_TILE_STATUS.SCAFFOLDED,
    priority: "next",
    description: "Paid phone/video booking requests, approval, decline, refund, scheduled time, countdown, and follow-up status.",
    firstBuild: "Surface booking counts and action states before backend call-session ledger wiring.",
  },
  {
    id: "ppv-content-manager",
    title: "PPV Content Manager",
    icon: "🎬",
    routeKey: "ppv",
    status: MISTRESS_UTILITY_TILE_STATUS.SAFETY_GATED,
    priority: "next",
    description: "Upload paid media, set price, duration, buy-to-keep access, subscription bundle availability, and content zone placement.",
    firstBuild: "Create upload/pricing/access placeholders without connecting real media storage yet.",
  },
  {
    id: "live-room-control",
    title: "Live Room Control",
    icon: "📡",
    routeKey: "live",
    status: MISTRESS_UTILITY_TILE_STATUS.SAFETY_GATED,
    priority: "next",
    description: "Start live rooms, manage sidebar chat, viewer count, room locks, micro-gifts, paid requests, and access-code rooms.",
    firstBuild: "Keep camera, recording, and viewer-cam controls behind consent and moderation gates.",
  },
  {
    id: "inventory-fulfilment",
    title: "Inventory + Fulfilment",
    icon: "🛍️",
    routeKey: "inventory",
    status: MISTRESS_UTILITY_TILE_STATUS.SAFETY_GATED,
    priority: "later",
    description: "Store, vending machine, hamper, stock, drops, fulfilment, custom requests, order state, and dispute status.",
    firstBuild: "Use catalogue placeholders until category rules, fulfilment states, and dispute flows exist.",
  },
  {
    id: "gamify-panel",
    title: "Gamify Panel",
    icon: "🏆",
    routeKey: "badges",
    status: MISTRESS_UTILITY_TILE_STATUS.PLANNED,
    priority: "later",
    description: "Leaderboards, badges, trophies, streaks, awards, overlays, game tools, and seasonal ranking controls.",
    firstBuild: "Connect to badge/leaderboard placeholder before real points and award automation.",
  },
];

export function getMistressUtilityTileById(id) {
  return mistressUtilityTiles.find((tile) => tile.id === id) || null;
}

export function getMistressUtilityTilesByPriority(priority) {
  return mistressUtilityTiles.filter((tile) => tile.priority === priority);
}

export function getMistressUtilityTilesByStatus(status) {
  return mistressUtilityTiles.filter((tile) => tile.status === status);
}
