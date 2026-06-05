import React from 'react';
import { Pressable, Text, View } from 'react-native';

type AudioRoomSeat = {
  id: string;
  label: string;
  userName?: string;
  role: 'host' | 'speaker' | 'listener' | 'empty';
  muted?: boolean;
  raisedHand?: boolean;
};

type LiveAudioRoomSeatMapProps = {
  title?: string;
  subtitle?: string;
  seats?: AudioRoomSeat[];
  onSeatPress?: (seat: AudioRoomSeat) => void;
};

const defaultSeats: AudioRoomSeat[] = [
  { id: 'host', label: 'Host', userName: 'Mistress Luna', role: 'host' },
  { id: 'speaker-1', label: 'Speaker 1', userName: 'VelvetFan', role: 'speaker' },
  { id: 'speaker-2', label: 'Speaker 2', userName: 'NightOwl', role: 'speaker', muted: true },
  { id: 'speaker-3', label: 'Speaker 3', userName: 'CollectorSub77', role: 'speaker', raisedHand: true },
  { id: 'seat-4', label: 'Open Seat', role: 'empty' },
  { id: 'seat-5', label: 'Open Seat', role: 'empty' },
];

function seatAccent(role: AudioRoomSeat['role']) {
  if (role === 'host') return '#d4af37';
  if (role === 'speaker') return '#ff3f8e';
  if (role === 'listener') return '#a855f7';
  return '#444';
}

export function LiveAudioRoomSeatMap({
  title = 'Audio Room Seats',
  subtitle = 'Host, speaker, listener, muted, raised-hand, and open-seat states for audio rooms.',
  seats = defaultSeats,
  onSeatPress,
}: LiveAudioRoomSeatMapProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {seats.map((seat) => {
          const accent = seatAccent(seat.role);
          return (
            <Pressable
              key={seat.id}
              onPress={() => onSeatPress?.(seat)}
              style={{
                width: '30%',
                minWidth: 100,
                backgroundColor: seat.role === 'empty' ? '#0b0b0b' : '#101010',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 18,
                padding: 10,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  backgroundColor: '#1a0b13',
                  borderColor: accent,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: accent, fontSize: 18, fontWeight: '900' }}>
                  {seat.role === 'empty' ? '+' : (seat.userName || seat.label).slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900', textAlign: 'center' }} numberOfLines={1}>
                {seat.userName || seat.label}
              </Text>
              <Text style={{ color: accent, fontSize: 10, fontWeight: '800', marginTop: 3 }}>{seat.role.toUpperCase()}</Text>
              {seat.muted ? <Text style={{ color: '#777', fontSize: 10, marginTop: 3 }}>Muted</Text> : null}
              {seat.raisedHand ? <Text style={{ color: '#d4af37', fontSize: 10, marginTop: 3 }}>Hand raised</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
