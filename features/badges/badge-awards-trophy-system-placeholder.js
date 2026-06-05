import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const BADGE_FAMILIES = [
  {
    id: "verification-badges",
    label: "Verification Badges",
    icon: "✅",
    description: "Official member, subscriber, ID verified, financial verified, premium supporter, elite member, VIP patron, and quick responder badges.",
  },
  {
    id: "viewing-points-badges",
    label: "Viewing Points / Eye Badges",
    icon: "👁️",
    description: "Bronze, silver, gold, diamond, and eternal watcher engagement badges for views and ad/content dedication.",
  },
  {
    id: "trust-badges",
    label: "Trust Badges",
    icon: "💎",
    description: "Headmistress and Mistress-awarded trust markers for loyalty, reliability, communication, support, and rule-following.",
  },
  {
    id: "achievement-badges",
    label: "Achievement Badges",
    icon: "🎖️",
    description: "Auto-awarded milestones for tributes, streaks, games, ad engagement, gifts, purchases, and content support.",
  },
  {
    id: "annual-awards",
    label: "Annual Awards",
    icon: "🏆",
    description: "Yearly recognition such as Sub of the Year, Most Loyal, Most Generous, Gaming Champion, Community Star, and Scholar of Servitude.",
  },
  {
    id: "trophies",
    label: "Trophy System",
    icon: "🥇",
    description: "Competition-based trophies for game high scores, challenges, lottery wins, leaderboard victories, and event participation.",
  },
  {
    id: "casual-stickers",
    label: "Casual Stickers / Mini Awards",
    icon: "🌟",
    description: "Mistress-awarded mood, time-based, appreciation, personality, and milestone stickers that appear on profile collections.",
  },
];

const TRUST_CATEGORIES = [
  "Verified Loyal",
  "Generous Supporter",
  "Punctual & Reliable",
  "Obedient Servant",
  "Excellent Communicator",
  "Respectful Gentleman",
  "Trustworthy",
  "Dedicated Learner",
];

const AWARD_RULES = [
  "Headmistress can award official gold trust badges",
  "Mistresses can award purple trust badges and stickers",
  "Auto-awards trigger from ledger, streak, game, view, gift, and purchase events",
  "Some badges can expire, such as subscription or financial verification badges",
  "Trust badges show awarder name and date where public visibility is allowed",
  "Trophies can be competition, event, leaderboard, or challenge based",
  "Annual awards create permanent yearly winner tags",
  "Badge actions must be logged for audit and dispute review",
];

const PROFILE_DISPLAY_AREAS = [
  "Profile header badge row",
  "Trust badge panel",
  "Trophy cabinet",
  "Annual awards Hall of Fame",
  "Sticker collection panel",
  "Viewing points / eye badge counter",
  "Verification detail modal",
  "Badge history and expiry list",
];

