export function createCalendarNote(input = {}) {
  return {
    id: input.id || `calendar-note-${Date.now()}`,
    eventId: input.eventId || null,
    authorId: input.authorId || 'system',
    body: input.body || '',
    visibility: input.visibility || 'private',
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export function attachNoteToEvent(event, note) {
  return {
    ...event,
    notes: [...(event.notes || []), note],
  };
}

export function listNotesForEvent(notes = [], eventId) {
  return notes.filter((note) => note.eventId === eventId);
}
