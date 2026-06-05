// Control System - Block, Ban, Extinguish logic

export class ControlSystem {
  constructor() {
    this.blockedSubs = new Set();
    this.bannedSubs = new Set();
    this.extinguishedSubs = new Set();
  }

  blockSub(subId) {
    this.blockedSubs.add(subId);
    console.log(`Blocked sub ${subId}`);
  }

  banSub(subId) {
    this.bannedSubs.add(subId);
    console.log(`Banned sub ${subId}`);
  }

  extinguishSub(subId) {
    this.extinguishedSubs.add(subId);
    console.log(`Extinguished sub ${subId}`);
  }

  isBlocked(subId) {
    return this.blockedSubs.has(subId);
  }

  isBanned(subId) {
    return this.bannedSubs.has(subId);
  }

  isExtinguished(subId) {
    return this.extinguishedSubs.has(subId);
  }

  // TODO: Add methods for temporary block expiration and moderation logs
}
