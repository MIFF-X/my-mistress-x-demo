import { saveChatThreadUnlockWithApi } from "../text-chat/chat-thread-unlocks-store.js";
import {
  getAfterShowMessageRequestCounts,
  getAfterShowMessageRequests,
  syncAfterShowMessageRequestsFromApi,
  updateAfterShowMessageRequestWithApi,
} from "./after-show-message-requests-store.js";

function createRequestCard(request, refresh) {
  const card = document.createElement("div");
  card.className = "panel after-show-message-request-card";

  const createdAt = request.createdAt ? new Date(request.createdAt).toLocaleString() : "Just now";
  card.innerHTML = `
    <div class="after-show-message-request-head">
      <div>
        <h4>${request.title || "After-show private message request"}</h4>
        <p>${request.message || "Sub requested private message access after the live show."}</p>
      </div>
      <span class="after-show-message-status after-show-message-status-${request.status || "pending"}">${request.status || "pending"}</span>
    </div>
    <div class="after-show-message-meta">
      <span>Booking: ${request.bookingId || "local fallback"}</span>
      <span>${request.availabilitySnapshot || "Limited spot"}</span>
      <span>${createdAt}</span>
      ${request.chatUnlockId ? `<span>Chat unlock: ${request.chatUnlockId}</span>` : ""}
      ${request.source ? `<span>Source: ${request.source}</span>` : ""}
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "button-row";

  const accept = document.createElement("button");
  accept.className = "button-primary";
  accept.innerText = request.chatUnlockId ? "Accepted / Chat Unlocked" : "Accept + Unlock Chat";
  accept.onclick = async () => {
    accept.disabled = true;
    accept.innerText = "Accepting...";
    const unlockResult = await saveChatThreadUnlockWithApi({
      requestId: request.id,
      bookingId: request.bookingId || null,
      conversationName: request.conversationName || "Sub 1",
      hostUserId: request.hostUserId || "demo-mistress",
      subUserId: request.subUserId || "demo-sub",
      label: "After-show private message access",
    });
    const unlock = unlockResult.unlock;

    await updateAfterShowMessageRequestWithApi(request.id, {
      status: "accepted",
      chatUnlockId: unlock.id,
      chatThreadName: unlock.conversationName,
    });
    await refresh();
  };

  const decline = document.createElement("button");
  decline.className = "button-secondary";
  decline.innerText = "Decline";
  decline.onclick = async () => {
    decline.disabled = true;
    decline.innerText = "Declining...";
    await updateAfterShowMessageRequestWithApi(request.id, { status: "declined" });
    await refresh();
  };

  const markPending = document.createElement("button");
  markPending.className = "button-secondary";
  markPending.innerText = "Back to Pending";
  markPending.onclick = async () => {
    markPending.disabled = true;
    markPending.innerText = "Updating...";
    await updateAfterShowMessageRequestWithApi(request.id, { status: "pending" });
    await refresh();
  };

  actions.appendChild(accept);
  actions.appendChild(decline);
  actions.appendChild(markPending);
  card.appendChild(actions);
  return card;
}

export function createAfterShowMessageRequestsInbox() {
  ensureAfterShowMessageRequestsInboxStyles();

  const shell = document.createElement("div");
  shell.className = "page-shell after-show-message-requests-inbox";
  shell.style.padding = "20px";

  const render = async ({ shouldSync = false } = {}) => {
    if (shouldSync) {
      shell.innerHTML = `
        <h2>💬 After-Show Message Requests</h2>
        <div class="panel after-show-message-counts">Syncing message requests...</div>
      `;
      await syncAfterShowMessageRequestsFromApi();
    }

    const counts = getAfterShowMessageRequestCounts();
    const requests = getAfterShowMessageRequests();
    shell.innerHTML = `
      <h2>💬 After-Show Message Requests</h2>
      <p>Review private message requests created from the live show / Watch With Mistress offer tray.</p>
      <div class="panel after-show-message-counts">
        <strong>${counts.pending}</strong> pending · <strong>${counts.accepted}</strong> accepted · <strong>${counts.declined}</strong> declined · <strong>${counts.total}</strong> total
      </div>
    `;

    const refreshButton = document.createElement("button");
    refreshButton.className = "button-secondary";
    refreshButton.innerText = "Sync Requests";
    refreshButton.onclick = () => render({ shouldSync: true });
    shell.appendChild(refreshButton);

    if (!requests.length) {
      const empty = document.createElement("div");
      empty.className = "panel";
      empty.innerHTML = "<h3>No message requests yet</h3><p>When a Sub pre-books Private Message access after a show, it will appear here.</p>";
      shell.appendChild(empty);
      return;
    }

    requests.forEach((request) => shell.appendChild(createRequestCard(request, render)));
  };

  render({ shouldSync: true });
  return shell;
}

export function ensureAfterShowMessageRequestsInboxStyles() {
  if (document.getElementById("after-show-message-requests-inbox-styles")) return;

  const style = document.createElement("style");
  style.id = "after-show-message-requests-inbox-styles";
  style.textContent = `
    .after-show-message-counts {
      color: rgba(255,255,255,0.78);
    }

    .after-show-message-request-card {
      margin-top: 12px;
    }

    .after-show-message-request-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
    }

    .after-show-message-request-head h4 {
      margin: 0 0 6px;
    }

    .after-show-message-request-head p,
    .after-show-message-meta {
      color: rgba(255,255,255,0.68);
      font-size: 13px;
    }

    .after-show-message-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 10px 0;
    }

    .after-show-message-meta span,
    .after-show-message-status {
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      border-radius: 999px;
      padding: 4px 8px;
    }

    .after-show-message-status {
      color: #f2c94c;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .after-show-message-status-accepted {
      color: #1D9E75;
    }

    .after-show-message-status-declined {
      color: #ff8fa3;
    }
  `;
  document.head.appendChild(style);
}
