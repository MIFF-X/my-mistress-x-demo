import type { UiLayoutPreset, UiLayoutSurface } from './layoutPresets';

export type ResponsiveBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export type ResponsiveDashboardShell = {
  breakpoint: ResponsiveBreakpoint;
  surface: UiLayoutSurface;
  navigation: 'bottom-tabs' | 'collapsed-rail' | 'sidebar';
  columns: number;
  showRightRail: boolean;
  cardFlow: 'stacked' | 'grid' | 'carousel';
  density: 'compact' | 'comfortable' | 'command';
};

export const RESPONSIVE_DASHBOARD_SHELLS: ResponsiveDashboardShell[] = [
  {
    breakpoint: 'mobile',
    surface: 'app',
    navigation: 'bottom-tabs',
    columns: 1,
    showRightRail: false,
    cardFlow: 'stacked',
    density: 'compact',
  },
  {
    breakpoint: 'tablet',
    surface: 'tablet',
    navigation: 'collapsed-rail',
    columns: 2,
    showRightRail: false,
    cardFlow: 'grid',
    density: 'comfortable',
  },
  {
    breakpoint: 'desktop',
    surface: 'web',
    navigation: 'sidebar',
    columns: 4,
    showRightRail: true,
    cardFlow: 'grid',
    density: 'command',
  },
  {
    breakpoint: 'wide',
    surface: 'web',
    navigation: 'sidebar',
    columns: 5,
    showRightRail: true,
    cardFlow: 'grid',
    density: 'command',
  },
];

export function getResponsiveDashboardShell(width: number): ResponsiveDashboardShell {
  if (width < 768) {
    return RESPONSIVE_DASHBOARD_SHELLS[0];
  }

  if (width < 1100) {
    return RESPONSIVE_DASHBOARD_SHELLS[1];
  }

  if (width < 1500) {
    return RESPONSIVE_DASHBOARD_SHELLS[2];
  }

  return RESPONSIVE_DASHBOARD_SHELLS[3];
}

export function describeLayoutForShell(preset: UiLayoutPreset, shell: ResponsiveDashboardShell) {
  const pattern = shell.surface === 'app' || shell.breakpoint === 'mobile'
    ? preset.appPattern
    : preset.webPattern;

  return {
    presetId: preset.id,
    title: preset.title,
    breakpoint: shell.breakpoint,
    navigation: shell.navigation,
    columns: shell.columns,
    showRightRail: shell.showRightRail,
    cardFlow: shell.cardFlow,
    density: shell.density,
    pattern,
  };
}
