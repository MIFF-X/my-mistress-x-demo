import React from 'react';
import { Pressable, Text, View } from 'react-native';

type WatchQuickAction = {
  id: string;
  label: string;
  description: string;
  icon: string;
  priceLabel?: string;
  locked?: boolean;
  highlighted?: boolean;
};

type WatchWithMistressQuickActionsProps = {
  title?: string;
  subtitle?: string;
  actions?: WatchQuickAction[];
  onActionPress?: (action: WatchQuickAction) => void;
};

const defaultActions: WatchQuickAction[] = [
  {
    id: 'request-commentary',
    label: 'Request Commentary',
    description: 'Ask Mistress to react to a scene or moment.',
    icon: '🎙️',
    priceLabel: 'MX 150',
    highlighted: true,
  },
  {
    id: 'send-gift',
    label: 'Send Gift',
    description: 'Drop a rose, crown, diamond, or luxe box.',
    icon: '🎁',
    priceLabel: 'From MX 10',
  },
  {
    id: 'private-message',
    label: 'Private Message',
    description: 'Send a side note during the room where allowed.',
    icon: '💬',
    priceLabel: 'MX 50',
  },
  {
    id: 'book-after-show',
    label: 'After-Show Booking',
    description: 'Reserve voice, video, or message time after the show.',
    icon: '📅',
    priceLabel: 'Limited spots',
  },
  {
    id: 'toggle-tv-overlay',
    label: 'TV Overlay',
    description: 'Switch the retro frame on or off.',
    icon: '📺',
  },
  {
    id: 'unlock-vip-replay',
    label: 'VIP Replay',
    description: 'Unlock replay access when the room allows it.',
    icon: '🔐',
    priceLabel: 'VIP',
    locked: true,
  },
];

export function WatchWithMistressQuickActions({
  title = 'Watch With Mistress Actions',
  subtitle = 'Expandable room controls for gifts, commentary, private messages, bookings, overlays, and replays.',
  actions = defaultActions,
  onActionPress,
}: WatchWithMistressQuickActionsProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ gap: 10 }}>
        {actions.map((action) => {
          const accent = action.highlighted ? '#ff3f8e' : action.locked ? '#7d4a63' : '#d4af37';
          return (
            <Pressable
              key={action.id}
              onPress={() => onActionPress?.(action)}
              style={{
                backgroundColor: action.highlighted ? '#201018' : '#101010',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: '#1a0b13',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 22 }}>{action.icon}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{action.label}</Text>
                <Text style={{ color: '#999', fontSize: 11, marginTop: 3 }}>{action.description}</Text>
              </View>

              {action.priceLabel ? (
                <View style={{ backgroundColor: '#1f1218', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
                  <Text style={{ color: accent, fontWeight: '900', fontSize: 10 }}>{action.priceLabel}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
