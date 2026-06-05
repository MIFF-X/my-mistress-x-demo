import type { ActionButtonKey } from '../buttons/ActionButtonPack';
import type { DashboardRole } from '../dashboard/widgets/dashboardWidgetRegistry';

export const UI_LAYOUT_STUDIO_VIEW_KEY = 'uiLayoutStudio';
export const UI_LAYOUT_STUDIO_WIDGET_ID = 'ui-layout-studio';

export const UI_LAYOUT_STUDIO_ROLES: DashboardRole[] = ['HEADMISTRESS', 'MISTRESS', 'SUB', 'ADMIN'];

export const UI_LAYOUT_STUDIO_DASHBOARD_MODULE = {
  title: 'UI Layout Studio',
  subtitle: 'Choose web/app dashboard layouts, style modes, rails, bottom tabs and live-room surfaces',
  visual: 'uiLayoutStudio' as ActionButtonKey,
  view: UI_LAYOUT_STUDIO_VIEW_KEY,
  badgeOverride: 'LAYOUT',
};

export const UI_LAYOUT_STUDIO_WIDGET_DEFINITION = {
  id: UI_LAYOUT_STUDIO_WIDGET_ID,
  view: UI_LAYOUT_STUDIO_VIEW_KEY,
  title: 'UI Layout Studio',
  subtitle: 'Choose web/app dashboard layouts, style modes and responsive shells',
  icon: 'UI',
  badge: 'LAYOUT',
  roles: UI_LAYOUT_STUDIO_ROLES,
  source: 'core',
  defaultSize: 'wide',
};

export const UI_LAYOUT_STUDIO_INTEGRATION_NOTES = [
  'Add uiLayoutStudio to DashboardView unions in DashboardScreen and dashboardWidgetRegistry.',
  'Add UI_LAYOUT_STUDIO_DASHBOARD_MODULE to each role section where layout selection should appear.',
  'Register UI_LAYOUT_STUDIO_WIDGET_DEFINITION in the widget registry after style-packs.',
  'Render UiLayoutStudioLauncher for activeView === uiLayoutStudio.',
];
