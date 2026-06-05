import React from 'react';
import { Text, View } from 'react-native';

type DailyReward = {
  id: string;
  label: string;
  value: string | number;
  helper?: string;
  tone: 'points' | 'badge' | 'sticker' | 'milestone';
};

type DailyRewardSummaryCardProps = {
  title?: string;
  subtitle?: string;
  rewards?: DailyReward[];
};

const defaultRewards: DailyReward[] = [
  { id: 'points', label: 'Points', value: '+100', helper: 'Daily login', tone: 'points' },
  { id: 'badge', label: 'Badge', value: '1', helper: '5-day milestone', tone: 'badge' },
  { id: 'sticker', label: 'Sticker', value: 'New', helper: 'Reward drop', tone: 'sticker' },
  { id: 'milestone', label: 'Milestone', value: '5/7', helper: 'Challenge progress', tone: 'milestone' },
];

function rewardAccent(tone: DailyReward['tone']) {
  if (tone === 'points') return '#d4af37';
  if (tone === 'badge') return '#ff3f8e';
  if (tone === 'sticker') return '#a855f7';
  return '#1D9E75';
}

export function DailyRewardSummaryCard({
  title = 'Reward Summary',
  subtitle = 'Points, badges, stickers, and milestone rewards for the daily service loop.',
  rewards = defaultRewards,
}: DailyRewardSummaryCardProps) {
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

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {rewards.map((reward) => {
          const accent = rewardAccent(reward.tone);
          return (
            <View
              key={reward.id}
              style={{
                flexGrow: 1,
                minWidth: 130,
                backgroundColor: '#050505',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text style={{ color: accent, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{reward.label}</Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 6 }}>{reward.value}</Text>
              {reward.helper ? <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{reward.helper}</Text> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
