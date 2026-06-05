import React from 'react';
import { Text, View } from 'react-native';
import { StickyNoteCard } from './StickyNoteCard';

type StickyBoardNote = {
  id: string;
  title: string;
  body: string;
  dateLabel?: string;
  tone?: 'pink' | 'gold' | 'purple' | 'green' | 'plain';
  locked?: boolean;
  pinned?: boolean;
};

type StickyNoteBoardProps = {
  title?: string;
  subtitle?: string;
  notes?: StickyBoardNote[];
  onOpenNote?: (note: StickyBoardNote) => void;
};

const defaultNotes: StickyBoardNote[] = [
  {
    id: 'booking-note',
    title: 'Booking Reminder',
    body: 'Check tomorrow’s call bookings and follow-up messages before the live room opens.',
    dateLabel: 'Today',
    tone: 'gold',
    pinned: true,
  },
  {
    id: 'rolodex-note',
    title: 'Rolodex Note',
    body: 'Update favourite tags, group labels, and recent interaction notes for VIP cards.',
    dateLabel: 'Pinned',
    tone: 'pink',
    pinned: true,
  },
  {
    id: 'vault-note',
    title: 'Vault Idea',
    body: 'Create a private locker reminder for invite-only content drops and sticker rewards.',
    dateLabel: 'Draft',
    tone: 'purple',
    locked: true,
  },
];

export function StickyNoteBoard({
  title = 'Sticky Note Board',
  subtitle = 'Corkboard-style notes for dashboards, Rolodex reminders, bookings, private vaults, and creator planning.',
  notes = defaultNotes,
  onOpenNote,
}: StickyNoteBoardProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {notes.map((note) => (
          <View key={note.id} style={{ flexGrow: 1, minWidth: 220, maxWidth: 320 }}>
            <StickyNoteCard
              title={note.title}
              body={note.body}
              dateLabel={note.dateLabel}
              tone={note.tone}
              locked={note.locked}
              pinned={note.pinned}
              onOpenPress={() => onOpenNote?.(note)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
