import React from 'react';
import { Pressable, Text, View } from 'react-native';

type ModerationBannerTone = 'info' | 'warning' | 'review' | 'safe';

type LiveRoomModerationBannerProps = {
  tone?: ModerationBannerTone;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

function toneConfig(tone: ModerationBannerTone) {
  if (tone === 'warning') {
    return { border: '#d4af37', background: '#171207', text: '#f5c542', badge: 'ATTENTION' };
  }
  if (tone === 'review') {
    return { border: '#a855f7', background: '#120b17', text: '#d8b4fe', badge: 'REVIEW' };
  }
  if (tone === 'safe') {
    return { border: '#1D9E75', background: '#071712', text: '#6ee7b7', badge: 'SAFE' };
  }
  return { border: '#3b82f6', background: '#08111f', text: '#93c5fd', badge: 'INFO' };
}

export function LiveRoomModerationBanner({
  tone = 'safe',
  title = 'Room protections active',
  subtitle = 'Age gates, access checks, report tools, and moderation controls are available for this room.',
  actionLabel = 'View Rules',
  onActionPress,
}: LiveRoomModerationBannerProps) {
  const config = toneConfig(tone);

  return (
    <View
      style={{
        backgroundColor: config.background,
        borderColor: config.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: config.text, fontSize: 11, fontWeight: '900', marginBottom: 5 }}>{config.badge}</Text>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#aaa', fontSize: 12, lineHeight: 18, marginTop: 6 }}>{subtitle}</Text>
        </View>
        <Pressable
          onPress={onActionPress}
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: config.border,
            borderWidth: 1,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: config.text, fontWeight: '900', fontSize: 11 }}>{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
