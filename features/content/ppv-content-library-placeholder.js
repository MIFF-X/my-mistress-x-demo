import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const ACCESS_MODES = [
  {
    id: "timed-viewing",
    label: "Timed Viewing",
    icon: "⏱️",
    description: "Sub buys access for a set viewing window such as 24 hours, 7 days, or 30 days.",
  },
  {
    id: "buy-to-keep",
    label: "Buy To Keep",
    icon: "🔐",
    description: "Sub purchases permanent access to an approved content item or bundle.",
  },
  {
    id: "always-available",
    label: "Always Available",
    icon: "♾️",
    description: "Content remains listed and available for purchase until the Mistress removes or archives it.",
  },
  {
    id: "subscription-bundle",
    label: "Subscription Bundle",
    icon: "🎟️",
    description: "Content is bundled into a subscription tier or paid access package.",
  },
  {
    id: "vaulted-drop",
    label: "Vaulted Drop",
    icon: "🗄️",
    description: "Limited or archived content that can be re-released, scheduled, or bundled later.",
  },
];

const CONTENT_TYPES = [
  "Video",
  "Audio",
  "Pictures",
  "Ebooks",
  "Bundles",
  "Archive drops",
];

export function createPpvContentLibraryPlaceholder({ onBack, onCreateContent } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Content Monetisation Plugin",
      title: "PPV Content Library",
      description:
        "Paid content library for Mistress uploads, pricing, access windows, subscriptions, bundles, archives, and wallet-based unlocks.",
      icon: "🎬",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Requirements captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Content Types", value: String(CONTENT_TYPES.length), helper: "Video, audio, pictures, ebooks, bundles", icon: "📚", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Wallet Unlock", value: "Pending", helper: "Requires ledger/access backend", icon: "💰", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Moderation", value: "Pending", helper: "Review, reports, archive controls", icon: "🛡️", progress: 0 }));
  shell.appendChild(stats);

  const title = createFormField({ label: "Content title", placeholder: "Private clip / audio / bundle title" });
  const contentType = createFormField({
    label: "Content type",
    type: "select",
    options: CONTENT_TYPES,
  });
  const price = createFormField({
    label: "Price in credits",
    type: "number",
    placeholder: "25",
    helper: "Placeholder only. Real min/max, taxes, fees, and split rules come from backend config.",
  });
  const accessMode = createFormField({
    label: "Access mode",
    type: "select",
    options: ACCESS_MODES.map((mode) => ({ label: mode.label, value: mode.id })),
  });
  const duration = createFormField({
    label: "Access duration / rule",
    placeholder: "24h / 7d / 30d / permanent / tier name",
  });
  const submit = createButton({ label: "Create PPV Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "PPV listing test form",
      description: "This is a non-upload placeholder. It captures the listing and access-rule flow before media storage, moderation, wallet, and access backend wiring are added.",
      fields: [title, contentType, price, accessMode, duration],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onCreateContent?.({
      title: title.control.value,
      contentType: contentType.control.value,
      price: price.control.value,
      accessMode: accessMode.control.value,
      duration: duration.control.value,
    });
  });
  shell.appendChild(form);

  const accessGrid = document.createElement("div");
  accessGrid.className = "mx-grid mx-grid--cards";
  ACCESS_MODES.forEach((mode) => {
    accessGrid.appendChild(
      createCard({
        eyebrow: "Access Rule",
        title: mode.label,
        description: mode.description,
        icon: mode.icon,
        meta: mode.id,
      }),
    );
  });

  shell.appendChild(
    createCard({
      eyebrow: "Access Rules",
      title: "PPV access and package modes",
      description: "Each access mode must eventually connect to wallet spend, content access records, expiry jobs, and reporting.",
      icon: "🔐",
    }),
  );
  shell.appendChild(accessGrid);

  const lifecycleGrid = document.createElement("div");
  lifecycleGrid.className = "mx-grid mx-grid--cards";
  [
    { title: "Draft", icon: "✍️", description: "Mistress creates or edits listing metadata before publishing." },
    { title: "Scheduled", icon: "📅", description: "Content can be queued for a drop, bundle release, or subscription update." },
    { title: "Active", icon: "✅", description: "Visible to eligible buyers with wallet unlock and access rules." },
    { title: "Expiring", icon: "⏳", description: "Timed access or limited drops approach expiry." },
    { title: "Archived / Vaulted", icon: "🗄️", description: "Content can be removed from sale or stored for future controlled release." },
    { title: "Moderation Review", icon: "🛡️", description: "Reports, flags, compliance review, and admin actions sit here." },
  ].forEach((item) => lifecycleGrid.appendChild(createCard({ eyebrow: "Lifecycle", ...item })));

  shell.appendChild(
    createCard({
      eyebrow: "Content Lifecycle",
      title: "From upload to archive",
      description: "PPV needs a controlled content lifecycle so media, access, wallet, reports, and moderation stay in sync.",
      icon: "🔁",
    }),
  );
  shell.appendChild(lifecycleGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "PPV unlock ledger path",
      description:
        "Mistress creates listing → media/moderation status is checked → Sub buys unlock → wallet ledger records spend → access record is created → expiry job updates access → reporting and earnings feed Earnings Vault.",
      icon: "📒",
    }),
  );

  return shell;
}
