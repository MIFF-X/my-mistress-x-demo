import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { DashboardRole } from '../dashboard/widgets/dashboardWidgetRegistry';
import { UiLayoutSelectorScreen } from './UiLayoutSelectorScreen';
import { UiLayoutStudioCard } from './UiLayoutStudioCard';
import { mapDashboardRoleToUiLayoutAudience } from './dashboardUiLayoutBridge';

type UiLayoutStudioLauncherProps = {
  userId?: string;
  role?: DashboardRole | string;
  width?: number;
  startOpen?: boolean;
  onSaved?: () => void;
};

export function UiLayoutStudioLauncher({
  userId = 'anonymous',
  role,
  width = 390,
  startOpen = false,
  onSaved,
}: UiLayoutStudioLauncherProps) {
  const [isOpen, setIsOpen] = useState(startOpen);
  const audience = mapDashboardRoleToUiLayoutAudience(role);

  if (!isOpen) {
    return <UiLayoutStudioCard userId={userId} role={role} width={width} onPress={() => setIsOpen(true)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: mxTheme.colors.background }}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: mxTheme.colors.border,
          backgroundColor: '#0d0d0d',
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900', fontSize: 16 }}>UI Layout Studio</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>
            {audience} · web/app layout selector
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsOpen(false)}
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: mxTheme.colors.border,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: '#111',
          }}
        >
          <Text style={{ color: mxTheme.colors.muted, fontWeight: '900', fontSize: 12 }}>Close</Text>
        </Pressable>
      </View>

      <UiLayoutSelectorScreen
        userId={userId}
        audience={audience}
        width={width}
        onSaved={() => {
          onSaved?.();
          setIsOpen(false);
        }}
      />
    </View>
  );
}
