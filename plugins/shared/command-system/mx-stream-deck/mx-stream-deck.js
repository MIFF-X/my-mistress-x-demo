export const MX_STREAM_DECK_PLUGIN_ID = "mx-stream-deck";

export const MX_STREAM_DECK_QR_SETUP = {
  payloadVersion: "mx-stream-deck/v1",
  setupRoute: "mistressx://plugins/mx-stream-deck/setup",
  webFallbackRoute: "/plugins/mx-stream-deck/setup",
  expiresInMinutes: 10,
  requiredClaims: ["userId", "role", "deviceId", "nonce"],
  nextBackendSteps: [
    "Create signed setup sessions with single-use nonces.",
    "Render a platform-owned QR image instead of sending setup tokens through third-party QR services.",
    "Persist paired devices, deck templates, and setup audit events.",
  ],
};

export const MX_STREAM_DECK_USE_CASES = [
  {
    title: "Quick replies",
    owner: "Shared",
    uses: ["Send saved replies in chat", "Drop polite boundary messages", "Trigger welcome or aftercare snippets"],
  },
  {
    title: "Live show control",
    owner: "Mistress",
    uses: ["Open the next live segment", "Queue a paid request prompt", "Toggle polls, Q&A, games, stickers, or goals"],
  },
  {
    title: "Game buttons",
    owner: "Shared",
    uses: ["Start a round", "Send a challenge", "Reveal a clue", "Queue a reward or replay button"],
  },
  {
    title: "Wallet and PPV prompts",
    owner: "Mistress",
    uses: ["Ask for a tribute", "Offer a timed PPV unlock", "Send a booking or wishlist shortcut"],
  },
  {
    title: "Personal command pad",
    owner: "Sub",
    uses: ["Save personal reminders", "Open favourite routes", "Send check-in responses", "Track routine buttons"],
  },
  {
    title: "Headmistress operations",
    owner: "Headmistress",
    uses: ["Escalate an alert", "Open compliance checks", "Launch SMM blast prep", "Review queued plugin actions"],
  },
  {
    title: "Device handoff",
    owner: "Shared",
    uses: ["Scan QR setup from desktop", "Pair phone as a pocket deck", "Continue a live workflow from another trusted device"],
  },
];

export const MX_STREAM_DECKS = {
  MISTRESS: [
    { id: "reply-tease", label: "Quick Reply", group: "quick_replies", action: "chat.quick_reply", tone: "pink" },
    { id: "ask-tribute", label: "Ask Tribute", group: "tribute", action: "wallet.tribute_prompt", tone: "gold" },
    { id: "ppv-unlock", label: "PPV Unlock", group: "ppv", action: "ppv.offer_unlock", tone: "violet" },
    { id: "live-poll", label: "Live Poll", group: "live", action: "live.toggle_poll", tone: "blue" },
    { id: "game-dare", label: "Game Dare", group: "games", action: "games.challenge", tone: "green" },
    { id: "book-call", label: "Book Call", group: "bookings", action: "booking.offer_slot", tone: "orange" },
  ],
  SUB: [
    { id: "yes-mistress", label: "Yes", group: "quick_replies", action: "chat.quick_reply", tone: "pink" },
    { id: "send-checkin", label: "Check In", group: "personal", action: "personal.check_in", tone: "green" },
    { id: "open-wallet", label: "Wallet", group: "personal", action: "route.wallet", tone: "gold" },
    { id: "join-game", label: "Join Game", group: "games", action: "games.join", tone: "blue" },
    { id: "request-booking", label: "Booking", group: "bookings", action: "booking.request", tone: "orange" },
    { id: "send-sticker", label: "Sticker", group: "stickers", action: "stickers.send", tone: "violet" },
  ],
  HEADMISTRESS: [
    { id: "admin-alert", label: "Alert", group: "admin", action: "admin.alert_queue", tone: "red" },
    { id: "compliance", label: "Compliance", group: "compliance", action: "compliance.open_check", tone: "gold" },
    { id: "smm-blast", label: "SMM Prep", group: "smm", action: "smm.prepare_blast", tone: "blue" },
    { id: "provider-check", label: "Provider", group: "admin", action: "provider.readiness", tone: "green" },
    { id: "plugin-review", label: "Plugin Review", group: "admin", action: "plugins.review", tone: "violet" },
    { id: "risk-note", label: "Risk Note", group: "compliance", action: "audit.risk_note", tone: "orange" },
  ],
};

