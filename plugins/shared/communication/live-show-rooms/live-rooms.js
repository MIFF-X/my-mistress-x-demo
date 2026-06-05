import { createAfterLiveBookingInApi } from "../after-live-bookings/after-live-bookings-api.js";
import {
  chargeDemoWallet,
  getDemoWalletBalance,
  refundDemoWallet,
  saveAfterLiveBooking
} from "../after-live-bookings/after-live-bookings-store.js";
import { hasBookingApiAuth } from "../api/booking-api-client.js";
import { getChatMonetisationPricing } from "../text-chat/chat-monetisation-pricing.js";
import {
  buildLiveRoomEntitlementPayload,
  checkRoomEntitlement,
  unlockRoomEntitlement
} from "../api/room-entitlements-api-client.js";
import {
  canEnterRoom,
  checkRoomCode,
  getRoomEntry,
  getRoomEntryLabel,
  markRoomEntered
} from "./live-room-entry-state.js";
import { createLiveShow } from "./live-show.js";

const LIVE_ROOM_HOST_IDS_KEY = "mistressXLiveRoomHostIds";

const LIVE_ROOMS = [
  {
    id: "public-throne-room",
    title: "Public Throne Room",
    host: "Mistress Noir",
    hostUserId: "",
    status: "Live now",
    accessType: "public",
    viewers: 142,
    description: "Open room with live chat, gifts, tips, and public interaction."
  },
  {
    id: "vip-aftercare",
    title: "VIP After-Live Room",
    host: "Mistress Velvet",
    hostUserId: "",
    status: "Starting soon",
    accessType: "locked",
    unlockRule: "VIP subscription or paid entry",
    priceCredits: 25,
    viewers: 38,
    description: "Locked room for VIP viewers and after-live bookings."
  },
  {
    id: "private-code-room",
    title: "Private Invite Room",
    host: "Mistress X",
    hostUserId: "",
    status: "Private",
    accessType: "code",
    unlockRule: "Access code required",
    accessCode: "MXVIP",
    viewers: 9,
    description: "Invite-only room for private group sessions and booked access."
  }
];

function getCurrentRole() {
  return String(window.currentRole || localStorage.getItem("mistressXRole") || "sub").toLowerCase();
}

function isHostSetupRole() {
  return ["mistress", "headmistress", "admin"].includes(getCurrentRole());
}

