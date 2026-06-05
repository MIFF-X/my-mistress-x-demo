// Identity & Bubble Tags - Manage sub personas and spending styles

const TAG_CATALOG = {
  interest: ["Financial Slave", "Ad Junkie", "Gaming Enthusiast", "Content Lover", "Gift Giver"],
  personality: ["Chatty Sub", "Eager Learner", "Respectful", "Quick Responder"],
  specialty: ["Voyeur Devotee", "Task Finisher", "Tribute Loyalist", "Weekend Warrior"]
};

function normalizeTag(tag) {
  return String(tag || "").trim();
}

export class IdentityBubbleTags {
  constructor(catalog = TAG_CATALOG) {
    this.catalog = catalog;
    this.tags = new Map(); // subId -> [{ name, category, selectedAt }]
  }

  addTag(subId, tag, category = "interest") {
    const normalizedTag = normalizeTag(tag);
    if (!normalizedTag) {
      throw new Error("Tag name is required");
    }

    if (!this.tags.has(subId)) {
      this.tags.set(subId, []);
    }

    const existing = this.tags.get(subId).some((item) => item.name.toLowerCase() === normalizedTag.toLowerCase());
    if (existing) {
      return this.getTags(subId);
    }

    this.tags.get(subId).push({
      name: normalizedTag,
      category,
      selectedAt: new Date()
    });

    return this.getTags(subId);
  }

  removeTag(subId, tag) {
    const normalizedTag = normalizeTag(tag).toLowerCase();
    if (!this.tags.has(subId)) {
      return [];
    }

    const filtered = this.tags.get(subId).filter((item) => item.name.toLowerCase() !== normalizedTag);
    this.tags.set(subId, filtered);
    return this.getTags(subId);
  }

  getTags(subId) {
    return this.tags.has(subId) ? [...this.tags.get(subId)] : [];
  }

  getTagsByCategory(subId) {
    return this.getTags(subId).reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {});
  }

  getCatalog() {
    return this.catalog;
  }

  validateTag(tag, category) {
    const normalizedTag = normalizeTag(tag);
    const bucket = this.catalog[category] || [];
    return bucket.includes(normalizedTag);
  }
}

export const identityBubbleTagsStore = new IdentityBubbleTags();
