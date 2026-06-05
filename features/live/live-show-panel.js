import { getUserRole } from '../auth/role-client.js';
import {
  LIVE_SHOW_EVENTS,
  emitLivePPVUnlock,
  emitMicroGift,
  emitPaidRequest,
  onLiveShowEvent,
} from './live-show-events.js';

function appendLiveLog(log, label, detail) {
  const row = document.createElement('div');
  row.className = 'live-show-log-row';
  row.innerHTML = `<strong>${label}</strong><small>${new Date().toLocaleTimeString()}</small><p>${detail}</p>`;
  log.prepend(row);
}

export function createLiveShowPanel(room = {}) {
  const role = getUserRole();
  const panel = document.createElement('section');
  panel.className = 'panel live-show-panel';

  panel.innerHTML = `
    <div class="live-show-stage">
      <div class="live-show-video-placeholder">
        <strong>${room.title || 'Mistress Live Show'}</strong>
        <span>${role === 'Mistress' ? 'Host view' : 'Viewer view'}</span>
      </div>
      <aside class="live-show-sidebar">
        <h3>Live Chat + Requests</h3>
        <div class="live-show-actions"></div>
        <div class="live-show-log" aria-live="polite"></div>
      </aside>
    </div>
  `;

  const actions = panel.querySelector('.live-show-actions');
  const log = panel.querySelector('.live-show-log');
  const roomId = room.id || 'demo-live-room';

  if (role === 'Sub') {
    const giftBtn = document.createElement('button');
    giftBtn.className = 'button-primary';
    giftBtn.innerText = 'Send Micro Gift';
    giftBtn.onclick = () => emitMicroGift({
      roomId,
      subId: 'current-sub',
      mistressId: room.mistressId || 'host-mistress',
      giftId: 'gift-heart',
      label: 'Micro Gift',
      amount: 5,
    });

    const requestBtn = document.createElement('button');
    requestBtn.className = 'button-secondary';
    requestBtn.innerText = 'Paid Request';
    requestBtn.onclick = () => emitPaidRequest({
      roomId,
      subId: 'current-sub',
      mistressId: room.mistressId || 'host-mistress',
      requestType: 'live_request',
      label: 'Live Request',
      amount: 10,
      message: 'Request sent during live show.',
    });

    const ppvBtn = document.createElement('button');
    ppvBtn.className = 'button-secondary';
    ppvBtn.innerText = 'Unlock Live PPV';
    ppvBtn.onclick = () => emitLivePPVUnlock({
      roomId,
      subId: 'current-sub',
      contentId: 'live-ppv-demo',
      title: 'Live Show PPV Unlock',
      price: 15,
    });

    actions.append(giftBtn, requestBtn, ppvBtn);
  }

  if (role === 'Mistress') {
    actions.innerHTML = `
      <button class="button-primary">Start Timer</button>
      <button class="button-secondary">Spotlight Next Sub</button>
      <button class="button-secondary">Open Paid Requests</button>
    `;
  }

  onLiveShowEvent(LIVE_SHOW_EVENTS.MICRO_GIFT, (event) => {
    appendLiveLog(log, 'Micro Gift', `${event.detail.label} · $${event.detail.amount}`);
  });

  onLiveShowEvent(LIVE_SHOW_EVENTS.PAID_REQUEST, (event) => {
    appendLiveLog(log, 'Paid Request', `${event.detail.label} · $${event.detail.amount}`);
  });

  onLiveShowEvent(LIVE_SHOW_EVENTS.PPV_UNLOCK, (event) => {
    appendLiveLog(log, 'PPV Unlock', `${event.detail.title} · $${event.detail.price}`);
  });

  return panel;
}
