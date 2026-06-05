import { spendCredits } from '../payments/payment-store.js';

export function createTipJar({ mistressId = 'demo-mistress', label = 'Tip Jar', options = [5, 10, 25, 50] } = {}) {
  const shell = document.createElement('section');
  shell.className = 'panel tip-jar-panel';

  const title = document.createElement('h3');
  title.innerText = label;

  const status = document.createElement('p');
  status.innerText = 'Choose a quick tribute amount.';

  const row = document.createElement('div');
  row.className = 'button-row';

  options.forEach((amount) => {
    const button = document.createElement('button');
    button.className = 'button-primary';
    button.innerText = `$${amount}`;
    button.onclick = () => {
      const transaction = spendCredits({
        amount,
        source: 'tip_jar',
        mistressId,
        label: `${label} tribute`,
      });
      status.innerText = `Sent $${transaction.amount} to ${mistressId}.`;
    };
    row.appendChild(button);
  });

  shell.appendChild(title);
  shell.appendChild(status);
  shell.appendChild(row);
  return shell;
}
