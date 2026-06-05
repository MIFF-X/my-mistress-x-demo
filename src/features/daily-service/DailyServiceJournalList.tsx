import React from 'react';
import { Text, View } from 'react-native';
import { DailyServiceJournalEntryCard } from './DailyServiceJournalEntryCard';

type DailyServiceJournalItem = {
  id: string;
  title: string;
  bodyPreview: string;
  dateLabel: string;
  privacyLabel: string;
  moodLabel: string;
};

type DailyServiceJournalListProps = {
  title?: string;
  subtitle?: string;
  entries?: DailyServiceJournalItem[];
  onOpenEntry?: (entry: DailyServiceJournalItem) => void;
  onShareSettings?: (entry: DailyServiceJournalItem) => void;
};

const defaultEntries: DailyServiceJournalItem[] = [
  {
    id: 'entry-1',
    title: 'Today’s Reflection',
    bodyPreview: 'Completed the daily check-in, kept the streak alive, and set tomorrow’s focus.',
    dateLabel: 'Today · 8:42 PM',
    privacyLabel: 'Private',
    moodLabel: 'Focused',
  },
  {
    id: 'entry-2',
    title: 'Challenge Day 5',
    bodyPreview: 'Reached the fifth day milestone and unlocked progress toward the weekly reward.',
    dateLabel: 'Yesterday · 9:10 PM',
    privacyLabel: 'Shared',
    moodLabel: 'Proud',
  },
];

export function DailyServiceJournalList({
  title = 'Journal Entries',
  subtitle = 'Recent reflection entries with privacy state, mood label, and attachment-ready previews.',
  entries = defaultEntries,
  onOpenEntry,
  onShareSettings,
}: DailyServiceJournalListProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginBottom: 10 }}>{subtitle}</Text>

      {entries.length === 0 ? (
        <View style={{ backgroundColor: '#101010', borderColor: '#2a1620', borderWidth: 1, borderRadius: 18, padding: 14 }}>
          <Text style={{ color: '#777', fontSize: 12 }}>No journal entries yet.</Text>
        </View>
      ) : (
        entries.map((entry) => (
          <DailyServiceJournalEntryCard
            key={entry.id}
            title={entry.title}
            bodyPreview={entry.bodyPreview}
            dateLabel={entry.dateLabel}
            privacyLabel={entry.privacyLabel}
            moodLabel={entry.moodLabel}
            onOpenPress={() => onOpenEntry?.(entry)}
            onSharePress={() => onShareSettings?.(entry)}
          />
        ))
      )}
    </View>
  );
}
