import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyServiceCreatorTemplateCard } from './DailyServiceCreatorTemplateCard';
import { DailyServiceCommandPanel } from './DailyServiceCommandPanel';
import { DailyReminderPanel } from './DailyReminderPanel';

export function DailyServiceCreatorTemplateLibrary() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Creator Template Library</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview shell for reusable task, journal, challenge, reward, reminder, and command templates.
        </Text>
      </View>

      <DailyServiceCommandPanel />
      <DailyServiceCreatorTemplateCard />
      <DailyReminderPanel />
    </ScrollView>
  );
}
