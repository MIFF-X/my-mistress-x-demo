import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import { InfoPill } from './InfoPill';

export type WatchWithMistressBannerState = 'active' | 'scheduled' | 'fallback';

export type WatchWithMistressBanner = {
  title: string;
  state: WatchWithMistressBannerState;
  accessLabel: string;
  viewerCount?: number;
  startsAtLabel?: string;
  hasMistressCam?: boolean;
  hasRetroTvOverlay?: boolean;
  chatSummary?: string;
  giftSummary?: string;
  primaryActionLabel?: string;
};

type WatchWithMistressProfileBannerProps = {
  banner: WatchWithMistressBanner;
};

export function WatchWithMistressProfileBanner({ banner }: WatchWithMistressProfileBannerProps) {
  const stateLabel = banner.state === 'active' ? 'WATCHING NOW' : banner.state === 'scheduled' ? 'SCHEDULED' : 'FEATURED';
  const actionLabel = banner.primaryActionLabel || (banner.state === 'scheduled' ? 'Remind me' : 'Open room');

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: 'rgba(245, 197, 66, 0.35)',
        backgroundColor: '#130814',
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ backgroundColor: 'rgba(255, 0, 85, 0.22)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>{stateLabel}</Text>
        </View>
        <Text style={{ color: mxTheme.colors.warning, fontSize: 11, fontWeight: '800' }}>{banner.accessLabel}</Text>
      </View>

      <View style={{ backgroundColor: '#050505', borderRadius: 16, minHeight: 112, padding: 14, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{banner.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, marginTop: 4, fontSize: 12 }}>
            {banner.startsAtLabel || `${banner.viewerCount || 0} viewers · safe preview`}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {banner.hasMistressCam ? <InfoPill label="Commentary cam" tone="pink" /> : null}
          {banner.hasRetroTvOverlay ? <InfoPill label="Retro TV overlay" tone="gold" /> : null}
          {banner.chatSummary ? <InfoPill label={banner.chatSummary} tone="purple" /> : null}
          {banner.giftSummary ? <InfoPill label={banner.giftSummary} tone="gold" /> : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable style={{ flex: 1, backgroundColor: mxTheme.colors.warning, borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: '#050505', fontWeight: '900' }}>{actionLabel}</Text>
        </Pressable>
        <Pressable style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 14, justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>Gifts</Text>
        </Pressable>
      </View>
    </View>
  );
}
