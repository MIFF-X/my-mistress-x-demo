export function createSiteWalletLedger(initialBalance = 0) {
  const entries = [];
  return {
    get balance() {
      return entries.reduce((total, entry) => total + entry.amount, Number(initialBalance || 0));
    },
    addEntry(entry) {
      const amount = Number(entry?.amount || 0);
      const record = {
        id: entry?.id || `wallet-entry-${Date.now()}`,
        amount,
        reason: entry?.reason || 'site-plugin-adjustment',
        createdAt: entry?.createdAt || new Date().toISOString(),
      };
      entries.push(record);
      return record;
    },
    listEntries() {
      return [...entries];
    },
  };
}
