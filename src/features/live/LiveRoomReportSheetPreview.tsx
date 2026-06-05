import React from 'react';
import { Pressable, Text, View } from 'react-native';

type ReportReason = {
  id: string;
  label: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
};

type LiveRoomReportSheetPreviewProps = {
  title?: string;
  subtitle?: string;
  reasons?: ReportReason[];
  selectedReasonId?: string;
  onSelectReason?: (reason: ReportReason) => void;
  onSubmitReport?: () => void;
};

const defaultReasons: ReportReason[] = [
  { id: 'unsafe-chat', label: 'Unsafe chat behaviour', detail: 'Messages or behaviour that should be reviewed.', severity: 'medium' },
  { id: 'access-issue', label: 'Access or payment issue', detail: 'Ticket, membership, invite, replay, or unlock problem.', severity: 'low' },
  { id: 'room-content', label: 'Room content concern', detail: 'A room preview or stream needs moderation review.', severity: 'high' },
  { id: 'technical', label: 'Technical problem', detail: 'Video, audio, chat, or gift controls are not working.', severity: 'low' },
];

function severityAccent(severity: ReportReason['severity']) {
  if (severity === 'high') return '#ff3f8e';
  if (severity === 'medium') return '#d4af37';
  return '#93c5fd';
}

export function LiveRoomReportSheetPreview({
  title = 'Report Room',
  subtitle = 'Preview report sheet for live rooms, Watch With Mistress, audio rooms, and event rooms.',
  reasons = defaultReasons,
  selectedReasonId,
  onSelectReason,
  onSubmitReport,
}: LiveRoomReportSheetPreviewProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#2a1620',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 }}>{subtitle}</Text>

      <View style={{ gap: 8 }}>
        {reasons.map((reason) => {
          const selected = selectedReasonId === reason.id;
          const accent = severityAccent(reason.severity);
          return (
            <Pressable
              key={reason.id}
              onPress={() => onSelectReason?.(reason)}
              style={{
                backgroundColor: selected ? '#1b1118' : '#050505',
                borderColor: selected ? accent : '#222',
                borderWidth: 1,
                borderRadius: 14,
                padding: 11,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{reason.label}</Text>
                  <Text style={{ color: '#888', fontSize: 11, lineHeight: 16, marginTop: 3 }}>{reason.detail}</Text>
                </View>
                <Text style={{ color: accent, fontWeight: '900', fontSize: 10 }}>{reason.severity.toUpperCase()}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onSubmitReport}
        style={{
          marginTop: 12,
          backgroundColor: '#2a1018',
          borderColor: '#ff3f8e',
          borderWidth: 1,
          borderRadius: 999,
          paddingVertical: 11,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Submit Report</Text>
      </Pressable>
    </View>
  );
}
