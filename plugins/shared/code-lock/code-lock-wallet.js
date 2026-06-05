export const DEMO_WALLET_STORAGE_KEY = "mistressXDemoWalletBalance";

export function getDemoWalletBalance() {
  const stored = Number(localStorage.getItem(DEMO_WALLET_STORAGE_KEY));
  return Number.isFinite(stored) ? stored : 25;
}

export function setDemoWalletBalance(value) {
  localStorage.setItem(DEMO_WALLET_STORAGE_KEY, String(value));
  document.querySelectorAll("[data-wallet-balance]").forEach((node) => {
    node.innerText = `${value} credits`;
  });
}

export function chargeDemoWallet(credits) {
  const balance = getDemoWalletBalance();
  if (balance < credits) return false;
  setDemoWalletBalance(balance - credits);
  return true;
}
