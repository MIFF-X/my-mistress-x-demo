import { createAfterLiveBookingsSyncPanel } from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-sync-panel.js";
import { getBookingCounts } from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-store.js";
import { createChatScreen } from "../../plugins/shared/communication/text-chat/chat-screen.js";
import { getActiveChatThreadUnlocks } from "../../plugins/shared/communication/text-chat/chat-thread-unlocks-store.js";
import { createPunishmentsScreen } from "../../plugins/mistress/punishment-system/punishments-screen.js";
import { createAuctionManagerScreen } from "../../plugins/mistress/auction-system/auction-manager-screen.js";
import { createUsersGrid } from "../users/users-grid.js";
import { createPaymentSummary } from "../payments/payment-summary.js";
import { createPaymentsScreen } from "../payments/payments-screen.js";
import { createRecentTributes } from "../payments/recent-tributes.js";
import { createSubscriptionsSummary } from "../payments/subscriptions-summary.js";
import { createPaymentStatusSummary } from "../payments/payment-status-summary.js";
import { createRecentTopUps } from "../payments/recent-topups.js";
import { createLiveRoomsLobby } from "../../plugins/shared/communication/live-show-rooms/live-rooms.js";
import { getAfterShowMessageRequestCounts } from "../../plugins/shared/communication/live-show-rooms/after-show-message-requests-store.js";
import { createAfterShowMessageRequestsInbox } from "../../plugins/shared/communication/live-show-rooms/after-show-message-requests-inbox.js";
import { createWatchWithMistressRoom } from "../../plugins/shared/communication/live-show-rooms/watch-with-mistress-room.js";
import { createAfterLiveBookingInbox } from "./after-live-booking-inbox-v2.js";
import { createMistressCodeLockSettingsScreen } from "./code-lock-settings-screen.js";
import { createMistressMonetisationSettings } from "./mistress-monetisation-settings.js";

function openScreen(factory) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(factory());
}

function createBookingSummaryCard() {
  const counts = getBookingCounts();
  const card = document.createElement("div");
  card.className = "panel mistress-booking-summary";
  card.innerHTML = `
    <h3>📅 Booking Requests</h3>
    <p><strong>${counts.pending}</strong> pending · <strong>${counts.approved}</strong> approved · <strong>${counts.declined}</strong> declined · <strong>${counts.completed}</strong> completed</p>
    <p>Approve, decline, credit-return, schedule, or complete phone/video follow-ups.</p>
  `;

  const button = document.createElement("button");
  button.className = counts.pending > 0 ? "button-primary" : "button-secondary";
  button.innerText = counts.pending > 0 ? `Open Inbox (${counts.pending})` : "Open Booking Inbox";
  button.onclick = () => openScreen(createAfterLiveBookingInbox);
  card.appendChild(button);

  return card;
}

function createAfterShowMessageSummaryCard() {
  const counts = getAfterShowMessageRequestCounts();
  const unlockedThreads = getActiveChatThreadUnlocks();
  const card = document.createElement("div");
  card.className = "panel mistress-after-show-message-summary";
  card.innerHTML = `
    <h3>💬 After-Show Message Requests</h3>
    <p><strong>${counts.pending}</strong> pending · <strong>${counts.accepted}</strong> accepted · <strong>${counts.declined}</strong> declined · <strong>${counts.total}</strong> total</p>
    <p><strong>${unlockedThreads.length}</strong> active unlocked after-show chat thread${unlockedThreads.length === 1 ? "" : "s"}.</p>
    <p>Manage private message requests created from Live Shows and Watch With Mistress after-show offers.</p>
  `;

  const buttonRow = document.createElement("div");
  buttonRow.className = "button-row";

  const inboxButton = document.createElement("button");
  inboxButton.className = counts.pending > 0 ? "button-primary" : "button-secondary";
  inboxButton.innerText = counts.pending > 0 ? `Open Message Requests (${counts.pending})` : "Open Message Requests";
  inboxButton.onclick = () => openScreen(createAfterShowMessageRequestsInbox);

  const chatButton = document.createElement("button");
  chatButton.className = unlockedThreads.length > 0 ? "button-primary" : "button-secondary";
  chatButton.innerText = unlockedThreads.length > 0 ? `Open Unlocked Chats (${unlockedThreads.length})` : "Open Messages";
  chatButton.onclick = () => openScreen(createChatScreen);

  buttonRow.appendChild(inboxButton);
  buttonRow.appendChild(chatButton);
  card.appendChild(buttonRow);

  return card;
}

function createWatchWithMistressSummaryCard() {
  const card = document.createElement("div");
  card.className = "panel mistress-watch-with-summary";
  card.innerHTML = `
    <h3>📺 Watch With Mistress</h3>
    <p>Open the co-viewing room with retro TV overlay, Mistress commentary cam, live chat, wishlist link, and after-show limited spots.</p>
    <p><strong>After-show offers:</strong> Private Message · Voice Call · 1-on-1 Video Call.</p>
  `;

  const button = document.createElement("button");
  button.className = "button-primary";
  button.innerText = "Open Watch Room";
  button.onclick = () => openScreen(createWatchWithMistressRoom);
  card.appendChild(button);

  return card;
}

