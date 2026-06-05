import { ppvApi } from './ppv-api.js';
import { getAuthRole } from '../auth/auth-client.js';
import { createReportButton } from '../dashboard/report-action.js';

function formatCredits(value) {
  const number = Number(value || 0);
  return `${number.toFixed(2)} credits`;
}

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

function createPpvCard(item, onUnlocked, statusEl) {
  const card = document.createElement('article');
  card.className = 'panel ppv-card';

  const preview = document.createElement('div');
  preview.className = 'ppv-preview';

  if (item.previewUrl || item.mediaUrl) {
    const image = document.createElement('img');
    image.src = item.previewUrl || item.mediaUrl;
    image.alt = item.title || 'PPV preview';
    image.style.width = '100%';
    image.style.maxHeight = '180px';
    image.style.objectFit = 'cover';
    image.style.filter = 'blur(6px)';
    preview.appendChild(image);
  } else {
    preview.innerText = 'Locked PPV Preview';
  }

  const title = document.createElement('h3');
  title.innerText = item.title || 'Untitled PPV';

  const description = document.createElement('p');
  description.innerText = item.description || 'No description provided.';

  const price = document.createElement('strong');
  price.innerText = formatCredits(item.price);

  const actions = document.createElement('div');
  actions.className = 'button-row';

  const unlockBtn = createButton('Unlock PPV', 'button-primary');
  unlockBtn.onclick = async () => {
    await ppvApi.unlockItem(item.id);
    unlockBtn.innerText = 'Unlocked';
    unlockBtn.disabled = true;
    preview.querySelector('img')?.style.removeProperty('filter');
    onUnlocked?.(item);
  };

  const reportBtn = createReportButton({
    label: 'Report PPV',
    title: `Reported PPV: ${item.title || item.id}`,
    description: item.description || 'PPV item reported from PPV panel.',
    targetType: 'ppv',
    targetId: item.id,
    targetUserId: item.mistressUserId,
    area: 'PPV',
    priority: 'HIGH',
    metadata: {
      price: item.price,
      accessType: item.accessType,
    },
    onCreated: () => {
      if (statusEl) statusEl.innerText = 'PPV report sent to moderation.';
    },
    onError: (error) => {
      if (statusEl) statusEl.innerText = error.message || 'Could not report PPV item.';
    },
  });

  actions.appendChild(unlockBtn);
  actions.appendChild(reportBtn);

  card.appendChild(preview);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(price);
  card.appendChild(actions);

  return card;
}

function createCreatorForm(onCreated) {
  const form = document.createElement('div');
  form.className = 'panel ppv-creator-form';

  const title = document.createElement('h3');
  title.innerText = 'Create PPV Content';

  const titleInput = createInput({ id: 'ppv-title', placeholder: 'Title' });
  const descriptionInput = createInput({ id: 'ppv-description', placeholder: 'Description' });
  const priceInput = createInput({ id: 'ppv-price', type: 'number', placeholder: 'Price in credits' });
  const mediaInput = createInput({ id: 'ppv-media-url', placeholder: 'Media URL' });
  const previewInput = createInput({ id: 'ppv-preview-url', placeholder: 'Preview URL optional' });

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const submit = createButton('Create PPV', 'button-primary');
  submit.onclick = async () => {
    error.style.display = 'none';

    try {
      await ppvApi.createItem({
        title: titleInput.value,
        description: descriptionInput.value,
        price: Number(priceInput.value),
        mediaUrl: mediaInput.value,
        previewUrl: previewInput.value,
      });

      titleInput.value = '';
      descriptionInput.value = '';
      priceInput.value = '';
      mediaInput.value = '';
      previewInput.value = '';

      await onCreated?.();
    } catch (err) {
      error.innerText = err.message || 'Could not create PPV item.';
      error.style.display = 'block';
    }
  };

  form.appendChild(title);
  form.appendChild(titleInput);
  form.appendChild(descriptionInput);
  form.appendChild(priceInput);
  form.appendChild(mediaInput);
  form.appendChild(previewInput);
  form.appendChild(error);
  form.appendChild(submit);

  return form;
}

export function createPpvPanel() {
  const shell = document.createElement('section');
  shell.className = 'page-shell ppv-panel';

  const title = document.createElement('h2');
  title.innerText = 'PPV Content';

  const helper = document.createElement('p');
  helper.innerText = 'Create, browse, and unlock pay-per-view content using wallet credits.';

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const status = document.createElement('p');
  status.className = 'ppv-status';

  const refreshBtn = createButton('Refresh PPV Feed');

  const feed = document.createElement('div');
  feed.className = 'ppv-feed-grid dashboard-card-grid';

  async function loadFeed() {
    error.style.display = 'none';
    feed.innerHTML = '';

    try {
      const items = await ppvApi.listItems();

      if (!Array.isArray(items) || items.length === 0) {
        const empty = document.createElement('p');
        empty.innerText = 'No PPV content has been added yet.';
        feed.appendChild(empty);
        return;
      }

      items.forEach((item) => feed.appendChild(createPpvCard(item, undefined, status)));
    } catch (err) {
      error.innerText = err.message || 'Could not load PPV feed.';
      error.style.display = 'block';
    }
  }

  refreshBtn.onclick = loadFeed;

  shell.appendChild(title);
  shell.appendChild(helper);

  if (getAuthRole() === 'MISTRESS') {
    shell.appendChild(createCreatorForm(loadFeed));
  }

  shell.appendChild(refreshBtn);
  shell.appendChild(status);
  shell.appendChild(error);
  shell.appendChild(feed);

  loadFeed();

  return shell;
}
