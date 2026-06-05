const STYLE_ID = 'mistress-x-notification-styles';

export function ensureNotificationStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .notification-dashboard-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: fit-content;
      margin-top: 0.75rem;
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 215, 0, 0.35);
      background: rgba(255, 215, 0, 0.12);
      font-weight: 800;
      letter-spacing: 0.01em;
    }

    .notification-metadata-line,
    .notification-type-summary {
      display: block;
      margin-top: 0.45rem;
      opacity: 0.86;
      line-height: 1.45;
    }

    .notification-row.is-unread {
      border-color: rgba(255, 215, 0, 0.35);
      box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.08), 0 14px 34px rgba(0, 0, 0, 0.18);
    }

    .notification-row.is-read {
      opacity: 0.78;
    }
  `;

  document.head.appendChild(style);
}
