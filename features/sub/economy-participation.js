// Economy Participation - Tribute unlock, wishlist purchasing, wall of shame

export class EconomyParticipation {
  constructor() {
    this.tributes = new Map(); // subId -> tribute amount
    this.wishlistPurchases = new Map(); // subId -> Array of purchased items
    this.wallOfShame = new Set(); // subIds opted in
  }

  addTribute(subId, amount) {
    this.tributes.set(subId, (this.tributes.get(subId) || 0) + amount);
    console.log(`Sub ${subId} added tribute: ${amount}`);
  }

  purchaseWishlistItem(subId, item) {
    if (!this.wishlistPurchases.has(subId)) {
      this.wishlistPurchases.set(subId, []);
    }
    this.wishlistPurchases.get(subId).push(item);
    console.log(`Sub ${subId} purchased wishlist item:`, item);
  }

  optInWallOfShame(subId) {
    this.wallOfShame.add(subId);
    console.log(`Sub ${subId} opted into Wall of Shame`);
  }

  optOutWallOfShame(subId) {
    this.wallOfShame.delete(subId);
    console.log(`Sub ${subId} opted out of Wall of Shame`);
  }

  // TODO: Add methods for consent and visibility controls
}
