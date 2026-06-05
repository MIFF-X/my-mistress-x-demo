export const LIVE_SHOW_CATEGORIES = [
  { id: "featured", label: "Featured Live", description: "Primary featured live room format." },
  { id: "qa", label: "Q and A Live", description: "Question and answer live room format." },
  { id: "games", label: "Trivia and Games", description: "Structured games with rounds and scoreboards." },
  { id: "daily-chat", label: "Daily Chat", description: "Recurring talk-led room format." },
  { id: "getting-ready", label: "Getting Ready", description: "Lifestyle preparation room format." },
  { id: "self-care", label: "Self Care", description: "Self care and routine room format." },
  { id: "household", label: "Household", description: "Daily life and household room format." },
  { id: "outings", label: "Outings", description: "Mobile lifestyle room format." },
  { id: "props", label: "Props and Themes", description: "Theme-led room format using props or planned topics." },
  { id: "performance", label: "Performance", description: "Music, dancing, celebration, and entertainment room format." },
  { id: "misc", label: "Miscellaneous or Custom", description: "Fallback category for custom live room formats." }
];

export const LIVE_LAYOUT_OPTIONS = [
  { id: "single", label: "Single player" },
  { id: "side-by-side", label: "Side by side" },
  { id: "quarter-grid", label: "Quarter grid" },
  { id: "vertical-strip", label: "Vertical strip" },
  { id: "horizontal-strip", label: "Horizontal strip" },
  { id: "click-expand", label: "Click to expand" }
];

export const LIVE_DISCOVERY_CONFIG = {
  id: "live-discovery-roulette",
  label: "Live Discovery Roulette",
  defaultPreviewSeconds: 60,
  freeActions: ["Favourite", "Follow", "Open Profile", "Skip", "Join"],
  upgradeActions: ["Stay Longer", "Unlock Chat", "Enter Full Live", "Send Gift", "Book", "Subscribe"]
};

export const FREE_PREVIEW_OPTIONS = [
  { id: "none", label: "No free preview", minutes: 0 },
  { id: "one-minute", label: "First 1 minute free", minutes: 1 },
  { id: "two-minutes", label: "First 2 minutes free", minutes: 2 },
  { id: "five-minutes", label: "First 5 minutes free", minutes: 5 },
  { id: "custom", label: "Custom free preview", minutes: null }
];

export const TIER_PREVIEW_OPTIONS = [
  { tier: "Guest", minutes: 0.5 },
  { tier: "Follower", minutes: 1 },
  { tier: "Basic", minutes: 2 },
  { tier: "VIP", minutes: 5 },
  { tier: "Inner Circle", minutes: 10 }
];

export function getLiveShowCategoryById(categoryId) {
  return LIVE_SHOW_CATEGORIES.find((category) => category.id === categoryId) || LIVE_SHOW_CATEGORIES[LIVE_SHOW_CATEGORIES.length - 1];
}
