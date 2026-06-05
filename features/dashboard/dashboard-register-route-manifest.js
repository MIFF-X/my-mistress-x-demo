export const dashboardRegisterRouteManifest = [
  { key: "badges", label: "Badges + Awards", target: "badge-awards-trophy-system", category: "rewards", status: "scaffolded" },
  { key: "backend", label: "Backend Task Queue", target: "backend-task-dashboard", category: "system", status: "scaffolded" },
  { key: "calls", label: "Calls + Bookings", target: "paid-calls-bookings", category: "live", status: "scaffolded" },
  { key: "command", label: "Command Centre", target: "headmistress-command-centre", category: "admin", status: "scaffolded" },
  { key: "compliance", label: "Compliance Shield", target: "compliance-shield", category: "safety", status: "scaffolded" },
  { key: "earnings", label: "Earnings Vault", target: "earnings-vault", category: "money", status: "scaffolded" },
  { key: "inventory", label: "Interactive Inventory", target: "inventory-environments", category: "marketplace", status: "scaffolded" },
  { key: "live", label: "Live Rooms", target: "live-shows-chat-sidebar", category: "live", status: "scaffolded" },
  { key: "plugins", label: "Plugin Registry", target: "platform-plugin-dashboard", category: "system", status: "scaffolded" },
  { key: "ppv", label: "Content Library", target: "ppv-content-library", category: "content", status: "scaffolded" },
  { key: "rolodex", label: "Rolodex Cards", target: "rolodex-contact-cards", category: "relationship", status: "scaffolded" },
  { key: "stickers", label: "Sticker Collections", target: "sticker-collector-system", category: "collectibles", status: "scaffolded" },
  { key: "topUp", label: "Top-Up Options", target: "top-up-payment-options", category: "money", status: "scaffolded" },
];

export function getDashboardRouteByKey(key) {
  return dashboardRegisterRouteManifest.find((route) => route.key === key) || null;
}

export function getDashboardRoutesByCategory(category) {
  return dashboardRegisterRouteManifest.filter((route) => route.category === category);
}

export function getDashboardRouteKeys() {
  return dashboardRegisterRouteManifest.map((route) => route.key);
}
