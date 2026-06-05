import { paymentStore } from '../payments/payment-store.js';
import { loadMonetizationConfig } from './monetization-config-loader.js';

export function createMonetizationDashboard(config = loadMonetizationConfig()) {
  const shell = document.createElement('section');
  shell.className = 'panel monetization-dashboard';

  const title = document.createElement('h3');
  title.innerText = 'Site Monetization';

  const metrics = document.createElement('div');
  metrics.className = 'stats-grid';

  [
    ['Wallet Balance', `$${paymentStore.walletBalance}`],
    ['Mistress Revenue', `$${paymentStore.mistressRevenue}`],
    ['Platform Revenue', `$${paymentStore.platformRevenue}`],
    ['Modules', String(config.enabledModules.length)],
  ].forEach(([label, value]) => {
    const card = document.createElement('div');
    card.className = 'panel stat-card';
    card.innerHTML = `<h2>${value}</h2><p>${label}</p>`;
    metrics.appendChild(card);
  });

  shell.appendChild(title);
  shell.appendChild(metrics);
  return shell;
}
