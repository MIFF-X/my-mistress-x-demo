// Competition Management - Leaderboards and Title Holders

export class CompetitionManager {
  constructor() {
    this.leaderboards = {};
  }

  updateLeaderboard(category, subId, points) {
    if (!this.leaderboards[category]) {
      this.leaderboards[category] = [];
    }
    // Add or update sub points
    const index = this.leaderboards[category].findIndex(entry => entry.subId === subId);
    if (index >= 0) {
      this.leaderboards[category][index].points = points;
    } else {
      this.leaderboards[category].push({ subId, points });
    }
    console.log(`Updated leaderboard for ${category}`, this.leaderboards[category]);
  }

  getLeaderboard(category) {
    return this.leaderboards[category] || [];
  }

  // TODO: Add methods for title assignment and competition rules
}
