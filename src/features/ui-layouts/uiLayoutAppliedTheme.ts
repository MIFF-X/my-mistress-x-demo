import type { UiLayoutAudience } from './layoutPresets';
import { getUiLayoutPreset, type UiLayoutPresetId } from './layoutPresets';
import { loadUiLayoutPreference } from './uiLayoutStore';
import { UI_LAYOUT_STYLE_PACKS } from './uiLayoutStylePacks';
import { loadUiLayoutStylePackPreference } from './uiLayoutStylePackStore';

export type AppliedUiLayoutTheme = {
  userId: string;
  audience: UiLayoutAudience;
  presetId: UiLayoutPresetId;
  presetTitle: string;
  stylePackId: string;
  stylePackTitle: string;
  accent: string;
  locked: boolean;
  shellLabel: string;
  tags: string[];
};

function findPack(packId: string) {
  return UI_LAYOUT_STYLE_PACKS.find((pack) => pack.id === packId) || UI_LAYOUT_STYLE_PACKS[0];
}

export function resolveAppliedUiLayoutTheme(userId: string, audience: UiLayoutAudience): AppliedUiLayoutTheme {
  const layoutPreference = loadUiLayoutPreference(userId, audience);
  const packPreference = loadUiLayoutStylePackPreference(userId, audience);
  const preset = getUiLayoutPreset(layoutPreference.presetId);
  const pack = findPack(packPreference.packId);

  return {
    userId,
    audience,
    presetId: layoutPreference.presetId,
    presetTitle: preset?.title || layoutPreference.presetId.replace(/-/g, ' '),
    stylePackId: packPreference.packId,
    stylePackTitle: pack?.title || packPreference.packId.replace(/-/g, ' '),
    accent: pack?.accent || preset?.accent || '#D4AF37',
    locked: layoutPreference.locked,
    shellLabel: preset?.surfaces.join(' / ') || 'web / app',
    tags: pack?.tags || [],
  };
}

export function describeAppliedUiLayoutTheme(theme: AppliedUiLayoutTheme) {
  return `${theme.presetTitle} + ${theme.stylePackTitle} · ${theme.locked ? 'locked' : 'editable'}`;
}
