import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LiveRoomAdminAuditCard } from './LiveRoomAdminAuditCard';
import { LiveRoomAdminControlStrip } from './LiveRoomAdminControlStrip';
import { LiveRoomAdminQueuePreview } from './LiveRoomAdminQueuePreview';
import { LiveRoomModerationBanner } from './LiveRoomModerationBanner';
import { LiveRoomReportSheetPreview } from './LiveRoomReportSheetPreview';
import { LiveRoomRulesCard } from './LiveRoomRulesCard';
import { LiveRoomSafetyFooter } from './LiveRoomSafetyFooter';

export function LiveRoomAdminOpsPreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Live Room Admin Ops</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Headmistress/Admin preview shell for room auditing, moderation, safety controls, reporting, and queue review.
        </Text>
      </View>

      <LiveRoomModerationBanner />
      <LiveRoomAdminAuditCard />
      <LiveRoomAdminControlStrip />
      <LiveRoomAdminQueuePreview />
      <LiveRoomRulesCard />
      <LiveRoomReportSheetPreview />
      <LiveRoomSafetyFooter />
    </ScrollView>
  );
}
