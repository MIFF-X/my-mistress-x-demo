import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyChallengeCard } from './DailyChallengeCard';
import { DailyJournalPromptCard } from './DailyJournalPromptCard';
import { DailyMoodCheckInCard } from './DailyMoodCheckInCard';
import { DailyRewardSummaryCard } from './DailyRewardSummaryCard';
import { DailyServiceStreakWidget } from './DailyServiceStreakWidget';
import { DailyTaskCard } from './DailyTaskCard';

export function DailyServiceDashboardPreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Service Dashboard</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview shell for daily login points, service streaks, tasks, challenges, journal prompts, mood check-ins, and reward summaries.
        </Text>
      </View>

      <DailyServiceStreakWidget />
      <DailyTaskCard />
      <DailyChallengeCard />
      <DailyJournalPromptCard />
      <DailyMoodCheckInCard />
      <DailyRewardSummaryCard />
    </ScrollView>
  );
}
