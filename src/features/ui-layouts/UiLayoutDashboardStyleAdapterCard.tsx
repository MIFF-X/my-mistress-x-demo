import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { UiLayoutAudience } from './layoutPresets';
import { createUiLayoutDashboardStyleAdapter } from './uiLayoutDashboardStyleAdapter';

type UiLayoutDashboardStyleAdapterCardProps = {
  userId: string;
  audience: UiLayoutAudience;
};

function MiniDashboardCard({
  title,
  subtitle,
  adapter,
}: {
  title: string;
  subtitle: string;
  adapter: ReturnType<typeof createUiLayoutDashboardStyleAdapter>;
}) {
  return (
    <View
      style={{
        backgroundColor: adapter.card.backgroundColor,
        borderColor: adapter.card.borderColor,
        borderRadius: adapter.card.borderRadius,
        borderWidth: 1,
        padding: adapter.spacing.cardPadding,
        flexBasis: 150,
        flexGrow: 1,
      }}
    >
      <Text style={{ color: adapter.text.accentColor, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        {title}
      </Text>
      <Text style={{ color: adapter.text.headingColor, fontSize: 15, fontWeight: '900', marginTop: 6 }}>
        {subtitle}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {['card', 'chip', 'glow'].map((label) => (
          <View
            key={`${title}-${label}`}
            style={{
              backgroundColor: adapter.chip.backgroundColor,
              borderColor: adapter.chip.borderColor,
              borderRadius: adapter.chip.borderRadius,
              borderWidth: 1,
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: adapter.text.accentColor, fontSize: 10, fontWeight: '800' }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function UiLayoutDashboardStyleAdapterCard({ userId, audience }: UiLayoutDashboardStyleAdapterCardProps) {
  const adapter = useMemo(() => createUiLayoutDashboardStyleAdapter(userId, audience), [audience, userId]);

  return (
    <View
      style={{
        backgroundColor: adapter.container.backgroundColor,
        borderColor: adapter.card.borderColor,
        borderRadius: adapter.card.borderRadius,
        borderWidth: 1,
        padding: adapter.spacing.cardPadding,
        marginBottom: mxTheme.spacing.lg,
      }}
    >
      <Text style={{ color: adapter.text.accentColor, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        Dashboard style adapter preview
      </Text>
      <Text style={{ color: adapter.text.headingColor, fontSize: 18, fontWeight: '900', marginTop: 7 }}>
        Cards, chips and spacing from the selected UI theme
      </Text>
      <Text style={{ color: adapter.text.mutedColor, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
        This preview shows how the saved layout and style pack can later drive actual dashboard card rendering.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: adapter.spacing.gap, marginTop: 12 }}>
        <MiniDashboardCard title="Priority" subtitle="Command card" adapter={adapter} />
        <MiniDashboardCard title="Widget" subtitle="Styled module" adapter={adapter} />
      </View>

      <Text style={{ color: adapter.text.mutedColor, fontSize: 11, marginTop: 12 }}>
        Density: {adapter.tokens.density} · Radius: {adapter.tokens.radiusMode} · Accent: {adapter.tokens.accent}
      </Text>
    </View>
  );
}
