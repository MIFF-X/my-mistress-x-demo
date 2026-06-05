function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toISOString().slice(0, 10);
}

function normalizeMistress(mistress = {}) {
  return {
    id: mistress.id || "demo-mistress",
    username: mistress.username || mistress.handle || "unknown-mistress",
    displayName: mistress.displayName || mistress.name || mistress.username || "Unnamed Mistress",
    memberSince: mistress.memberSince || mistress.createdAt || null,
    categories: Array.isArray(mistress.categories) ? mistress.categories : [],
    channelStatus: mistress.channelStatus || "draft",
  };
}

export const MISTRESS_PROFILE_SECTIONS = [
  {
    id: "public-channel",
    label: "Public channel",
    detail: "Display name, banner, bio, category chips, and follower-safe social links.",
  },
  {
    id: "creator-style",
    label: "Creator style",
    detail: "Profile tone, title, welcome copy, emblem, league presence, and visual theme.",
  },
  {
    id: "visibility",
    label: "Visibility rules",
    detail: "Public, follower-only, private, and restricted profile fields stay Mistress-owned.",
  },
  {
    id: "rolodex-context",
    label: "Rolodex context",
    detail: "Private Sub cards, labels, notes, follow-up prompts, and relationship history.",
  },
];

export function getMistressProfileSections(overrides = []) {
  return overrides.length > 0 ? overrides : MISTRESS_PROFILE_SECTIONS;
}

export function createMistressProfileViewModel({
  mistress = {},
  stats = {},
  sections = MISTRESS_PROFILE_SECTIONS,
} = {}) {
  const profile = normalizeMistress(mistress);

  return {
    profile: {
      ...profile,
      memberSince: formatDate(profile.memberSince),
      categories: profile.categories,
    },
    stats: {
      followers: stats.followers || 0,
      activeSubs: stats.activeSubs || 0,
      liveShows: stats.liveShows || 0,
      openBookings: stats.openBookings || 0,
      rewardLanes: stats.rewardLanes || 0,
    },
    sections: getMistressProfileSections(sections),
  };
}

function createSectionCard(section) {
  const card = document.createElement("article");
  card.className = "panel stat-card mistress-profile-section-card";
  card.dataset.sectionId = section.id;

  const label = document.createElement("h3");
  label.innerText = section.label;

  const detail = document.createElement("p");
  detail.innerText = section.detail;

  card.appendChild(label);
  card.appendChild(detail);
  return card;
}

export function createMistressProfilePanel({ mistress = {}, stats = {}, sections } = {}) {
  const viewModel = createMistressProfileViewModel({ mistress, stats, sections });

  const panel = document.createElement("section");
  panel.className = "panel mistress-profile-panel";
  panel.dataset.mistressId = viewModel.profile.id;

  const title = document.createElement("h2");
  title.innerText = `${viewModel.profile.displayName} (@${viewModel.profile.username})`;

  const meta = document.createElement("p");
  meta.innerText = `Member since ${viewModel.profile.memberSince} - channel ${viewModel.profile.channelStatus}`;

  const statsLine = document.createElement("p");
  statsLine.innerText = `Followers: ${viewModel.stats.followers} - Active Subs: ${viewModel.stats.activeSubs} - Live shows: ${viewModel.stats.liveShows} - Open bookings: ${viewModel.stats.openBookings}`;

  const categoryLine = document.createElement("p");
  categoryLine.innerText = viewModel.profile.categories.length > 0
    ? `Categories: ${viewModel.profile.categories.join(", ")}`
    : "Categories: none selected";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid mistress-profile-sections";
  viewModel.sections.forEach((section) => {
    grid.appendChild(createSectionCard(section));
  });

  panel.appendChild(title);
  panel.appendChild(meta);
  panel.appendChild(statsLine);
  panel.appendChild(categoryLine);
  panel.appendChild(grid);

  return panel;
}
