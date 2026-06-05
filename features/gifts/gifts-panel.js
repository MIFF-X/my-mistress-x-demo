import { giftsApi } from './gifts-api.js';
import { getAuthRole } from '../auth/auth-client.js';

function createInput({ id, type = 'text', placeholder }) {
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.className = 'input-field';
  return input;
}

function createButton(label, className = 'button-secondary') {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  return button;
}

function createGiftCard(gift, targetInput, statusEl, onSent) {
  const card = document.createElement('article');
  card.className = 'panel gift-card';

  const emoji = document.createElement('div');
  emoji.className = 'gift-emoji';
  emoji.innerText = gift.emoji || '🎁';
  emoji.style.fontSize = '2rem';

  const title = document.createElement('h3');
  title.innerText = gift.name || 'Unnamed Gift';

  const price = document.createElement('p');
  price.innerText = `${Number(gift.price || 0).toFixed(2)} credits`;

  const sendBtn = createButton('Send Gift', 'button-primary');
  sendBtn.onclick = async () => {
    const targetUserId = targetInput.value.trim();

    if (!targetUserId) {
      statusEl.innerText = 'Enter a target user ID before sending a gift.';
      return;
    }

    if (String(gift.id || '').startsWith('rose') || String(gift.id || '').startsWith('crown') || String(gift.id || '').startsWith('diamond') || String(gift.id || '').startsWith('throne') || String(gift.id || '').startsWith('gold-heart')) {
      statusEl.innerText = 'Default gifts must be created in the backend catalog before they can be sent.';
      return;
    }

    try {
      await giftsApi.sendGift({
        targetUserId,
        amount: Number(gift.price || 0),
        giftId: gift.id,
      });

      statusEl.innerText = `Sent ${gift.name || 'gift'} to ${targetUserId}.`;
      await onSent?.();
    } catch (err) {
      statusEl.innerText = err.message || 'Could not send gift.';
    }
  };

  card.appendChild(emoji);
  card.appendChild(title);
  card.appendChild(price);
  card.appendChild(sendBtn);

  return card;
}

function createOwnedGiftCard(row) {
  const gift = row.gift || row;
  const card = document.createElement('article');
  card.className = 'panel owned-gift-card';

  const emoji = document.createElement('div');
  emoji.className = 'gift-emoji';
  emoji.innerText = gift.emoji || '🎁';
  emoji.style.fontSize = '2rem';

  const title = document.createElement('h3');
  title.innerText = gift.name || 'Owned Gift';

  const meta = document.createElement('p');
  meta.innerText = `Quantity: ${row.quantity || 1} · Last received: ${row.updatedAt || row.createdAt || ''}`;

  card.appendChild(emoji);
  card.appendChild(title);
  card.appendChild(meta);

  return card;
}

function createGiftDefinitionForm(onCreated) {
  const form = document.createElement('div');
  form.className = 'panel gift-definition-form';

  const title = document.createElement('h3');
  title.innerText = 'Create Gift Catalog Item';

  const nameInput = createInput({ id: 'gift-name', placeholder: 'Gift name' });
  const emojiInput = createInput({ id: 'gift-emoji', placeholder: 'Emoji e.g. 👑' });
  const priceInput = createInput({ id: 'gift-price', type: 'number', placeholder: 'Price in credits' });
  const animationInput = createInput({ id: 'gift-animation', placeholder: 'Animation key optional' });

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const submit = createButton('Create Gift', 'button-primary');
  submit.onclick = async () => {
    error.style.display = 'none';

    try {
      const gift = await giftsApi.createGift({
        name: nameInput.value,
        emoji: emojiInput.value,
        price: Number(priceInput.value || 0),
        animation: animationInput.value,
        metadata: { source: 'frontend_gift_creator' },
      });

      nameInput.value = '';
      emojiInput.value = '';
      priceInput.value = '';
      animationInput.value = '';

      await onCreated?.(gift);
    } catch (err) {
      error.innerText = err.message || 'Could not create gift.';
      error.style.display = 'block';
    }
  };

  form.appendChild(title);
  form.appendChild(nameInput);
  form.appendChild(emojiInput);
  form.appendChild(priceInput);
  form.appendChild(animationInput);
  form.appendChild(error);
  form.appendChild(submit);

  return form;
}

export function createGiftsPanel() {
  const shell = document.createElement('section');
  shell.className = 'page-shell gifts-panel';

  const title = document.createElement('h2');
  title.innerText = 'Digital Gifts';

  const helper = document.createElement('p');
  helper.innerText = 'Send wallet-backed gifts that create spend, ledger activity, Mistress earnings, and receiver gift ownership records.';

  const targetInput = createInput({
    id: 'gift-target-user-id',
    placeholder: 'Target Mistress/User ID',
  });

  const status = document.createElement('p');
  status.className = 'gift-status';

  const actions = document.createElement('div');
  actions.className = 'button-row';
  const refreshBtn = createButton('Refresh Gifts');
  actions.appendChild(refreshBtn);

  const catalogTitle = document.createElement('h3');
  catalogTitle.innerText = 'Gift Catalog';

  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid gifts-grid';

  const mineTitle = document.createElement('h3');
  mineTitle.innerText = 'My Gifts';

  const mineGrid = document.createElement('div');
  mineGrid.className = 'dashboard-card-grid my-gifts-grid';

  async function loadMyGifts() {
    mineGrid.innerHTML = '';

    try {
      const mine = await giftsApi.listMyGifts();

      if (!Array.isArray(mine) || mine.length === 0) {
        const empty = document.createElement('p');
        empty.innerText = 'No gifts received yet.';
        mineGrid.appendChild(empty);
        return;
      }

      mine.forEach((row) => mineGrid.appendChild(createOwnedGiftCard(row)));
    } catch (err) {
      const fallback = document.createElement('p');
      fallback.innerText = err.message || 'Could not load your gifts.';
      mineGrid.appendChild(fallback);
    }
  }

  async function loadGifts() {
    grid.innerHTML = '';

    try {
      const gifts = await giftsApi.listCatalog();

      gifts.forEach((gift) => {
        grid.appendChild(createGiftCard(gift, targetInput, status, loadMyGifts));
      });
    } catch (err) {
      status.innerText = err.message || 'Could not load gifts.';
    }
  }

  refreshBtn.onclick = async () => {
    await loadGifts();
    await loadMyGifts();
  };

  shell.appendChild(title);
  shell.appendChild(helper);

  if (getAuthRole() === 'MISTRESS' || getAuthRole() === 'HEADMISTRESS' || getAuthRole() === 'ADMIN') {
    shell.appendChild(createGiftDefinitionForm(async (gift) => {
      status.innerText = `Created gift: ${gift.name || 'gift'}.`;
      await loadGifts();
    }));
  }

  shell.appendChild(targetInput);
  shell.appendChild(actions);
  shell.appendChild(status);
  shell.appendChild(catalogTitle);
  shell.appendChild(grid);
  shell.appendChild(mineTitle);
  shell.appendChild(mineGrid);

  loadGifts();
  loadMyGifts();

  return shell;
}
