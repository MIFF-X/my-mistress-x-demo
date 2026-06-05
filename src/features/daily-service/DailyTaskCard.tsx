import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyTaskStatus = 'new' | 'due_today' | 'in_progress' | 'submitted' | 'approved' | 'returned' | 'completed' | 'missed';

type DailyTaskCardProps = {
  title?: string;
  description?: string;
  status?: DailyTaskStatus;
  dueLabel?: string;
  rewardLabel?: string;
  proofLabel?: string;
  onOpenPress?: () => void;
  onSubmitPress?: () => void;
};

function statusAccent(status: DailyTaskStatus) {
  if (status === 'approved' || status === 'completed') return '#1D9E75';
  if (status === 'submitted' || status === 'in_progress') return '#d4af37';
  if (status === 'returned' || status === 'missed') return '#ff3f8e';
  return '#a855f7';
}

function statusLabel(status: DailyTaskStatus) {
  return status.replace(/_/g, ' ').toUpperCase();
}

export function DailyTaskCard({
  title = 'Daily Check-In',
  description = 'Complete the assigned daily action and submit proof or a note where required.',
  status = 'due_today',
  dueLabel = 'Due today',
  rewardLabel = '+100 points / milestone progress',
  proofLabel = 'Text or photo proof optional',
  onOpenPress,
  onSubmitPress,
}: DailyTaskCardProps) {
  const accent = statusAccent(status);

  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: accent,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5 }}>{description}</Text>
        </View>
        <View style={{ backgroundColor: '#1a0b13', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{statusLabel(status)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>{dueLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>{rewardLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#aaa', fontSize: 10, fontWeight: '800' }}>{proofLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable onPress={onOpenPress} style={{ flex: 1, borderColor: accent, borderWidth: 1, borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: accent, fontWeight: '900' }}>Open Task</Text>
        </Pressable>
        <Pressable onPress={onSubmitPress} style={{ flex: 1, backgroundColor: accent, borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: '#080808', fontWeight: '900' }}>Submit</Text>
        </Pressable>
      </View>
    </View>
  );
}
