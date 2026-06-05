import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyMoodOverviewPreview } from './DailyMoodOverviewPreview';
import { DailyServiceAdminConsolePreview } from './DailyServiceAdminConsolePreview';
import { DailyServiceBuildStatusPanel } from './DailyServiceBuildStatusPanel';
import { DailyServiceComponentGallery } from './DailyServiceComponentGallery';
import { DailyServiceCreatorTemplateLibrary } from './DailyServiceCreatorTemplateLibrary';
import { DailyServiceGamificationPreview } from './DailyServiceGamificationPreview';
import { DailyServiceHomePreview } from './DailyServiceHomePreview';
import { DailyServiceJournalPreview } from './DailyServiceJournalPreview';

export function DailyServiceFeatureIndex() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Service Feature Index</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Master preview index for the daily service feature family: home, component gallery, journal, mood, gamification, admin, templates, and build status.
        </Text>
      </View>

      <DailyServiceBuildStatusPanel />
      <DailyServiceHomePreview />
      <DailyServiceComponentGallery />
      <DailyServiceJournalPreview />
      <DailyMoodOverviewPreview />
      <DailyServiceGamificationPreview />
      <DailyServiceAdminConsolePreview />
      <DailyServiceCreatorTemplateLibrary />
    </ScrollView>
  );
}
