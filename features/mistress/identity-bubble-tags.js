// Identity & Bubble Tags - Manage sub personas and spending styles

export class IdentityBubbleTags {
  constructor() {
    this.tags = new Map(); // mistressId -> Set of tags
  }

  addTag(mistressId, tag) {
    if (!this.tags.has(mistressId)) {
      this.tags.set(mistressId, new Set());
    }
    this.tags.get(mistressId).add(tag);
    console.log(`Added tag '${tag}' to sub ${mistressId}`);
  }

  removeTag(mistressId, tag) {
    if (this.tags.has(mistressId)) {
      this.tags.get(mistressId).delete(tag);
      console.log(`Removed tag '${tag}' from sub ${mistressId}`);
    }
  }

  getTags(mistressId) {
    return this.tags.has(mistressId) ? Array.from(this.tags.get(mistressId)) : [];
  }

  // TODO: Add methods for tag validation and category grouping
}
