// Personal Notes - Store Mistress preferences for subs

export class PersonalNotes {
  constructor() {
    this.notes = new Map(); // subId -> note string
  }

  addNote(subId, note) {
    this.notes.set(subId, note);
    console.log(`Added personal note for sub ${subId}`);
  }

  getNote(subId) {
    return this.notes.get(subId) || '';
  }

  // TODO: Add methods for note privacy and history
}
