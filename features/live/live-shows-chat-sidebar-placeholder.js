import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";
import { createAuctionCommerceToolTray } from "../../plugins/mistress/auction-system/auction-ui.js";

const LIVE_ROOM_TYPES = [
  {
    id: "public-live",
    label: "Public Live Room",
    icon: "📡",
    description: "Visible in the public/available rooms list with chat, gifts, and paid requests available by room rules.",
  },
  {
    id: "private-live",
    label: "Private Live Room",
    icon: "🔐",
    description: "Invite-only or paid room for one-to-one or small group live sessions.",
  },
  {
    id: "locked-room",
    label: "Locked Room",
    icon: "🔒",
    description: "Room appears with a lock icon and can be unlocked by tier, paid entry, access code, or tribute rule.",
  },
  {
    id: "access-code-room",
    label: "Access Code Room",
    icon: "🎟️",
    description: "Room requires an invite/access code before the Sub can enter.",
  },
  {
    id: "watch-with-mistress",
    label: "Watch With Mistress",
    icon: "📺",
    description: "Co-viewing style session with optional retro TV overlay, chat/sidebar, paid requests, and micro-gifts.",
  },
  {
    id: "replay-room",
    label: "Replay / Archive Room",
    icon: "🗄️",
    description: "Saved live session can be made free, paid, subscription-only, or archived by the Mistress.",
  },
];

const LIVE_FEATURES = [
  "Live video stage",
  "Chat sidebar",
  "Micro-gifts",
  "Paid requests",
  "Ticketed entry",
  "Access-code entry",
  "Subscription-tier unlock",
  "Replay/archive access",
  "Add-to-calendar links",
  "Upcoming live notifications",
  "Consent-led screen share",
  "Moderator/admin oversight",
];

export function createLiveShowsChatSidebarPlaceholder({ onBack, onScheduleLive } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Live Interaction Plugin",
      title: "Live Shows + Chat Sidebar",
      description:
        "Live room plugin for Mistress-led sessions, chat/sidebar, access rules, tickets, micro-gifts, paid requests, replays, and schedule notifications.",
      icon: "📡",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Live room requirements captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Room Types", value: String(LIVE_ROOM_TYPES.length), helper: "Public, private, locked, replay, co-view", icon: "🚪", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Real-Time Chat", value: "Pending", helper: "WebSocket/stream integration needed", icon: "💬", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Wallet Hooks", value: "Pending", helper: "Tickets, gifts, paid requests", icon: "💰", progress: 0 }));
  shell.appendChild(stats);

  const title = createFormField({ label: "Live session title", placeholder: "Friday Throne Room Live" });
  const roomType = createFormField({
    label: "Room type",
    type: "select",
    options: LIVE_ROOM_TYPES.map((room) => ({ label: room.label, value: room.id })),
  });
  const entryPrice = createFormField({
    label: "Entry price / rule",
    placeholder: "Free / 25 credits / VIP tier / access code",
    helper: "Placeholder only. Real access rules come from backend config and wallet checks.",
  });
  const schedule = createFormField({
    label: "Scheduled time",
    placeholder: "2026-05-06 8:00 PM",
  });
  const replayRule = createFormField({
    label: "Replay rule",
    type: "select",
    options: [
      { label: "No replay", value: "none" },
      { label: "Free replay", value: "free" },
      { label: "Paid replay", value: "paid" },
      { label: "Subscription-only replay", value: "subscription" },
      { label: "Archive only", value: "archive" },
    ],
  });
  const submit = createButton({ label: "Create Live Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Live room test form",
      description: "This is a non-streaming placeholder. It captures room setup and access-rule flow before streaming, chat, wallet, and schedule backend wiring are added.",
      fields: [title, roomType, entryPrice, schedule, replayRule],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onScheduleLive?.({
      title: title.control.value,
      roomType: roomType.control.value,
      entryPrice: entryPrice.control.value,
      schedule: schedule.control.value,
      replayRule: replayRule.control.value,
    });
  });
  shell.appendChild(form);

  shell.appendChild(
    createCard({
      eyebrow: "Live Stage Commerce Tool Tray",
      title: "Attach auctions while setting up and saving a live stage",
      description: "This tray loads the Auctions plugin into the live-stage setup zone so public/private and live/normal lots can be saved with the stage.",
      icon: "🔨",
      children: [createAuctionCommerceToolTray({ stageId: "live-stage-setup", defaultExpanded: true, showOpenButton: true })],
    }),
  );

  const roomGrid = document.createElement("div");
  roomGrid.className = "mx-grid mx-grid--cards";
  LIVE_ROOM_TYPES.forEach((room) => {
    roomGrid.appendChild(
      createCard({
        eyebrow: "Room Type",
        title: room.label,
        description: room.description,
        icon: room.icon,
        meta: room.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Room Access Rules",
      title: "Live room types and access modes",
      description: "Rooms can be public, private, locked, access-code based, subscription-tiered, paid-entry, or replay/archive based.",
      icon: "🚪",
    }),
  );
  shell.appendChild(roomGrid);

  const featureGrid = document.createElement("div");
  featureGrid.className = "mx-grid mx-grid--cards";
  LIVE_FEATURES.forEach((feature) => {
    featureGrid.appendChild(
      createCard({
        eyebrow: "Live Feature",
        title: feature,
        description: "Placeholder for future stream, chat, wallet, access, notification, or admin wiring.",
        icon: "✨",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Live Feature Map",
      title: "Live systems feeding systems",
      description: "Live connects to chat, wallet, gifts, leaderboards, notifications, Mistress earnings, replays, and Headmistress analytics.",
      icon: "🧩",
    }),
  );
  shell.appendChild(featureGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Safety / Consent Flow",
      title: "Visible, opt-in participation only",
      description:
        "Any screen share, camera participation, replay, or recording mode must be visible, opt-in, revocable, logged, and controlled by room rules before launch.",
      icon: "🛡️",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Live room ledger path",
      description:
        "Mistress schedules room → access rules are set → Sub enters by ticket/tier/code/payment → chat and gifts attach to session → paid requests create ledger entries → replay access is created after session → analytics and earnings feed command centre and Earnings Vault.",
      icon: "📒",
    }),
  );

  return shell;
}
