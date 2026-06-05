export const ROLODEX_SCOPE_LEVELS = {
  SUB_PERSONAL: "sub_personal",
  MISTRESS_PERSONAL: "mistress_personal",
  HEADMISTRESS_MASTER: "headmistress_master",
};

export const dashboardRolodexScopeRules = [
  {
    role: "sub",
    scope: ROLODEX_SCOPE_LEVELS.SUB_PERSONAL,
    dashboardName: "Sub Dashboard",
    rolodexName: "Little Black Book",
    canSee: "Only Mistresses the Sub has collected, favourited, followed, unlocked, interacted with, or saved.",
    cannotSee: "The Sub cannot see the platform master Rolodex, other Subs, or another Sub's collected Mistresses.",
    purpose: "Gives each Sub a private Mistress relationship and discovery history without exposing platform-wide records.",
  },
  {
    role: "mistress",
    scope: ROLODEX_SCOPE_LEVELS.MISTRESS_PERSONAL,
    dashboardName: "Mistress Dashboard",
    rolodexName: "Mistress Rolodex",
    canSee: "Only Subs collected by that Mistress through follows, favourites, messages, purchases, bookings, tribute, card submission, or approved relationship history.",
    cannotSee: "The Mistress cannot see another Mistress's private Sub list or the full Headmistress master Rolodex.",
    purpose: "Keeps each Mistress's business network private and limited to her own collected/supporting Subs.",
  },
  {
    role: "headmistress",
    scope: ROLODEX_SCOPE_LEVELS.HEADMISTRESS_MASTER,
    dashboardName: "Headmistress Control Centre",
    rolodexName: "Master Rolodex",
    canSee: "All Mistresses and all Subs across the platform, including relationship links needed for safety, reporting, moderation, analytics, and compliance.",
    cannotSee: "Master access should not expose private notes casually; sensitive fields still require audit, admin permission, and policy purpose.",
    purpose: "Provides platform-wide oversight while preserving audit and compliance rules for sensitive data.",
  },
];

export function getRolodexScopeForRole(role) {
  return dashboardRolodexScopeRules.find((rule) => rule.role === role) || null;
}

export function getRolodexScopeByLevel(scope) {
  return dashboardRolodexScopeRules.find((rule) => rule.scope === scope) || null;
}
