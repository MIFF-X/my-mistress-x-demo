import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const CALL_TYPES = [
  {
    id: "video-call",
    label: "Video Call",
    icon: "🎥",
    description: "Timed one-to-one or approved group video session with countdown, extensions, and wallet lock.",
  },
  {
    id: "audio-call",
    label: "Audio Call",
    icon: "🎧",
    description: "Timed audio-only session for phone-style interactions, check-ins, or private conversations.",
  },
  {
    id: "text-session",
    label: "Timed Text Session",
    icon: "💬",
    description: "Paid chat/SMS/IM session with duration window, message limits, or per-minute/per-session pricing.",
  },
  {
    id: "screen-share-session",
    label: "Consent Screen Share",
    icon: "🖥️",
    description: "Visible, opt-in screen-share session for support, co-viewing, or approved task/watch interactions.",
  },
  {
    id: "calendar-slot",
    label: "Calendar Slot",
    icon: "📅",
    description: "Bookable availability slot with reminders, add-to-calendar link, payment state, and expiry rules.",
  },
  {
    id: "extension-pack",
    label: "Extension Pack",
    icon: "⏳",
    description: "Extra minutes or additional session time purchased before or during the call where allowed.",
  },
];

const BOOKING_STATES = [
  "Available",
  "Requested",
  "Pending Payment",
  "Confirmed",
  "Reminder Sent",
  "Live / In Call",
  "Extension Offered",
  "Completed",
  "Cancelled",
  "No Show",
  "Refund / Dispute Review",
];

export function createPaidCallsBookingsPlaceholder({ onBack, onCreateBooking } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Live / Calls Plugin",
      title: "Paid Calls + Bookings",
      description:
        "Timed call and booking plugin for video, audio, text sessions, screen share, calendar slots, countdown timers, extensions, reminders, and wallet-based booking locks.",
      icon: "📅",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Booking/call requirements captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Call Types", value: String(CALL_TYPES.length), helper: "Video, audio, text, screen share, slots, extensions", icon: "☎️", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Calendar Wiring", value: "Pending", helper: "Availability, reminders, add-to-calendar", icon: "📅", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Wallet Lock", value: "Pending", helper: "Booking payment, holds, refunds, extensions", icon: "💰", progress: 0 }));
  shell.appendChild(stats);

  const title = createFormField({ label: "Booking title", placeholder: "Private video call / audio session / text session" });
  const callType = createFormField({
    label: "Call/session type",
    type: "select",
    options: CALL_TYPES.map((type) => ({ label: type.label, value: type.id })),
  });
  const duration = createFormField({
    label: "Duration",
    placeholder: "15 min / 30 min / 60 min",
    helper: "Placeholder only. Real duration options come from Mistress settings/backend config.",
  });
  const price = createFormField({
    label: "Price / rule",
    placeholder: "50 credits / VIP only / subscription discount",
  });
  const bookingTime = createFormField({
    label: "Booking time",
    placeholder: "2026-05-06 9:30 PM",
  });
  const extensionRule = createFormField({
    label: "Extension rule",
    placeholder: "10 min extension / 20 credits / disabled",
  });
  const submit = createButton({ label: "Create Booking Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Booking setup test form",
      description: "This is a non-call placeholder. It captures call/session configuration before real calendar, wallet, timer, video/audio, and notification wiring are added.",
      fields: [title, callType, duration, price, bookingTime, extensionRule],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onCreateBooking?.({
      title: title.control.value,
      callType: callType.control.value,
      duration: duration.control.value,
      price: price.control.value,
      bookingTime: bookingTime.control.value,
      extensionRule: extensionRule.control.value,
    });
  });
  shell.appendChild(form);

  const callGrid = document.createElement("div");
  callGrid.className = "mx-grid mx-grid--cards";
  CALL_TYPES.forEach((type) => {
    callGrid.appendChild(
      createCard({
        eyebrow: "Call / Booking Type",
        title: type.label,
        description: type.description,
        icon: type.icon,
        meta: type.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Session Types",
      title: "Paid call and booking modes",
      description: "Calls are separated from live rooms so one-to-one booking, timer, extension, and wallet rules can be managed cleanly.",
      icon: "☎️",
    }),
  );
  shell.appendChild(callGrid);

  const stateGrid = document.createElement("div");
  stateGrid.className = "mx-grid mx-grid--cards";
  BOOKING_STATES.forEach((state) => {
    stateGrid.appendChild(
      createCard({
        eyebrow: "Booking State",
        title: state,
        description: "Placeholder state for booking workflow, payment lock, notifications, session lifecycle, dispute review, or history.",
        icon: "📍",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Booking Lifecycle",
      title: "From available slot to completed session",
      description: "Paid calls need a controlled state machine so calendar, wallet, timer, notifications, extensions, and dispute handling stay in sync.",
      icon: "🔁",
    }),
  );
  shell.appendChild(stateGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Timer / Extension Flow",
      title: "Countdown and extension logic",
      description:
        "Session starts → countdown begins → warnings appear before expiry → optional extension offer appears where allowed → extra time is charged through wallet ledger → completed session feeds reporting and Earnings Vault.",
      icon: "⏱️",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Safety / Consent Flow",
      title: "Visible consent for call modes",
      description:
        "Any video, audio, recording, screen share, or session replay mode must be visible, opt-in, revocable, permissioned, and logged before launch.",
      icon: "🛡️",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Paid booking ledger path",
      description:
        "Mistress publishes availability → Sub requests or buys a slot → payment hold or purchase is recorded → booking is confirmed → reminders fire → call timer starts → extension purchases update ledger → completed booking feeds reports and Earnings Vault.",
      icon: "📒",
    }),
  );

  return shell;
}
