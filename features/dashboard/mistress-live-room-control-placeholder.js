import { createCard, createStatCard } from "../ui/card.js";

const liveRoomLanes = [
  {
    id: "room-setup",
    label: "Room Setup",
    icon: "🎛️",
    count: 3,
    status: "setup_needed",
    note: "Create public, private, locked, subscription, paid-entry, or access-code rooms with title, category, and visibility.",
  },
  {
    id: "live-chat",
    label: "Live Chat",
    icon: "💬",
    count: 18,
    status: "active",
    note: "Sidebar chat, pinned messages, paid requests, moderation flags, and viewer interaction signals.",
  },
  {
    id: "gifts-requests",
    label: "Gifts + Requests",
    icon: "🎁",
    count: 12,
    status: "monetised",
    note: "Micro-gifts, overlays, paid requests, goal contributions, and session-triggered rewards.",
  },
  {
    id: "viewer-controls",
    label: "Viewer Controls",
    icon: "👁️",
    count: 5,
    status: "safety_review",
    note: "Viewer count, mute/kick/report, optional viewer-cam controls, and clear consent indicators.",
  },
  {
    id: "replay-recording",
    label: "Replay + Recording",
    icon: "🎥",
    count: 2,
    status: "consent_required",
    note: "Recording, replay, clips, post-show access, and storage rules must stay behind consent and audit gates.",
  },
];

function createLiveLaneGrid(lanes) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  lanes.forEach((lane) => {
    const detail = document.createElement("div");
    detail.className = "mx-live-lane-detail";
    detail.innerHTML = `
      <span class="mx-live-pill mx-live-pill--${lane.status}">${lane.status.replaceAll("_", " ")}</span>
      <strong>${lane.count}</strong>
      <p>${lane.note}</p>
    `;

    grid.appendChild(createCard({
      eyebrow: "Live Room Lane",
      title: lane.label,
      description: "A live interaction control lane for the Mistress dashboard.",
      icon: lane.icon,
      meta: lane.id,
      children: [detail],
    }));
  });

  return grid;
}

export function createMistressLiveRoomControlPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const totalSignals = liveRoomLanes.reduce((sum, lane) => sum + lane.count, 0);
  const safetyLanes = liveRoomLanes.filter((lane) => lane.status === "safety_review" || lane.status === "consent_required").length;

  shell.appendChild(createCard({
    eyebrow: "Mistress Dashboard Utility",
    title: "Live Room Control",
    description: "A safe placeholder for live rooms, chat sidebar, gifts, paid requests, viewer controls, locked/access-code rooms, and recording/replay consent rules.",
    icon: "📡",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Live Lanes", value: String(liveRoomLanes.length), helper: "Live control sections", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Signals", value: String(totalSignals), helper: "Placeholder activity count", icon: "📡", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Monetised", value: "2", helper: "Chat/gift/request pathways", icon: "💎", progress: 55 }));
  stats.appendChild(createStatCard({ label: "Safety", value: String(safetyLanes), helper: "Consent/moderation lanes", icon: "🛡️", progress: 45 }));
  shell.appendChild(stats);

  shell.appendChild(createLiveLaneGrid(liveRoomLanes));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-live-lane-detail {
      position: relative;
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-live-lane-detail strong {
      color: var(--mx-text);
      font-size: var(--mx-text-2xl);
    }

    .mx-live-lane-detail p {
      margin: 0;
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-live-pill {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      border: 1px solid var(--mx-border);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .mx-live-pill--active,
    .mx-live-pill--monetised {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-live-pill--setup_needed {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-live-pill--safety_review,
    .mx-live-pill--consent_required {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }
  `;
  shell.appendChild(styles);

  return shell;
}
