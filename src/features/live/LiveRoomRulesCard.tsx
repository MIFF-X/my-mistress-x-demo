import React from 'react';
import { Text, View } from 'react-native';

type LiveRoomRule = {
  id: string;
  label: string;
  detail: string;
  tone?: 'safe' | 'access' | 'moderation' | 'payment';
};

type LiveRoomRulesCardProps = {
  title?: string;
  subtitle?: string;
  rules?: LiveRoomRule[];
};

const defaultRules: LiveRoomRule[] = [
  {
    id: 'public-safe',
    label: 'Public preview stays safe',
    detail: 'Discovery cards and preview states use controlled, non-explicit surfaces.',
    tone: 'safe',
  },
  {
    id: 'access-checks',
    label: 'Access is checked before entry',
    detail: 'Tickets, memberships, invite codes, and private approval states are checked before opening room content.',
    tone: 'access',
  },
  {
    id: 'room-reporting',
    label: 'Report tools stay visible',
    detail: 'Users can report unsafe room activity and admins can review room flags.',
    tone: 'moderation',
  },
  {
    id: 'wallet-confirmation',
    label: 'Paid actions confirm first',
    detail: 'Gift, request, replay, and entry actions should confirm price and balance before purchase.',
    tone: 'payment',
  },
];

function ruleAccent(tone?: LiveRoomRule['tone']) {
  if (tone === 'safe') return '#1D9E75';
  if (tone === 'access') return '#a855f7';
  if (tone === 'payment') return '#d4af37';
  return '#ff3f8e';
}

export function LiveRoomRulesCard({
  title = 'Room Rules',
  subtitle = 'Clear safety, access, moderation, and payment rules for Live Shows and Watch With Mistress.',
  rules = defaultRules,
}: LiveRoomRulesCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#2a1620',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 }}>{subtitle}</Text>

      <View style={{ gap: 10 }}>
        {rules.map((rule) => {
          const accent = ruleAccent(rule.tone);
          return (
            <View key={rule.id} style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ width: 5, borderRadius: 999, backgroundColor: accent }} />
              <View style={{ flex: 1, backgroundColor: '#050505', borderRadius: 14, padding: 10 }}>
                <Text style={{ color: accent, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{rule.label}</Text>
                <Text style={{ color: '#aaa', fontSize: 12, lineHeight: 17, marginTop: 4 }}>{rule.detail}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
