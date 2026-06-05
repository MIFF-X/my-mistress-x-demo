import {
  createAfterShowMessageRequestInApi,
  listAfterShowMessageRequestsFromApi,
  updateAfterShowMessageRequestInApi,
} from "./live-show-offers-api.js";

const AFTER_SHOW_MESSAGE_REQUESTS_KEY = "mistressXAfterShowMessageRequests";

function readRequests() {
  try {
    return JSON.parse(localStorage.getItem(AFTER_SHOW_MESSAGE_REQUESTS_KEY) || "[]") || [];
  } catch {
    return [];
  }
}

function normalizeTimestamp(value) {
  if (!value) return Date.now();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number(value) || Date.now();
}

function normalizeRequest(request = {}) {
  return {
    id: request.id || `after_show_message_${Date.now()}`,
    source: request.source || "live-show-after-show-offer",
    status: request.status || "pending",
    hostUserId: request.hostUserId || "demo-mistress",
    subUserId: request.subUserId || "demo-sub",
    title: request.title || "After-show private message request",
    message: request.message || "Sub requested private message access after the live show.",
    bookingId: request.bookingId || null,
    conversationName: request.conversationName || request.chatThreadName || "Sub 1",
    availabilitySnapshot: request.availabilitySnapshot || null,
    chatUnlockId: request.chatUnlockId || null,
    chatThreadName: request.chatThreadName || null,
    createdAt: normalizeTimestamp(request.createdAt),
    updatedAt: normalizeTimestamp(request.updatedAt),
    ...request,
  };
}

function writeRequests(requests) {
  const sorted = [...requests]
    .map(normalizeRequest)
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  localStorage.setItem(AFTER_SHOW_MESSAGE_REQUESTS_KEY, JSON.stringify(sorted));
  window.dispatchEvent(
    new CustomEvent("mistressx:after-show-message-requests-updated", {
      detail: { count: sorted.length, requests: sorted },
    })
  );
  return sorted;
}

export function getAfterShowMessageRequests() {
  return readRequests();
}

export async function syncAfterShowMessageRequestsFromApi() {
  try {
    const requests = await listAfterShowMessageRequestsFromApi();
    const synced = writeRequests(Array.isArray(requests) ? requests : []);
    return { ok: true, source: "api", requests: synced, counts: getAfterShowMessageRequestCounts(synced) };
  } catch (error) {
    const requests = readRequests();
    return {
      ok: false,
      source: "local",
      requests,
      counts: getAfterShowMessageRequestCounts(requests),
      error: error instanceof Error ? error.message : "After-show message request API unavailable",
    };
  }
}

export function saveAfterShowMessageRequest(request = {}) {
  const nextRequest = normalizeRequest(request);
  writeRequests([nextRequest, ...readRequests()]);
  return nextRequest;
}

export async function saveAfterShowMessageRequestWithApi(request = {}) {
  try {
    const apiRequest = await createAfterShowMessageRequestInApi(request);
    const saved = normalizeRequest({ ...request, ...apiRequest, source: "api" });
    writeRequests([saved, ...readRequests().filter((item) => item.id !== saved.id)]);
    return { ok: true, source: "api", request: saved };
  } catch (error) {
    const saved = saveAfterShowMessageRequest(request);
    return {
      ok: false,
      source: "local",
      request: saved,
      error: error instanceof Error ? error.message : "After-show message request API create failed",
    };
  }
}

export function updateAfterShowMessageRequest(requestId, updates = {}) {
  const next = readRequests().map((request) =>
    request.id === requestId ? normalizeRequest({ ...request, ...updates, updatedAt: Date.now() }) : request
  );
  return writeRequests(next);
}

export async function updateAfterShowMessageRequestWithApi(requestId, updates = {}) {
  try {
    const apiRequest = await updateAfterShowMessageRequestInApi(requestId, updates);
    updateAfterShowMessageRequest(requestId, apiRequest);
    return { ok: true, source: "api", request: normalizeRequest(apiRequest) };
  } catch (error) {
    updateAfterShowMessageRequest(requestId, updates);
    return {
      ok: false,
      source: "local",
      request: readRequests().find((request) => request.id === requestId) || null,
      error: error instanceof Error ? error.message : "After-show message request API update failed",
    };
  }
}

export function getAfterShowMessageRequestCounts(sourceRequests = readRequests()) {
  const requests = sourceRequests.map(normalizeRequest);
  return {
    total: requests.length,
    pending: requests.filter((request) => request.status === "pending").length,
    accepted: requests.filter((request) => request.status === "accepted").length,
    declined: requests.filter((request) => request.status === "declined").length,
  };
}
