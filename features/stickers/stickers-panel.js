import { stickersApi } from './stickers-api.js';
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

function formatCredits(value) {
  return `${Number(value || 0).toFixed(2)} credits`;
}

function createStickerCard(sticker, statusEl, onRefresh) {
  const card = document.createElement('article');
  card.className = 'panel sticker-card';

  const visual = document.createElement('div');
  visual.className = 'sticker-visual';
  visual.style.minHeight = '90px';
  visual.style.display = 'grid';
  visual.style.placeItems = 'center';
  visual.style.border = '1px dashed rgba(255,255,255,0.25)';
  visual.style.borderRadius = '12px';
  visual.innerText = sticker.imageUrl ? '' : '✨';

  if (sticker.imageUrl) {
    const img = document.createElement('img');
    img.src = sticker.imageUrl;
    img.alt = sticker.title || 'Sticker';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100px';
    visual.appendChild(img);
  }

  const title = document.createElement('h3');
  title.innerText = sticker.title || 'Untitled Sticker';

  const rarity = sticker.rarity || sticker.metadata?.rarity || 'COMMON';
  const source = sticker.source || sticker.metadata?.source || 'platform';

  const meta = document.createElement('p');
  meta.innerText = `${rarity} · ${formatCredits(sticker.price)} · ${source}`;

  const note = document.createElement('p');
  note.innerText = source === 'purchase_tie_in'
    ? 'Designed for matching worn-item purchase collectibles.'
    : 'Digital collectible sticker.';

  const controls = document.createElement('div');
  controls.className = 'button-row';

  const collectBtn = createButton('Collect Sticker', 'button-primary');
  collectBtn.onclick = async () => {
    try {
      if (String(sticker.id || '').startsWith('gold-') || String(sticker.id || '').startsWith('rose-') || String(sticker.id || '').startsWith('diamond-') || String(sticker.id || '').startsWith('worn-')) {
        statusEl.innerText = 'Default stickers must be created by a Mistress before they can be collected.';
        return;
      }

      await stickersApi.purchaseStickerProduct(sticker.id);
      collectBtn.innerText = 'Collected';
      collectBtn.disabled = true;
      statusEl.innerText = `Collected ${sticker.title || 'sticker'}.`;
      await onRefresh?.();
    } catch (err) {
      statusEl.innerText = err.message || 'Could not collect sticker.';
    }
  };

  const createBtn = createButton('Create as Sticker', 'button-secondary');
  createBtn.style.display = getAuthRole() === 'MISTRESS' ? 'inline-block' : 'none';
  createBtn.onclick = async () => {
    try {
      const created = await stickersApi.createStickerProduct({
        title: sticker.title,
        description: `${rarity} digital sticker collectible`,
        price: sticker.price,
        stock: 25,
        imageUrl: sticker.imageUrl || '',
        metadata: {
          rarity,
          source,
          templateId: sticker.id,
        },
      });
      statusEl.innerText = `Created sticker: ${created.title || sticker.title}.`;
      createBtn.innerText = 'Sticker Created';
      createBtn.disabled = true;
      await onRefresh?.();
    } catch (err) {
      statusEl.innerText = err.message || 'Could not create sticker.';
    }
  };

  controls.appendChild(collectBtn);
  controls.appendChild(createBtn);

  card.appendChild(visual);
  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(note);
  card.appendChild(controls);

  return card;
}

function createOwnedStickerCard(row) {
  const sticker = row.sticker || row;
  const card = document.createElement('article');
  card.className = 'panel owned-sticker-card';

  const title = document.createElement('h3');
  title.innerText = sticker.title || 'Owned Sticker';

  const meta = document.createElement('p');
  meta.innerText = `Quantity: ${row.quantity || 1} · Collected: ${row.updatedAt || row.createdAt || ''}`;

  card.appendChild(title);
  card.appendChild(meta);

  return card;
}

