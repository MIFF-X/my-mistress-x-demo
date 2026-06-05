import { platformPluginRegistry } from "../../plugins/registry/platform-plugin-registry.js";

export const FEATURE_PROGRESS_STATUS = Object.freeze({
  DONE: "done",
  IN_PROGRESS: "in_progress",
  LOCKED: "locked",
  NOT_STARTED: "not_started",
  BLOCKED: "blocked",
  NEEDS_REVIEW: "needs_review",
});

function mapPluginStatusToFeatureStatus(plugin) {
  if (plugin.progress >= 100) return FEATURE_PROGRESS_STATUS.DONE;
  if (plugin.status === "safety_review") return FEATURE_PROGRESS_STATUS.NEEDS_REVIEW;
  if (plugin.status === "locked") return FEATURE_PROGRESS_STATUS.LOCKED;
  if (plugin.status === "scaffolded" || plugin.progress > 0) return FEATURE_PROGRESS_STATUS.IN_PROGRESS;
  return FEATURE_PROGRESS_STATUS.NOT_STARTED;
}

function pluginToProgressItem(plugin) {
  return {
    id: `plugin-${plugin.id}`,
    title: plugin.name,
    category: `Plugin: ${plugin.category}`,
    status: mapPluginStatusToFeatureStatus(plugin),
    progress: plugin.progress,
    summary: plugin.description,
    source: "platform-plugin-registry",
  };
}

export const baseFeatureProgressRegistry = [
  {
    id: "frontend-scaffold",
    title: "Frontend Scaffold",
    category: "Build Foundation",
    status: FEATURE_PROGRESS_STATUS.DONE,
    progress: 100,
    summary: "Shared tokens, base CSS, UI components, app shell, visible frontend entry, and navigation are scaffolded.",
    source: "feature-progress-registry",
  },
  {
    id: "visible-web-entry",
    title: "Visible Web Entry",
    category: "Build Foundation",
    status: FEATURE_PROGRESS_STATUS.DONE,
    progress: 100,
    summary: "frontend/index.html and frontend/index.js mount the scaffold into a visible runnable page.",
    source: "feature-progress-registry",
  },
  {
    id: "platform-plugin-registry",
    title: "Platform Plugin Registry",
    category: "Plugin Architecture",
    status: FEATURE_PROGRESS_STATUS.DONE,
    progress: 100,
    summary: "Central registry now tracks PPV, live, communication commands, money, stickers, Rolodex, inventory, SMM, styling, badges, admin, and compliance plugins.",
    source: "feature-progress-registry",
  },
  {
    id: "styling-plugin-system",
    title: "Styling Plugin System",
    category: "Brand / Styling",
    status: FEATURE_PROGRESS_STATUS.DONE,
    progress: 100,
    summary: "Styling pack types, registry, and marketplace placeholder are scaffolded.",
    source: "feature-progress-registry",
  },
  {
    id: "brand-assets",
    title: "Brand Assets",
    category: "Brand / Styling",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 80,
    summary: "Pink MX signature and gold MX emblem assets generated locally; binary PNG/ICO upload still pending.",
    source: "feature-progress-registry",
  },
  {
    id: "favicon",
    title: "Favicon / App Icon",
    category: "Brand / Styling",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 60,
    summary: "SVG favicon and manifest committed; binary icon files and final runtime wiring still pending.",
    source: "feature-progress-registry",
  },
  {
    id: "backend-task-list",
    title: "Universal Backend Task List",
    category: "Backend Planning",
    status: FEATURE_PROGRESS_STATUS.DONE,
    progress: 100,
    summary: "Backend, database, admin, compliance, and integration tasks are collected in one document.",
    source: "feature-progress-registry",
  },
  {
    id: "conversation-progress-report",
    title: "Conversation Progress Report",
    category: "Progress Reporting",
    status: FEATURE_PROGRESS_STATUS.DONE,
    progress: 100,
    summary: "The live feature-progress route now summarizes the conversation into done-vs-next lanes for Magnetic, games, money, live, commerce, AI, identity, and publish hygiene.",
    source: "feature-progress-registry",
  },
  {
    id: "runtime-app-merge",
    title: "Runtime App / Expo Merge",
    category: "Integration",
    status: FEATURE_PROGRESS_STATUS.BLOCKED,
    progress: 20,
    summary: "Plain web entry exists; real Expo/app runtime files still need to be located or created.",
    source: "feature-progress-registry",
  },
  {
    id: "safety-compliance-queue",
    title: "Safety / Compliance Rewrite Queue",
    category: "Compliance",
    status: FEATURE_PROGRESS_STATUS.NEEDS_REVIEW,
    progress: 60,
    summary: "Sensitive raw ideas identified and safer implementation directions documented; legal/compliance review still pending.",
    source: "feature-progress-registry",
  },
];

