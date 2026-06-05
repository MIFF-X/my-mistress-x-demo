function getBrowserApiBaseUrl() {
  if (typeof window === "undefined") return "http://localhost:3000/api";
  const hostname = window.location.hostname || "localhost";
  return `http://${hostname}:3000/api`;
}

export const CHAT_THREAD_UNLOCKS_API_BASE_URL =
  window?.MISTRESS_X_API_BASE_URL ||
  window?.EXPO_PUBLIC_API_URL ||
  getBrowserApiBaseUrl();

async function requestChatThreadUnlocksApi(path, options = {}) {
  const response = await fetch(`${CHAT_THREAD_UNLOCKS_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Chat thread unlock request failed: ${response.status}`);
  }

  return response.json();
}

export async function listChatThreadUnlocksFromApi(status = "active") {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return requestChatThreadUnlocksApi(`/chat-thread-unlocks${query}`);
}

export async function createChatThreadUnlockInApi(body = {}) {
  return requestChatThreadUnlocksApi("/chat-thread-unlocks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateChatThreadUnlockInApi(unlockId, body = {}) {
  if (!unlockId) throw new Error("Chat thread unlock id is required.");
  return requestChatThreadUnlocksApi(`/chat-thread-unlocks/${encodeURIComponent(unlockId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
