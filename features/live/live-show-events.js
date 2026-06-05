export const LIVE_SHOW_EVENTS = {
  JOINED: 'mx:live-show-joined',
  LEFT: 'mx:live-show-left',
  CHAT_MESSAGE: 'mx:live-show-chat-message',
  MICRO_GIFT: 'mx:live-show-micro-gift',
  PAID_REQUEST: 'mx:live-show-paid-request',
  PPV_UNLOCK: 'mx:live-show-ppv-unlock',
  TIMER_STARTED: 'mx:live-show-timer-started',
  TIMER_TICK: 'mx:live-show-timer-tick',
  TIMER_ENDED: 'mx:live-show-timer-ended',
  SPOTLIGHT_CHANGED: 'mx:live-show-spotlight-changed',
};

export function emitLiveShowEvent(type, detail = {}) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

export function onLiveShowEvent(type, handler) {
  window.addEventListener(type, handler);
  return () => window.removeEventListener(type, handler);
}

export function emitMicroGift({ roomId, subId, mistressId, giftId, label, amount }) {
  emitLiveShowEvent(LIVE_SHOW_EVENTS.MICRO_GIFT, {
    roomId,
    subId,
    mistressId,
    giftId,
    label,
    amount,
    createdAt: new Date().toISOString(),
  });
}

export function emitPaidRequest({ roomId, subId, mistressId, requestType, label, amount, message }) {
  emitLiveShowEvent(LIVE_SHOW_EVENTS.PAID_REQUEST, {
    roomId,
    subId,
    mistressId,
    requestType,
    label,
    amount,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
}

export function emitLivePPVUnlock({ roomId, subId, contentId, title, price }) {
  emitLiveShowEvent(LIVE_SHOW_EVENTS.PPV_UNLOCK, {
    roomId,
    subId,
    contentId,
    title,
    price,
    packType: 'paid',
    createdAt: new Date().toISOString(),
  });

  window.dispatchEvent(new CustomEvent('mx:ppv-purchased', {
    detail: { contentId, title, price, packType: 'paid' },
  }));
}