function createAuctionSummaryCard() {
  const card = document.createElement("div");
  card.className = "panel mistress-auction-summary";
  card.innerHTML = `
    <h3>🔨 Mistress-X Auctions</h3>
    <p>Run public/private, live/normal, VIP, sealed, rare-vault, replay, fulfilment, and NFT digital-lot auctions.</p>
    <p>The synced auction manager can load backend auctions while preserving local preview mode.</p>
  `;

  const button = document.createElement("button");
  button.className = "button-primary";
  button.innerText = "Open Auction Manager";
  button.onclick = () => openScreen(createAuctionManagerScreen);
  card.appendChild(button);

  return card;
}

export function createMistressDashboard() {
  window.currentRole = "mistress";
  const counts = getBookingCounts();
  const messageCounts = getAfterShowMessageRequestCounts();
  const unlockedThreads = getActiveChatThreadUnlocks();

  const container = document.createElement("div");
  container.className = "page-shell mistress-dashboard";
  container.style.padding = "20px";

  const title = document.createElement("h2");
  title.innerText = "👑 Mistress Control Panel";

  const text = document.createElement("p");
  text.innerText = "Welcome, Mistress. Manage subs, messages, monetisation, live rooms, auctions, Watch With Mistress, private access, booking approvals, and payments from here.";

  const quickLinks = document.createElement("div");
  quickLinks.className = "button-row";

  const subsBtn = document.createElement("button");
  subsBtn.className = "button-primary";
  subsBtn.innerText = "View Subs";
  subsBtn.onclick = () => openScreen(createUsersGrid);

  const messagesBtn = document.createElement("button");
  messagesBtn.className = unlockedThreads.length > 0 ? "button-primary" : "button-secondary";
  messagesBtn.innerText = unlockedThreads.length > 0 ? `Messages (${unlockedThreads.length} unlocked)` : "Messages";
  messagesBtn.onclick = () => openScreen(createChatScreen);

  const liveBtn = document.createElement("button");
  liveBtn.className = "button-secondary";
  liveBtn.innerText = "Live Rooms";
  liveBtn.onclick = () => openScreen(createLiveRoomsLobby);

  const auctionBtn = document.createElement("button");
  auctionBtn.className = "button-secondary";
  auctionBtn.innerText = "Auctions";
  auctionBtn.onclick = () => openScreen(createAuctionManagerScreen);

  const watchWithBtn = document.createElement("button");
  watchWithBtn.className = "button-secondary";
  watchWithBtn.innerText = "Watch With Mistress";
  watchWithBtn.onclick = () => openScreen(createWatchWithMistressRoom);

  const afterShowMessagesBtn = document.createElement("button");
  afterShowMessagesBtn.className = messageCounts.pending > 0 ? "button-primary" : "button-secondary";
  afterShowMessagesBtn.innerText = messageCounts.pending > 0 ? `After-Show Messages (${messageCounts.pending})` : "After-Show Messages";
  afterShowMessagesBtn.onclick = () => openScreen(createAfterShowMessageRequestsInbox);

  const bookingInboxBtn = document.createElement("button");
  bookingInboxBtn.className = counts.pending > 0 ? "button-primary" : "button-secondary";
  bookingInboxBtn.innerText = counts.pending > 0 ? `Booking Inbox (${counts.pending})` : "Booking Inbox";
  bookingInboxBtn.onclick = () => openScreen(createAfterLiveBookingInbox);

  const pricingBtn = document.createElement("button");
  pricingBtn.className = "button-secondary";
  pricingBtn.innerText = "Monetisation Settings";
  pricingBtn.onclick = () => openScreen(createMistressMonetisationSettings);

  const codeLockBtn = document.createElement("button");
  codeLockBtn.className = "button-secondary";
  codeLockBtn.innerText = "Code Lock Settings";
  codeLockBtn.onclick = () => openScreen(createMistressCodeLockSettingsScreen);

  const punishmentsBtn = document.createElement("button");
  punishmentsBtn.className = "button-secondary";
  punishmentsBtn.innerText = "Punishments";
  punishmentsBtn.onclick = () => openScreen(createPunishmentsScreen);

  const paymentsQuick = document.createElement("button");
  paymentsQuick.className = "button-secondary";
  paymentsQuick.innerText = "Open Payments";
  paymentsQuick.onclick = () => openScreen(createPaymentsScreen);

  quickLinks.appendChild(subsBtn);
  quickLinks.appendChild(messagesBtn);
  quickLinks.appendChild(liveBtn);
  quickLinks.appendChild(auctionBtn);
  quickLinks.appendChild(watchWithBtn);
  quickLinks.appendChild(afterShowMessagesBtn);
  quickLinks.appendChild(bookingInboxBtn);
  quickLinks.appendChild(pricingBtn);
  quickLinks.appendChild(codeLockBtn);
  quickLinks.appendChild(punishmentsBtn);
  quickLinks.appendChild(paymentsQuick);

  container.appendChild(title);
  container.appendChild(text);
  container.appendChild(quickLinks);
  container.appendChild(createAuctionSummaryCard());
  container.appendChild(createWatchWithMistressSummaryCard());
  container.appendChild(createAfterShowMessageSummaryCard());
  container.appendChild(createBookingSummaryCard());
  container.appendChild(createAfterLiveBookingsSyncPanel({ autoSync: true }));
  container.appendChild(createPaymentSummary());
  container.appendChild(createSubscriptionsSummary());
  container.appendChild(createPaymentStatusSummary());
  container.appendChild(createRecentTributes());
  container.appendChild(createRecentTopUps());

  return container;
}
