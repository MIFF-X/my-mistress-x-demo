import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  clearUiLayoutAnalyticsEvents,
  listUiLayoutAnalyticsEvents,
  type UiLayoutAnalyticsEvent,
} from './uiLayoutAnalytics';

type UiLayoutAnalyticsPanelProps = {
  limit?: number;
};

function eventColour(event: UiLayoutAnalyticsEvent) {
  if (event.type.includes('custom_request')) return mxTheme.colors.warning;
  if (event.type.includes('style_pack')) return '#c084fc';
  if (event.type.includes('layout_preset')) return mxTheme.colors.success;
  if (event.type.includes('lock') || event.type.includes('reset')) return mxTheme.colors.accentSoft;
  return mxTheme.colors.muted;
}

function formatEventType(type: string) {
  return type.replace(/_/g, ' ');
}

function AnalyticsEventCard({ event }: { event: UiLayoutAnalyticsEvent }) {
  const colour = eventColour(event);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: `${colour}88`,
        borderRadius: mxTheme.radius.md,
        backgroundColor: '#0d0d0d',
        padding: mxTheme.spacing.md,
        marginBottom: mxTheme.spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colour, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
            {formatEventType(event.type)}
          </Text>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900', marginTop: 4 }}>
            {event.audience} · {event.userId}
          </Text>
        </View>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '800' }}>
          {new Date(event.createdAt).toLocaleTimeString()}
        </Text>
      </View>

      <View style={{ marginTop: 9, gap: 4 }}>
        {event.presetId ? (
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Preset: {event.presetId}</Text>
        ) : null}
        {event.stylePackId ? (
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Style pack: {event.stylePackId}</Text>
        ) : null}
        {event.requestId ? (
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Request: {event.requestId}</Text>
        ) : null}
        {event.requestStatus ? (
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Status: {event.requestStatus}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function UiLayoutAnalyticsPanel({ limit = 25 }: UiLayoutAnalyticsPanelProps) {
  const [refreshToken, setRefreshToken] = useState(0);
  const events = useMemo(() => listUiLayoutAnalyticsEvents(limit), [limit, refreshToken]);

  function clearEvents() {
    clearUiLayoutAnalyticsEvents();
    setRefreshToken((current) => current + 1);
  }

  function refreshEvents() {
    setRefreshToken((current) => current + 1);
  }

  return (
    <View style={{ marginTop: mxTheme.spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Layout analytics</Text>
          <Text style={{ color: mxTheme.colors.muted, marginTop: 4, fontSize: 12 }}>
            Local event stream for selector, style pack and custom request actions.
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            onPress={refreshEvents}
            style={{ borderWidth: 1, borderColor: mxTheme.colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }}
          >
            <Text style={{ color: mxTheme.colors.muted, fontWeight: '900', fontSize: 11 }}>Refresh</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={clearEvents}
            style={{ borderWidth: 1, borderColor: mxTheme.colors.accentSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }}
          >
            <Text style={{ color: mxTheme.colors.accentSoft, fontWeight: '900', fontSize: 11 }}>Clear</Text>
          </Pressable>
        </View>
      </View>

      {events.length === 0 ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: mxTheme.colors.border,
            borderRadius: mxTheme.radius.md,
            backgroundColor: '#0d0d0d',
            padding: mxTheme.spacing.md,
          }}
        >
          <Text style={{ color: mxTheme.colors.muted }}>No layout analytics events recorded yet.</Text>
        </View>
      ) : null}

      {events.map((event) => (
        <AnalyticsEventCard key={event.id} event={event} />
      ))}
    </View>
  );
}
