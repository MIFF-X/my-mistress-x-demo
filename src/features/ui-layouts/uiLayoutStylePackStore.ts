import type { UiLayoutAudience } from './layoutPresets';
import type { UiLayoutStylePack } from './uiLayoutStylePacks';
import { UI_LAYOUT_STYLE_PACKS, getInstalledUiLayoutStylePacks } from './uiLayoutStylePacks';

type BrowserStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type StoredUiLayoutStylePackPreference = {
  packId: string;
  audience: UiLayoutAudience;
  updatedAt: string;
};

const memoryStylePacks: Record<string, StoredUiLayoutStylePackPreference> = {};

function storageKey(userId: string, audience: UiLayoutAudience) {
  return `mx.ui.layout.stylePack.${audience}.${userId}`;
}

function browserStorage(): BrowserStorage | null {
  const candidate = globalThis as unknown as { localStorage?: BrowserStorage };
  return candidate.localStorage || null;
}

function findPack(packId: string): UiLayoutStylePack | undefined {
  return UI_LAYOUT_STYLE_PACKS.find((pack) => pack.id === packId);
}

export function getDefaultUiLayoutStylePackId() {
  return getInstalledUiLayoutStylePacks()[0]?.id || 'default-dark';
}

export function canApplyUiLayoutStylePack(pack: UiLayoutStylePack) {
  return pack.status === 'installed' || pack.status === 'available';
}

export function loadUiLayoutStylePackPreference(
  userId: string,
  audience: UiLayoutAudience,
): StoredUiLayoutStylePackPreference {
  const key = storageKey(userId, audience);
  const fallback =
    memoryStylePacks[key] ||
    {
      packId: getDefaultUiLayoutStylePackId(),
      audience,
      updatedAt: new Date().toISOString(),
    };

  try {
    const storedValue = browserStorage()?.getItem(key);
    if (!storedValue) return fallback;
    const parsed = JSON.parse(storedValue) as Partial<StoredUiLayoutStylePackPreference>;
    if (!parsed.packId || !findPack(parsed.packId)) return fallback;

    return {
      packId: parsed.packId,
      audience,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return fallback;
  }
}

export function saveUiLayoutStylePackPreference(
  userId: string,
  audience: UiLayoutAudience,
  packId: string,
) {
  const pack = findPack(packId);
  if (!pack || !canApplyUiLayoutStylePack(pack)) {
    return loadUiLayoutStylePackPreference(userId, audience);
  }

  const key = storageKey(userId, audience);
  const storedPreference: StoredUiLayoutStylePackPreference = {
    packId,
    audience,
    updatedAt: new Date().toISOString(),
  };

  memoryStylePacks[key] = storedPreference;

  try {
    browserStorage()?.setItem(key, JSON.stringify(storedPreference));
  } catch {
    // Memory storage keeps native/dev surfaces usable when browser localStorage is not present.
  }

  return storedPreference;
}

export function clearUiLayoutStylePackPreference(userId: string, audience: UiLayoutAudience) {
  const key = storageKey(userId, audience);
  delete memoryStylePacks[key];

  try {
    browserStorage()?.removeItem(key);
  } catch {
    // Ignore storage failures; callers can fall back to the installed default pack.
  }
}
