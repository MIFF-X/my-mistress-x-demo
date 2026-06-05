import { DISCOVERY_EVENT_TYPES, trackDiscoveryEvent } from "./discovery-analytics-store.js";
import { createLiveHubScreen } from "./live-hub-screen.js";
import { ensureLiveSessionNavigationStyles, createLiveSessionTopBar } from "./live-session-navigation.js";
import { LIVE_DISCOVERY_CONFIG, TIER_PREVIEW_OPTIONS } from "./live-show-categories.js";

const DISCOVERY_ITEMS = [
  { id: "creator-noir", displayName: "Noir", category: "Featured Live", status: "Live now", viewers: 142, seconds: 60 },
  { id: "creator-velvet", displayName: "Velvet", category: "Daily Chat", status: "Live now", viewers: 88, seconds: 90 },
  { id: "creator-x", displayName: "X", category: "Trivia and Games", status: "Starting soon", viewers: 51, seconds: 120 }
];

function getSavedDiscoveryItems() {
  try {
    return JSON.parse(localStorage.getItem("mxDiscoverySaved") || "[]");
  } catch (error) {
    return [];
  }
}

function saveDiscoveryItem(item) {
  const saved = getSavedDiscoveryItems();
  if (!saved.some((entry) => entry.id === item.id)) {
    saved.push({ id: item.id, displayName: item.displayName, category: item.category, savedAt: new Date().toISOString() });
    localStorage.setItem("mxDiscoverySaved", JSON.stringify(saved));
  }
}

