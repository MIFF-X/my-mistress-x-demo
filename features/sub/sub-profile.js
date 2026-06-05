import { recognitionBadgeStore } from "./recognition-badges.js";
import { identityBubbleTagsStore } from "./identity-bubble-tags.js";

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toISOString().slice(0, 10);
}

function normalizeSub(sub = {}) {
  return {
    id: sub.id || "demo-sub",
    username: sub.username || sub.name || "unknown-sub",
    name: sub.name || sub.username || "Unnamed Sub",
    memberSince: sub.memberSince || sub.createdAt || null,
    avatarUrl: sub.avatarUrl || null,
  };
}

export function createSubProfileViewModel({
  sub = {},
  badgeStore = recognitionBadgeStore,
  tagStore = identityBubbleTagsStore,
  publicStats = {},
} = {}) {
  const normalizedSub = normalizeSub(sub);
  const badgeSummary = badgeStore.getUserBadgeSummary(normalizedSub.id);
  const tags = tagStore.getTags(normalizedSub.id);

  return {
    profile: {
      id: normalizedSub.id,
      username: normalizedSub.username,
      displayName: normalizedSub.name,
      memberSince: formatDate(normalizedSub.memberSince),
      avatarUrl: normalizedSub.avatarUrl,
    },
    verificationBadges: badgeSummary.verification,
    trustBadges: badgeSummary.trust,
    achievementBadges: badgeSummary.achievements,
    badgeCount: badgeSummary.total,
    badgeBreakdown: badgeSummary.bySystem,
    specializationTags: tags,
    stats: {
      totalTributes: publicStats.totalTributes || 0,
      streakDays: publicStats.streakDays || 0,
      gamesPlayed: publicStats.gamesPlayed || 0,
      tasksCompleted: publicStats.tasksCompleted || 0,
      handbooksFinished: publicStats.handbooksFinished || 0,
    },
  };
}

export function renderSubProfileSummary(viewModel) {
  return {
    header: `${viewModel.profile.displayName} (@${viewModel.profile.username})`,
    memberSince: viewModel.profile.memberSince,
    badgeCount: viewModel.badgeCount,
    verification: viewModel.verificationBadges.map((badge) => `${badge.title} [${badge.badgeColor}]`),
    trust: viewModel.trustBadges.map((badge) => ({
      title: badge.title,
      awardedBy: badge.awardedById,
      dateAwarded: formatDate(badge.createdAt),
      reason: badge.reason,
    })),
    achievements: viewModel.achievementBadges.map((badge) => badge.title),
    tags: viewModel.specializationTags.map((tag) => `${tag.name} (${tag.category})`),
    stats: viewModel.stats,
  };
}

export function createSubProfilePanel({ sub = {}, publicStats = {} } = {}) {
  const viewModel = createSubProfileViewModel({ sub, publicStats });
  const summary = renderSubProfileSummary(viewModel);

  const section = document.createElement("section");
  section.className = "panel sub-profile-panel";
  section.dataset.subId = viewModel.profile.id;

  const title = document.createElement("h2");
  title.innerText = summary.header;

  const meta = document.createElement("p");
  meta.innerText = `Member since ${summary.memberSince} - ${summary.badgeCount} badge(s)`;

  const stats = document.createElement("p");
  stats.innerText = `Tributes: ${summary.stats.totalTributes} - Streak: ${summary.stats.streakDays} days - Games: ${summary.stats.gamesPlayed} - Tasks: ${summary.stats.tasksCompleted}`;

  const tags = document.createElement("p");
  tags.innerText = summary.tags.length > 0 ? `Tags: ${summary.tags.join(", ")}` : "Tags: none selected";

  const achievements = document.createElement("p");
  achievements.innerText = summary.achievements.length > 0
    ? `Achievements: ${summary.achievements.join(", ")}`
    : "Achievements: none yet";

  section.appendChild(title);
  section.appendChild(meta);
  section.appendChild(stats);
  section.appendChild(tags);
  section.appendChild(achievements);

  return section;
}
