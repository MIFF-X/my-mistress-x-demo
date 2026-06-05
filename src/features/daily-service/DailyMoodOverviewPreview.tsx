import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyMoodCheckInCard } from './DailyMoodCheckInCard';
import { DailyMoodTrendCard } from './DailyMoodTrendCard';
import { DailyServicePrivacyToggle } from './DailyServicePrivacyToggle';

export function DailyMoodOverviewPreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Mood Overview</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview shell for mood check-ins, weekly mood trends, and privacy controls.
        </Text>
      </View>

      <DailyMoodCheckInCard />
      <DailyMoodTrendCard />
      <DailyServicePrivacyToggle title="Mood Privacy" subtitle="Choose whether mood check-ins stay private, are shared with permission, or are queued for review." />
    </ScrollView>
  );
}
