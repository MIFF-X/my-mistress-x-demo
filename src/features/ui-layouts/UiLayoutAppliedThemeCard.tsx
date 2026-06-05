import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { UiLayoutAudience } from './layoutPresets';
import {
  describeAppliedUiLayoutTheme,
  resolveAppliedUiLayoutTheme,
} from './uiLayoutAppliedTheme';

type UiLayoutAppliedThemeCardProps = {
  userId: string;
  audience: UiLayoutAudience;
};

export function UiLayoutAppliedThemeCard({ userId, audience }: UiLayoutAppliedThemeCardProps) {
  const theme = useMemo(() => resolveAppliedUiLayoutTheme(userId, audience), [audience, userId]);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.accent,
        borderRadius: mxTheme.radius.lg,
        backgroundColor: '#101010',
        padding: mxTheme.spacing.lg,
        marginBottom: mxTheme.spacing.lg,
      }}
    >
      <Text style={{ color: theme.accent, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        Applied UI theme
      </Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 7 }}>
        {describeAppliedUiLayoutTheme(theme)}
      </Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
        {theme.audience} · {theme.shellLabel} · {theme.stylePackId}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
        {theme.tags.length === 0 ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#2a2a2a',
              borderRadius: 999,
              backgroundColor: '#080808',
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '800' }}>no tags</Text>
          </View>
        ) : null}
        {theme.tags.map((tag) => (
          <View
            key={`${theme.userId}-${theme.stylePackId}-${tag}`}
            style={{
              borderWidth: 1,
              borderColor: `${theme.accent}66`,
              borderRadius: 999,
              backgroundColor: '#080808',
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: theme.accent, fontSize: 10, fontWeight: '800' }}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
