const SYSTEM_TYPES = ["trust", "achievement", "award", "trophy", "sticker", "verification"];

export const VERIFICATION_BADGE_CONFIG = {
  official_member: { color: "blue", icon: "checkmark", title: "Official Member" },
  subscriber: { color: "purple", icon: "star", title: "Subscriber" },
  id_verified: { color: "green", icon: "shield", title: "ID Verified" },
  financial_verified: { color: "gold", icon: "bank", title: "Financial Verified" },
  premium_supporter: { color: "orange", icon: "flame", title: "Premium Supporter" },
  elite_member: { color: "diamond", icon: "diamond", title: "Elite Member" },
  vip_patron: { color: "crown-gold", icon: "crown", title: "VIP Patron" },
  quick_responder: { color: "yellow", icon: "lightning", title: "Quick Responder" }
};

export const VIEWING_EYE_TIERS = [
  { minimumViews: 10000, color: "rainbow", title: "Eternal Watcher", pulseSpeed: "1.1s" },
  { minimumViews: 5000, color: "diamond", title: "Diamond Eye", pulseSpeed: "1.2s" },
  { minimumViews: 1000, color: "gold", title: "Gold Eye", pulseSpeed: "1.35s" },
  { minimumViews: 500, color: "silver", title: "Silver Eye", pulseSpeed: "1.5s" },
  { minimumViews: 100, color: "bronze", title: "Bronze Eye", pulseSpeed: "1.7s" }
];

function toDate(value) {
  if (value instanceof Date) return value;
  return value ? new Date(value) : new Date();
}

export function getEyeBadgeTier(viewCount) {
  return VIEWING_EYE_TIERS.find((tier) => viewCount >= tier.minimumViews) || null;
}

export class RecognitionBadgeStore {
  constructor() {
    this.badges = [];
  }

  createBadge(payload) {
    if (!SYSTEM_TYPES.includes(payload.systemType)) {
      throw new Error(`Unsupported systemType: ${payload.systemType}`);
    }

    const badge = {
      id: payload.id || `${payload.systemType}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      userId: payload.userId,
      awardedById: payload.awardedById || "system",
      systemType: payload.systemType,
      badgeType: payload.badgeType || "system",
      badgeColor: payload.badgeColor || "silver",
      category: payload.category || "general",
      title: payload.title,
      description: payload.description || "",
      reason: payload.reason || "",
      isAnnualAward: Boolean(payload.isAnnualAward),
      awardYear: payload.awardYear || null,
      isPublic: payload.isPublic !== false,
      metadata: payload.metadata || null,
      createdAt: toDate(payload.createdAt)
    };

    this.badges.push(badge);
    return badge;
  }

  awardVerificationBadge({ userId, verifyType, awardedById = "system", description = "", reason = "", metadata = null }) {
    const config = VERIFICATION_BADGE_CONFIG[verifyType] || { color: "blue", icon: "checkmark", title: verifyType };
    return this.createBadge({
      userId,
      awardedById,
      systemType: "verification",
      badgeType: awardedById === "headmistress" ? "headmistress" : "system",
      badgeColor: config.color,
      category: verifyType,
      title: config.title,
      description,
      reason,
      metadata: {
        icon: config.icon,
        verifyType,
        ...metadata
      }
    });
  }

  awardTrustBadge({ userId, awardedById, awardedByRole = "mistress", category, title, reason = "", description = "" }) {
    return this.createBadge({
      userId,
      awardedById,
      systemType: "trust",
      badgeType: awardedByRole,
      badgeColor: awardedByRole === "headmistress" ? "gold" : "purple",
      category,
      title,
      description,
      reason,
      metadata: {
        role: awardedByRole
      }
    });
  }

  awardAchievementBadge({ userId, category, title, reason = "", metadata = null }) {
    return this.createBadge({
      userId,
      systemType: "achievement",
      badgeType: "system",
      badgeColor: "silver",
      category,
      title,
      reason,
      metadata
    });
  }

  recordViewingPoints({ userId, points = 1, awardedById = "system" }) {
    const latestEyeBadge = this.getUserBadges(userId)
      .filter((badge) => badge.category === "viewing_eye")
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    const totalViews = (latestEyeBadge?.metadata?.viewCount || 0) + points;
    const tier = getEyeBadgeTier(totalViews);

    if (!tier) {
      return null;
    }

    return this.createBadge({
      userId,
      awardedById,
      systemType: "verification",
      badgeType: "system",
      badgeColor: tier.color,
      category: "viewing_eye",
      title: tier.title,
      description: "Viewing points engagement tier.",
      reason: `Reached ${totalViews} views`,
      metadata: {
        icon: "eye",
        viewCount: totalViews,
        pulseSpeed: tier.pulseSpeed
      }
    });
  }

  getUserBadges(userId, { publicOnly = true } = {}) {
    return this.badges
      .filter((badge) => badge.userId === userId)
      .filter((badge) => (publicOnly ? badge.isPublic : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getUserBadgeSummary(userId) {
    const badges = this.getUserBadges(userId);
    const summary = {
      total: badges.length,
      bySystem: {},
      verification: badges.filter((badge) => badge.systemType === "verification"),
      trust: badges.filter((badge) => badge.systemType === "trust"),
      achievements: badges.filter((badge) => badge.systemType === "achievement")
    };

    badges.forEach((badge) => {
      summary.bySystem[badge.systemType] = (summary.bySystem[badge.systemType] || 0) + 1;
    });

    return summary;
  }
}

export const recognitionBadgeStore = new RecognitionBadgeStore();
