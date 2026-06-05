import { mountViewerBookingDashboardCards } from "../../plugins/shared/communication/after-live-bookings/after-live-booking-dashboard-mounts.js";
import { createAfterLiveBookingsSyncPanel } from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-sync-panel.js";
import { getBookingCounts } from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-store.js";
import { createChatScreen } from "../../plugins/shared/communication/text-chat/chat-screen.js";
import { createLiveRoomsLobby } from "../../plugins/shared/communication/live-show-rooms/live-rooms.js";
import { createWatchWithMistressRoom } from "../../plugins/shared/communication/live-show-rooms/watch-with-mistress-room.js";
import { createPaymentSummary } from "../payments/payment-summary.js";
import { createPaymentsScreen } from "../payments/payments-screen.js";
import { createRecentTributes } from "../payments/recent-tributes.js";
import { createSubscriptionsSummary } from "../payments/subscriptions-summary.js";
import { createPaymentStatusSummary } from "../payments/payment-status-summary.js";
import { createRecentTopUps } from "../payments/recent-topups.js";
import { createSubAfterLiveBookings } from "./after-live-bookings-v2.js";

function openScreen(factory) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(factory());
}

function createBookingSummaryCard() {
  const counts = getBookingCounts();

  const card = document.createElement("div");
  card.className = "panel sub-booking-summary";
  card.innerHTML = `
    <h3>📅 My Booking Status</h3>
    <p><strong>${counts.pending}</strong> pending · <strong>${counts.approved}</strong> approved · <strong>${counts.declined}</strong> declined · <strong>${counts.completed}</strong> completed</p>
    <p>Track after-live phone/video bookings, approved slots, host notes, and refund status.</p>
  `;

  const button = document.createElement("button");
  button.className = counts.approved > 0 ? "button-primary" : "button-secondary";
  button.innerText = counts.approved > 0 ? `My Bookings (${counts.approved} approved)` : "Open My Bookings";
  button.onclick = () => openScreen(createSubAfterLiveBookings);
  card.appendChild(button);

  return card;
}

function createWatchWithMistressSummaryCard() {
  const card = document.createElement("div");
  card.className = "panel sub-watch-with-summary";
  card.innerHTML = `
    <h3>📺 Watch With Mistress</h3>
    <p>Join the co-viewing room with chat, retro TV overlay, Mistress commentary cam, wishlist access, and after-show booking spots.</p>
    <p><strong>Available after-show access:</strong> Private Message · Voice Call · 1-on-1 Video Call.</p>
  `;

  const button = document.createElement("button");
  button.className = "button-primary";
  button.innerText = "Enter Watch Room";
  button.onclick = () => openScreen(createWatchWithMistressRoom);
  card.appendChild(button);

  return card;
}

export function createSubDashboard() {
  window.currentRole = "sub";
  const counts = getBookingCounts();

  const container = document.createElement("div");
  container.className = "page-shell sub-dashboard";
  container.style.padding = "20px";

  const title = document.createElement("h2");
  title.innerText = "🔗 Sub Panel";

  const text = document.createElement("p");
  text.innerText = "Welcome, Sub. Access your Mistress, messages, live rooms, Watch With Mistress, bookings, payments, and activity from here.";

  const quickLinks = document.createElement("div");
  quickLinks.className = "button-row";

  const mistressBtn = document.createElement("button");
  mistressBtn.className = "button-primary";
  mistressBtn.innerText = "My Mistress";
  mistressBtn.onclick = () => alert("My Mistress relationship hub coming next.");

  const tasksBtn = document.createElement("button");
  tasksBtn.className = "button-secondary";
  tasksBtn.innerText = "Tasks";
  tasksBtn.onclick = () => alert("Tasks and rituals coming next.");

  const messagesBtn = document.createElement("button");
  messagesBtn.className = "button-secondary";
  messagesBtn.innerText = "Messages";
  messagesBtn.onclick = () => openScreen(createChatScreen);

  const liveBtn = document.createElement("button");
  liveBtn.className = "button-secondary";
  liveBtn.innerText = "Live Rooms";
  liveBtn.onclick = () => openScreen(createLiveRoomsLobby);

  const watchWithBtn = document.createElement("button");
  watchWithBtn.className = "button-secondary";
  watchWithBtn.innerText = "Watch With Mistress";
  watchWithBtn.onclick = () => openScreen(createWatchWithMistressRoom);

  const bookingsBtn = document.createElement("button");
  bookingsBtn.className = counts.approved > 0 ? "button-primary" : "button-secondary";
  bookingsBtn.innerText = counts.approved > 0 ? `My Bookings (${counts.approved})` : "My Bookings";
  bookingsBtn.onclick = () => openScreen(createSubAfterLiveBookings);

  const paymentsQuick = document.createElement("button");
  paymentsQuick.className = "button-secondary";
  paymentsQuick.innerText = "Open Payments";
  paymentsQuick.onclick = () => openScreen(createPaymentsScreen);

  quickLinks.appendChild(mistressBtn);
  quickLinks.appendChild(tasksBtn);
  quickLinks.appendChild(messagesBtn);
  quickLinks.appendChild(liveBtn);
  quickLinks.appendChild(watchWithBtn);
  quickLinks.appendChild(bookingsBtn);
  quickLinks.appendChild(paymentsQuick);

  container.appendChild(title);
  container.appendChild(text);
  container.appendChild(quickLinks);
  container.appendChild(createWatchWithMistressSummaryCard());
  mountViewerBookingDashboardCards(container, () => openScreen(createSubAfterLiveBookings));
  container.appendChild(createBookingSummaryCard());
  container.appendChild(createAfterLiveBookingsSyncPanel({ autoSync: true }));
  container.appendChild(createPaymentSummary());
  container.appendChild(createSubscriptionsSummary());
  container.appendChild(createPaymentStatusSummary());
  container.appendChild(createRecentTributes());
  container.appendChild(createRecentTopUps());

  return container;
}
