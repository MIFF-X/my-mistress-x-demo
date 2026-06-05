import { paymentStore } from '../payments/payment-store.js';

export function createMonetizationReportView() {
  const shell = document.createElement('section');
  shell.className = 'panel monetization-report-view';

  const title = document.createElement('h3');
  title.innerText = 'Monetization Report';

  const history = paymentStore.history.slice(0, 10);
  const list = document.createElement('div');
  list.className = 'stack-list';

  if (history.length === 0) {
    const empty = document.createElement('p');
    empty.innerText = 'No monetization events yet.';
    list.appendChild(empty);
  } else {
    history.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'panel punishment-item';
      row.innerText = `${entry.label || entry.type || entry.source}: $${entry.amount}`;
      list.appendChild(row);
    });
  }

  shell.appendChild(title);
  shell.appendChild(list);
  return shell;
}
