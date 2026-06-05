import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyJournalPromptCard } from './DailyJournalPromptCard';
import { DailyServiceJournalEntryCard } from './DailyServiceJournalEntryCard';
import { DailyServiceJournalList } from './DailyServiceJournalList';
import { DailyServicePrivacyToggle } from './DailyServicePrivacyToggle';

export function DailyServiceJournalPreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Journal Preview</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview shell for daily reflection prompts, private journal entries, privacy controls, and share settings.
        </Text>
      </View>

      <DailyJournalPromptCard />
      <DailyServicePrivacyToggle />
      <DailyServiceJournalEntryCard />
      <DailyServiceJournalList />
    </ScrollView>
  );
}
