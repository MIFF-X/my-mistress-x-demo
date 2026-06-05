import { topUpWallet } from './top-up-wallet.js';

export function createTopupModal({ amount = 100, onComplete } = {}) {
  const shell = document.createElement('section');
  shell.className = 'panel topup-modal';

  const title = document.createElement('h3');
  title.innerText = 'Wallet Top Up';

  const copy = document.createElement('p');
  copy.innerText = `Add $${amount} to the demo wallet.`;

  const button = document.createElement('button');
  button.className = 'button-primary';
  button.innerText = `Top Up $${amount}`;
  button.onclick = () => {
    topUpWallet(amount);
    onComplete?.(amount);
  };

  shell.appendChild(title);
  shell.appendChild(copy);
  shell.appendChild(button);
  return shell;
}
