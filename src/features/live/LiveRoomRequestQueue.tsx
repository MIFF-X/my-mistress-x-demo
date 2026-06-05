import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomRequest = {
  id: string;
  label: string;
  requester: string;
  priceLabel?: string;
  status: 'new' | 'approved' | 'waiting' | 'done';
  note?: string;
};

type LiveRoomRequestQueueProps = {
  title?: string;
  subtitle?: string;
  requests?: LiveRoomRequest[];
  onApprove?: (request: LiveRoomRequest) => void;
  onDismiss?: (request: LiveRoomRequest) => void;
};

const defaultRequests: LiveRoomRequest[] = [
  {
    id: 'commentary-1',
    label: 'Commentary request',
    requester: 'CollectorSub77',
    priceLabel: 'MX 150',
    status: 'new',
    note: 'React to the next scene.',
  },
  {
    id: 'gift-shoutout',
    label: 'Gift shoutout',
    requester: 'VelvetFan',
    priceLabel: 'MX 75',
    status: 'waiting',
    note: 'Name shown in room feed.',
  },
  {
    id: 'replay-question',
    label: 'Replay question',
    requester: 'NightOwl',
    status: 'approved',
    note: 'Answer after the room ends.',
  },
];

function statusAccent(status: LiveRoomRequest['status']) {
  if (status === 'new') return '#ff3f8e';
  if (status === 'approved') return '#1D9E75';
  if (status === 'waiting') return '#d4af37';
  return '#777';
}

export function LiveRoomRequestQueue({
  title = 'Room Requests',
  subtitle = 'Paid or queued room requests for live shows and Watch With Mistress.',
  requests = defaultRequests,
  onApprove,
  onDismiss,
}: LiveRoomRequestQueueProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ gap: 10 }}>
        {requests.map((request) => {
          const accent = statusAccent(request.status);
          return (
            <View
              key={request.id}
              style={{
                backgroundColor: '#101010',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{request.label}</Text>
                  <Text style={{ color: '#ff9abf', fontWeight: '800', fontSize: 11, marginTop: 3 }}>From {request.requester}</Text>
                  {request.note ? <Text style={{ color: '#999', fontSize: 11, marginTop: 5 }}>{request.note}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ backgroundColor: '#1b1018', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
                    <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{request.status.toUpperCase()}</Text>
                  </View>
                  {request.priceLabel ? <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900', marginTop: 8 }}>{request.priceLabel}</Text> : null}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Pressable onPress={() => onApprove?.(request)} style={{ flex: 1, backgroundColor: '#1D9E75', borderRadius: 999, paddingVertical: 9, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Approve</Text>
                </Pressable>
                <Pressable onPress={() => onDismiss?.(request)} style={{ flex: 1, backgroundColor: '#251017', borderRadius: 999, paddingVertical: 9, alignItems: 'center' }}>
                  <Text style={{ color: '#ff9abf', fontWeight: '900', fontSize: 12 }}>Dismiss</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
