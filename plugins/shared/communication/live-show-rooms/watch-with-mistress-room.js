import { createChatInput } from "../text-chat/chat-input.js";
import { createChatWindow } from "../text-chat/chat-window.js";
import { createLiveShowOfferTray } from "./live-show-offer-tray.js";

function createToggleButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "watch-with-control-btn";
  button.innerText = label;
  button.onclick = onClick;
  return button;
}

function ensureWatchWithMistressRoomStyles() {
  if (document.getElementById("watch-with-mistress-room-styles")) return;
  const style = document.createElement("style");
  style.id = "watch-with-mistress-room-styles";
  style.textContent = `
    .watch-with-mistress-room {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      gap: 14px;
      height: 85vh;
      color: white;
    }

    .watch-with-stage {
      position: relative;
      min-height: 560px;
      border-radius: 20px;
      border: 1px solid rgba(222,176,56,.32);
      background: radial-gradient(circle at center, rgba(222,176,56,.08), #020202 54%);
      overflow: hidden;
    }

    .watch-with-stage.is-tv-overlay::before {
      content: "";
      position: absolute;
      inset: 22px;
      border: 10px solid rgba(255,255,255,.08);
      border-radius: 34px;
      pointer-events: none;
      box-shadow: inset 0 0 0 2px rgba(222,176,56,.18), inset 0 0 70px rgba(0,0,0,.72);
      z-index: 8;
    }

    .watch-with-content {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-align: center;
      padding: 30px;
    }

    .watch-with-content-icon {
      font-size: 44px;
      color: #f2c94c;
    }

    .watch-with-mistress-cam {
      position: absolute;
      right: 22px;
      top: 22px;
      width: 210px;
      min-height: 120px;
      border-radius: 18px;
      border: 1px solid rgba(222,176,56,.45);
      background: rgba(20,20,24,.92);
      padding: 14px;
      z-index: 12;
      box-shadow: 0 18px 45px rgba(0,0,0,.4);
    }

    .watch-with-mistress-cam strong,
    .watch-with-mistress-cam small {
      display: block;
    }

    .watch-with-mistress-cam small,
    .watch-with-status,
    .watch-with-sidebar p {
      color: rgba(255,255,255,.68);
      font-size: 12px;
    }

    .watch-with-controls {
      position: absolute;
      left: 18px;
      top: 18px;
      z-index: 14;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .watch-with-control-btn {
      border: 1px solid rgba(222,176,56,.4);
      background: rgba(0,0,0,.58);
      color: #f2c94c;
      border-radius: 999px;
      padding: 8px 11px;
      font-weight: 900;
      cursor: pointer;
    }

    .watch-with-sidebar {
      display: flex;
      flex-direction: column;
      border-radius: 18px;
      background: #171717;
      border: 1px solid rgba(255,255,255,.08);
      padding: 12px;
      min-width: 0;
    }

    .watch-with-chat-content {
      flex: 1;
      min-height: 0;
      overflow: auto;
      border-radius: 14px;
      background: rgba(255,255,255,.03);
      margin: 10px 0;
    }

    .watch-with-status {
      position: absolute;
      left: 18px;
      bottom: 18px;
      z-index: 16;
      background: rgba(0,0,0,.56);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 999px;
      padding: 8px 11px;
    }

    @media (max-width: 900px) {
      .watch-with-mistress-room { grid-template-columns: 1fr; height: auto; }
      .watch-with-stage { min-height: 620px; }
    }
  `;
  document.head.appendChild(style);
}

export function createWatchWithMistressRoom({ role = window.currentRole || "sub", mistressId = "demo-mistress" } = {}) {
  ensureWatchWithMistressRoomStyles();

  let tvOverlayVisible = true;
  let mistressCamVisible = true;
  let sidebarVisible = true;
  let focusMode = false;

  const page = document.createElement("div");
  page.className = "watch-with-mistress-room";

  const stage = document.createElement("div");
  stage.className = "watch-with-stage is-tv-overlay";

  const content = document.createElement("div");
  content.className = "watch-with-content";
  content.innerHTML = `
    <div class="watch-with-content-icon">📺</div>
    <h2>Watch With Mistress</h2>
    <p>Synchronized co-viewing, commentary, gifts, requests, wishlist, and after-session booking offers.</p>
  `;

  const mistressCam = document.createElement("div");
  mistressCam.className = "watch-with-mistress-cam";
  mistressCam.innerHTML = `
    <strong>👑 Mistress Commentary Cam</strong>
    <small>Live reactions, voice commentary, and optional picture-in-picture cam.</small>
  `;

  const controls = document.createElement("div");
  controls.className = "watch-with-controls";

  const status = document.createElement("div");
  status.className = "watch-with-status";
  status.innerText = "Offers visible · TV overlay on · Mistress cam on";

  const offerTraySlot = document.createElement("div");
  offerTraySlot.appendChild(createLiveShowOfferTray({ mistressId, defaultExpanded: true }));

  const sidebar = document.createElement("aside");
  sidebar.className = "watch-with-sidebar";
  sidebar.innerHTML = `
    <h3>Watch Room Chat</h3>
    <p>Subs can chat, send gifts, request attention, open wishlist, or pre-buy one-on-one time for after the session.</p>
    <div class="watch-with-chat-content"></div>
    <div class="watch-with-chat-input"></div>
  `;

  const chatWindow = createChatWindow();
  const chatInput = createChatInput({ role, isLiveOverlay: false });
  sidebar.querySelector(".watch-with-chat-content").appendChild(chatWindow);
  sidebar.querySelector(".watch-with-chat-input").appendChild(chatInput);

  controls.appendChild(
    createToggleButton("TV Overlay", () => {
      tvOverlayVisible = !tvOverlayVisible;
      stage.classList.toggle("is-tv-overlay", tvOverlayVisible);
      status.innerText = `${focusMode ? "Focus mode" : "Offers visible"} · TV overlay ${tvOverlayVisible ? "on" : "off"} · Mistress cam ${mistressCamVisible ? "on" : "off"}`;
    })
  );

  controls.appendChild(
    createToggleButton("Mistress Cam", () => {
      mistressCamVisible = !mistressCamVisible;
      mistressCam.style.display = mistressCamVisible ? "block" : "none";
      status.innerText = `${focusMode ? "Focus mode" : "Offers visible"} · TV overlay ${tvOverlayVisible ? "on" : "off"} · Mistress cam ${mistressCamVisible ? "on" : "off"}`;
    })
  );

  controls.appendChild(
    createToggleButton("Chat", () => {
      sidebarVisible = !sidebarVisible;
      sidebar.style.display = sidebarVisible ? "flex" : "none";
      page.style.gridTemplateColumns = sidebarVisible ? "minmax(0, 1fr) 360px" : "1fr";
      status.innerText = `Chat ${sidebarVisible ? "on" : "hidden"} · Offers visible · Mistress cam ${mistressCamVisible ? "on" : "off"}`;
    })
  );

  controls.appendChild(
    createToggleButton("Focus", () => {
      focusMode = !focusMode;
      offerTraySlot.style.display = focusMode ? "none" : "block";
      sidebar.style.opacity = focusMode ? "0.35" : "1";
      status.innerText = focusMode ? "Focus mode · Offers hidden" : "Offers visible · Focus mode off";
    })
  );

  stage.appendChild(content);
  stage.appendChild(mistressCam);
  stage.appendChild(controls);
  stage.appendChild(offerTraySlot);
  stage.appendChild(status);
  page.appendChild(stage);
  page.appendChild(sidebar);

  return page;
}
