const STORAGE_KEY = "mxLiveLaunchAnalyticsEvents";

export const LIVE_LAUNCH_EVENT_TYPES = {
  HANDOFF_VIEWED: "handoff_viewed",
  LAUNCH_CHECKLIST_VIEWED: "launch_checklist_viewed",
  DEMO_LIVE_ENTERED: "demo_live_entered",
  NO_DRAFT_WARNING_SHOWN: "no_draft_warning_shown"
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

export function trackLiveLaunchEvent(type, detail = {}) {
  const events = readEvents();
  const event = {
    id: `launch_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    detail,
    createdAt: new Date().toISOString()
  };

  events.unshift(event);
  writeEvents(events.slice(0, 150));
  return event;
}

export function getLiveLaunchEvents() {
  return readEvents();
}

export function getLiveLaunchAnalyticsSummary() {
  const events = readEvents();

  return {
    totalEvents: events.length,
    handoffViews: events.filter((event) => event.type === LIVE_LAUNCH_EVENT_TYPES.HANDOFF_VIEWED).length,
    checklistViews: events.filter((event) => event.type === LIVE_LAUNCH_EVENT_TYPES.LAUNCH_CHECKLIST_VIEWED).length,
    demoEntries: events.filter((event) => event.type === LIVE_LAUNCH_EVENT_TYPES.DEMO_LIVE_ENTERED).length,
    noDraftWarnings: events.filter((event) => event.type === LIVE_LAUNCH_EVENT_TYPES.NO_DRAFT_WARNING_SHOWN).length
  };
}

export function clearLiveLaunchAnalytics() {
  writeEvents([]);
}
