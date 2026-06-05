import React from 'react';
import { Pressable, Text, View } from 'react-native';

type MoodOption = {
  id: string;
  label: string;
  emoji: string;
  helper?: string;
};

type DailyMoodCheckInCardProps = {
  title?: string;
  subtitle?: string;
  selectedMoodId?: string;
  moods?: MoodOption[];
  shareLabel?: string;
  onMoodSelect?: (mood: MoodOption) => void;
  onSavePress?: () => void;
};

const defaultMoods: MoodOption[] = [
  { id: 'focused', label: 'Focused', emoji: '🎯', helper: 'Ready' },
  { id: 'calm', label: 'Calm', emoji: '🌙', helper: 'Steady' },
  { id: 'motivated', label: 'Motivated', emoji: '🔥', helper: 'Active' },
  { id: 'reflective', label: 'Reflective', emoji: '📝', helper: 'Journal' },
  { id: 'tired', label: 'Tired', emoji: '☁️', helper: 'Low energy' },
  { id: 'proud', label: 'Proud', emoji: '✨', helper: 'Progress' },
];

export function DailyMoodCheckInCard({
  title = 'Mood Check-In',
  subtitle = 'Track emotional state privately or share a summary where permission is granted.',
  selectedMoodId = 'focused',
  moods = defaultMoods,
  shareLabel = 'Private unless shared',
  onMoodSelect,
  onSavePress,
}: DailyMoodCheckInCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#a855f7',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#d8b4fe', fontSize: 10, fontWeight: '900' }}>MOOD</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {moods.map((mood) => {
          const active = selectedMoodId === mood.id;
          return (
            <Pressable
              key={mood.id}
              onPress={() => onMoodSelect?.(mood)}
              style={{
                width: '31%',
                minWidth: 96,
                backgroundColor: active ? '#241033' : '#050505',
                borderColor: active ? '#d8b4fe' : '#252525',
                borderWidth: 1,
                borderRadius: 16,
                padding: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>{mood.emoji}</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900', marginTop: 6 }}>{mood.label}</Text>
              {mood.helper ? <Text style={{ color: active ? '#d8b4fe' : '#777', fontSize: 10, marginTop: 2 }}>{mood.helper}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <Text style={{ color: '#d8b4fe', fontSize: 11, fontWeight: '900' }}>{shareLabel}</Text>
        <Pressable onPress={onSavePress} style={{ backgroundColor: '#a855f7', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Save Check-In</Text>
        </Pressable>
      </View>
    </View>
  );
}
