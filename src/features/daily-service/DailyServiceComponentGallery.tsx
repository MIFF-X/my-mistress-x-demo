import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyChallengeCard } from './DailyChallengeCard';
import { DailyJournalPromptCard } from './DailyJournalPromptCard';
import { DailyMoodCheckInCard } from './DailyMoodCheckInCard';
import { DailyReminderPanel } from './DailyReminderPanel';
import { DailyRewardSummaryCard } from './DailyRewardSummaryCard';
import { DailyServiceApprovalPanel } from './DailyServiceApprovalPanel';
import { DailyServiceCalendarGrid } from './DailyServiceCalendarGrid';
import { DailyServiceCommandPanel } from './DailyServiceCommandPanel';
import { DailyServicePrivacyToggle } from './DailyServicePrivacyToggle';
import { DailyServiceProofUploadCard } from './DailyServiceProofUploadCard';
import { DailyServiceStreakWidget } from './DailyServiceStreakWidget';
import { DailyTaskCard } from './DailyTaskCard';

export function DailyServiceComponentGallery() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Service Component Gallery</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview catalogue for daily login points, service streaks, task cards, challenge cards, journal prompts, mood check-ins, reminders, proof, privacy, approval, and command controls.
        </Text>
      </View>

      <DailyServiceStreakWidget />
      <DailyTaskCard />
      <DailyChallengeCard />
      <DailyJournalPromptCard />
      <DailyMoodCheckInCard />
      <DailyRewardSummaryCard />
      <DailyServiceCalendarGrid />
      <DailyReminderPanel />
      <DailyServiceProofUploadCard />
      <DailyServicePrivacyToggle />
      <DailyServiceApprovalPanel />
      <DailyServiceCommandPanel />
    </ScrollView>
  );
}
