import { chatGiftCatalog } from './gift-catalog.js';
import { walletApi, chatApi } from '../../../../api/mistress-x-api.js';

export function createMonetizedChatUI({ userId, targetUserId }) {
  const container = document.createElement('div');
  container.style.padding = '12px';
  container.style.color = 'white';

  let balance = 0;

  const balanceEl = document.createElement('div');
  balanceEl.innerText = 'Balance: loading...';

  async function refreshBalance() {
    const res = await walletApi.getBalance(userId);
    balance = res.balance;
    balanceEl.innerText = `Balance: ${balance}`;
  }

  const status = document.createElement('div');
  status.innerText = '🔒 Chat Locked';

  const unlockBtn = document.createElement('button');
  unlockBtn.innerText = 'Unlock Chat (20)';
  unlockBtn.onclick = async () => {
    try {
      await chatApi.unlock(userId, targetUserId, 20);
      status.innerText = '🔓 Chat Unlocked';
      await refreshBalance();
    } catch (e) {
      alert(e.message);
    }
  };

  const input = document.createElement('input');
  input.placeholder = 'Type message...';

  const sendBtn = document.createElement('button');
  sendBtn.innerText = 'Send';
  sendBtn.onclick = async () => {
    await chatApi.send(userId, input.value);
  };

  const paidBtn = document.createElement('button');
  paidBtn.innerText = 'Send Paid (10)';
  paidBtn.onclick = async () => {
    try {
      await chatApi.sendPaid(userId, targetUserId, 10, input.value);
      await refreshBalance();
    } catch (e) {
      alert(e.message);
    }
  };

  const giftRow = document.createElement('div');

  chatGiftCatalog.forEach((gift) => {
    const btn = document.createElement('button');
    btn.innerText = `${gift.emoji} ${gift.price}`;

    btn.onclick = async () => {
      try {
        await walletApi.spend(userId, gift.price, targetUserId, 'gift');
        playGiftAnimation(gift);
        await refreshBalance();
      } catch (e) {
        alert(e.message);
      }
    };

    giftRow.appendChild(btn);
  });

  container.appendChild(balanceEl);
  container.appendChild(status);
  container.appendChild(unlockBtn);
  container.appendChild(document.createElement('br'));
  container.appendChild(input);
  container.appendChild(sendBtn);
  container.appendChild(paidBtn);
  container.appendChild(giftRow);

  refreshBalance();

  return container;
}

function playGiftAnimation(gift) {
  const overlay = document.createElement('div');
  overlay.innerText = gift.emoji;
  overlay.style.position = 'fixed';
  overlay.style.bottom = '20px';
  overlay.style.left = '50%';
  overlay.style.fontSize = '40px';
  overlay.style.transition = 'all 1s ease-out';

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.transform = 'translateY(-200px)';
    overlay.style.opacity = '0';
  }, 50);

  setTimeout(() => {
    overlay.remove();
  }, 1200);
}
