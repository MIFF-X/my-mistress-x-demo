import {
  createChatThreadUnlockInApi,
  listChatThreadUnlocksFromApi,
  updateChatThreadUnlockInApi,
} from "./chat-thread-unlocks-api.js";

const CHAT_THREAD_UNLOCKS_KEY = "mistressXChatThreadUnlocks";

function readUnlocks() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_THREAD_UNLOCKS_KEY) || "[]") || [];
  } catch {
    return [];
  }
}

function normalizeTimestamp(value) {
  if (!value) return Date.now();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number(value) || Date.now();
}

function normalizeUnlock(unlock = {}) {
  return {
    id: unlock.id || `chat_unlock_${Date.now()}`,
    source: unlock.source || "after-show-private-message",
    status: unlock.status || "active",
    conversationName: unlock.conversationName || "Sub 1",
    hostUserId: unlock.hostUserId || "demo-mistress",
    subUserId: unlock.subUserId || "demo-sub",
    requestId: unlock.requestId || null,
    bookingId: unlock.bookingId || null,
    label: unlock.label || "After-show private message access",
    createdAt: normalizeTimestamp(unlock.createdAt),
    updatedAt: normalizeTimestamp(unlock.updatedAt),
    ...unlock,
  };
}

function writeUnlocks(unlocks) {
  const sorted = [...unlocks]
    .map(normalizeUnlock)
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  localStorage.setItem(CHAT_THREAD_UNLOCKS_KEY, JSON.stringify(sorted));
  window.dispatchEvent(
    new CustomEvent("mistressx:chat-thread-unlocks-updated", {
      detail: { count: sorted.length, unlocks: sorted },
    })
  );
  return sorted;
}

export function getChatThreadUnlocks() {
  return readUnlocks();
}

export async function syncChatThreadUnlocksFromApi(status = "active") {
  try {
    const unlocks = await listChatThreadUnlocksFromApi(status);
    const synced = writeUnlocks(Array.isArray(unlocks) ? unlocks : []);
    return { ok: true, source: "api", unlocks: synced };
  } catch (error) {
    return {
      ok: false,
      source: "local",
      unlocks: readUnlocks(),
      error: error instanceof Error ? error.message : "Chat thread unlock API unavailable",
    };
  }
}

export function saveChatThreadUnlock(unlock = {}) {
  const nextUnlock = normalizeUnlock(unlock);
  writeUnlocks([nextUnlock, ...readUnlocks()]);
  return nextUnlock;
}

export async function saveChatThreadUnlockWithApi(unlock = {}) {
  try {
    const apiUnlock = await createChatThreadUnlockInApi(unlock);
    const saved = normalizeUnlock({ ...unlock, ...apiUnlock, source: "api" });
    writeUnlocks([saved, ...readUnlocks().filter((item) => item.id !== saved.id)]);
    return { ok: true, source: "api", unlock: saved };
  } catch (error) {
    const saved = saveChatThreadUnlock(unlock);
    return {
      ok: false,
      source: "local",
      unlock: saved,
      error: error instanceof Error ? error.message : "Chat thread unlock API create failed",
    };
  }
}

export async function updateChatThreadUnlockWithApi(unlockId, updates = {}) {
  try {
    const apiUnlock = await updateChatThreadUnlockInApi(unlockId, updates);
    const saved = normalizeUnlock(apiUnlock);
    writeUnlocks([saved, ...readUnlocks().filter((item) => item.id !== saved.id)]);
    return { ok: true, source: "api", unlock: saved };
  } catch (error) {
    const next = readUnlocks().map((unlock) =>
      unlock.id === unlockId ? normalizeUnlock({ ...unlock, ...updates, updatedAt: Date.now() }) : unlock
    );
    writeUnlocks(next);
    return {
      ok: false,
      source: "local",
      unlock: readUnlocks().find((unlock) => unlock.id === unlockId) || null,
      error: error instanceof Error ? error.message : "Chat thread unlock API update failed",
    };
  }
}

export function getActiveChatThreadUnlocks() {
  return readUnlocks().filter((unlock) => unlock.status === "active");
}

export function hasActiveChatThreadUnlock(conversationName) {
  return getActiveChatThreadUnlocks().some((unlock) => unlock.conversationName === conversationName);
}
