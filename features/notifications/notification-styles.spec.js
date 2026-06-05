import { ensureNotificationStyles } from './notification-styles.js';

describe('notification style injector', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('injects notification styles once', () => {
    ensureNotificationStyles();
    ensureNotificationStyles();

    const styles = document.head.querySelectorAll('#mistress-x-notification-styles');
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain('.notification-dashboard-badge');
    expect(styles[0].textContent).toContain('.notification-row.is-unread');
    expect(styles[0].textContent).toContain('.notification-row.is-read');
  });
});
