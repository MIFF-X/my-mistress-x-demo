import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { UiLayoutPreset } from './layoutPresets';
import {
  describeLayoutForShell,
  RESPONSIVE_DASHBOARD_SHELLS,
  type ResponsiveDashboardShell,
} from './responsiveDashboardShell';

type UiLayoutPreviewFocus = 'all' | 'app' | 'web';

type UiLayoutPreviewCardsProps = {
  preset: UiLayoutPreset;
  defaultFocus?: UiLayoutPreviewFocus;
};

function shellLabel(shell: ResponsiveDashboardShell) {
  if (shell.breakpoint === 'mobile') return 'Mobile / App';
  if (shell.breakpoint === 'tablet') return 'Tablet';
  if (shell.breakpoint === 'desktop') return 'Desktop Web';
  return 'Wide Web';
}

function navigationLabel(shell: ResponsiveDashboardShell) {
  if (shell.navigation === 'bottom-tabs') return 'Bottom tabs';
  if (shell.navigation === 'collapsed-rail') return 'Collapsed rail';
  return 'Sidebar';
}

function filterShellsByFocus(focus: UiLayoutPreviewFocus) {
  if (focus === 'app') {
    return RESPONSIVE_DASHBOARD_SHELLS.filter((shell) => shell.breakpoint === 'mobile' || shell.breakpoint === 'tablet');
  }

  if (focus === 'web') {
    return RESPONSIVE_DASHBOARD_SHELLS.filter((shell) => shell.breakpoint === 'desktop' || shell.breakpoint === 'wide');
  }

  return RESPONSIVE_DASHBOARD_SHELLS;
}

function PreviewFocusButton({
  label,
  focus,
  activeFocus,
  accentColor,
  onPress,
}: {
  label: string;
  focus: UiLayoutPreviewFocus;
  activeFocus: UiLayoutPreviewFocus;
  accentColor: string;
  onPress: (focus: UiLayoutPreviewFocus) => void;
}) {
  const isActive = focus === activeFocus;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={() => onPress(focus)}
      style={{
        borderWidth: 1,
        borderColor: isActive ? accentColor : mxTheme.colors.border,
        borderRadius: 999,
        backgroundColor: isActive ? '#171717' : '#0d0d0d',
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: isActive ? accentColor : mxTheme.colors.muted, fontSize: 12, fontWeight: '900' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function PreviewSkeleton({ shell, accentColor }: { shell: ResponsiveDashboardShell; accentColor: string }) {
  const cardCount = Math.min(shell.columns + 1, 5);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: `${accentColor}66`,
        borderRadius: mxTheme.radius.md,
        backgroundColor: '#070707',
        padding: 10,
        marginTop: 12,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 7, minHeight: 66 }}>
        {shell.navigation !== 'bottom-tabs' ? (
          <View
            style={{
              width: shell.navigation === 'sidebar' ? 36 : 16,
              borderRadius: 8,
              backgroundColor: `${accentColor}33`,
            }}
          />
        ) : null}

        <View style={{ flex: 1 }}>
          <View style={{ height: 10, width: '64%', borderRadius: 999, backgroundColor: `${accentColor}77`, marginBottom: 8 }} />
          <View style={{ flexDirection: shell.cardFlow === 'stacked' ? 'column' : 'row', flexWrap: 'wrap', gap: 6 }}>
            {Array.from({ length: cardCount }).map((_, index) => (
              <View
                key={`${shell.breakpoint}-preview-card-${index}`}
                style={{
                  height: shell.cardFlow === 'stacked' ? 18 : 26,
                  flexBasis: shell.cardFlow === 'stacked' ? '100%' : `${Math.max(18, 80 / shell.columns)}%`,
                  flexGrow: 1,
                  borderRadius: 7,
                  backgroundColor: index === 0 ? `${accentColor}55` : '#1a1a1a',
                  borderWidth: 1,
                  borderColor: index === 0 ? `${accentColor}88` : '#242424',
                }}
              />
            ))}
          </View>
        </View>

        {shell.showRightRail ? (
          <View
            style={{
              width: 28,
              borderRadius: 8,
              backgroundColor: '#141414',
              borderWidth: 1,
              borderColor: '#2a2a2a',
            }}
          />
        ) : null}
      </View>

      {shell.navigation === 'bottom-tabs' ? (
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 9 }}>
          {['', '', '', ''].map((_, index) => (
            <View
              key={`bottom-tab-${index}`}
              style={{ flex: 1, height: 7, borderRadius: 999, backgroundColor: index === 0 ? accentColor : '#242424' }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function UiLayoutPreviewCards({ preset, defaultFocus = 'all' }: UiLayoutPreviewCardsProps) {
  const [activeFocus, setActiveFocus] = useState<UiLayoutPreviewFocus>(defaultFocus);
  const focusedShells = useMemo(() => filterShellsByFocus(activeFocus), [activeFocus]);

  return (
    <View style={{ marginTop: mxTheme.spacing.lg }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 10 }}>
        Responsive previews
      </Text>
      <Text style={{ color: mxTheme.colors.muted, lineHeight: 19, marginBottom: 12 }}>
        See how this layout changes across app, tablet and web surfaces before applying it.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: mxTheme.spacing.md }}>
        <PreviewFocusButton label="All previews" focus="all" activeFocus={activeFocus} accentColor={preset.accent} onPress={setActiveFocus} />
        <PreviewFocusButton label="App only" focus="app" activeFocus={activeFocus} accentColor={preset.accent} onPress={setActiveFocus} />
        <PreviewFocusButton label="Web only" focus="web" activeFocus={activeFocus} accentColor={preset.accent} onPress={setActiveFocus} />
      </View>

      {focusedShells.map((shell) => {
        const description = describeLayoutForShell(preset, shell);

        return (
          <View
            key={`preview-${preset.id}-${shell.breakpoint}`}
            style={{
              borderWidth: 1,
              borderColor: mxTheme.colors.border,
              borderRadius: mxTheme.radius.lg,
              backgroundColor: mxTheme.colors.surface,
              padding: mxTheme.spacing.md,
              marginBottom: mxTheme.spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: preset.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }}>
                  {shellLabel(shell)}
                </Text>
                <Text style={{ color: mxTheme.colors.text, fontSize: 15, fontWeight: '900', marginTop: 4 }}>
                  {navigationLabel(shell)} · {shell.columns} column{shell.columns === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>
                {shell.cardFlow}
              </Text>
            </View>

            <PreviewSkeleton shell={shell} accentColor={preset.accent} />

            <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 10 }}>
              {description.pattern}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
