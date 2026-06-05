import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomAccessState = 'public_preview' | 'free' | 'ticketed' | 'subscription' | 'invite_code' | 'private' | 'sold_out' | 'scheduled' | 'replay';

type LiveRoomAccessPill = {
  id: LiveRoomAccessState;
  label: string;
  helper: string;
  count?: string | number;
};

type LiveRoomAccessPillsProps = {
  title?: string;
  subtitle?: string;
  selected?: LiveRoomAccessState;
  pills?: LiveRoomAccessPill[];
  onSelect?: (pill: LiveRoomAccessPill) => void;
};

const defaultPills: LiveRoomAccessPill[] = [
  { id: 'public_preview', label: 'Preview', helper: 'Safe public entry', count: 'Open' },
  { id: 'free', label: 'Free', helper: 'No charge room', count: 12 },
  { id: 'ticketed', label: 'Ticketed', helper: 'One-time entry', count: 8 },
  { id: 'subscription', label: 'Membership', helper: 'Tier required', count: 16 },
  { id: 'invite_code', label: 'Code', helper: 'Invite access', count: 5 },
  { id: 'private', label: 'Private', helper: 'Approval needed', count: 3 },
  { id: 'scheduled', label: 'Soon', helper: 'Starting later', count: 21 },
  { id: 'replay', label: 'Replay', helper: 'Recorded access', count: 9 },
];

function accessAccent(id: LiveRoomAccessState) {
  if (id === 'public_preview' || id === 'free') return '#1D9E75';
  if (id === 'ticketed' || id === 'subscription') return '#d4af37';
  if (id === 'invite_code' || id === 'private') return '#a855f7';
  if (id === 'sold_out') return '#777777';
  return '#ff3f8e';
}

export function LiveRoomAccessPills({
  title = 'Access Filters',
  subtitle = 'Show public, free, paid, membership, invite-code, private, scheduled, and replay rooms clearly.',
  selected,
  pills = defaultPills,
  onSelect,
}: LiveRoomAccessPillsProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {pills.map((pill) => {
          const active = selected === pill.id;
          const accent = accessAccent(pill.id);
          return (
            <Pressable
              key={pill.id}
              onPress={() => onSelect?.(pill)}
              style={{
                backgroundColor: active ? accent : '#101010',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 999,
                paddingHorizontal: 11,
                paddingVertical: 8,
                minHeight: 38,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: active ? '#fff' : accent }} />
              <View>
                <Text style={{ color: active ? '#050505' : '#fff', fontWeight: '900', fontSize: 11 }}>{pill.label}</Text>
                <Text style={{ color: active ? '#1b1b1b' : '#777', fontSize: 9 }}>{pill.helper}</Text>
              </View>
              {pill.count !== undefined ? (
                <Text style={{ color: active ? '#050505' : accent, fontWeight: '900', fontSize: 10 }}>{pill.count}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
