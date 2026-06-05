const CLOSED_LOT_FOLLOWUP_KEY = "mistressXClosedLotFollowups";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Embedded previews may disable storage.
  }
}

export function getClosedLotFollowups() {
  return readJson(CLOSED_LOT_FOLLOWUP_KEY, {});
}

export function getClosedLotFollowup(lotId) {
  const all = getClosedLotFollowups();
  return all[lotId] || {
    status: "pending review",
    note: "",
    updatedAt: null,
  };
}

export function updateClosedLotFollowup(lotId, patch = {}) {
  const all = getClosedLotFollowups();
  const next = {
    ...getClosedLotFollowup(lotId),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  all[lotId] = next;
  writeJson(CLOSED_LOT_FOLLOWUP_KEY, all);
  window.dispatchEvent(new CustomEvent("mistressx:closed-lot-followup-updated", {
    detail: { lotId, followup: next },
  }));
  return next;
}
