const blackBookEntries = [];

function createEntryCard(entry) {
  const card = document.createElement('article');
  card.className = 'black-book-card';
  card.innerHTML = `
    <div class="black-book-card__header">
      <strong>${entry.alias}</strong>
      <small>${entry.date}</small>
    </div>
    <p><strong>${entry.type}</strong></p>
    <p>${entry.notes}</p>
    <div class="icon-slot" data-pack-icons="${entry.packIcons.join(',')}"></div>
  `;
  return card;
}

function renderFallbackBlackBook(container, entries) {
  container.innerHTML = '';
  entries.forEach((entry) => container.appendChild(createEntryCard(entry)));
}

export function initBlackBookPPVListener(container, renderBlackBook = renderFallbackBlackBook) {
  if (!container) return;

  window.addEventListener('mx:ppv-purchased', (event) => {
    const item = event.detail || {};

    blackBookEntries.unshift({
      alias: 'PPV Unlock',
      date: new Date().toISOString().slice(0, 10),
      type: 'ppv_purchased',
      notes: `Unlocked ${item.title || 'PPV content'} for $${item.price ?? 0}.`,
      packIcons: [item.packType || 'paid'],
      viewableByMistress: true,
    });

    renderBlackBook(container, blackBookEntries);
  });
}
