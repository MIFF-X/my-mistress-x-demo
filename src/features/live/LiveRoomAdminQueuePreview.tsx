import React from 'react';
import { Pressable, Text, View } from 'react-native';

type AdminQueueItem = {
  id: string;
  label: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'reviewing' | 'actioned';
};

type LiveRoomAdminQueuePreviewProps = {
  title?: string;
  subtitle?: string;
  items?: AdminQueueItem[];
  onOpenItem?: (item: AdminQueueItem) => void;
  onOpenQueue?: () => void;
};

const defaultItems: AdminQueueItem[] = [
  { id: 'q1', label: 'Room report received', source: 'Watch With Mistress', severity: 'medium', status: 'new' },
  { id: 'q2', label: 'Payment gate mismatch', source: 'Ticketed live room', severity: 'low', status: 'assigned' },
  { id: 'q3', label: 'Geo rule review', source: 'Region discovery', severity: 'high', status: 'reviewing' },
];

function severityAccent(severity: AdminQueueItem['severity']) {
  if (severity === 'critical') return '#ff1744';
  if (severity === 'high') return '#ff3f8e';
  if (severity === 'medium') return '#d4af37';
  return '#93c5fd';
}

export function LiveRoomAdminQueuePreview({
  title = 'Room Admin Queue',
  subtitle = 'Preview queue for live room reports, access issues, payment holds, and geo/compliance checks.',
  items = defaultItems,
  onOpenItem,
  onOpenQueue,
}: LiveRoomAdminQueuePreviewProps) {
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
          const accent = severityAccent(item.severity);
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
                  <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>{item.source}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: accent, fontWeight: '900', fontSize: 10 }}>{item.severity.toUpperCase()}</Text>
                  <Text style={{ color: '#777', fontWeight: '800', fontSize: 9, marginTop: 3 }}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
