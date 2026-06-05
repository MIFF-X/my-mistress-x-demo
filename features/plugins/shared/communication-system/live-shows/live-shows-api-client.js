const API_BASE_URL = "/api";

function getAuthToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === "string" ? body : body?.message || "Live Shows API request failed";
    throw new Error(message);
  }

  return body;
}

export const liveShowsApiClient = {
  createDraft(payload) {
    return request("/live-room-drafts", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  listDrafts() {
    return request("/live-room-drafts");
  },

  getLatestDraft() {
    return request("/live-room-drafts/latest");
  },

  updateDraft(draftId, payload) {
    return request(`/live-room-drafts/${draftId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  deleteDraft(draftId) {
    return request(`/live-room-drafts/${draftId}`, {
      method: "DELETE"
    });
  },

  createRoomFromDraft(draftId) {
    return request(`/live-rooms/from-draft/${draftId}`, {
      method: "POST"
    });
  },

  listRooms() {
    return request("/live-rooms");
  },

  getRoom(roomId) {
    return request(`/live-rooms/${roomId}`);
  },

  updateRoomStatus(roomId, status) {
    return request(`/live-rooms/${roomId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  },

  endRoom(roomId) {
    return request(`/live-rooms/${roomId}/end`, {
      method: "POST"
    });
  },

  trackDiscoveryEvent(payload) {
    return request("/live-discovery-events", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getDiscoverySummary() {
    return request("/live-discovery-events/summary");
  },

  getRecentDiscoveryEvents() {
    return request("/live-discovery-events/recent");
  },

  trackLaunchEvent(payload) {
    return request("/live-launch-events", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getLaunchSummary() {
    return request("/live-launch-events/summary");
  },

  getRecentLaunchEvents() {
    return request("/live-launch-events/recent");
  }
};
