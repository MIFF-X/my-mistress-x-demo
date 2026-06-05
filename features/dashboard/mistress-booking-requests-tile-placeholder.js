import { createCard, createStatCard } from "../ui/card.js";

const bookingStages = [
  {
    id: "new-request",
    label: "New Request",
    icon: "📥",
    count: 5,
    status: "needs_review",
    note: "New paid phone/video booking requests waiting for Mistress approval, decline, or schedule options.",
  },
  {
    id: "approved",
    label: "Approved",
    icon: "✅",
    count: 3,
    status: "scheduled",
    note: "Confirmed sessions with date, time, price, duration, countdown, and reminder state.",
  },
  {
    id: "extension",
    label: "Extension Requests",
    icon: "⏱️",
    count: 2,
    status: "payment_needed",
    note: "Extra minutes, add-on time, or upgrade requests that require payment confirmation before continuing.",
  },
  {
    id: "cancel-refund",
    label: "Cancel / Refund",
    icon: "↩️",
    count: 1,
    status: "policy_review",
    note: "Cancellations, no-shows, refunds, and dispute-sensitive booking states requiring policy checks.",
  },
  {
    id: "completed",
    label: "Completed",
    icon: "🏁",
    count: 8,
    status: "history",
    note: "Completed call/video sessions ready for earnings, rating, notes, and repeat-booking prompts.",
  },
];

function createBookingStageGrid(stages) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  stages.forEach((stage) => {
    const detail = document.createElement("div");
    detail.className = "mx-booking-stage-detail";
    detail.innerHTML = `
      <span class="mx-booking-pill mx-booking-pill--${stage.status}">${stage.status.replaceAll("_", " ")}</span>
      <strong>${stage.count}</strong>
      <p>${stage.note}</p>
    `;

    grid.appendChild(createCard({
      eyebrow: "Booking Stage",
      title: stage.label,
      description: "A paid interaction booking lane for the Mistress dashboard.",
      icon: stage.icon,
      meta: stage.id,
      children: [detail],
    }));
  });

  return grid;
}

export function createMistressBookingRequestsTilePlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const totalBookings = bookingStages.reduce((sum, stage) => sum + stage.count, 0);
  const activeStages = bookingStages.filter((stage) => stage.id !== "completed").length;

  shell.appendChild(createCard({
    eyebrow: "Mistress Dashboard Utility",
    title: "Booking Requests",
    description: "A safe paid-call booking control tile for reviewing phone/video bookings, approvals, extensions, cancellations, refunds, and completed session history before backend session ledger wiring.",
    icon: "📅",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Booking Stages", value: String(bookingStages.length), helper: "Request lifecycle lanes", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Demo Bookings", value: String(totalBookings), helper: "Placeholder activity count", icon: "📅", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Active Stages", value: String(activeStages), helper: "Needs operational review", icon: "⚡", progress: 65 }));
  stats.appendChild(createStatCard({ label: "Safety", value: "Policy", helper: "Refunds and disputes need guard rules", icon: "🛡️", progress: 45 }));
  shell.appendChild(stats);

  shell.appendChild(createBookingStageGrid(bookingStages));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-booking-stage-detail {
      position: relative;
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-booking-stage-detail strong {
      color: var(--mx-text);
      font-size: var(--mx-text-2xl);
    }

    .mx-booking-stage-detail p {
      margin: 0;
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-booking-pill {
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

    .mx-booking-pill--scheduled,
    .mx-booking-pill--history {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-booking-pill--needs_review,
    .mx-booking-pill--payment_needed {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-booking-pill--policy_review {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }
  `;
  shell.appendChild(styles);

  return shell;
}
