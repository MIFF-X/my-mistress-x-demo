import React from 'react';
import { Text, View } from 'react-native';

type MilestoneBadge = {
  id: string;
  label: string;
  helper: string;
  unlocked: boolean;
  progressLabel?: string;
  tone: 'gold' | 'pink' | 'green' | 'purple';
};

type DailyServiceMilestoneBadgesProps = {
  title?: string;
  subtitle?: string;
  badges?: MilestoneBadge[];
};

const defaultBadges: MilestoneBadge[] = [
  { id: 'day-5', label: '5 Days', helper: 'First service milestone', unlocked: true, progressLabel: 'Unlocked', tone: 'gold' },
  { id: 'day-7', label: '7 Days', helper: 'Weekly streak badge', unlocked: false, progressLabel: '5/7', tone: 'pink' },
  { id: 'journal-10', label: '10 Entries', helper: 'Journal habit badge', unlocked: false, progressLabel: '6/10', tone: 'purple' },
  { id: 'tasks-25', label: '25 Tasks', helper: 'Task finisher badge', unlocked: false, progressLabel: '18/25', tone: 'green' },
];

function badgeAccent(tone: MilestoneBadge['tone']) {
  if (tone === 'gold') return '#d4af37';
  if (tone === 'green') return '#1D9E75';
  if (tone === 'purple') return '#a855f7';
  return '#ff3f8e';
}

export function DailyServiceMilestoneBadges({
  title = 'Milestone Badges',
  subtitle = 'Badge row for login streaks, journal streaks, task totals, and challenge completion.',
  badges = defaultBadges,
}: DailyServiceMilestoneBadgesProps) {
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
        {badges.map((badge) => {
          const accent = badgeAccent(badge.tone);
          return (
            <View
              key={badge.id}
              style={{
                flexGrow: 1,
                minWidth: 132,
                backgroundColor: badge.unlocked ? '#171017' : '#050505',
                borderColor: badge.unlocked ? accent : '#262626',
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
                opacity: badge.unlocked ? 1 : 0.78,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  backgroundColor: badge.unlocked ? accent : '#1b1b1b',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: badge.unlocked ? '#080808' : '#777', fontWeight: '900' }}>★</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>{badge.label}</Text>
              <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>{badge.helper}</Text>
              {badge.progressLabel ? <Text style={{ color: accent, fontSize: 11, fontWeight: '900', marginTop: 6 }}>{badge.progressLabel}</Text> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
