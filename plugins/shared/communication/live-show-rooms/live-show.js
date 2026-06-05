import { createChatWindow } from "../text-chat/chat-window.js";
import { createChatInput } from "../text-chat/chat-input.js";
import { createLiveShowOfferTray } from "./live-show-offer-tray.js";

const LIVE_GOAL_TARGET = 500;

function isHostRole(role) {
  return ["mistress", "MISTRESS", "headmistress", "HEADMISTRESS", "admin", "ADMIN"].includes(role);
}

function createLiveAlert(stage, detail) {
  const alert = document.createElement("div");
  alert.className = `live-gift-alert live-gift-alert-${detail.actionKind || "generic"}`;

  const icon = document.createElement("span");
  icon.className = "live-gift-alert-icon";
  icon.innerText = detail.icon || "✨";

  const text = document.createElement("strong");
  text.innerText = detail.title || "Live interaction";

  const subText = document.createElement("small");
  subText.innerText = detail.credits ? `${detail.text} · ${detail.credits} credits` : detail.text || "New live action";

  alert.appendChild(icon);
  alert.appendChild(text);
  alert.appendChild(subText);
  stage.appendChild(alert);

  window.setTimeout(() => {
    alert.classList.add("is-leaving");
    window.setTimeout(() => alert.remove(), 650);
  }, 3200);
}

function addFloatingLiveMessage(container, detail) {
  const item = document.createElement("div");
  item.className = "live-floating-message";
  item.innerText = `${detail.icon || "✨"} ${detail.title || "Live action"}: ${detail.text || ""}`;
  container.appendChild(item);

  while (container.children.length > 5) {
    container.firstElementChild?.remove();
  }
}

function startViewerTicker(viewerValue) {
  let viewers = 142;
  viewerValue.innerText = `${viewers}`;

  return window.setInterval(() => {
    const shift = Math.floor(Math.random() * 5) - 2;
    viewers = Math.max(1, viewers + shift);
    viewerValue.innerText = `${viewers}`;
  }, 6000);
}

function updateLiveGoal(goalText, goalFill, currentValue) {
  const safeValue = Math.min(currentValue, LIVE_GOAL_TARGET);
  const percent = Math.round((safeValue / LIVE_GOAL_TARGET) * 100);
  goalText.innerText = `Live Goal: ${safeValue} / ${LIVE_GOAL_TARGET} credits`;
  goalFill.style.width = `${percent}%`;

  if (safeValue >= LIVE_GOAL_TARGET) {
    goalText.innerText = `Live Goal Complete: ${safeValue} / ${LIVE_GOAL_TARGET} credits`;
    goalFill.classList.add("is-complete");
  }
}

function createHostControlButton(label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "live-host-control-btn";
  button.innerText = label;
  button.onclick = action;
  return button;
}

