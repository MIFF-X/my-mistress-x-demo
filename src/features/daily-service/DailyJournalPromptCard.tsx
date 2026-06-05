import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyJournalPromptCardProps = {
  title?: string;
  prompt?: string;
  privacyLabel?: string;
  streakLabel?: string;
  sharedLabel?: string;
  onWritePress?: () => void;
  onPrivacyPress?: () => void;
};

export function DailyJournalPromptCard({
  title = 'Daily Reflection Prompt',
  prompt = 'What did you complete today, and what are you focusing on next?',
  privacyLabel = 'Private by default',
  streakLabel = 'Journal streak: 5 days',
  sharedLabel = 'Share only when approved',
  onWritePress,
  onPrivacyPress,
}: DailyJournalPromptCardProps) {
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
          <Text style={{ color: '#f5c4d8', fontSize: 15, lineHeight: 22, marginTop: 8 }}>{prompt}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255, 154, 191, 0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>JOURNAL</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <Pressable onPress={onPrivacyPress} style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>{privacyLabel}</Text>
        </Pressable>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>{streakLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#aaa', fontSize: 10, fontWeight: '800' }}>{sharedLabel}</Text>
        </View>
      </View>

      <Pressable
        onPress={onWritePress}
        style={{
          marginTop: 12,
          backgroundColor: '#ff9abf',
          borderRadius: 999,
          paddingVertical: 11,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#120814', fontWeight: '900' }}>Write Entry</Text>
      </Pressable>
    </View>
  );
}
