// Wallet System - Virtual wallet and revenue split logic

export class WalletSystem {
  constructor() {
    this.balances = new Map(); // userId -> balance
  }

  credit(userId, amount) {
    this.balances.set(userId, (this.balances.get(userId) || 0) + amount);
    console.log(`Credited ${amount} to user ${userId}`);
  }

  debit(userId, amount) {
    const current = this.balances.get(userId) || 0;
    if (current < amount) {
      console.warn(`Insufficient balance for user ${userId}`);
      return false;
    }
    this.balances.set(userId, current - amount);
    console.log(`Debited ${amount} from user ${userId}`);
    return true;
  }

  getBalance(userId) {
    return this.balances.get(userId) || 0;
  }

  // TODO: Add methods for revenue split and withdrawal
}
