import React from 'react';
import { Pressable, Text, View } from 'react-native';

type JournalEntryAttachment = {
  id: string;
  label: string;
  type: 'text' | 'photo' | 'voice' | 'file';
};

type DailyServiceJournalEntryCardProps = {
  title?: string;
  bodyPreview?: string;
  dateLabel?: string;
  privacyLabel?: string;
  moodLabel?: string;
  attachments?: JournalEntryAttachment[];
  onOpenPress?: () => void;
  onSharePress?: () => void;
};

const defaultAttachments: JournalEntryAttachment[] = [
  { id: 'note', label: 'Text note', type: 'text' },
  { id: 'voice', label: 'Voice note', type: 'voice' },
];

function attachmentIcon(type: JournalEntryAttachment['type']) {
  if (type === 'photo') return '▧';
  if (type === 'voice') return '▰';
  if (type === 'file') return '▣';
  return '✎';
}

export function DailyServiceJournalEntryCard({
  title = 'Today’s Reflection',
  bodyPreview = 'Completed the daily check-in, kept the streak alive, and set tomorrow’s focus.',
  dateLabel = 'Today · 8:42 PM',
  privacyLabel = 'Private',
  moodLabel = 'Focused',
  attachments = defaultAttachments,
  onOpenPress,
  onSharePress,
}: DailyServiceJournalEntryCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#120b10',
        borderColor: '#ff9abf',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{dateLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>{privacyLabel}</Text>
        </View>
      </View>

      <Text style={{ color: '#f5c4d8', fontSize: 13, lineHeight: 19, marginTop: 10 }}>{bodyPreview}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#d8b4fe', fontSize: 10, fontWeight: '900' }}>Mood: {moodLabel}</Text>
        </View>
        {attachments.map((attachment) => (
          <View key={attachment.id} style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
            <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>
              {attachmentIcon(attachment.type)} {attachment.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable onPress={onOpenPress} style={{ flex: 1, backgroundColor: '#ff9abf', borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: '#120814', fontWeight: '900' }}>Open Entry</Text>
        </Pressable>
        <Pressable onPress={onSharePress} style={{ flex: 1, borderColor: '#ff9abf', borderWidth: 1, borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Share Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}
