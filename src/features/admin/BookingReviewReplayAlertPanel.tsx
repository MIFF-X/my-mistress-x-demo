import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  AdminBookingReviewBatchReplayDetail,
  handleAdminBookingReviewBatchReplayAlert,
  retryFailedAdminBookingReviewBatchRows,
} from '../../api/adminCommandApi';
import {
  BookingReplayAlertAction,
  bookingReplayAlertDefaultNote,
  buildBookingReplayAlertActionRequest,
  buildBookingReplayFailedRowsRetryRequest,
  getBookingReplayAlertState,
} from './bookingReviewReplayAlertHelpers';

type BookingReviewReplayAlertPanelProps = {
  detail: AdminBookingReviewBatchReplayDetail | null;
  assignedToId?: string;
  onUpdated?: (detail: AdminBookingReviewBatchReplayDetail) => void;
  onStatus?: (message: string) => void;
};

function panelStyle(tone: string) {
  return {
    backgroundColor: '#111',
    borderColor: tone,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  } as const;
}

function buttonStyle(tone: string) {
  return {
    backgroundColor: tone,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 8,
    marginTop: 8,
  } as const;
}

export function BookingReviewReplayAlertPanel({ detail, assignedToId, onUpdated, onStatus }: BookingReviewReplayAlertPanelProps) {
  const alertState = useMemo(() => getBookingReplayAlertState(detail), [detail]);
  const [note, setNote] = useState(bookingReplayAlertDefaultNote(alertState));
  const [busyAction, setBusyAction] = useState<string | null>(null);

  if (!detail) return null;

  const sourceBatchId = detail.sourceBatchId || detail.batchId;

  const runAlertAction = async (action: BookingReplayAlertAction) => {
    setBusyAction(action);
    try {
      const request = buildBookingReplayAlertActionRequest(detail, action, note, assignedToId);
      const result = await handleAdminBookingReviewBatchReplayAlert(request.batchId, request.body);
      onUpdated?.(result.detail);
      onStatus?.(`${action.toLowerCase().replace(/_/g, ' ')} saved for ${request.batchId}.`);
    } catch (error) {
      onStatus?.(`Replay alert action failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setBusyAction(null);
    }
  };

  const runRetryFailedRows = async () => {
    setBusyAction('RETRY_FAILED_ROWS');
    try {
      const request = buildBookingReplayFailedRowsRetryRequest(detail, note);
      const result = await retryFailedAdminBookingReviewBatchRows(request.batchId, request.body);
      onStatus?.(`Retry failed rows requested for ${request.batchId}: ${result.summary.updated} updated, ${result.summary.failed} failed.`);
    } catch (error) {
      onStatus?.(`Retry failed rows failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <View style={panelStyle(alertState.tone)}>
      <Text style={{ color: alertState.tone, fontWeight: '800' }}>{alertState.statusLabel}</Text>
      <Text style={{ color: '#ddd', marginTop: 6 }}>{alertState.summary}</Text>
      <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
        Recommended: {alertState.actionLabel} - Source batch: {sourceBatchId}
      </Text>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Action note"
        placeholderTextColor="#666"
        multiline
        style={{
          color: '#fff',
          borderColor: '#333',
          borderWidth: 1,
          borderRadius: 10,
          padding: 8,
          marginTop: 10,
          minHeight: 54,
        }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Pressable
          disabled={busyAction !== null}
          onPress={() => runAlertAction('ACKNOWLEDGE')}
          style={buttonStyle('#d4af37')}
        >
          <Text style={{ color: '#111', fontWeight: '800' }}>
            {busyAction === 'ACKNOWLEDGE' ? 'Acknowledging...' : 'Acknowledge'}
          </Text>
        </Pressable>

        <Pressable
          disabled={busyAction !== null}
          onPress={() => runAlertAction('ESCALATE')}
          style={buttonStyle('#ff6b6b')}
        >
          <Text style={{ color: '#111', fontWeight: '800' }}>
            {busyAction === 'ESCALATE' ? 'Escalating...' : 'Escalate'}
          </Text>
        </Pressable>

        <Pressable
          disabled={busyAction !== null || detail.summary.unreplayedFailedReviewIds.length === 0}
          onPress={runRetryFailedRows}
          style={buttonStyle('#1D9E75')}
        >
          <Text style={{ color: '#111', fontWeight: '800' }}>
            {busyAction === 'RETRY_FAILED_ROWS' ? 'Retrying...' : 'Retry Failed Rows'}
          </Text>
        </Pressable>

        <Pressable
          disabled={busyAction !== null}
          onPress={() => runAlertAction('SCHEDULE_RETRY_REMINDER')}
          style={buttonStyle('#d4af37')}
        >
          <Text style={{ color: '#111', fontWeight: '800' }}>
            {busyAction === 'SCHEDULE_RETRY_REMINDER' ? 'Scheduling...' : 'Schedule Retry Reminder'}
          </Text>
        </Pressable>

        {detail.summary.retryReminderDueAt ? (
          <>
            <Pressable
              disabled={busyAction !== null}
              onPress={() => runAlertAction('SNOOZE_RETRY_REMINDER')}
              style={buttonStyle('#1D9E75')}
            >
              <Text style={{ color: '#111', fontWeight: '800' }}>
                {busyAction === 'SNOOZE_RETRY_REMINDER' ? 'Snoozing...' : 'Snooze 24h'}
              </Text>
            </Pressable>

            <Pressable
              disabled={busyAction !== null}
              onPress={() => runAlertAction('CLEAR_RETRY_REMINDER')}
              style={buttonStyle('#222')}
            >
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                {busyAction === 'CLEAR_RETRY_REMINDER' ? 'Clearing...' : 'Clear Reminder'}
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}
