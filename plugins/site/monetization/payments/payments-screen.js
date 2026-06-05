import { paymentStore } from './payment-store.js';
import { topUpWallet } from './top-up-wallet.js';
import { createRolePicker } from '../../../../styles/dashboard/dashboard-role-picker.js';
import { createTopContributorsScreen } from './top-contributors-screen.js';
import { createPaymentsByUserScreen } from './payments-by-user-screen.js';
import { createSubscriptionsScreen } from './subscriptions-screen.js';
import { createPaymentActivityScreen } from './payment-activity-screen.js';

export function createPaymentsScreen(filter = 'all') {
  const shell = document.createElement('div');
  shell.className = 'page-shell';

  const topRow = document.createElement('div');
  topRow.className = 'button-row';

  const backBtn = document.createElement('button');
  backBtn.className = 'button-secondary';
  backBtn.innerText = 'Back';
  backBtn.onclick = () => {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(createRolePicker());
  };

  const topUpBtn = document.createElement('button');
  topUpBtn.className = 'button-primary';
  topUpBtn.innerText = 'Top Up $100';
  topUpBtn.onclick = () => {
    topUpWallet(100);
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(createPaymentsScreen(filter));
  };

  topRow.appendChild(backBtn);
  topRow.appendChild(topUpBtn);

  const title = document.createElement('h2');
  title.innerText = 'Payments & Tributes';

  const statsGrid = document.createElement('div');
  statsGrid.className = 'stats-grid';

  const totalTributes = paymentStore.history
    .filter((item) => item.type === 'tribute')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalTopUps = paymentStore.history
    .filter((item) => item.type === 'topup')
    .reduce((sum, item) => sum + item.amount, 0);

  [
    { label: 'Wallet Balance', value: `$${paymentStore.walletBalance}` },
    { label: 'Total Tributes Sent', value: `$${totalTributes}` },
    { label: 'Total Top Ups', value: `$${totalTopUps}` },
  ].forEach((item) => {
    const card = document.createElement('div');
    card.className = 'panel stat-card';
    card.innerHTML = `<h2>${item.value}</h2><p>${item.label}</p>`;
    statsGrid.appendChild(card);
  });

  const quickLinks = document.createElement('div');
  quickLinks.className = 'button-row';

  [
    ['Top Targets', createTopContributorsScreen],
    ['Payments by User', createPaymentsByUserScreen],
    ['Subscriptions', createSubscriptionsScreen],
    ['Payment Activity', createPaymentActivityScreen],
  ].forEach(([label, factory]) => {
    const button = document.createElement('button');
    button.className = 'button-secondary';
    button.innerText = label;
    button.onclick = () => {
      const app = document.getElementById('app');
      app.innerHTML = '';
      app.appendChild(factory());
    };
    quickLinks.appendChild(button);
  });

  const optionsPanel = document.createElement('div');
  optionsPanel.className = 'panel';
  optionsPanel.innerHTML = '<h3>Tribute Options</h3>';

  const optionsRow = document.createElement('div');
  optionsRow.className = 'button-row';
  paymentStore.tributeOptions.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'button-primary';
    btn.innerText = option.label;
    btn.onclick = () => {
      window.alert?.(`Tribute option selected: ${option.label}\nUse this from a profile.`);
    };
    optionsRow.appendChild(btn);
  });
  optionsPanel.appendChild(optionsRow);

  const subsPanel = document.createElement('div');
  subsPanel.className = 'panel';
  subsPanel.innerHTML = '<h3>Subscription Plans</h3>';

  paymentStore.subscriptions.forEach((sub) => {
    const row = document.createElement('div');
    row.className = 'panel punishment-item';
    row.innerHTML = `<h3>${sub.label}</h3><p><strong>Amount:</strong> $${sub.amount}</p><p><strong>Status:</strong> ${sub.status}</p>`;
    subsPanel.appendChild(row);
  });

  const historyPanel = document.createElement('div');
  historyPanel.className = 'panel';
  historyPanel.innerHTML = '<h3>Payment History</h3>';

  const filterRow = document.createElement('div');
  filterRow.className = 'button-row';
  [
    { label: 'All', value: 'all' },
    { label: 'Tributes', value: 'tribute' },
    { label: 'Top Ups', value: 'topup' },
  ].forEach((entry) => {
    const btn = document.createElement('button');
    btn.className = 'button-secondary';
    btn.innerText = entry.label;
    btn.onclick = () => {
      const app = document.getElementById('app');
      app.innerHTML = '';
      app.appendChild(createPaymentsScreen(entry.value));
    };
    filterRow.appendChild(btn);
  });
  historyPanel.appendChild(filterRow);

  let filteredHistory = paymentStore.history.slice().reverse();
  if (filter !== 'all') {
    filteredHistory = filteredHistory.filter((entry) => entry.type === filter);
  }

  if (filteredHistory.length === 0) {
    const empty = document.createElement('p');
    empty.innerText = 'No payment history in this filter.';
    historyPanel.appendChild(empty);
  } else {
    filteredHistory.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'panel punishment-item';
      row.innerHTML = `<p><strong>Type:</strong> ${entry.type}</p><p><strong>Target:</strong> ${entry.toUserName || entry.mistressId || '-'}</p><p><strong>Amount:</strong> $${entry.amount}</p><p><strong>Time:</strong> ${entry.timestamp}</p>`;
      historyPanel.appendChild(row);
    });
  }

  shell.appendChild(topRow);
  shell.appendChild(title);
  shell.appendChild(statsGrid);
  shell.appendChild(quickLinks);
  shell.appendChild(optionsPanel);
  shell.appendChild(subsPanel);
  shell.appendChild(historyPanel);

  return shell;
}
