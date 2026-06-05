import { createAfterShowBookingRequest } from "./live-show-after-show-booking.js";
import { saveAfterShowMessageRequestWithApi } from "./after-show-message-requests-store.js";
import {
  formatAfterShowAvailability,
  getAfterShowAvailability,
} from "./live-show-after-show-availability.js";

function dispatchAfterShowAction(detail) {
  window.dispatchEvent(new CustomEvent("mistressx:live-action", { detail }));
}

function createAfterShowButton({ kind, icon, label, sublabel, onClick }) {
  const availability = getAfterShowAvailability(kind);
  const button = document.createElement("button");
  button.type = "button";
  button.className = availability.soldOut ? "live-show-offer-button is-sold-out" : "live-show-offer-button";
  button.disabled = availability.soldOut;
  button.onclick = availability.soldOut ? undefined : onClick;

  const iconEl = document.createElement("span");
  iconEl.className = "live-show-offer-icon";
  iconEl.innerText = icon;

  const text = document.createElement("span");
  text.className = "live-show-offer-text";
  text.innerHTML = `<strong>${label}</strong><small>${sublabel}</small><em>${formatAfterShowAvailability(kind)}</em>`;

  button.appendChild(iconEl);
  button.appendChild(text);
  return button;
}

function requestAfterShowBooking(kind, settings, status, actionDetail) {
  const result = createAfterShowBookingRequest(kind, settings);
  status.innerText = result.message;

  dispatchAfterShowAction({
    ...actionDetail,
    text: result.message,
    bookingId: result.booking?.id || null,
    bookingStatus: result.booking?.status || null,
  });

  window.dispatchEvent(
    new CustomEvent("mistressx:after-show-booking-requested", {
      detail: result,
    })
  );

  return result;
}

async function requestAfterShowPrivateMessage(settings, status) {
  const bookingResult = requestAfterShowBooking("privateMessage", settings, status, {
    actionKind: "message",
    icon: "💬",
    title: "After-show private message requested",
  });

  if (!bookingResult.ok) return bookingResult;

  status.innerText = `${bookingResult.message} Saving message request...`;

  const result = await saveAfterShowMessageRequestWithApi({
    showId: "demo-show",
    bookingId: bookingResult.booking?.id || null,
    title: "After-show private message request",
    message: "Sub requested private message access from the live show offer tray.",
    status: "pending",
    conversationName: "Sub 1",
    availabilitySnapshot: formatAfterShowAvailability("privateMessage"),
  });

  status.innerText = `${bookingResult.message} Message request ${result.request.id} saved via ${result.source}.`;
  return { ...bookingResult, messageRequest: result.request, messageRequestSource: result.source };
}

export function createAfterShowConnectionSection(settings, status) {
  const section = document.createElement("div");
  section.className = "live-show-after-show-section";

  const heading = document.createElement("div");
  heading.className = "live-show-after-show-heading";
  heading.innerHTML = `
    <strong>Stay Connected With Mistress After the Show</strong>
    <small>Limited spots available · pre-book private access before the show ends</small>
  `;

  const grid = document.createElement("div");
  grid.className = "live-show-after-show-grid";

  grid.appendChild(
    createAfterShowButton({
      kind: "privateMessage",
      icon: "💬",
      label: "Private Message",
      sublabel: "After-show message access",
      onClick: () => requestAfterShowPrivateMessage(settings, status),
    })
  );

  if (settings.phoneBookingEnabled) {
    grid.appendChild(
      createAfterShowButton({
        kind: "voiceCall",
        icon: "📞",
        label: "Voice Call",
        sublabel: `${settings.voiceCallRate} credits/min · ${settings.phoneBookingMinutes.join(", ")} min`,
        onClick: () => {
          requestAfterShowBooking("voiceCall", settings, status, {
            actionKind: "voice",
            icon: "📞",
            title: "After-show voice call requested",
            credits: Number(settings.voiceCallRate || 0),
          });
        },
      })
    );
  }

  if (settings.videoBookingEnabled) {
    grid.appendChild(
      createAfterShowButton({
        kind: "videoCall",
        icon: "🎥",
        label: "1-on-1 Video Call",
        sublabel: `${settings.videoCallRate} credits/min · ${settings.videoBookingMinutes.join(", ")} min`,
        onClick: () => {
          requestAfterShowBooking("videoCall", settings, status, {
            actionKind: "video",
            icon: "🎥",
            title: "After-show video call requested",
            credits: Number(settings.videoCallRate || 0),
          });
        },
      })
    );
  }

  section.appendChild(heading);
  section.appendChild(grid);
  return section;
}