function createStickerProductForm(onCreated) {
  const form = document.createElement('div');
  form.className = 'panel sticker-product-form';

  const title = document.createElement('h3');
  title.innerText = 'Create Custom Sticker';

  const titleInput = createInput({ id: 'sticker-title', placeholder: 'Sticker title' });
  const descriptionInput = createInput({ id: 'sticker-description', placeholder: 'Description' });
  const imageInput = createInput({ id: 'sticker-image-url', placeholder: 'Image URL optional' });
  const priceInput = createInput({ id: 'sticker-price', type: 'number', placeholder: 'Price in credits' });
  const rarityInput = createInput({ id: 'sticker-rarity', placeholder: 'Rarity e.g. COMMON, RARE, EPIC, LIMITED' });

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const submit = createButton('Create Sticker', 'button-primary');
  submit.onclick = async () => {
    error.style.display = 'none';

    try {
      const sticker = await stickersApi.createStickerProduct({
        title: titleInput.value,
        description: descriptionInput.value,
        imageUrl: imageInput.value,
        price: Number(priceInput.value || 0),
        metadata: {
          rarity: rarityInput.value || 'COMMON',
          source: 'custom_creator',
        },
      });

      titleInput.value = '';
      descriptionInput.value = '';
      imageInput.value = '';
      priceInput.value = '';
      rarityInput.value = '';

      await onCreated?.(sticker);
    } catch (err) {
      error.innerText = err.message || 'Could not create sticker.';
      error.style.display = 'block';
    }
  };

  form.appendChild(title);
  form.appendChild(titleInput);
  form.appendChild(descriptionInput);
  form.appendChild(imageInput);
  form.appendChild(priceInput);
  form.appendChild(rarityInput);
  form.appendChild(error);
  form.appendChild(submit);

  return form;
}

export function createStickersPanel() {
  const shell = document.createElement('section');
  shell.className = 'page-shell stickers-panel';

  const title = document.createElement('h2');
  title.innerText = 'Sticker Book / Collectibles';

  const helper = document.createElement('p');
  helper.innerText = 'Create and collect digital stickers, including purchase-tied worn-item collectible stickers.';

  const status = document.createElement('p');
  status.className = 'sticker-status';

  const actions = document.createElement('div');
  actions.className = 'button-row';

  const refreshBtn = createButton('Refresh Stickers');
  actions.appendChild(refreshBtn);

  const gridTitle = document.createElement('h3');
  gridTitle.innerText = 'Sticker Catalog';

  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid stickers-grid';

  const mineTitle = document.createElement('h3');
  mineTitle.innerText = 'My Stickers';

  const mineGrid = document.createElement('div');
  mineGrid.className = 'dashboard-card-grid my-stickers-grid';

  async function loadMyStickers() {
    mineGrid.innerHTML = '';

    try {
      const mine = await stickersApi.listMyStickers();

      if (!Array.isArray(mine) || mine.length === 0) {
        const empty = document.createElement('p');
        empty.innerText = 'No stickers collected yet.';
        mineGrid.appendChild(empty);
        return;
      }

      mine.forEach((row) => mineGrid.appendChild(createOwnedStickerCard(row)));
    } catch (err) {
      const fallback = document.createElement('p');
      fallback.innerText = err.message || 'Could not load your stickers.';
      mineGrid.appendChild(fallback);
    }
  }

  async function loadCatalog() {
    grid.innerHTML = '';

    try {
      const stickers = await stickersApi.listCatalog();

      stickers.forEach((sticker) => {
        grid.appendChild(createStickerCard(sticker, status, async () => {
          await loadCatalog();
          await loadMyStickers();
        }));
      });
    } catch (err) {
      status.innerText = err.message || 'Could not load sticker catalog.';
    }
  }

  refreshBtn.onclick = async () => {
    await loadCatalog();
    await loadMyStickers();
  };

  shell.appendChild(title);
  shell.appendChild(helper);

  if (getAuthRole() === 'MISTRESS') {
    shell.appendChild(createStickerProductForm(async (sticker) => {
      status.innerText = `Created custom sticker: ${sticker.title || 'sticker'}.`;
      await loadCatalog();
    }));
  }

  shell.appendChild(actions);
  shell.appendChild(status);
  shell.appendChild(gridTitle);
  shell.appendChild(grid);
  shell.appendChild(mineTitle);
  shell.appendChild(mineGrid);

  loadCatalog();
  loadMyStickers();

  return shell;
}
