import { rolodexApi, ROLODEX_CARD_TYPES } from './rolodex-api.js';
import { createRolodexCardReportButton } from './rolodex-report-actions.js';

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

function createTypeSelect() {
  const select = document.createElement('select');
  select.className = 'input-field';

  ROLODEX_CARD_TYPES.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.innerText = type.replaceAll('_', ' ');
    select.appendChild(option);
  });

  return select;
}

function createCardView(card, onDelete, statusEl) {
  const wrapper = document.createElement('article');
  wrapper.className = 'panel rolodex-card';
  wrapper.dataset.cardType = card.type;

  const type = document.createElement('small');
  type.innerText = card.type?.replaceAll('_', ' ') || 'CONTACT CARD';

  const title = document.createElement('h3');
  title.innerText = card.title || 'Untitled Card';

  const name = document.createElement('strong');
  name.innerText = card.displayName || 'No display name';

  const notes = document.createElement('p');
  notes.innerText = card.notes || 'No notes yet.';

  const tags = document.createElement('p');
  tags.innerText = Array.isArray(card.tags) && card.tags.length
    ? `Tags: ${card.tags.join(', ')}`
    : 'No tags';

  const actions = document.createElement('div');
  actions.className = 'button-row';

  const deleteBtn = createButton('Delete Card');
  deleteBtn.onclick = async () => {
    await rolodexApi.deleteCard(card.id);
    await onDelete?.();
  };

  actions.appendChild(deleteBtn);
  actions.appendChild(createRolodexCardReportButton(card, statusEl));

  wrapper.appendChild(type);
  wrapper.appendChild(title);
  wrapper.appendChild(name);
  wrapper.appendChild(notes);
  wrapper.appendChild(tags);
  wrapper.appendChild(actions);

  return wrapper;
}

function createCardForm(onCreated) {
  const form = document.createElement('div');
  form.className = 'panel rolodex-card-form';

  const heading = document.createElement('h3');
  heading.innerText = 'Create Contact Card';

  const titleInput = createInput({ id: 'rolodex-title', placeholder: 'Card title e.g. Mistress Profile Card' });
  const displayNameInput = createInput({ id: 'rolodex-display-name', placeholder: 'Display name' });
  const notesInput = createInput({ id: 'rolodex-notes', placeholder: 'Notes / contract / award details' });
  const tagsInput = createInput({ id: 'rolodex-tags', placeholder: 'Tags separated by commas' });
  const typeSelect = createTypeSelect();

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const submit = createButton('Create Card', 'button-primary');
  submit.onclick = async () => {
    error.style.display = 'none';

    try {
      const card = await rolodexApi.createCard({
        title: titleInput.value,
        displayName: displayNameInput.value,
        type: typeSelect.value,
        notes: notesInput.value,
        tags: tagsInput.value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        style: {
          template: typeSelect.value,
        },
      });

      titleInput.value = '';
      displayNameInput.value = '';
      notesInput.value = '';
      tagsInput.value = '';

      await onCreated?.(card);
    } catch (err) {
      error.innerText = err.message || 'Could not create Rolodex card.';
      error.style.display = 'block';
    }
  };

  form.appendChild(heading);
  form.appendChild(typeSelect);
  form.appendChild(titleInput);
  form.appendChild(displayNameInput);
  form.appendChild(notesInput);
  form.appendChild(tagsInput);
  form.appendChild(error);
  form.appendChild(submit);

  return form;
}

export function createRolodexPanel() {
  const shell = document.createElement('section');
  shell.className = 'page-shell rolodex-panel';

  const title = document.createElement('h2');
  title.innerText = 'Rolodex / Contact Cards';

  const helper = document.createElement('p');
  helper.innerText = 'Create and manage profile cards, contract cards, MX awards, and collector cards.';

  const status = document.createElement('p');
  status.className = 'rolodex-status';

  const refreshBtn = createButton('Refresh Cards');

  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid rolodex-card-grid';

  async function loadCards() {
    grid.innerHTML = '';

    try {
      const cards = await rolodexApi.listCards();

      if (!Array.isArray(cards) || cards.length === 0) {
        const empty = document.createElement('p');
        empty.innerText = 'No Rolodex cards yet. Create your first profile, contract, award, or collector card.';
        grid.appendChild(empty);
        return;
      }

      cards.forEach((card) => {
        grid.appendChild(createCardView(card, loadCards, status));
      });
    } catch (err) {
      status.innerText = err.message || 'Could not load Rolodex cards.';
    }
  }

  refreshBtn.onclick = loadCards;

  shell.appendChild(title);
  shell.appendChild(helper);
  shell.appendChild(createCardForm(async (card) => {
    status.innerText = `Created card: ${card.title || 'Untitled Card'}.`;
    await loadCards();
  }));
  shell.appendChild(refreshBtn);
  shell.appendChild(status);
  shell.appendChild(grid);

  loadCards();

  return shell;
}
