import React from 'react';
import { Text, View } from 'react-native';
import { DailyServiceDashboardEntryCard } from './DailyServiceDashboardEntryCard';
import { DailyServiceMiniStatsBar } from './DailyServiceMiniStatsBar';
import { DailyServiceRewardToast } from './DailyServiceRewardToast';
import { DailyServiceTodaySummary } from './DailyServiceTodaySummary';

type DailyServiceDashboardWidgetStackProps = {
  title?: string;
  subtitle?: string;
  showRewardToast?: boolean;
  onOpenDailyService?: () => void;
};

export function DailyServiceDashboardWidgetStack({
  title = 'Daily Service Widgets',
  subtitle = 'Dashboard-ready stack for the Daily Service entry card, mini stats, today summary, and reward toast.',
  showRewardToast = true,
  onOpenDailyService,
}: DailyServiceDashboardWidgetStackProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
        <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 4 }}>{subtitle}</Text>
      </View>

      <DailyServiceDashboardEntryCard onOpenPress={onOpenDailyService} />
      <DailyServiceMiniStatsBar />
      <DailyServiceTodaySummary />
      {showRewardToast ? <DailyServiceRewardToast /> : null}
    </View>
  );
}
