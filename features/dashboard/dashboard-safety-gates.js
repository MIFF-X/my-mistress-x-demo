export const DASHBOARD_SAFETY_LEVELS = {
  OPEN: "open",
  ACCOUNT: "account",
  CONSENT: "consent",
  MODERATION: "moderation",
  ADMIN: "admin",
};

export const dashboardSafetyGates = [
  {
    moduleName: "Locked Vault",
    routeKey: "compliance",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.CONSENT,
    reason: "Sensitive identity, document, and verification data requires explicit permission, revoke controls, and audit logs.",
    launchRule: "Do not launch until consent ledger, access expiry, revoke flow, and admin audit trail exist.",
  },
  {
    moduleName: "Little Black Book",
    routeKey: "rolodex",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.ACCOUNT,
    reason: "Relationship history and private interaction context should only be visible to the owning account and approved role views.",
    launchRule: "Require role-based access checks before connecting real user data.",
  },
  {
    moduleName: "Rolodex",
    routeKey: "rolodex",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.CONSENT,
    reason: "Sub contact cards, notes, colour coding, and profile markers can contain private relationship information.",
    launchRule: "Separate Sub-submitted card data from Mistress private notes before backend wiring.",
  },
  {
    moduleName: "PPV Content",
    routeKey: "ppv",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.MODERATION,
    reason: "Paid media requires access controls, expiry rules, content moderation, and ownership tracking.",
    launchRule: "Require content access ledger, purchase record, expiry engine, and moderation flags.",
  },
  {
    moduleName: "Live Shows",
    routeKey: "live",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.MODERATION,
    reason: "Live interaction, requests, chat, viewer count, and camera modes need clear consent and moderation controls.",
    launchRule: "Require opt-in camera state, room access rules, reports, moderation, and recording/replay controls.",
  },
  {
    moduleName: "Paid Calls",
    routeKey: "calls",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.MODERATION,
    reason: "Timed voice/video sessions need booking approval, timer enforcement, payment records, and dispute/refund pathways.",
    launchRule: "Require call session ledger, countdown state, extension payment flow, and cancellation/refund state.",
  },
  {
    moduleName: "Store / Vending / Hamper",
    routeKey: "inventory",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.MODERATION,
    reason: "Physical and digital inventory needs category rules, fulfilment status, refunds, and dispute handling.",
    launchRule: "Require allowed-category controls, stock ledger, order state, and fulfilment/dispute records.",
  },
  {
    moduleName: "Bank",
    routeKey: "earnings",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.ADMIN,
    reason: "Platform revenue, reserves, payouts, and financial reporting must be restricted to admin roles.",
    launchRule: "Require admin role guard, audit log, and read-only financial summaries before money movement controls.",
  },
  {
    moduleName: "Oversight",
    routeKey: "command",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.ADMIN,
    reason: "Reports, moderation, user controls, and audit queues are platform governance tools.",
    launchRule: "Require Headmistress/admin permissions, action logging, and reversible moderation workflows.",
  },
  {
    moduleName: "Compliance Shield",
    routeKey: "compliance",
    safetyLevel: DASHBOARD_SAFETY_LEVELS.ADMIN,
    reason: "Compliance controls define platform-wide rules and should be limited to authorised administrators.",
    launchRule: "Require admin-only access and immutable audit logs for rule changes.",
  },
];

export function getSafetyGateForModule(moduleName) {
  return dashboardSafetyGates.find((gate) => gate.moduleName === moduleName) || null;
}

export function getSafetyGatesByLevel(safetyLevel) {
  return dashboardSafetyGates.filter((gate) => gate.safetyLevel === safetyLevel);
}

export function requiresSafetyGate(moduleName) {
  return Boolean(getSafetyGateForModule(moduleName));
}
