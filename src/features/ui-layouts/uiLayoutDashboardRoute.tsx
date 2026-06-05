import React from 'react';
import type { DashboardRole } from '../dashboard/widgets/dashboardWidgetRegistry';
import { UiLayoutStudioLauncher } from './UiLayoutStudioLauncher';
import { useUiLayoutSurfaceWidth } from './useUiLayoutSurfaceWidth';

type UiLayoutDashboardRouteProps = {
  userId?: string;
  role?: DashboardRole | string;
  width?: number;
  onSaved?: () => void;
};

export function UiLayoutDashboardRoute({
  userId = 'anonymous',
  role,
  width,
  onSaved,
}: UiLayoutDashboardRouteProps) {
  const detectedWidth = useUiLayoutSurfaceWidth(width || 390);

  return (
    <UiLayoutStudioLauncher
      userId={userId}
      role={role}
      width={width || detectedWidth}
      startOpen
      onSaved={onSaved}
    />
  );
}
