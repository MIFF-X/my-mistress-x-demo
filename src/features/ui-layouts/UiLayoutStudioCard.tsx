import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { DashboardRole } from '../dashboard/widgets/dashboardWidgetRegistry';
import { getUiLayoutPreset } from './layoutPresets';
import {
  createDashboardUiLayoutBridgeState,
  getUiLayoutDashboardSubtitle,
} from './dashboardUiLayoutBridge';

type UiLayoutStudioCardProps = {
  userId?: string;
  role?: DashboardRole | string;
  width?: number;
  onPress?: () => void;
};

export function UiLayoutStudioCard({ userId, role, width = 390, onPress }: UiLayoutStudioCardProps) {
  const bridgeState = useMemo(
    () => createDashboardUiLayoutBridgeState({ userId, role, width }),
    [userId, role, width],
  );
  const preset = getUiLayoutPreset(bridgeState.activePresetId as never);
  const accentColor = preset?.accent || mxTheme.colors.accent;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: accentColor,
        borderRadius: mxTheme.radius.lg,
        backgroundColor: '#111111',
        padding: mxTheme.spacing.lg,
        marginBottom: mxTheme.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: mxTheme.radius.md,
            borderWidth: 1,
            borderColor: `${accentColor}99`,
            backgroundColor: '#080808',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>{preset?.icon || '🎛️'}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900' }}>
            UI Layout Studio
          </Text>
          <Text style={{ color: mxTheme.colors.muted, marginTop: 4, fontSize: 12, lineHeight: 17 }}>
            {getUiLayoutDashboardSubtitle(bridgeState)}
          </Text>
          <Text style={{ color: accentColor, marginTop: 5, fontSize: 11, fontWeight: '900' }}>
            {preset?.title || 'Choose layout'} · web + app responsive modes
          </Text>
        </View>

        <Text style={{ color: accentColor, fontSize: 11, fontWeight: '900' }}>
          OPEN
        </Text>
      </View>
    </Pressable>
  );
}
