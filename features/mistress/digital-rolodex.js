// Digital Rolodex - Module for managing Sub Info Cards

import { recognitionBadgeStore } from "../sub/recognition-badges.js";
import { identityBubbleTagsStore } from "../sub/identity-bubble-tags.js";
import { createSubProfileViewModel } from "../sub/sub-profile.js";

function keyFor(mistressId, subId) {
  return `${mistressId}::${subId}`;
}

function normalizeMoney(value) {
  return Number(value || 0).toFixed(2);
}

export class DigitalRolodex {
  constructor({ badgeStore = recognitionBadgeStore, tagStore = identityBubbleTagsStore } = {}) {
    this.badgeStore = badgeStore;
    this.tagStore = tagStore;
    this.cards = new Map();
    this.interactions = new Map();
  }

  upsertCard(card) {
    const relationshipKey = keyFor(card.mistressId, card.subId);
    const current = this.cards.get(relationshipKey) || {};

    const merged = {
      ...current,
      ...card,
      updatedAt: new Date()
    };

    this.cards.set(relationshipKey, merged);
    return merged;
  }

  recordInteraction(mistressId, subId, interaction) {
    const relationshipKey = keyFor(mistressId, subId);
    if (!this.interactions.has(relationshipKey)) {
      this.interactions.set(relationshipKey, []);
    }

    const entry = {
      ...interaction,
      id: interaction.id || `event_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      timestamp: interaction.timestamp ? new Date(interaction.timestamp) : new Date()
    };

    this.interactions.get(relationshipKey).push(entry);
    return entry;
  }

  getCard(mistressId, sub, options = {}) {
    const relationshipKey = keyFor(mistressId, sub.id);
    const relationship = this.cards.get(relationshipKey) || this.upsertCard({
      mistressId,
      subId: sub.id,
      isFavorite: false,
      privateNotes: "",
      totalTributesToMistress: 0,
      totalMessagesWithMistress: 0,
      totalGiftsToMistress: 0,
      totalContentPurchasedFromMistress: 0
    });

    const profile = createSubProfileViewModel({
      sub,
      badgeStore: options.badgeStore || this.badgeStore,
      tagStore: options.tagStore || this.tagStore,
      publicStats: options.publicStats || {}
    });

    const history = this.getTimeline(mistressId, sub.id);

    return {
      quickGlance: {
        username: profile.profile.username,
        badgeStrip: profile.verificationBadges.slice(0, 5).map((badge) => badge.title),
        trustBadgeCount: profile.trustBadges.length,
        achievementCount: profile.achievementBadges.length,
        totalTributesToMistress: normalizeMoney(relationship.totalTributesToMistress),
        streakDays: profile.stats.streakDays,
        favorite: Boolean(relationship.isFavorite)
      },
      tabs: {
        overview: {
          stats: profile.stats,
          interactionsWithMistress: {
            tributes: normalizeMoney(relationship.totalTributesToMistress),
            messages: relationship.totalMessagesWithMistress,
            gifts: normalizeMoney(relationship.totalGiftsToMistress),
            contentPurchases: normalizeMoney(relationship.totalContentPurchasedFromMistress)
          },
          recentActivity: history.slice(-10).reverse()
        },
        badges: {
          verification: profile.verificationBadges,
          trust: profile.trustBadges,
          achievements: profile.achievementBadges
        },
        tags: {
          selected: profile.specializationTags,
          grouped: this.tagStore.getTagsByCategory(sub.id)
        },
        stats: profile.stats,
        history
      },
      privateNotes: relationship.privateNotes,
      updatedAt: relationship.updatedAt
    };
  }

  getTimeline(mistressId, subId) {
    const relationshipKey = keyFor(mistressId, subId);
    return this.interactions.has(relationshipKey) ? [...this.interactions.get(relationshipKey)] : [];
  }

  toggleFavorite(mistressId, subId) {
    const relationshipKey = keyFor(mistressId, subId);
    const current = this.cards.get(relationshipKey);
    if (!current) return false;

    current.isFavorite = !current.isFavorite;
    current.updatedAt = new Date();
    this.cards.set(relationshipKey, current);
    return current.isFavorite;
  }

  addPrivateNote(mistressId, subId, note) {
    const relationshipKey = keyFor(mistressId, subId);
    const current = this.cards.get(relationshipKey);
    if (!current) {
      throw new Error("Cannot add note to missing relationship card");
    }

    current.privateNotes = note;
    current.updatedAt = new Date();
    this.cards.set(relationshipKey, current);
    return current.privateNotes;
  }

  getCardsForMistress(mistressId) {
    return Array.from(this.cards.values())
      .filter((card) => card.mistressId === mistressId)
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }
}
