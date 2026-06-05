export const pluginRoles = {
  HEADMISTRESS: "headmistress",
  MISTRESS: "mistress",
  SUB: "sub",
  SHARED: "shared"
};

export const pluginPlacements = {
  DASHBOARD: "dashboard",
  PROFILE: "profile",
  CHAT: "chat",
  STORE: "store",
  LIVE: "live",
  ADMIN: "admin"
};

export function createPluginManifest({
  id,
  name,
  description,
  category,
  roles = [],
  placements = [],
  status = "planned",
  enabled = false,
  route = null,
  icon = "🔌",
  phase = "future",
  dependencies = []
}) {
  return {
    id,
    name,
    description,
    category,
    roles,
    placements,
    status,
    enabled,
    route,
    icon,
    phase,
    dependencies
  };
}
