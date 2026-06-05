import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyMoodOverviewPreview } from './DailyMoodOverviewPreview';
import { DailyServiceAdminReviewBanner } from './DailyServiceAdminReviewBanner';
import { DailyServiceEmptyState } from './DailyServiceEmptyState';
import { DailyServiceGamificationPreview } from './DailyServiceGamificationPreview';
import { DailyServiceJournalPreview } from './DailyServiceJournalPreview';
import { DailyServiceLockedState } from './DailyServiceLockedState';
import { DailyServiceRouteCards } from './DailyServiceRouteCards';
import { DailyServiceTodaySummary } from './DailyServiceTodaySummary';

export function DailyServiceHomePreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Service Home</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Combined route preview for today, journal, mood, rewards, admin review, locked, and empty states.
        </Text>
      </View>

      <DailyServiceRouteCards />
      <DailyServiceTodaySummary />
      <DailyServiceAdminReviewBanner />
      <DailyServiceLockedState />
      <DailyServiceEmptyState />
      <DailyServiceJournalPreview />
      <DailyMoodOverviewPreview />
      <DailyServiceGamificationPreview />
    </ScrollView>
  );
}
