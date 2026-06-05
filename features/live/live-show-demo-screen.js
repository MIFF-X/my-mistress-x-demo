import { createLiveShowPanel } from './live-show-panel.js';

export function createLiveShowDemoScreen(room = {}) {
  const page = document.createElement('main');
  page.className = 'mx-page mx-stack';

  const header = document.createElement('section');
  header.className = 'panel';
  header.innerHTML = `
    <h2>Live Show Test Room</h2>
    <p class="mx-muted">Role-aware test mount for live chat sidebar, micro-gifts, paid requests, PPV unlocks, timers, and future video provider wiring.</p>
  `;

  page.appendChild(header);
  page.appendChild(createLiveShowPanel({
    id: room.id || 'demo-live-room',
    title: room.title || 'Mistress Live Show',
    mistressId: room.mistressId || 'host-mistress',
  }));

  return page;
}

export function mountLiveShowDemoScreen(app = document.getElementById('app'), room = {}) {
  if (!app) return;
  app.innerHTML = '';
  app.appendChild(createLiveShowDemoScreen(room));
}
