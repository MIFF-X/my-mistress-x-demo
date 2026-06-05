import React from 'react';
import { Pressable, Text, View } from 'react-native';

type StickyNoteTone = 'pink' | 'gold' | 'purple' | 'green' | 'plain';

type StickyNoteCardProps = {
  title?: string;
  body?: string;
  dateLabel?: string;
  tone?: StickyNoteTone;
  locked?: boolean;
  pinned?: boolean;
  onOpenPress?: () => void;
};

function noteAccent(tone: StickyNoteTone) {
  if (tone === 'gold') return '#d4af37';
  if (tone === 'purple') return '#a855f7';
  if (tone === 'green') return '#1D9E75';
  if (tone === 'pink') return '#ff9abf';
  return '#d9d0c7';
}

function noteBackground(tone: StickyNoteTone) {
  if (tone === 'gold') return '#2b220d';
  if (tone === 'purple') return '#1a1024';
  if (tone === 'green') return '#071712';
  if (tone === 'pink') return '#251018';
  return '#181818';
}

export function StickyNoteCard({
  title = 'Private Note',
  body = 'Add reminders, booking details, Rolodex notes, or private dashboard context here.',
  dateLabel = 'Today',
  tone = 'pink',
  locked = false,
  pinned = true,
  onOpenPress,
}: StickyNoteCardProps) {
  const accent = noteAccent(tone);

  return (
    <Pressable
      onPress={onOpenPress}
      style={{
        backgroundColor: noteBackground(tone),
        borderColor: accent,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
        minHeight: 150,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: accent, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>{pinned ? 'PINNED NOTE' : 'NOTE'}</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
        </View>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: locked ? '#d4af37' : accent, fontSize: 10, fontWeight: '900' }}>{locked ? 'LOCKED' : dateLabel}</Text>
        </View>
      </View>

      <Text style={{ color: '#e6dfe4', fontSize: 13, lineHeight: 19, marginTop: 12 }}>{body}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{locked ? 'PIN REQUIRED' : 'TAP TO OPEN'}</Text>
        </View>
        {pinned ? (
          <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
            <Text style={{ color: '#aaa', fontSize: 10, fontWeight: '800' }}>Pinned to board</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
