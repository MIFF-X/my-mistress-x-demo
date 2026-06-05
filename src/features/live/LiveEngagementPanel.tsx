import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

export type LiveTipEvent = {
  userId: string;
  amount: number;
};

type LiveEngagementPanelProps = {
  tips: LiveTipEvent[];
  goalAmount?: number;
};

export function LiveEngagementPanel({ tips, goalAmount = 100 }: LiveEngagementPanelProps) {
  const total = tips.reduce((sum, tip) => sum + Number(tip.amount || 0), 0);
  const progress = Math.min(100, Math.round((total / goalAmount) * 100));

  const topSupporters = useMemo(() => {
    const totals = new Map<string, number>();

    tips.forEach((tip) => {
      totals.set(tip.userId, (totals.get(tip.userId) || 0) + Number(tip.amount || 0));
    });

    return Array.from(totals.entries())
      .map(([userId, amount]) => ({ userId, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [tips]);

  return (
    <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Live Goal
      </Text>

      <View style={{ height: 12, backgroundColor: '#222', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <View style={{ width: `${progress}%`, height: '100%', backgroundColor: '#ff0055' }} />
      </View>

      <Text style={{ color: '#bbb', marginBottom: 12 }}>
        {total} / {goalAmount} credits
      </Text>

      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
        Top Supporters
      </Text>

      {topSupporters.length === 0 ? (
        <Text style={{ color: '#777' }}>No activity yet.</Text>
      ) : (
        topSupporters.map((supporter, index) => (
          <View
            key={supporter.userId}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}
          >
            <Text style={{ color: '#ddd' }}>
              {index + 1}. {supporter.userId}
            </Text>
            <Text style={{ color: '#ff9abf', fontWeight: '700' }}>{supporter.amount}</Text>
          </View>
        ))
      )}
    </View>
  );
}
