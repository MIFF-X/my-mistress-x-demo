export function createVeilOverlay(options = {}) {
  const overlay = document.createElement('section');
  overlay.className = 'panel site-veil-overlay';
  overlay.dataset.plugin = 'site-monetization-veil';

  const title = document.createElement('h3');
  title.innerText = options.title || 'Locked Content';

  const copy = document.createElement('p');
  copy.innerText = options.message || 'Unlock this area with wallet credits, tribute access, or an approved entitlement.';

  const action = document.createElement('button');
  action.className = 'button-primary';
  action.innerText = options.actionLabel || 'Review Access';
  action.onclick = () => options.onAction?.();

  overlay.appendChild(title);
  overlay.appendChild(copy);
  overlay.appendChild(action);
  return overlay;
}

export const veilOverlayStatus = {
  id: 'site-monetization-veil',
  status: 'scaffold',
};
