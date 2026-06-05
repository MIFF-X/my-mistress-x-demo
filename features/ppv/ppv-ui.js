import { ppvApi } from '../../api/ppv-api.js';

export async function createPpvFeedUI() {
  const container = document.createElement('div');
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  container.style.gap = '12px';

  const items = await ppvApi.feed();

  for (const item of items) {
    const card = document.createElement('div');
    card.style.border = '1px solid #333';
    card.style.padding = '10px';
    card.style.background = '#111';

    const img = document.createElement('img');
    img.src = item.previewUrl || item.mediaUrl;
    img.style.width = '100%';
    img.style.filter = 'blur(10px)';

    const title = document.createElement('div');
    title.innerText = item.title;

    const price = document.createElement('div');
    price.innerText = `${item.price} credits`;

    const btn = document.createElement('button');
    btn.innerText = 'Unlock';

    btn.onclick = async () => {
      try {
        await ppvApi.unlock(item.id);
        img.style.filter = 'none';
        btn.remove();
      } catch (e) {
        alert(e.message);
      }
    };

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(btn);

    container.appendChild(card);
  }

  return container;
}