function getStoredRoomHostIds() {
  try {
    return JSON.parse(localStorage.getItem(LIVE_ROOM_HOST_IDS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function setStoredRoomHostId(roomId, hostUserId) {
  const next = {
    ...getStoredRoomHostIds(),
    [roomId]: hostUserId.trim()
  };
  localStorage.setItem(LIVE_ROOM_HOST_IDS_KEY, JSON.stringify(next));
  return next;
}

function hydrateRoom(room) {
  const storedHostIds = getStoredRoomHostIds();
  return {
    ...room,
    hostUserId: storedHostIds[room.id] || room.hostUserId || ""
  };
}

function canCreateBackendBooking(room) {
  return Boolean(room.hostUserId && hasBookingApiAuth());
}

function openRoom(room) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(createLiveShow({ room }));
}

function ensureLiveRoomStyles() {
  if (document.getElementById("live-room-lobby-styles")) return;

  const style = document.createElement("style");
  style.id = "live-room-lobby-styles";
  style.textContent = `
    .live-rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-top: 18px;
    }

    .live-room-card {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, rgba(27, 27, 27, 0.98), rgba(19, 19, 28, 0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }

    .live-room-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .live-room-card h3 {
      margin: 0;
    }

    .live-room-meta,
    .live-room-rule,
    .live-room-unlock-note {
      color: rgba(255, 255, 255, 0.68);
      font-size: 13px;
    }

    .live-room-badge,
    .live-room-mode-pill {
      border-radius: 999px;
      padding: 5px 9px;
      font-size: 11px;
      font-weight: 900;
      white-space: nowrap;
    }

    .live-room-mode-pill {
      display: inline-flex;
      margin-top: 6px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: rgba(255, 255, 255, 0.72);
      background: rgba(255, 255, 255, 0.06);
    }

    .live-room-mode-pill.is-api-ready {
      color: #9ff5d3;
      border-color: rgba(29, 158, 117, 0.38);
      background: rgba(29, 158, 117, 0.12);
    }

    .live-room-badge-public {
      background: rgba(29, 158, 117, 0.14);
      color: #9ff5d3;
      border: 1px solid rgba(29, 158, 117, 0.38);
    }

    .live-room-badge-locked {
      background: rgba(255, 193, 7, 0.12);
      color: #ffe08a;
      border: 1px solid rgba(255, 193, 7, 0.38);
    }

    .live-room-badge-code {
      background: rgba(127, 119, 221, 0.14);
      color: #c6c1ff;
      border: 1px solid rgba(127, 119, 221, 0.38);
    }

    .live-room-access-row,
    .live-room-host-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin: 10px 0;
    }

    .live-room-access-row input,
    .live-room-host-row input {
      flex: 1;
      min-width: 0;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      background: #101016;
      color: white;
      padding: 10px;
    }

    .live-room-host-row {
      align-items: stretch;
    }

    .live-room-host-helper {
      margin: 6px 0 0;
      color: rgba(255, 255, 255, 0.56);
      font-size: 12px;
    }

    .live-room-card.is-unlocked,
    .live-room-card.has-booking-request {
      border-color: rgba(29, 158, 117, 0.42);
      box-shadow: 0 16px 40px rgba(29, 158, 117, 0.12);
    }

    .after-live-booking-panel {
      display: none;
      margin-top: 12px;
      padding: 12px;
      border-radius: 14px;
      background: rgba(8, 8, 12, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .after-live-booking-panel.is-visible {
      display: block;
    }

    .after-live-booking-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
      margin-top: 10px;
    }

    .after-live-booking-option {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: #262632;
      color: white;
      border-radius: 14px;
      padding: 10px;
      cursor: pointer;
      font-weight: 800;
      text-align: left;
    }

    .after-live-booking-option span {
      display: block;
      margin-top: 4px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.62);
    }

    .after-live-topup-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);
}

function createAccessBadge(room) {
  const badge = document.createElement("span");
  badge.className = `live-room-badge live-room-badge-${room.accessType}`;

  if (room.accessType === "public") badge.innerText = "Public";
  if (room.accessType === "locked") badge.innerText = "Locked";
  if (room.accessType === "code") badge.innerText = "Access code";

  return badge;
}

function createModePill(room) {
  const pill = document.createElement("span");
  const apiReady = canCreateBackendBooking(room);
  pill.className = apiReady ? "live-room-mode-pill is-api-ready" : "live-room-mode-pill";
  pill.innerText = apiReady ? "Backend booking ready" : "Demo booking fallback";
  return pill;
}

function markUnlocked(card, note, message, room, reason = "entry-unlocked") {
  card.classList.add("is-unlocked");
  delete card.dataset.entitlementNeedsConfirm;
  note.innerText = message;
  if (room) markRoomEntered(room, reason);
}

function entitlementMessage(entitlement, fallback) {
  const parts = [entitlement?.reason || fallback];
  if (entitlement?.entitlementId) parts.push(`Grant: ${entitlement.entitlementId}.`);
  if (entitlement?.receiptId) parts.push(`Receipt: ${entitlement.receiptId}.`);
  if (entitlement?.ledgerHoldId) parts.push(`Ledger: ${entitlement.ledgerHoldId}.`);
  return parts.join(" ");
}

function markDemoUnlock(card, note, reason, room) {
  markUnlocked(card, note, `${reason} Demo unlock active until the entitlement API is available.`, room, "local-demo");
}

async function checkAccessCodeEntitlement({ room, code, card, note, button }) {
  const accessCode = String(code || "").trim();
  if (!accessCode) {
    note.innerText = "Enter the room code first.";
    return false;
  }

  if (hasBookingApiAuth()) {
    button.disabled = true;
    button.innerText = "Checking...";

    try {
      const entitlement = await checkRoomEntitlement(
        buildLiveRoomEntitlementPayload(room, {
          mode: "access_code",
          accessCode
        })
      );

      if (entitlement?.allowed) {
        markUnlocked(
          card,
          note,
          entitlementMessage(entitlement, "Access code accepted."),
          room,
          "backend-access-code"
        );
        button.innerText = "Code Accepted";
        return true;
      }

      note.innerText = entitlement?.reason || "Access code not recognised.";
      button.innerText = "Check Code";
      return false;
    } catch (error) {
      note.innerText = `Entitlement API unavailable. Checking local demo code. ${error instanceof Error ? error.message : ""}`;
    } finally {
      button.disabled = false;
    }
  }

  if (checkRoomCode(room, accessCode)) {
    markUnlocked(card, note, "Access code accepted.", room, "local-access-code");
    button.innerText = "Code Accepted";
    return true;
  }

  note.innerText = "Access code not recognised.";
  return false;
}

async function unlockLockedRoomEntitlement({ room, card, note, button }) {
  if (!hasBookingApiAuth()) {
    markDemoUnlock(card, note, "No API token detected.", room);
    return true;
  }

  button.disabled = true;
  button.innerText = card.dataset.entitlementNeedsConfirm === "true" ? "Confirming..." : "Checking...";

  try {
    const payload = buildLiveRoomEntitlementPayload(room, {
      mode: "paid_entry",
      confirmSpend: card.dataset.entitlementNeedsConfirm === "true"
    });
    const entitlement = payload.confirmSpend
      ? await unlockRoomEntitlement(payload)
      : await checkRoomEntitlement(payload);

    if (entitlement?.allowed) {
      markUnlocked(
        card,
        note,
        entitlementMessage(entitlement, "Room entitlement accepted."),
        room,
        payload.confirmSpend ? "paid-entry-confirmed" : "backend-entitlement"
      );
      button.innerText = "Enter Room";
      return true;
    }

    if (entitlement?.decision === "payment_required") {
      card.dataset.entitlementNeedsConfirm = "true";
      button.innerText = `Confirm ${entitlement.requiredCredits || room.priceCredits || 25} Credit Unlock`;
      note.innerText = `${entitlement.reason} Click confirm to spend wallet credits and enter.`;
      return false;
    }

    button.innerText = "Unlock / Enter";
    note.innerText = entitlement?.reason || "Room entitlement check did not allow access.";
    return false;
  } catch (error) {
    markDemoUnlock(
      card,
      note,
      `Entitlement API unavailable${error instanceof Error ? `: ${error.message}` : "."}`,
      room
    );
    button.innerText = "Enter Room";
    return true;
  } finally {
    button.disabled = false;
  }
}

function createTopUpRow(helper) {
  const row = document.createElement("div");
  row.className = "after-live-topup-row";

  [25, 50, 100].forEach((amount) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button-secondary";
    button.innerText = `Top up ${amount}`;
    button.onclick = () => {
      refundDemoWallet(amount);
      helper.innerText = `Wallet topped up by ${amount} credits. New balance: ${getDemoWalletBalance()} credits.`;
    };
    row.appendChild(button);
  });

  return row;
}

async function createBookingRequest({ room, option, card, helper, panel }) {
  if (canCreateBackendBooking(room)) {
    helper.innerText = "Sending booking request to backend...";

    try {
      const booking = await createAfterLiveBookingInApi({
        hostUserId: room.hostUserId,
        type: option.type,
        minutes: option.minutes,
        credits: option.credits,
        roomId: room.id,
        notes: `${option.label} requested from ${room.title}`
      });

      saveAfterLiveBooking(booking);
      card.classList.add("has-booking-request");
      helper.innerText = `${option.label} requested with ${room.host}: ${option.minutes} minutes / ${option.credits} credits. Backend request ID: ${booking.id}`;
      window.dispatchEvent(new CustomEvent("mistressx:after-live-booking", { detail: booking }));
      return;
    } catch (error) {
      helper.innerText = `Backend booking failed, using local demo fallback. ${error instanceof Error ? error.message : ""}`;
    }
  }

  if (!chargeDemoWallet(option.credits)) {
    helper.innerText = `Top-up needed. ${option.label} costs ${option.credits} credits, but wallet has ${getDemoWalletBalance()} credits.`;

    if (!panel.querySelector(".after-live-topup-row")) {
      panel.appendChild(createTopUpRow(helper));
    }

    return;
  }

  const booking = saveAfterLiveBooking({
    roomId: room.id,
    host: room.host,
    hostUserId: room.hostUserId || null,
    type: option.type,
    minutes: option.minutes,
    credits: option.credits,
    requesterRole: window.currentRole || "sub",
    status: "pending",
    backend: false
  });

  card.classList.add("has-booking-request");
  helper.innerText = `${option.label} requested with ${room.host}: ${option.minutes} minutes / ${option.credits} credits deducted. Awaiting approval. Local request ID: ${booking.id}`;
  window.dispatchEvent(new CustomEvent("mistressx:after-live-booking", { detail: booking }));
}

function createBookingPanel(room, card) {
  const pricing = getChatMonetisationPricing();
  const panel = document.createElement("div");
  panel.className = "after-live-booking-panel";

  const title = document.createElement("strong");
  title.innerText = "Book after-live chat";

  const helper = document.createElement("p");
  helper.className = "live-room-unlock-note";
  helper.innerText = canCreateBackendBooking(room)
    ? "Backend booking mode is ready. Request a follow-up after the live session."
    : `Wallet: ${getDemoWalletBalance()} credits. Local demo booking mode is active until hostUserId/auth/API are available.`;

  const grid = document.createElement("div");
  grid.className = "after-live-booking-grid";

  const options = [
    { type: "phone", label: "Phone booking", credits: pricing.phoneBooking, minutes: 15, icon: "📞" },
    { type: "video", label: "Video booking", credits: pricing.videoBooking, minutes: 20, icon: "🎥" }
  ];

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "after-live-booking-option";
    button.innerHTML = `${option.icon} ${option.label}<span>${option.minutes} min · ${option.credits} credits</span>`;
    button.onclick = () => createBookingRequest({ room, option, card, helper, panel });
    grid.appendChild(button);
  });

  panel.appendChild(title);
  panel.appendChild(helper);
  panel.appendChild(grid);

  return panel;
}

function createHostIdSetup(room, modePill, bookingPanel, card) {
  const wrap = document.createElement("div");
  wrap.className = "live-room-host-setup";

  const row = document.createElement("div");
  row.className = "live-room-host-row";

  const input = document.createElement("input");
  input.placeholder = "Backend hostUserId for this room";
  input.value = room.hostUserId || "";

  const saveBtn = document.createElement("button");
  saveBtn.className = "button-secondary";
  saveBtn.innerText = "Save Host ID";
  saveBtn.onclick = () => {
    const nextHostId = input.value.trim();
    setStoredRoomHostId(room.id, nextHostId);
    room.hostUserId = nextHostId;
    const nextPill = createModePill(room);
    modePill.replaceWith(nextPill);
    saveBtn.innerText = "Saved";
    helper.innerText = nextHostId
      ? "Host ID saved. Reopen the booking panel to use backend-first mode."
      : "Host ID cleared. Demo fallback mode remains active.";
  };

  const helper = document.createElement("p");
  helper.className = "live-room-host-helper";
  helper.innerText = room.hostUserId
    ? "Host ID saved for backend booking mode."
    : "Host/admin only: add a backend hostUserId to activate backend-first booking mode.";

  row.appendChild(input);
  row.appendChild(saveBtn);
  wrap.appendChild(row);
  wrap.appendChild(helper);

  return wrap;
}

function createRoomCard(sourceRoom) {
  const room = hydrateRoom(sourceRoom);
  const card = document.createElement("div");
  card.className = "panel live-room-card";
  if (getRoomEntry(room.id)) card.classList.add("is-unlocked");

  const top = document.createElement("div");
  top.className = "live-room-card-top";

  const title = document.createElement("h3");
  title.innerText = room.title;

  top.appendChild(title);
  top.appendChild(createAccessBadge(room));

  const meta = document.createElement("p");
  meta.className = "live-room-meta";
  meta.innerText = `${room.host} · ${room.status} · 👁 ${room.viewers} watching`;

  const description = document.createElement("p");
  description.innerText = room.description;

  const rule = document.createElement("p");
  rule.className = "live-room-rule";
  rule.innerText = room.unlockRule || "No code or payment required.";

  const note = document.createElement("p");
  note.className = "live-room-unlock-note";
  note.innerText = getRoomEntryLabel(room);

  const accessRow = document.createElement("div");
  accessRow.className = "live-room-access-row";

  if (room.accessType === "code") {
    const input = document.createElement("input");
    input.placeholder = "Enter access code";
    input.autocomplete = "off";

    const unlockCodeBtn = document.createElement("button");
    unlockCodeBtn.className = "button-secondary";
    unlockCodeBtn.innerText = "Check Code";
    unlockCodeBtn.onclick = () =>
      checkAccessCodeEntitlement({
        room,
        code: input.value,
        card,
        note,
        button: unlockCodeBtn
      });

    accessRow.appendChild(input);
    accessRow.appendChild(unlockCodeBtn);
  }

  const modePill = createModePill(room);
  const bookingPanel = createBookingPanel(room, card);
  const hostSetup = isHostSetupRole() ? createHostIdSetup(room, modePill, bookingPanel, card) : null;
  const actions = document.createElement("div");
  actions.className = "button-row";

  const openBtn = document.createElement("button");
  openBtn.className = canEnterRoom(room) ? "button-primary" : "button-secondary";
  openBtn.innerText = canEnterRoom(room) ? "Enter Room" : "Unlock / Enter";
  openBtn.onclick = async () => {
    if (canEnterRoom(room)) {
      markRoomEntered(room, room.accessType === "public" ? "public-entry" : "room-entered");
      openRoom(room);
      return;
    }

    if (room.accessType === "code") {
      note.innerText = "Enter the room code first. Demo code: MXVIP";
      return;
    }

    if (room.accessType === "locked") {
      await unlockLockedRoomEntitlement({ room, card, note, button: openBtn });
      return;
    }
  };

  const bookBtn = document.createElement("button");
  bookBtn.className = "button-secondary";
  bookBtn.innerText = "Book After-Live Chat";
  bookBtn.onclick = () => {
    bookingPanel.classList.toggle("is-visible");
  };

  actions.appendChild(openBtn);
  actions.appendChild(bookBtn);

  card.appendChild(top);
  card.appendChild(meta);
  card.appendChild(modePill);
  if (hostSetup) card.appendChild(hostSetup);
  card.appendChild(description);
  card.appendChild(rule);
  if (room.accessType === "code") card.appendChild(accessRow);
  card.appendChild(note);
  card.appendChild(actions);
  card.appendChild(bookingPanel);

  return card;
}

export function createLiveRoomsLobby() {
  ensureLiveRoomStyles();

  const shell = document.createElement("div");
  shell.className = "page-shell live-rooms-lobby";
  shell.style.padding = "20px";

  const title = document.createElement("h2");
  title.innerText = "👁 Live Rooms";

  const intro = document.createElement("p");
  intro.innerText = "Choose a public room, unlock a locked live room, or enter an invite-code room. Live rooms include chat overlay, gifts, tips, phone/video requests, and after-live bookings.";

  const grid = document.createElement("div");
  grid.className = "live-rooms-grid";
  LIVE_ROOMS.forEach((room) => grid.appendChild(createRoomCard(room)));

  shell.appendChild(title);
  shell.appendChild(intro);
  shell.appendChild(grid);

  return shell;
}
