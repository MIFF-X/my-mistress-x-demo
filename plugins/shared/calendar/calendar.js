export function createCalendarEvent(input = {}) {
  const startsAt = input.startsAt || new Date().toISOString();

  return {
    id: input.id || `calendar-event-${Date.now()}`,
    title: input.title || 'Calendar Event',
    startsAt,
    endsAt: input.endsAt || startsAt,
    ownerId: input.ownerId || 'shared',
    audience: input.audience || 'all',
    status: input.status || 'scheduled',
    metadata: { ...(input.metadata || {}) },
  };
}

export function listUpcomingEvents(events = [], now = new Date()) {
  const currentTime = new Date(now).getTime();

  return [...events]
    .filter((event) => new Date(event.startsAt).getTime() >= currentTime)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function groupEventsByDay(events = []) {
  return events.reduce((groups, event) => {
    const day = new Date(event.startsAt).toISOString().slice(0, 10);
    return {
      ...groups,
      [day]: [...(groups[day] || []), event],
    };
  }, {});
}
