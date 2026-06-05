const STORAGE_KEY = "mxDiscoveryAnalyticsEvents";

export const DISCOVERY_EVENT_TYPES = {
  PREVIEW_VIEWED: "preview_viewed",
  PROFILE_SAVED: "profile_saved",
  PROFILE_FOLLOWED: "profile_followed",
  PREVIEW_SKIPPED: "preview_skipped",
  FULL_ROOM_JOIN_CLICKED: "full_room_join_clicked",
  UPGRADE_PROMPT_SHOWN: "upgrade_prompt_shown"
};

function readEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function writeEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function trackDiscoveryEvent(type, detail = {}) {
  const events = readEvents();
  const event = {
    id: `disc_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    detail,
    createdAt: new Date().toISOString()
  };

  events.unshift(event);
  writeEvents(events.slice(0, 150));
  return event;
}

export function getDiscoveryEvents() {
  return readEvents();
}

export function getDiscoveryAnalyticsSummary() {
  const events = readEvents();

  return {
    totalEvents: events.length,
    previews: events.filter((event) => event.type === DISCOVERY_EVENT_TYPES.PREVIEW_VIEWED).length,
    saves: events.filter((event) => event.type === DISCOVERY_EVENT_TYPES.PROFILE_SAVED).length,
    follows: events.filter((event) => event.type === DISCOVERY_EVENT_TYPES.PROFILE_FOLLOWED).length,
    skips: events.filter((event) => event.type === DISCOVERY_EVENT_TYPES.PREVIEW_SKIPPED).length,
    joins: events.filter((event) => event.type === DISCOVERY_EVENT_TYPES.FULL_ROOM_JOIN_CLICKED).length,
    upgrades: events.filter((event) => event.type === DISCOVERY_EVENT_TYPES.UPGRADE_PROMPT_SHOWN).length
  };
}

export function clearDiscoveryAnalytics() {
  writeEvents([]);
}
