import type { UiLayoutAudience } from './layoutPresets';
import { resolveAppliedUiLayoutTheme } from './uiLayoutAppliedTheme';
import { resolveUiLayoutThemeTokens, type UiLayoutThemeTokens } from './uiLayoutThemeTokens';

export type UiLayoutDashboardStyleAdapter = {
  tokens: UiLayoutThemeTokens;
  container: {
    backgroundColor: string;
  };
  card: {
    backgroundColor: string;
    borderColor: string;
    borderRadius: number;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
  };
  chip: {
    backgroundColor: string;
    borderColor: string;
    borderRadius: number;
  };
  text: {
    headingColor: string;
    bodyColor: string;
    mutedColor: string;
    accentColor: string;
  };
  spacing: {
    cardPadding: number;
    gap: number;
  };
};

function radiusValue(mode: UiLayoutThemeTokens['radiusMode']) {
  if (mode === 'sharp') return 10;
  if (mode === 'royal') return 18;
  if (mode === 'live') return 22;
  return 16;
}

function densitySpacing(density: UiLayoutThemeTokens['density']) {
  if (density === 'compact') return { cardPadding: 12, gap: 8 };
  if (density === 'command') return { cardPadding: 18, gap: 12 };
  return { cardPadding: 16, gap: 10 };
}

export function createUiLayoutDashboardStyleAdapter(
  userId: string,
  audience: UiLayoutAudience,
): UiLayoutDashboardStyleAdapter {
  const theme = resolveAppliedUiLayoutTheme(userId, audience);
  const tokens = resolveUiLayoutThemeTokens(theme);
  const radius = radiusValue(tokens.radiusMode);
  const spacing = densitySpacing(tokens.density);

  return {
    tokens,
    container: {
      backgroundColor: '#000000',
    },
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderColor: tokens.border,
      borderRadius: radius,
      shadowColor: tokens.accent,
      shadowOpacity: tokens.density === 'command' ? 0.2 : 0.12,
      shadowRadius: tokens.density === 'compact' ? 6 : 10,
    },
    chip: {
      backgroundColor: tokens.surface,
      borderColor: tokens.accentSoft,
      borderRadius: 999,
    },
    text: {
      headingColor: tokens.text,
      bodyColor: tokens.text,
      mutedColor: tokens.muted,
      accentColor: tokens.accent,
    },
    spacing,
  };
}
