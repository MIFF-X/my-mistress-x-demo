import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyServiceAdminReviewBannerProps = {
  title?: string;
  subtitle?: string;
  queueLabel?: string;
  actionLabel?: string;
  onOpenQueue?: () => void;
};

export function DailyServiceAdminReviewBanner({
  title = 'Daily Service Review Active',
  subtitle = 'Shared tasks, proof uploads, journal entries, mood check-ins, rewards, and permission changes can be reviewed before approval.',
  queueLabel = '3 items waiting',
  actionLabel = 'Open Review Queue',
  onOpenQueue,
}: DailyServiceAdminReviewBannerProps) {
  return (
    <View
      style={{
        backgroundColor: '#171207',
        borderColor: '#d4af37',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900', marginBottom: 5 }}>ADMIN / REVIEW</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#aaa', fontSize: 12, lineHeight: 18, marginTop: 6 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: '#1a1510', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#f5c542', fontSize: 10, fontWeight: '900' }}>{queueLabel}</Text>
        </View>
      </View>

      <Pressable
        onPress={onOpenQueue}
        style={{
          marginTop: 12,
          backgroundColor: '#d4af37',
          borderRadius: 999,
          paddingVertical: 11,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#080808', fontWeight: '900' }}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