export const conversationScopeProgressRegistry = [
  {
    id: "conversation-branch-setup",
    title: "GitHub, Branch, And Publish Setup",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.DONE,
    progress: 100,
    summary: "Token guidance, app branch identity, main/web branch distinction, branch merge policy, and push-to-feature/abacus-ai-build workflow are settled.",
    source: "conversation-progress-report",
    done: [
      "feature/abacus-ai-build is treated as the working truth branch.",
      "Finished chunks are committed and pushed to GitHub.",
      "README/docs/progress trackers are part of the deliverable.",
    ],
    remaining: [
      "Keep rebasing before each publish because the branch moves across chats.",
      "Keep final ahead/behind checks in every publish cycle.",
    ],
  },
  {
    id: "conversation-readme-progress-reporting",
    title: "README Inventory And Progress Reporting",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.DONE,
    progress: 100,
    summary: "README and Markdown scope passes produced feature inventories, journey trackers, progress bars, and handoff docs.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-magnetic-layer",
    title: "Magnetic Contract Integration Layer",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 85,
    summary: "The Magnetic registry and contract rule are active; touched slices are plugged one at a time while future slices still need entries.",
    source: "conversation-progress-report",
    done: [
      "MX Magnetic Plug-and-Play Integration Layer is the default rule.",
      "Touched slices update contracts, registries, tests, and docs together.",
      "Large rewrites are avoided in favour of bounded feature slices.",
    ],
    remaining: [
      "Continue migrating older game surfaces into Magnetic contracts as they are touched.",
      "Keep frontend progress screens aligned with backend registry names.",
    ],
  },
  {
    id: "conversation-games-suite",
    title: "Games Suite And Game Ops",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 96,
    summary: "Bingo, Lotto, Raffles, casino games, Mystery Box, Scavenger Hunt, Web Game Hub, and Poll overlays are mostly local-complete; draw-game readiness, casino proof readiness, and Scavenger Hunt native proof/reward evidence are visible while the smoke harness reports exact full-staging blockers.",
    source: "conversation-progress-report",
    done: [
      "Game lane reset captured so games stay grouped together.",
      "Scavenger Hunt, Mystery Box, casino/spin wheel, reward configuration, and game hub work are in the active flow.",
      "Scratch Card face image upload preview is started in the React Native game screen.",
      "Focused checks are run around each games slice.",
      "Game provider dry-run now reports full-staging readiness and blockers before live credentials are supplied.",
      "Bingo/Lotto/Raffles app surfaces show role-aware readiness for sales lock, verification, purchase proof, draw progress, and result status.",
      "Admin Analytics now shows casino production proof readiness across audit export, game coverage, revenue split, odds history, and reconciliation.",
      "Game media customisation now has a backend Magnetic game-inventory key for visual and audio upload boundaries.",
      "Admin Analytics now persists Spin Wheel segment picture URLs through durable casino odds settings.",
      "Admin Analytics now persists Spin Wheel centre art through durable casino odds settings and the player wheel loads it.",
      "Mystery Box opens now emit fulfilment plans for credit, PLD, and PPV/content rewards.",
      "Scratch Card face image choices now reload from local per-Mistress game media settings.",
      "Trivia now has backend-synced correct/wrong answer sound URL controls, and Slot reel icon settings sync through backend template media settings.",
      "Slot Machine gameplay now has a route that loads durable reel icons and auto-fits uploaded pictures into the reels.",
      "Slot Machine spins now use backend casino settlement with wallet debit, creator revenue, prize credit, and durable audit history.",
      "Scavenger Hunt now supports Sub photo/video proof uploads, Mistress per-step proof preview, and badge/points/Pink Diamond Hearts reward issue audit.",
    ],
    remaining: [
      "Finish native uploaded game_audio picker flows for Trivia sounds.",
      "Extend PLD ledger issue/debit to Slot Machine, Spin Wheel, and Scratch rewards.",
      "Replace Trivia sound URL controls with native audio picker/upload once the app has a stable file picker path.",
      "Connect real PLD ledger issue/debit and PPV entitlement creation to the Mystery Box fulfilment plan.",
      "Finish staging provider validation.",
    ],
  },
  {
    id: "conversation-live-watch-rooms",
    title: "Live, Watch, And Room Systems",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 90,
    summary: "Watch profiles, room controls, offers, polls, room monitor, and provider readiness are built locally; production provider runs remain.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-money-wallet",
    title: "Wallet, Top-Up, And Earnings Vault",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 74,
    summary: "Ledger hardening, top-up flows, payout APIs, reversals, and Earnings Vault contracts are in place while real processors and payout providers remain open.",
    source: "conversation-progress-report",
    done: [
      "PLD and content reward concepts are captured for game rewards and chests.",
      "Wallet and earnings work is tracked as part of the wider reward economy.",
    ],
    remaining: [
      "Wire PLD purchase, spend, and issue flows into the real wallet ledger.",
      "Add chest odds, stock limits, visibility toggles, and fulfilment audit.",
    ],
  },
  {
    id: "conversation-ppv-content",
    title: "PPV And Content Monetisation",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 70,
    summary: "Timed unlocks, entitlements, signed media events, receipt history, and creator analytics are wired; upload/review polish remains.",
    source: "conversation-progress-report",
    done: [
      "Content reward delivery is part of the games and chest reward plan.",
      "PPV/content entitlement work is tracked as the fulfilment target for content prizes.",
      "The duplicate subscriptionIncluded response field build drift is fixed.",
    ],
    remaining: [
      "Connect game content rewards to PPV/content entitlement delivery.",
      "Finish upload/review polish after entitlement fulfilment is connected.",
    ],
  },
  {
    id: "conversation-marketplace-inventory",
    title: "Marketplace, Inventory, And Style Packs",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 82,
    summary: "Digital add-ons, receipt records, style packs, seller orders, and provider incidents are scaffolded or locally verified; external provider e2e remains.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-rolodex-profile",
    title: "Rolodex, Little Black Book, And Profiles",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 88,
    summary: "Rolodex cards, Little Black Book strips, auto-create hooks, profile menus, badge story metadata, and Sub profile-card partial update hardening are in place; wider privacy QA remains.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-messaging-notifications",
    title: "Messaging, Paid Chat, And Notifications",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 84,
    summary: "Paid chat unlocks, private requests, inbox surfaces, push readiness, and the notification/paid-chat smoke harness are in place; credential-backed provider sandbox run remains.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-admin-compliance",
    title: "Admin, Headmistress, And Compliance",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 76,
    summary: "Command Centre, Admin Member delegation, Quick Check, and compliance queues are active, with permission hardening still to finish.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-sub-rituals",
    title: "Sub Rituals, Devotion Journal, And Daily Service",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 65,
    summary: "Sub Devotion Journal, daily service cards, and gamification scaffolds exist; persistence and review flows remain.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-public-my-gate",
    title: "Public, My Gate, And External Discovery",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 50,
    summary: "Front-of-house gate mapping, Blogspot/My Adult Extra planning, and public discovery modules are captured; Headmistress settings wiring remains.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-unified-shell",
    title: "Unified App Shell And Crown Login",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 90,
    summary: "Shared crown login, unified dashboard home, and tab consolidation are built; visual QA and role-zone cleanup remain.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-abacus-ai",
    title: "Abacus AI Ops Loop",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.IN_PROGRESS,
    progress: 45,
    summary: "Provider dispatch planning and approval loop are scaffolded, while live external sends and provider smoke remain open.",
    source: "conversation-progress-report",
  },
  {
    id: "conversation-production-proof",
    title: "Production CI And Staging Provider Proof",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.BLOCKED,
    progress: 60,
    summary: "Frontend typecheck and nodejs_space build are green locally; remote CI, live credentials, and staging provider smoke remain the main release gate.",
    source: "conversation-progress-report",
    done: [
      "Blockers are separated from feature regressions so working slices stay visible.",
      "Diff checks, focused tests, and branch sync checks are routine.",
      "Frontend typecheck blockers are fixed.",
      "nodejs_space build blockers are fixed, including PPV subscriptionIncluded drift and Scavenger Hunt Prisma JSON typing.",
    ],
    remaining: [
      "Run staging/provider credential validation when secrets are available.",
      "Confirm remote CI on GitHub after push.",
      "Keep local dependencies aligned across Expo/web and nodejs_space runs.",
    ],
  },
  {
    id: "conversation-role-zone-cleanup",
    title: "Role-Zone UI Cleanup",
    category: "Conversation Scope",
    status: FEATURE_PROGRESS_STATUS.NEEDS_REVIEW,
    progress: 45,
    summary: "Wallet payout actions and live room operations are now gated from Sub-facing routes; older dashboard placeholders and visual QA remain.",
    source: "conversation-progress-report",
  },
];

