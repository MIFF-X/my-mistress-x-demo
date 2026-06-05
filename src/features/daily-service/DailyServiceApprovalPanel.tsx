import React from 'react';
import { Pressable, Text, View } from 'react-native';

type ApprovalItem = {
  id: string;
  label: string;
  submittedBy: string;
  status: 'submitted' | 'approved' | 'returned' | 'review';
  detail?: string;
};

type DailyServiceApprovalPanelProps = {
  title?: string;
  subtitle?: string;
  items?: ApprovalItem[];
  onApprove?: (item: ApprovalItem) => void;
  onReturn?: (item: ApprovalItem) => void;
};

const defaultItems: ApprovalItem[] = [
  { id: 'entry-1', label: 'Daily task proof', submittedBy: 'CollectorSub77', status: 'submitted', detail: 'Text proof attached' },
  { id: 'entry-2', label: 'Journal reflection', submittedBy: 'VelvetFan', status: 'review', detail: 'Shared with permission' },
  { id: 'entry-3', label: 'Challenge day 5', submittedBy: 'NightOwl', status: 'approved', detail: 'Milestone reward ready' },
];

function statusAccent(status: ApprovalItem['status']) {
  if (status === 'approved') return '#1D9E75';
  if (status === 'returned') return '#ff3f8e';
  if (status === 'review') return '#d4af37';
  return '#a855f7';
}

export function DailyServiceApprovalPanel({
  title = 'Approval Queue',
  subtitle = 'Review shared task proof, challenge progress, and journal entries that were submitted for approval.',
  items = defaultItems,
  onApprove,
  onReturn,
}: DailyServiceApprovalPanelProps) {
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

      <View style={{ gap: 10 }}>
        {items.map((item) => {
          const accent = statusAccent(item.status);
          return (
            <View key={item.id} style={{ backgroundColor: '#050505', borderColor: accent, borderWidth: 1, borderRadius: 14, padding: 11 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{item.label}</Text>
                  <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '800', marginTop: 3 }}>From {item.submittedBy}</Text>
                  {item.detail ? <Text style={{ color: '#888', fontSize: 11, marginTop: 4 }}>{item.detail}</Text> : null}
                </View>
                <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{item.status.toUpperCase()}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Pressable onPress={() => onApprove?.(item)} style={{ flex: 1, backgroundColor: '#1D9E75', borderRadius: 999, paddingVertical: 9, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Approve</Text>
                </Pressable>
                <Pressable onPress={() => onReturn?.(item)} style={{ flex: 1, backgroundColor: '#251017', borderRadius: 999, paddingVertical: 9, alignItems: 'center' }}>
                  <Text style={{ color: '#ff9abf', fontWeight: '900', fontSize: 12 }}>Return</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
