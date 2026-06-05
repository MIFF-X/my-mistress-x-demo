export function createReminder(input = {}) {
  return {
    id: input.id || `reminder-${Date.now()}`,
    eventId: input.eventId || null,
    userId: input.userId || 'shared',
    remindAt: input.remindAt || new Date().toISOString(),
    channel: input.channel || 'in-app',
    status: input.status || 'pending',
  };
}

export function listDueReminders(reminders = [], now = new Date()) {
  const currentTime = new Date(now).getTime();

  return reminders.filter((reminder) => (
    reminder.status === 'pending' && new Date(reminder.remindAt).getTime() <= currentTime
  ));
}

export function markReminderSent(reminder, sentAt = new Date().toISOString()) {
  return {
    ...reminder,
    status: 'sent',
    sentAt,
  };
}
