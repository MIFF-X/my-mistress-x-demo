import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  createUiLayoutAdminAnalyticsSummary,
  getUiLayoutAdminAnalyticsHighlights,
} from './uiLayoutAdminAnalyticsSummary';

type UiLayoutAdminAnalyticsSummaryCardProps = {
  limit?: number;
};

function SummaryPill({ label }: { label: string }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: `${mxTheme.colors.warning}66`,
        borderRadius: 999,
        backgroundColor: '#080808',
        paddingHorizontal: 10,
        paddingVertical: 7,
      }}
    >
      <Text style={{ color: mxTheme.colors.warning, fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}

export function UiLayoutAdminAnalyticsSummaryCard({ limit = 100 }: UiLayoutAdminAnalyticsSummaryCardProps) {
  const summary = useMemo(() => createUiLayoutAdminAnalyticsSummary(limit), [limit]);
  const highlights = useMemo(() => getUiLayoutAdminAnalyticsHighlights(summary), [summary]);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: mxTheme.colors.warning,
        borderRadius: mxTheme.radius.lg,
        backgroundColor: '#101010',
        padding: mxTheme.spacing.lg,
        marginBottom: mxTheme.spacing.lg,
      }}
    >
      <Text style={{ color: mxTheme.colors.warning, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        Headmistress analytics preview
      </Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 7 }}>
        UI Layout Studio activity summary
      </Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
        Local analytics rollup for layout choices, style packs and custom request activity.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {highlights.map((highlight) => (
          <SummaryPill key={highlight} label={highlight} />
        ))}
      </View>

      <View style={{ marginTop: 14, gap: 5 }}>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>
          Audience events: {Object.entries(summary.eventsByAudience).map(([audience, count]) => `${audience}: ${count}`).join(' · ') || 'none yet'}
        </Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>
          Most recent: {summary.mostRecentEventAt || 'no events yet'}
        </Text>
      </View>
    </View>
  );
}
