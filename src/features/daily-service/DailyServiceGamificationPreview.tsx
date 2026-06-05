import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyRewardSummaryCard } from './DailyRewardSummaryCard';
import { DailyServiceCalendarGrid } from './DailyServiceCalendarGrid';
import { DailyServiceMilestoneBadges } from './DailyServiceMilestoneBadges';
import { DailyServiceMiniStatsBar } from './DailyServiceMiniStatsBar';
import { DailyServiceProgressRing } from './DailyServiceProgressRing';
import { DailyServiceRewardToast } from './DailyServiceRewardToast';
import { DailyServiceStreakWidget } from './DailyServiceStreakWidget';
import { DailyServiceTodaySummary } from './DailyServiceTodaySummary';
import { DailyServiceWeeklyReviewCard } from './DailyServiceWeeklyReviewCard';

export function DailyServiceGamificationPreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Service Gamification</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview shell for streaks, points, rewards, badges, calendars, progress, daily summaries, and weekly reviews.
        </Text>
      </View>

      <DailyServiceMiniStatsBar />
      <DailyServiceTodaySummary />
      <DailyServiceProgressRing />
      <DailyServiceStreakWidget />
      <DailyRewardSummaryCard />
      <DailyServiceMilestoneBadges />
      <DailyServiceCalendarGrid />
      <DailyServiceWeeklyReviewCard />
      <DailyServiceRewardToast />
    </ScrollView>
  );
}