function ensureDiscoveryStyles() {
  if (document.getElementById("mx-discovery-screen-styles")) return;

  const style = document.createElement("style");
  style.id = "mx-discovery-screen-styles";
  style.textContent = `
    .discovery-screen-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.7fr);
      gap: 16px;
      margin-top: 16px;
    }

    .discovery-preview-card,
    .discovery-saved-card {
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(18,18,26,0.98), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.22);
    }

    .discovery-video-box {
      min-height: 260px;
      border-radius: 16px;
      background: radial-gradient(circle at top, rgba(212,175,55,0.18), rgba(0,0,0,0.94));
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin: 14px 0;
      position: relative;
      overflow: hidden;
    }

    .discovery-countdown {
      position: absolute;
      top: 14px;
      right: 14px;
      border-radius: 999px;
      background: rgba(0,0,0,0.7);
      border: 1px solid rgba(255,255,255,0.14);
      padding: 8px 12px;
      font-weight: 900;
      color: #d4af37;
    }

    .discovery-chip-row,
    .discovery-action-row,
    .discovery-tier-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-top: 10px;
    }

    .discovery-chip,
    .discovery-tier-pill {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.78);
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 800;
    }

    .discovery-saved-list {
      display: grid;
      gap: 8px;
      margin-top: 10px;
    }

    .discovery-saved-item {
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.05);
      border-radius: 14px;
      padding: 10px;
    }

    @media (max-width: 760px) {
      .discovery-screen-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

function renderSavedList(target) {
  target.innerHTML = "";
  const saved = getSavedDiscoveryItems();

  if (saved.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No saved profiles yet. Use Save or Follow during a preview.";
    target.appendChild(empty);
    return;
  }

  saved.forEach((item) => {
    const row = document.createElement("div");
    row.className = "discovery-saved-item";
    row.innerHTML = `<strong>${item.displayName}</strong><br><small>${item.category} · saved for later</small>`;
    target.appendChild(row);
  });
}

export function createDiscoveryScreen() {
  ensureDiscoveryStyles();
  ensureLiveSessionNavigationStyles();

  let currentIndex = 0;
  let remaining = DISCOVERY_ITEMS[0].seconds;
  let timer = null;

  const shell = document.createElement("div");
  shell.className = "page-shell discovery-screen";
  shell.style.padding = "20px";

  const intro = document.createElement("p");
  intro.innerText = "Starter screen for quick introductions, saved profiles, follow prompts, preview timers, and full room links.";

  const grid = document.createElement("div");
  grid.className = "discovery-screen-grid";

  const previewCard = document.createElement("div");
  previewCard.className = "discovery-preview-card";

  const savedCard = document.createElement("div");
  savedCard.className = "discovery-saved-card";
  savedCard.innerHTML = `<h3>Saved for Later</h3>`;

  const savedList = document.createElement("div");
  savedList.className = "discovery-saved-list";
  savedCard.appendChild(savedList);

  const tiers = document.createElement("div");
  tiers.className = "discovery-tier-row";
  TIER_PREVIEW_OPTIONS.forEach((tier) => {
    const pill = document.createElement("span");
    pill.className = "discovery-tier-pill";
    pill.innerText = `${tier.tier}: ${tier.minutes} min`;
    tiers.appendChild(pill);
  });
  savedCard.appendChild(tiers);

  function renderPreview() {
    if (timer) window.clearInterval(timer);
    const item = DISCOVERY_ITEMS[currentIndex];
    remaining = item.seconds;
    previewCard.innerHTML = "";

    trackDiscoveryEvent(DISCOVERY_EVENT_TYPES.PREVIEW_VIEWED, {
      itemId: item.id,
      category: item.category,
      seconds: item.seconds
    });

    const heading = document.createElement("h3");
    heading.innerText = item.displayName;

    const chips = document.createElement("div");
    chips.className = "discovery-chip-row";
    [item.category, item.status, `👁 ${item.viewers} watching`].forEach((value) => {
      const chip = document.createElement("span");
      chip.className = "discovery-chip";
      chip.innerText = value;
      chips.appendChild(chip);
    });

    const video = document.createElement("div");
    video.className = "discovery-video-box";
    video.innerHTML = `<div>📹 Preview Slot<br><small>Quick introduction mode</small></div>`;

    const countdown = document.createElement("div");
    countdown.className = "discovery-countdown";
    countdown.innerText = `${remaining}s free`;
    video.appendChild(countdown);

    const actions = document.createElement("div");
    actions.className = "discovery-action-row";

    const saveBtn = document.createElement("button");
    saveBtn.className = "button-secondary";
    saveBtn.innerText = "Save";
    saveBtn.onclick = () => {
      saveDiscoveryItem(item);
      trackDiscoveryEvent(DISCOVERY_EVENT_TYPES.PROFILE_SAVED, { itemId: item.id, category: item.category });
      renderSavedList(savedList);
    };

    const followBtn = document.createElement("button");
    followBtn.className = "button-secondary";
    followBtn.innerText = "Follow / Bell";
    followBtn.onclick = () => {
      saveDiscoveryItem(item);
      trackDiscoveryEvent(DISCOVERY_EVENT_TYPES.PROFILE_FOLLOWED, { itemId: item.id, category: item.category });
      followBtn.innerText = "Bell Saved";
      renderSavedList(savedList);
    };

    const joinBtn = document.createElement("button");
    joinBtn.className = "button-primary";
    joinBtn.innerText = "Join Full Room";
    joinBtn.onclick = () => {
      trackDiscoveryEvent(DISCOVERY_EVENT_TYPES.FULL_ROOM_JOIN_CLICKED, { itemId: item.id, category: item.category });
      countdown.innerText = "Join flow placeholder";
    };

    const skipBtn = document.createElement("button");
    skipBtn.className = "button-secondary";
    skipBtn.innerText = "Skip";
    skipBtn.onclick = () => {
      trackDiscoveryEvent(DISCOVERY_EVENT_TYPES.PREVIEW_SKIPPED, { itemId: item.id, category: item.category });
      currentIndex = (currentIndex + 1) % DISCOVERY_ITEMS.length;
      renderPreview();
    };

    actions.appendChild(saveBtn);
    actions.appendChild(followBtn);
    actions.appendChild(joinBtn);
    actions.appendChild(skipBtn);

    previewCard.appendChild(heading);
    previewCard.appendChild(chips);
    previewCard.appendChild(video);
    previewCard.appendChild(actions);

    timer = window.setInterval(() => {
      remaining -= 1;
      countdown.innerText = `${remaining}s free`;
      if (remaining <= 0) {
        countdown.innerText = "Preview ended";
        trackDiscoveryEvent(DISCOVERY_EVENT_TYPES.UPGRADE_PROMPT_SHOWN, { itemId: item.id, category: item.category });
        window.clearInterval(timer);
      }
    }, 1000);
  }

  renderSavedList(savedList);
  renderPreview();

  grid.appendChild(previewCard);
  grid.appendChild(savedCard);

  shell.appendChild(createLiveSessionTopBar(`🎡 ${LIVE_DISCOVERY_CONFIG.label}`, createLiveHubScreen, "Live Hub"));
  shell.appendChild(intro);
  shell.appendChild(grid);

  shell.cleanup = () => {
    if (timer) window.clearInterval(timer);
  };

  return shell;
}
