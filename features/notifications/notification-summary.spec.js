import {
  buildNotificationSummary,
  formatNotificationSummary,
  formatUnreadByTypeSummary,
} from './notification-summary.js';

describe('notification summary helper', () => {
  it('builds total, unread, chat unread, and unread by type counts', () => {
    const summary = buildNotificationSummary([
      { type: 'CHAT', read: false },
      { type: 'CHAT', read: false },
      { type: 'WALLET', read: false },
      { type: 'PPV', read: true },
      { read: false },
    ]);

    expect(summary).toEqual({
      total: 5,
      unread: 4,
      chatUnread: 2,
      unreadByType: {
        CHAT: 2,
        WALLET: 1,
        SYSTEM: 1,
      },
    });
  });

  it('handles missing or non-array notification input safely', () => {
    expect(buildNotificationSummary(null)).toEqual({
      total: 0,
      unread: 0,
      chatUnread: 0,
      unreadByType: {},
    });
  });

  it('formats notification summary badge text', () => {
    expect(formatNotificationSummary({ unread: 3, chatUnread: 1 })).toBe('3 unread · 1 chat');
  });

  it('formats unloaded summary fallback', () => {
    expect(formatNotificationSummary(null)).toBe('Notifications not loaded.');
  });

  it('formats unread-by-type summary text', () => {
    expect(formatUnreadByTypeSummary({ WALLET: 1, CHAT: 2 })).toBe('Unread by type · CHAT: 2 · WALLET: 1');
  });

  it('formats unread-by-type empty fallback', () => {
    expect(formatUnreadByTypeSummary({})).toBe('No unread notifications by type.');
  });
});