function injectMxStreamDeckStyles() {
  if (document.getElementById("mx-stream-deck-styles")) return;
  const style = document.createElement("style");
  style.id = "mx-stream-deck-styles";
  style.textContent = `
    .mx-stream-deck-screen {
      display: grid;
      gap: 16px;
      color: #f7f1e8;
    }
    .mx-stream-deck-panel {
      background: #101014;
      border: 1px solid #2b2b32;
      border-radius: 10px;
      padding: 16px;
    }
    .mx-stream-deck-header {
      display: grid;
      gap: 8px;
      border-color: #d4af37;
    }
    .mx-stream-deck-header h2,
    .mx-stream-deck-panel h3 {
      margin: 0;
      color: #fff;
    }
    .mx-stream-deck-header p,
    .mx-stream-deck-panel p,
    .mx-stream-deck-panel li {
      color: #b9b2a8;
      line-height: 1.45;
    }
    .mx-stream-deck-tabs,
    .mx-stream-deck-actions,
    .mx-stream-deck-use-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .mx-stream-deck-tabs button,
    .mx-stream-deck-button,
    .mx-stream-deck-copy {
      border: 1px solid #33343d;
      border-radius: 8px;
      background: #181820;
      color: #f7f1e8;
      cursor: pointer;
      font-weight: 800;
      padding: 10px 12px;
    }
    .mx-stream-deck-tabs button[aria-pressed="true"],
    .mx-stream-deck-copy {
      background: #d4af37;
      color: #050505;
      border-color: #d4af37;
    }
    .mx-stream-deck-button[data-tone="pink"] { border-color: #ff4f8b; }
    .mx-stream-deck-button[data-tone="gold"] { border-color: #d4af37; }
    .mx-stream-deck-button[data-tone="violet"] { border-color: #9d7cff; }
    .mx-stream-deck-button[data-tone="blue"] { border-color: #5bbcff; }
    .mx-stream-deck-button[data-tone="green"] { border-color: #38d996; }
    .mx-stream-deck-button[data-tone="orange"] { border-color: #ff9f43; }
    .mx-stream-deck-button[data-tone="red"] { border-color: #ff5f5f; }
    .mx-stream-deck-use-card {
      flex: 1 1 220px;
      min-width: 220px;
      background: #15151b;
      border: 1px solid #292932;
      border-radius: 8px;
      padding: 12px;
    }
    .mx-stream-deck-qr {
      display: grid;
      grid-template-columns: 170px minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    .mx-stream-deck-qr-grid {
      display: grid;
      grid-template-columns: repeat(17, 8px);
      gap: 2px;
      background: #050505;
      border: 1px solid #31313a;
      border-radius: 8px;
      padding: 12px;
      width: max-content;
    }
    .mx-stream-deck-qr-cell {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background: #222;
    }
    .mx-stream-deck-qr-cell.is-on {
      background: #fff;
    }
    .mx-stream-deck-log {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .mx-stream-deck-log li {
      border: 1px solid #282830;
      border-radius: 8px;
      padding: 10px;
    }
    @media (max-width: 720px) {
      .mx-stream-deck-qr {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

function buildQrPreviewMatrix(payload, size = 17) {
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const matrix = [];
  for (let row = 0; row < size; row += 1) {
    const cells = [];
    for (let col = 0; col < size; col += 1) {
      const inFinder =
        (row < 5 && col < 5) ||
        (row < 5 && col >= size - 5) ||
        (row >= size - 5 && col < 5);
      const finderOn = inFinder && (row % 4 === 0 || col % 4 === 0 || (row > 1 && col > 1 && row < size - 2 && col < size - 2));
      const dataOn = ((hash + row * 31 + col * 17 + row * col) & 3) === 0;
      cells.push(inFinder ? finderOn : dataOn);
    }
    matrix.push(cells);
  }
  return matrix;
}

function createQrPreview(payload) {
  const grid = document.createElement("div");
  grid.className = "mx-stream-deck-qr-grid";
  buildQrPreviewMatrix(payload).flat().forEach((on) => {
    const cell = document.createElement("span");
    cell.className = `mx-stream-deck-qr-cell${on ? " is-on" : ""}`;
    grid.appendChild(cell);
  });
  return grid;
}

function setupPayloadForRole(role) {
  return JSON.stringify({
    version: MX_STREAM_DECK_QR_SETUP.payloadVersion,
    route: MX_STREAM_DECK_QR_SETUP.setupRoute,
    role,
    deck: MX_STREAM_DECK_PLUGIN_ID,
    nonce: "signed-by-backend-next-step",
    expMinutes: MX_STREAM_DECK_QR_SETUP.expiresInMinutes,
  });
}

export function createMxStreamDeckScreen({ initialRole = "MISTRESS" } = {}) {
  injectMxStreamDeckStyles();
  const shell = document.createElement("section");
  shell.className = "mx-stream-deck-screen";

  let activeRole = MX_STREAM_DECKS[initialRole] ? initialRole : "MISTRESS";
  const queuedActions = [];

  const header = document.createElement("article");
  header.className = "mx-stream-deck-panel mx-stream-deck-header";
  header.innerHTML = `
    <p>Shared Command System</p>
    <h2>MX Stream Deck</h2>
    <p>Role-aware quick buttons for replies, game prompts, tribute prompts, PPV unlocks, live actions, bookings, stickers, admin alerts, compliance checks, SMM prep, and personal shortcuts.</p>
  `;

  const tabs = document.createElement("div");
  tabs.className = "mx-stream-deck-tabs";

  const deckPanel = document.createElement("article");
  deckPanel.className = "mx-stream-deck-panel";

  const qrPanel = document.createElement("article");
  qrPanel.className = "mx-stream-deck-panel";

  const usePanel = document.createElement("article");
  usePanel.className = "mx-stream-deck-panel";
  usePanel.innerHTML = `
    <h3>Possible Uses</h3>
    <div class="mx-stream-deck-use-grid">
      ${MX_STREAM_DECK_USE_CASES.map((useCase) => `
        <section class="mx-stream-deck-use-card">
          <strong>${useCase.title}</strong>
          <p>${useCase.owner}</p>
          <ul>${useCase.uses.map((item) => `<li>${item}</li>`).join("")}</ul>
        </section>
      `).join("")}
    </div>
  `;

  const logPanel = document.createElement("article");
  logPanel.className = "mx-stream-deck-panel";

  function queueAction(button) {
    queuedActions.unshift({
      ...button,
      queuedAt: new Date().toISOString(),
      role: activeRole,
    });
    queuedActions.splice(6);
    renderLog();
  }

  function renderTabs() {
    tabs.innerHTML = "";
    Object.keys(MX_STREAM_DECKS).forEach((role) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.textContent = role.charAt(0) + role.slice(1).toLowerCase();
      tab.setAttribute("aria-pressed", String(role === activeRole));
      tab.addEventListener("click", () => {
        activeRole = role;
        renderTabs();
        renderDeck();
        renderQr();
      });
      tabs.appendChild(tab);
    });
  }

  function renderDeck() {
    deckPanel.innerHTML = `
      <h3>${activeRole.charAt(0) + activeRole.slice(1).toLowerCase()} Deck</h3>
      <p>These buttons queue local actions now. Backend dispatch, saved buttons, and action audit logs are the next plug-in step.</p>
    `;
    const actions = document.createElement("div");
    actions.className = "mx-stream-deck-actions";
    MX_STREAM_DECKS[activeRole].forEach((button) => {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "mx-stream-deck-button";
      action.dataset.tone = button.tone;
      action.textContent = button.label;
      action.title = `${button.group}: ${button.action}`;
      action.addEventListener("click", () => queueAction(button));
      actions.appendChild(action);
    });
    deckPanel.appendChild(actions);
  }

  function renderQr() {
    const payload = setupPayloadForRole(activeRole);
    qrPanel.innerHTML = `
      <h3>QR Setup Handoff</h3>
      <p>Use this payload shape for phone pairing, desktop-to-mobile setup, and trusted second-device control. Production should generate a signed QR image from the platform backend.</p>
      <div class="mx-stream-deck-qr"></div>
    `;
    const qr = qrPanel.querySelector(".mx-stream-deck-qr");
    qr.appendChild(createQrPreview(payload));
    const detail = document.createElement("div");
    detail.innerHTML = `
      <p><strong>Setup route:</strong> ${MX_STREAM_DECK_QR_SETUP.setupRoute}</p>
      <p><strong>Expires:</strong> ${MX_STREAM_DECK_QR_SETUP.expiresInMinutes} minutes</p>
      <p><strong>Required claims:</strong> ${MX_STREAM_DECK_QR_SETUP.requiredClaims.join(", ")}</p>
    `;
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "mx-stream-deck-copy";
    copy.textContent = "Copy Setup Payload";
    copy.addEventListener("click", async () => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      }
      queueAction({ id: "copy-qr-payload", label: "Copied setup payload", group: "qr_setup", action: "setup.copy_payload", tone: "gold" });
    });
    detail.appendChild(copy);
    qr.appendChild(detail);
  }

  function renderLog() {
    logPanel.innerHTML = "<h3>Recent Queued Actions</h3>";
    if (!queuedActions.length) {
      const empty = document.createElement("p");
      empty.textContent = "No local actions queued yet.";
      logPanel.appendChild(empty);
      return;
    }

    const list = document.createElement("ul");
    list.className = "mx-stream-deck-log";
    queuedActions.forEach((item) => {
      const row = document.createElement("li");
      row.innerHTML = `<strong>${item.label}</strong><br><small>${item.role} / ${item.group} / ${item.action} / ${item.queuedAt}</small>`;
      list.appendChild(row);
    });
    logPanel.appendChild(list);
  }

  renderTabs();
  renderDeck();
  renderQr();
  renderLog();

  shell.append(header, tabs, deckPanel, qrPanel, usePanel, logPanel);
  return shell;
}
