import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyServiceAdminReviewBanner } from './DailyServiceAdminReviewBanner';
import { DailyServiceApprovalPanel } from './DailyServiceApprovalPanel';
import { DailyServiceCommandPanel } from './DailyServiceCommandPanel';
import { DailyServiceReviewQueuePreview } from './DailyServiceReviewQueuePreview';

export function DailyServiceAdminConsolePreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Service Admin Console</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview shell for creator/admin daily service commands, approvals, review queues, rewards, prompts, and shared-item moderation.
        </Text>
      </View>

      <DailyServiceAdminReviewBanner />
      <DailyServiceCommandPanel />
      <DailyServiceReviewQueuePreview />
      <DailyServiceApprovalPanel />
    </ScrollView>
  );
}
