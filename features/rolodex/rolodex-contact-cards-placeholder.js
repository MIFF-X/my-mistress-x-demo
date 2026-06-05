import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const CARD_TYPES = [
  {
    id: "sub-profile-card",
    label: "Sub Profile Card",
    icon: "🃏",
    description: "Pokemon-style profile card holding Sub traits, tags, status, role/flavour, badges, notes, and quick actions.",
  },
  {
    id: "mistress-created-card",
    label: "Mistress-Created Card",
    icon: "👑",
    description: "Mistress creates a private card for a Sub with her own colour coding, notes, labels, and management tags.",
  },
  {
    id: "sub-submitted-card",
    label: "Sub-Submitted Card",
    icon: "📨",
    description: "Sub fills out and sends a card to a Mistress for review, acceptance, grouping, or rejection.",
  },
  {
    id: "keeper-card",
    label: "Keeper Card",
    icon: "💎",
    description: "Special retained card for favourite, trusted, high-value, or long-term Subs.",
  },
  {
    id: "contract-card",
    label: "Contract Card",
    icon: "📜",
    description: "Card-linked agreement or contract record that can be stored in the Rolodex.",
  },
  {
    id: "award-card",
    label: "MX Award Card",
    icon: "🏆",
    description: "Award, trophy, badge, or recognition card stored against a Sub profile or competition result.",
  },
];

const CARD_FIELDS = [
  "Profile photo / portrait frame",
  "Display name and username",
  "Sub type / archetype",
  "Skills and useful services",
  "Kinks / interests / boundaries",
  "Trust badges and awards",
  "Private Mistress notes",
  "Public profile summary",
  "Contact / chat links",
  "Spend, support, and activity indicators",
  "Card colour theme and frame",
  "Greyed/highlighted quick icons",
];

const ROLODEX_FLOWS = [
  "Mistress creates a new Sub card",
  "Sub fills out his own card",
  "Sub sends card to Mistress",
  "Mistress requests card from Sub",
  "Mistress accepts, edits, groups, or archives card",
  "Mistress adds private notes",
  "Mistress groups cards by tags, kinks, interests, services, or value",
  "Double-click card to expand detail view",
  "Attach contracts, badges, awards, and stickers to card",
  "Use card for quick chat, booking, gift, or profile actions",
];

const CARD_THEMES = [
  "Gold Crown",
  "Pink Signature",
  "Dark Velvet",
  "Neon Glow",
  "Diamond VIP",
  "Warning / Watchlist",
  "Trusted / Verified",
  "Collector Edition",
];

export function createRolodexContactCardsPlaceholder({ onBack, onCreateCard } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Rolodex Plugin",
      title: "Rolodex + Contact Cards",
      description:
        "A visual card system for Sub profiles, Mistress notes, card requests, shared cards, contracts, awards, private tags, and expanded card views.",
      icon: "🗂️",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Card system requirements captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Card Types", value: String(CARD_TYPES.length), helper: "Sub, Mistress, Keeper, Contract, Award", icon: "🃏", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Private Notes", value: "Pending", helper: "Needs database/privacy rules", icon: "🔐", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Card Editor", value: "Pending", helper: "Themes, frames, icons, expanded view", icon: "🎨", progress: 0 }));
  shell.appendChild(stats);

  const cardName = createFormField({ label: "Card name", placeholder: "Sub display name / card title" });
  const cardType = createFormField({
    label: "Card type",
    type: "select",
    options: CARD_TYPES.map((type) => ({ label: type.label, value: type.id })),
  });
  const archetype = createFormField({ label: "Sub type / archetype", placeholder: "Tech Slave / Financial Devotee / Loyal Supporter" });
  const theme = createFormField({
    label: "Card theme",
    type: "select",
    options: CARD_THEMES,
  });
  const tags = createFormField({ label: "Tags / groups", placeholder: "VIP, reliable, coding, gifts, collector" });
  const notes = createFormField({ label: "Private notes", placeholder: "Mistress-only private note placeholder" });
  const submit = createButton({ label: "Create Card Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Rolodex card setup test form",
      description: "This is a non-saving placeholder. It captures the card structure before profile, notes, tags, privacy, and database wiring are added.",
      fields: [cardName, cardType, archetype, theme, tags, notes],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onCreateCard?.({
      cardName: cardName.control.value,
      cardType: cardType.control.value,
      archetype: archetype.control.value,
      theme: theme.control.value,
      tags: tags.control.value,
      notes: notes.control.value,
    });
  });
  shell.appendChild(form);

  const typeGrid = document.createElement("div");
  typeGrid.className = "mx-grid mx-grid--cards";
  CARD_TYPES.forEach((type) => {
    typeGrid.appendChild(
      createCard({
        eyebrow: "Card Type",
        title: type.label,
        description: type.description,
        icon: type.icon,
        meta: type.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Card Families",
      title: "Rolodex card types",
      description: "Cards can be created by the Mistress, submitted by the Sub, promoted to Keeper, or linked to contracts, awards, and achievements.",
      icon: "🃏",
    }),
  );
  shell.appendChild(typeGrid);

  const fieldGrid = document.createElement("div");
  fieldGrid.className = "mx-grid mx-grid--cards";
  CARD_FIELDS.forEach((field) => {
    fieldGrid.appendChild(
      createCard({
        eyebrow: "Card Field",
        title: field,
        description: "Placeholder field for future profile, notes, icon, badge, privacy, or visual-card wiring.",
        icon: "📍",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Card Data Map",
      title: "What a card can hold",
      description: "The Rolodex card is a visual command object that feeds chat, bookings, payments, badges, stickers, awards, and private Mistress workflow.",
      icon: "🗂️",
    }),
  );
  shell.appendChild(fieldGrid);

  const flowGrid = document.createElement("div");
  flowGrid.className = "mx-grid mx-grid--cards";
  ROLODEX_FLOWS.forEach((flow) => {
    flowGrid.appendChild(
      createCard({
        eyebrow: "Rolodex Flow",
        title: flow,
        description: "Placeholder step for future profile, sharing, request, grouping, notes, privacy, or card-detail wiring.",
        icon: "✅",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Rolodex Workflow",
      title: "From request to managed card",
      description: "Cards should support request/share/accept/edit/group/expand workflows, with private notes kept separate from public profile fields.",
      icon: "🔁",
    }),
  );
  shell.appendChild(flowGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Privacy Rule",
      title: "Private notes must stay Mistress-only",
      description:
        "Sub-visible fields, public profile fields, and Mistress private notes need separate database columns and access rules before launch.",
      icon: "🔐",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Rolodex card data path",
      description:
        "Card is created or submitted → owner/subject relationship is stored → visibility and privacy rules apply → tags, notes, badges, contracts, and awards attach → card powers quick chat, booking, payment, and profile actions.",
      icon: "📒",
    }),
  );

  return shell;
}
