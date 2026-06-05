export const DASHBOARD_PRIORITY_LEVELS = {
  NOW: "now",
  NEXT: "next",
  LATER: "later",
  SAFETY_FIRST: "safety_first",
};

export const dashboardBuildPriorities = [
  {
    moduleName: "Wallet",
    routeKey: "topUp",
    role: "sub",
    priority: DASHBOARD_PRIORITY_LEVELS.NOW,
    reason: "Wallet visibility supports top-ups, paid chat, PPV, live rooms, gifts, subscriptions, and spending limits.",
    nextAction: "Keep wallet visible on Sub screens and connect safe placeholder routes before live payment wiring.",
  },
  {
    moduleName: "Quick Check Zone",
    routeKey: "backend",
    role: "mistress",
    priority: DASHBOARD_PRIORITY_LEVELS.NOW,
    reason: "Mistress needs one place to see messages, bookings, requests, confessions, contributions, and fulfilment alerts.",
    nextAction: "Create a visible quick-check placeholder panel before wiring live inbox data.",
  },
  {
    moduleName: "Rolodex",
    routeKey: "rolodex",
    role: "mistress",
    priority: DASHBOARD_PRIORITY_LEVELS.NOW,
    reason: "Rolodex/contact cards are central to Sub management, grouping, notes, private cards, and Black Book flows.",
    nextAction: "Add safe card scaffolds and keep Mistress notes separate from Sub-submitted profile card data.",
  },
  {
    moduleName: "Live Shows",
    routeKey: "live",
    role: "mistress-sub",
    priority: DASHBOARD_PRIORITY_LEVELS.NEXT,
    reason: "Live shows connect the chat sidebar, viewer count, gifts, requests, public rooms, locked rooms, and TV guide.",
    nextAction: "Expand live room placeholders and keep camera/recording controls gated until consent tools exist.",
  },
  {
    moduleName: "Paid Calls",
    routeKey: "calls",
    role: "mistress-sub",
    priority: DASHBOARD_PRIORITY_LEVELS.NEXT,
    reason: "Paid calls need booking, timing, pricing, countdown, extensions, and cancellation/refund state.",
    nextAction: "Keep paid call booking screen scaffolded while backend session ledger is planned.",
  },
  {
    moduleName: "PPV Content",
    routeKey: "ppv",
    role: "mistress-sub",
    priority: DASHBOARD_PRIORITY_LEVELS.NEXT,
    reason: "PPV is core to content monetisation and subscription bundles.",
    nextAction: "Create upload/pricing/access placeholders before real media storage and content access ledger.",
  },
  {
    moduleName: "Locked Vault",
    routeKey: "compliance",
    role: "sub",
    priority: DASHBOARD_PRIORITY_LEVELS.SAFETY_FIRST,
    reason: "Sensitive verification data must not connect to live data until consent, expiry, revoke, and audit controls exist.",
    nextAction: "Build a non-data placeholder first, then design consent ledger and access grant records.",
  },
  {
    moduleName: "Store / Vending / Hamper",
    routeKey: "inventory",
    role: "mistress-sub",
    priority: DASHBOARD_PRIORITY_LEVELS.LATER,
    reason: "Interactive inventory is powerful but needs category rules, fulfilment, disputes, shipping, and stock ledgers.",
    nextAction: "Keep as placeholder until marketplace compliance and order state are designed.",
  },
  {
    moduleName: "Bank",
    routeKey: "earnings",
    role: "headmistress",
    priority: DASHBOARD_PRIORITY_LEVELS.SAFETY_FIRST,
    reason: "Platform financial controls must stay admin-only and audit logged.",
    nextAction: "Use read-only summaries first; money movement comes after role guards and ledger design.",
  },
];

export function getDashboardPrioritiesByLevel(priority) {
  return dashboardBuildPriorities.filter((item) => item.priority === priority);
}

export function getDashboardPriorityForModule(moduleName) {
  return dashboardBuildPriorities.find((item) => item.moduleName === moduleName) || null;
}
