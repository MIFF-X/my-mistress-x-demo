// Competition Leaderboards - Gifting and spending competition logic

export class CompetitionLeaderboards {
  constructor() {
    this.leaderboards = new Map(); // category -> Array of {subId, points}
  }

  updateLeaderboard(category, subId, points) {
    if (!this.leaderboards.has(category)) {
      this.leaderboards.set(category, []);
    }
    const board = this.leaderboards.get(category);
    const index = board.findIndex(entry => entry.subId === subId);
    if (index >= 0) {
      board[index].points = points;
    } else {
      board.push({ subId, points });
    }
    console.log(`Updated leaderboard for ${category}`, board);
  }

  getLeaderboard(category) {
    return this.leaderboards.get(category) || [];
  }

  // TODO: Add methods for rewards and notifications
}