export function createLiveShow() {
  const role = window.currentRole || "sub";
  const isHost = isHostRole(role);
  const page = document.createElement("div");
  page.className = isHost ? "plugin-live-show is-host" : "plugin-live-show is-viewer";
  page.style.display = "flex";
  page.style.height = "85vh";
  page.style.color = "white";

  page.innerHTML = `
    <div id="live-video-stage" style="flex:1; background:#000; display:flex; flex-direction: column; align-items:center; justify-content:center; position:relative; border-radius: 12px; margin-right: 15px; overflow:hidden;">
      <div id="video-stream" style="font-size: 24px; text-align:center; opacity:0.88;">📹 [ Mistress Live Stream Feed ]</div>

      <div id="viewer-count" class="live-viewer-pill">
        <span class="live-viewer-eye">👁</span>
        <strong id="live-viewer-value">142</strong>
        <span>watching</span>
      </div>

      <div id="live-goal-bar" class="live-goal-card">
        <div id="live-goal-text" class="live-goal-text">Live Goal: 380 / 500 credits</div>
        <div class="live-goal-track">
          <div id="live-goal-fill" class="live-goal-fill" style="width:76%;"></div>
        </div>
      </div>

      <div id="live-host-controls" class="live-host-controls"></div>
      <div id="live-status-pill" class="live-status-pill">${isHost ? "Host controls on · Chat live" : "Live chat · Gifts enabled"}</div>
      <div id="live-alert-layer" class="live-alert-layer"></div>

      <div id="live-floating-chat" class="live-floating-chat">
        <div class="live-floating-message">🎁 Sub_Finance_04 sent Crown</div>
        <div class="live-floating-message">💸 Sub_Tech_09 tipped 25 credits</div>
      </div>

      <div id="live-offer-tray-slot"></div>
      <div id="live-overlay-composer" class="live-overlay-composer"></div>
    </div>

    <div id="live-chat-sidebar" style="width:350px; background:#1b1b1b; display:flex; flex-direction:column; border-radius: 12px; padding: 10px;">
      <h3 style="margin-top: 0; padding: 10px; border-bottom: 1px solid #333;">Live Interaction Chat</h3>
      <div id="sidebar-chat-content" style="flex: 1; overflow-y: auto;"></div>
      <div id="sidebar-chat-input"></div>
    </div>
  `;

  const chatWin = createChatWindow();
  const sidebarComposer = createChatInput({ role });
  const overlayComposer = createChatInput({ role, isLiveOverlay: true });
  const stage = page.querySelector("#live-alert-layer");
  const floatingChat = page.querySelector("#live-floating-chat");
  const viewerValue = page.querySelector("#live-viewer-value");
  const goalText = page.querySelector("#live-goal-text");
  const goalFill = page.querySelector("#live-goal-fill");
  const hostControls = page.querySelector("#live-host-controls");
  const statusPill = page.querySelector("#live-status-pill");
  const overlayComposerShell = page.querySelector("#live-overlay-composer");
  const sidebar = page.querySelector("#live-chat-sidebar");
  const offerTraySlot = page.querySelector("#live-offer-tray-slot");
  let liveGoalTotal = 380;
  let overlayVisible = true;
  let sidebarVisible = true;
  let offersVisible = true;
  let chatMuted = false;

  page.querySelector("#sidebar-chat-content").appendChild(chatWin);
  page.querySelector("#sidebar-chat-input").appendChild(sidebarComposer);
  overlayComposerShell.appendChild(overlayComposer);
  offerTraySlot.appendChild(createLiveShowOfferTray({ mistressId: "demo-mistress", defaultExpanded: true }));

  if (isHost) {
    hostControls.appendChild(
      createHostControlButton("Overlay", () => {
        overlayVisible = !overlayVisible;
        overlayComposerShell.style.display = overlayVisible ? "block" : "none";
        statusPill.innerText = `${overlayVisible ? "Overlay on" : "Overlay hidden"} · ${chatMuted ? "Chat muted" : "Chat live"}`;
      })
    );

    hostControls.appendChild(
      createHostControlButton("Offers", () => {
        offersVisible = !offersVisible;
        offerTraySlot.style.display = offersVisible ? "block" : "none";
        statusPill.innerText = `${offersVisible ? "Offers visible" : "Offers hidden"} · ${chatMuted ? "Chat muted" : "Chat live"}`;
      })
    );

    hostControls.appendChild(
      createHostControlButton("Sidebar", () => {
        sidebarVisible = !sidebarVisible;
        sidebar.style.display = sidebarVisible ? "flex" : "none";
        statusPill.innerText = `${sidebarVisible ? "Sidebar on" : "Sidebar hidden"} · ${chatMuted ? "Chat muted" : "Chat live"}`;
      })
    );

    hostControls.appendChild(
      createHostControlButton("Mute Chat", () => {
        chatMuted = !chatMuted;
        statusPill.innerText = `${overlayVisible ? "Overlay on" : "Overlay hidden"} · ${chatMuted ? "Chat muted" : "Chat live"}`;
        overlayComposerShell.style.opacity = chatMuted ? "0.45" : "1";
        sidebar.style.opacity = chatMuted ? "0.7" : "1";
      })
    );

    hostControls.appendChild(
      createHostControlButton("Test Gift", () => {
        window.dispatchEvent(
          new CustomEvent("mistressx:live-action", {
            detail: {
              actionKind: "gift",
              icon: "🎁",
              title: "Digital Gift Sent",
              text: "Test Crown",
              credits: 15
            }
          })
        );
      })
    );

    hostControls.appendChild(
      createHostControlButton("Clear", () => {
        stage.innerHTML = "";
        floatingChat.innerHTML = "";
      })
    );
  } else {
    hostControls.remove();
  }

  const viewerInterval = startViewerTicker(viewerValue);

  const liveActionHandler = (event) => {
    const detail = event.detail || {};
    createLiveAlert(stage, detail);
    addFloatingLiveMessage(floatingChat, detail);

    if (["gift", "tip", "voice", "video"].includes(detail.actionKind) && detail.credits) {
      liveGoalTotal += Number(detail.credits) || 0;
      updateLiveGoal(goalText, goalFill, liveGoalTotal);
    }
  };

  window.addEventListener("mistressx:live-action", liveActionHandler);

  page.cleanup = () => {
    window.clearInterval(viewerInterval);
    window.removeEventListener("mistressx:live-action", liveActionHandler);
  };

  return page;
}