import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BookingReviewReplayOperationsPanel } from './BookingReviewReplayOperationsPanel';
import { createBookingReplayOperationsReadyFixture } from './bookingReviewReplayOperationsFixtures';

export function BookingReviewReplayOperationsPanelPreview() {
  const fixture = createBookingReplayOperationsReadyFixture();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 10 }}>
        Booking Replay Operations Preview
      </Text>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#aaa', fontSize: 12 }}>
          Isolated preview data for queue health, owner drilldowns, replay detail, alert actions, and replay CSV callbacks.
        </Text>
      </View>
      <BookingReviewReplayOperationsPanel
        batchHistory={fixture.batchHistory}
        replayDetail={fixture.replayDetail}
        alertOwnerId={fixture.alertOwnerId}
        onOwnerSelected={(ownerId) => console.log('owner selected', ownerId)}
        onOwnerCsvExport={(csvText) => console.log('owner csv', csvText)}
        onAlertUpdated={(detail) => console.log('alert updated', detail.sourceBatchId)}
        onStatus={(message) => console.log('status', message)}
        onDownloadReplayCsv={(batchId) => console.log('download replay csv', batchId)}
      />
    </ScrollView>
  );
}
