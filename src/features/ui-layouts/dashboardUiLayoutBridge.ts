import type { DashboardRole } from '../dashboard/widgets/dashboardWidgetRegistry';
import type { UiLayoutAudience } from './layoutPresets';
import { defaultUiLayoutPresetForAudience, loadUiLayoutPreference } from './uiLayoutStore';

export type DashboardUiLayoutBridgeInput = {
  userId?: string;
  role?: DashboardRole | string;
  width?: number;
};

export type DashboardUiLayoutBridgeState = {
  userId: string;
  audience: UiLayoutAudience;
  activePresetId: string;
  isLocked: boolean;
  width: number;
};

export function mapDashboardRoleToUiLayoutAudience(role?: DashboardRole | string): UiLayoutAudience {
  if (role === 'HEADMISTRESS') return 'HEADMISTRESS';
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'MISTRESS') return 'MISTRESS';
  if (role === 'SUB') return 'SUB';
  return 'ALL';
}

export function createDashboardUiLayoutBridgeState({
  userId = 'anonymous',
  role,
  width = 390,
}: DashboardUiLayoutBridgeInput): DashboardUiLayoutBridgeState {
  const audience = mapDashboardRoleToUiLayoutAudience(role);
  const preference = loadUiLayoutPreference(userId, audience);

  return {
    userId,
    audience,
    activePresetId: preference.presetId || defaultUiLayoutPresetForAudience(audience),
    isLocked: preference.locked,
    width,
  };
}

export function getUiLayoutDashboardSubtitle(state: DashboardUiLayoutBridgeState) {
  return `${state.audience} layout | ${state.activePresetId.replace(/-/g, ' ')} | ${state.isLocked ? 'locked' : 'editable'}`;
}
