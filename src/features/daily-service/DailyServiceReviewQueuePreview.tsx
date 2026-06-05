import React from 'react';
import { Pressable, Text, View } from 'react-native';

type ReviewQueueItem = {
  id: string;
  label: string;
  source: string;
  submittedBy: string;
  status: 'new' | 'reviewing' | 'approved' | 'returned';
  priority: 'low' | 'normal' | 'high';
};

type DailyServiceReviewQueuePreviewProps = {
  title?: string;
  subtitle?: string;
  items?: ReviewQueueItem[];
  onOpenItem?: (item: ReviewQueueItem) => void;
  onOpenQueue?: () => void;
};

const defaultItems: ReviewQueueItem[] = [
  { id: 'proof-1', label: 'Task proof submitted', source: 'Daily Task', submittedBy: 'CollectorSub77', status: 'new', priority: 'normal' },
  { id: 'journal-1', label: 'Shared journal entry', source: 'Journal', submittedBy: 'VelvetFan', status: 'reviewing', priority: 'low' },
  { id: 'challenge-1', label: 'Challenge reward approval', source: '7-Day Challenge', submittedBy: 'NightOwl', status: 'new', priority: 'high' },
];

function priorityAccent(priority: ReviewQueueItem['priority']) {
  if (priority === 'high') return '#ff3f8e';
  if (priority === 'normal') return '#d4af37';
  return '#93c5fd';
}

function statusLabel(status: ReviewQueueItem['status']) {
  return status.toUpperCase();
}

export function DailyServiceReviewQueuePreview({
  title = 'Daily Service Review Queue',
  subtitle = 'Compact review queue for shared task proof, journal entries, challenge rewards, and returned items.',
  items = defaultItems,
  onOpenItem,
  onOpenQueue,
}: DailyServiceReviewQueuePreviewProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 4 }}>{subtitle}</Text>
        </View>
        <Pressable onPress={onOpenQueue} style={{ backgroundColor: '#1a1510', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>OPEN</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: '#101010', borderColor: '#2a1620', borderWidth: 1, borderRadius: 18, padding: 12 }}>
        {items.map((item, index) => {
          const accent = priorityAccent(item.priority);
          return (
            <Pressable
              key={item.id}
              onPress={() => onOpenItem?.(item)}
              style={{
                paddingVertical: 10,
                borderBottomColor: '#1f1f1f',
                borderBottomWidth: index === items.length - 1 ? 0 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: accent, marginTop: 6 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{item.label}</Text>
                  <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '800', marginTop: 3 }}>{item.source}</Text>
                  <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>From {item.submittedBy}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: accent, fontWeight: '900', fontSize: 10 }}>{item.priority.toUpperCase()}</Text>
                  <Text style={{ color: '#777', fontWeight: '800', fontSize: 9, marginTop: 3 }}>{statusLabel(item.status)}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
