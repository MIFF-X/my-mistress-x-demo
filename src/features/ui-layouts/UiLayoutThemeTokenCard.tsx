import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { UiLayoutAudience } from './layoutPresets';
import { resolveAppliedUiLayoutTheme } from './uiLayoutAppliedTheme';
import {
  describeUiLayoutThemeTokens,
  resolveUiLayoutThemeTokens,
} from './uiLayoutThemeTokens';

type UiLayoutThemeTokenCardProps = {
  userId: string;
  audience: UiLayoutAudience;
};

function TokenSwatch({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: mxTheme.colors.border,
        borderRadius: mxTheme.radius.md,
        backgroundColor: '#0a0a0a',
        padding: mxTheme.spacing.sm,
        flexBasis: 128,
        flexGrow: 1,
      }}
    >
      <View
        style={{
          height: 18,
          borderRadius: 999,
          backgroundColor: value,
          borderWidth: 1,
          borderColor: '#282828',
          marginBottom: 7,
        }}
      />
      <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>{label}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 10, marginTop: 3 }}>{value}</Text>
    </View>
  );
}

export function UiLayoutThemeTokenCard({ userId, audience }: UiLayoutThemeTokenCardProps) {
  const theme = useMemo(() => resolveAppliedUiLayoutTheme(userId, audience), [audience, userId]);
  const tokens = useMemo(() => resolveUiLayoutThemeTokens(theme), [theme]);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: tokens.border,
        borderRadius: mxTheme.radius.lg,
        backgroundColor: tokens.surfaceRaised,
        padding: mxTheme.spacing.lg,
        marginBottom: mxTheme.spacing.lg,
      }}
    >
      <Text style={{ color: tokens.accent, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        Theme token preview
      </Text>
      <Text style={{ color: tokens.text, fontSize: 18, fontWeight: '900', marginTop: 7 }}>
        {describeUiLayoutThemeTokens(tokens)}
      </Text>
      <Text style={{ color: tokens.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
        These tokens are the next bridge from saved layout/style preferences into real dashboard card styling.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <TokenSwatch label="Accent" value={tokens.accent} />
        <TokenSwatch label="Accent Soft" value={tokens.accentSoft} />
        <TokenSwatch label="Border" value={tokens.border} />
        <TokenSwatch label="Surface" value={tokens.surface} />
        <TokenSwatch label="Raised" value={tokens.surfaceRaised} />
        <TokenSwatch label="Glow" value={tokens.glowShadow} />
      </View>
    </View>
  );
}
