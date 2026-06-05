import type { AppliedUiLayoutTheme } from './uiLayoutAppliedTheme';

export type UiLayoutThemeTokens = {
  accent: string;
  accentSoft: string;
  border: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  muted: string;
  glowShadow: string;
  radiusMode: 'soft' | 'sharp' | 'royal' | 'live';
  density: 'compact' | 'comfortable' | 'command';
};

function withAlpha(hex: string, alpha: string) {
  if (!hex.startsWith('#') || hex.length !== 7) return hex;
  return `${hex}${alpha}`;
}

function resolveRadiusMode(theme: AppliedUiLayoutTheme): UiLayoutThemeTokens['radiusMode'] {
  if (theme.presetId === 'vertical-live-room') return 'live';
  if (theme.tags.includes('command') || theme.tags.includes('admin')) return 'sharp';
  if (theme.tags.includes('gold') || theme.tags.includes('premium')) return 'royal';
  return 'soft';
}

function resolveDensity(theme: AppliedUiLayoutTheme): UiLayoutThemeTokens['density'] {
  if (theme.presetId === 'empire-command') return 'command';
  if (theme.presetId === 'vertical-live-room' || theme.presetId === 'sub-dashboard') return 'compact';
  return 'comfortable';
}

export function resolveUiLayoutThemeTokens(theme: AppliedUiLayoutTheme): UiLayoutThemeTokens {
  const accent = theme.accent || '#D4AF37';

  return {
    accent,
    accentSoft: withAlpha(accent, '66'),
    border: withAlpha(accent, '55'),
    surface: '#0d0d0d',
    surfaceRaised: '#151515',
    text: '#ffffff',
    muted: '#aaaaaa',
    glowShadow: withAlpha(accent, '33'),
    radiusMode: resolveRadiusMode(theme),
    density: resolveDensity(theme),
  };
}

export function describeUiLayoutThemeTokens(tokens: UiLayoutThemeTokens) {
  return `${tokens.density} density · ${tokens.radiusMode} corners · ${tokens.accent} accent`;
}