export function createBadgeAwardsTrophySystemPlaceholder({ onBack, onCreateBadge } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Badges Plugin",
      title: "Badge, Awards + Trophy System",
      description:
        "Central recognition system for verification, viewing points, trust, achievements, annual awards, trophies, stickers, Hall of Fame, and profile social proof.",
      icon: "🏆",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Badge ecosystem captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Badge Families", value: String(BADGE_FAMILIES.length), helper: "Verification, trust, achievements, awards, trophies", icon: "🏆", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Auto-Awards", value: "Pending", helper: "Needs events, counters, and rules engine", icon: "⚙️", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Profile Wiring", value: "Pending", helper: "Public profile display, modals, expiry", icon: "👤", progress: 0 }));
  shell.appendChild(stats);

  const badgeName = createFormField({ label: "Badge / award name", placeholder: "Verified Loyal / Gold Eye / Sub of the Year" });
  const badgeFamily = createFormField({
    label: "Badge family",
    type: "select",
    options: BADGE_FAMILIES.map((family) => ({ label: family.label, value: family.id })),
  });
  const awarder = createFormField({
    label: "Awarded by",
    type: "select",
    options: [
      { label: "System auto-award", value: "system" },
      { label: "Headmistress", value: "headmistress" },
      { label: "Mistress", value: "mistress" },
      { label: "Competition result", value: "competition" },
    ],
  });
  const visibility = createFormField({
    label: "Visibility",
    type: "select",
    options: [
      { label: "Public profile", value: "public" },
      { label: "Mistress-only", value: "mistress-only" },
      { label: "Headmistress/admin only", value: "admin-only" },
      { label: "Hidden until unlocked", value: "hidden" },
    ],
  });
  const trigger = createFormField({ label: "Trigger / requirement", placeholder: "$500 lifetime support / 1000 views / 30-day streak / admin approval" });
  const submit = createButton({ label: "Create Badge Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Badge setup test form",
      description: "This is a non-saving placeholder. It captures badge metadata before badge definitions, award logs, counters, expiry, and profile wiring are added.",
      fields: [badgeName, badgeFamily, awarder, visibility, trigger],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onCreateBadge?.({
      badgeName: badgeName.control.value,
      badgeFamily: badgeFamily.control.value,
      awarder: awarder.control.value,
      visibility: visibility.control.value,
      trigger: trigger.control.value,
    });
  });
  shell.appendChild(form);

  const familyGrid = document.createElement("div");
  familyGrid.className = "mx-grid mx-grid--cards";
  BADGE_FAMILIES.forEach((family) => {
    familyGrid.appendChild(
      createCard({
        eyebrow: "Badge Family",
        title: family.label,
        description: family.description,
        icon: family.icon,
        meta: family.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Badge Families",
      title: "Recognition and status systems",
      description: "Badges feed profile trust, leaderboards, games, stickers, annual awards, Trophy Cabinet, and Headmistress oversight.",
      icon: "🏆",
    }),
  );
  shell.appendChild(familyGrid);

  const trustGrid = document.createElement("div");
  trustGrid.className = "mx-grid mx-grid--cards";
  TRUST_CATEGORIES.forEach((category) => {
    trustGrid.appendChild(
      createCard({
        eyebrow: "Trust Category",
        title: category,
        description: "Trust badge placeholder for future Headmistress/Mistress awarding, attribution, public visibility, and profile proof.",
        icon: "💎",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Trust Badges",
      title: "Mistress and Headmistress-awarded social proof",
      description: "Trust badges should show who awarded them, when they were awarded, and whether they are public, private, expired, or revoked.",
      icon: "💎",
    }),
  );
  shell.appendChild(trustGrid);

  const ruleGrid = document.createElement("div");
  ruleGrid.className = "mx-grid mx-grid--cards";
  AWARD_RULES.forEach((rule) => {
    ruleGrid.appendChild(
      createCard({
        eyebrow: "Award Rule",
        title: rule,
        description: "Placeholder rule for future badge definitions, events, counters, admin controls, expiry, and audit logs.",
        icon: "✅",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Awarding Rules",
      title: "Who awards what, and how badges are earned",
      description: "Badge awarding must support manual awards, automated achievements, expiry, revocation, and audit history.",
      icon: "📜",
    }),
  );
  shell.appendChild(ruleGrid);

  const displayGrid = document.createElement("div");
  displayGrid.className = "mx-grid mx-grid--cards";
  PROFILE_DISPLAY_AREAS.forEach((area) => {
    displayGrid.appendChild(
      createCard({
        eyebrow: "Profile Display",
        title: area,
        description: "Placeholder display area for future profile, modal, badge history, trophy cabinet, and Hall of Fame wiring.",
        icon: "👤",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Profile + Hall of Fame",
      title: "Where badges appear",
      description: "Recognition should appear on profiles, card systems, leaderboards, trophy cabinets, annual award pages, and Headmistress reports.",
      icon: "🌟",
    }),
  );
  shell.appendChild(displayGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Badge award ledger path",
      description:
        "Badge definition is created → earning or awarding rule is met → award log is created → expiry/revocation rules are checked → profile display and leaderboard/social proof update → audit history remains source of truth.",
      icon: "📒",
    }),
  );

  return shell;
}