export const pluginDerivedProgressRegistry = platformPluginRegistry.map(pluginToProgressItem);

export const featureProgressRegistry = [
  ...baseFeatureProgressRegistry,
  ...conversationScopeProgressRegistry,
  ...pluginDerivedProgressRegistry,
];

export function getFeatureProgressItems({ category, status, source } = {}) {
  return featureProgressRegistry.filter((item) => {
    if (category && item.category !== category) return false;
    if (status && item.status !== status) return false;
    if (source && item.source !== source) return false;
    return true;
  });
}

export function getFeatureProgressSummary() {
  const total = featureProgressRegistry.length;
  const average = Math.round(featureProgressRegistry.reduce((sum, item) => sum + item.progress, 0) / total);
  const complete = featureProgressRegistry.filter((item) => item.progress >= 100).length;
  const blocked = featureProgressRegistry.filter((item) => item.status === FEATURE_PROGRESS_STATUS.BLOCKED).length;
  const pluginCount = pluginDerivedProgressRegistry.length;
  const pluginAverage = Math.round(pluginDerivedProgressRegistry.reduce((sum, item) => sum + item.progress, 0) / pluginCount);

  const byCategory = featureProgressRegistry.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || { count: 0, progress: 0 };
    acc[item.category].count += 1;
    acc[item.category].progress += item.progress;
    return acc;
  }, {});

  Object.keys(byCategory).forEach((category) => {
    byCategory[category].averageProgress = Math.round(byCategory[category].progress / byCategory[category].count);
  });

  return { total, average, complete, blocked, pluginCount, pluginAverage, byCategory };
}

export function getFeatureProgressById(id) {
  return featureProgressRegistry.find((item) => item.id === id) || null;
}
