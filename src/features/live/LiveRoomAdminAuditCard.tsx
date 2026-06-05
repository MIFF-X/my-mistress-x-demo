import React from 'react';
import { Pressable, Text, View } from 'react-native';

type AuditSignal = {
  id: string;
  label: string;
  value: string | number;
  tone: 'safe' | 'watch' | 'review' | 'blocked';
};

type LiveRoomAdminAuditCardProps = {
  title?: string;
  subtitle?: string;
  roomLabel?: string;
  signals?: AuditSignal[];
  onOpenAudit?: () => void;
  onOpenModeration?: () => void;
};

const defaultSignals: AuditSignal[] = [
  { id: 'reports', label: 'Reports', value: 0, tone: 'safe' },
  { id: 'access', label: 'Access checks', value: 'On', tone: 'safe' },
  { id: 'payments', label: 'Payment gates', value: 'Active', tone: 'watch' },
  { id: 'geo', label: 'Geo rules', value: 'Region safe', tone: 'review' },
];

function toneAccent(tone: AuditSignal['tone']) {
  if (tone === 'safe') return '#1D9E75';
  if (tone === 'watch') return '#d4af37';
  if (tone === 'blocked') return '#ff3f8e';
  return '#a855f7';
}

export function LiveRoomAdminAuditCard({
  title = 'Admin Room Audit',
  subtitle = 'Headmistress/Admin review surface for room access, reports, moderation flags, payments, and geo rules.',
  roomLabel = 'Watch With Mistress / Live Room',
  signals = defaultSignals,
  onOpenAudit,
  onOpenModeration,
}: LiveRoomAdminAuditCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#0f0f0f',
        borderColor: '#d4af37',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900', marginBottom: 5 }}>HEADMISTRESS / ADMIN</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: '#1a1510', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#f5c542', fontSize: 10, fontWeight: '900' }}>AUDIT</Text>
        </View>
      </View>

      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900', marginTop: 12 }}>{roomLabel}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {signals.map((signal) => {
          const accent = toneAccent(signal.tone);
          return (
            <View key={signal.id} style={{ flexGrow: 1, minWidth: 130, backgroundColor: '#050505', borderColor: accent, borderWidth: 1, borderRadius: 14, padding: 10 }}>
              <Text style={{ color: accent, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{signal.label}</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 5 }}>{signal.value}</Text>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable onPress={onOpenAudit} style={{ flex: 1, backgroundColor: '#d4af37', borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: '#080808', fontWeight: '900' }}>Open Audit</Text>
        </Pressable>
        <Pressable onPress={onOpenModeration} style={{ flex: 1, borderColor: '#3a3220', borderWidth: 1, borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: '#d4af37', fontWeight: '900' }}>Moderate</Text>
        </Pressable>
      </View>
    </View>
  );
}
