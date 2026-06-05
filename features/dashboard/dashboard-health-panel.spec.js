import { createDashboardHealthPanel } from './dashboard-health-panel.js';

describe('dashboard health panel', () => {
  it('renders notification visual polish metric and styled unread-enabled notification row', () => {
    const panel = createDashboardHealthPanel({ role: 'MISTRESS' });
    const text = panel.textContent;

    expect(panel.dataset.role).toBe('MISTRESS');
    expect(text).toContain('Notification visual polish');
    expect(text).toContain('On');
    expect(text).toContain('Notifications / Bell');
    expect(text).toContain('Styled unread-enabled');
    expect(text).toContain('Visual polish');
    expect(text).toContain('notification-specific style injection');
  });

  it('renders current module health metric labels', () => {
    const panel = createDashboardHealthPanel();
    const text = panel.textContent;

    expect(text).toContain('Mounted modules');
    expect(text).toContain('Hardened money flows');
    expect(text).toContain('DTO-backed controllers');
    expect(text).toContain('Chat presence layer');
    expect(text).toContain('Final role dashboards');
  });
});
