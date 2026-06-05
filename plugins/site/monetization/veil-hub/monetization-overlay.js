import { createVeilOverlay } from '../hub/veil-overlay.js';

export function createMonetizationOverlay(options = {}) {
  return createVeilOverlay({
    title: options.title || 'Monetized Content',
    message: options.message || 'This content is protected by the Site monetization layer.',
    actionLabel: options.actionLabel || 'Unlock',
    onAction: options.onAction,
  });
}
