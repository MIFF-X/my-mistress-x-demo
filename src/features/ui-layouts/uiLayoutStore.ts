import type { UiLayoutAudience, UiLayoutPresetId } from './layoutPresets';

type BrowserStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type StoredUiLayoutPreference = {
  presetId: UiLayoutPresetId;
  audience: UiLayoutAudience;
  locked: boolean;
  updatedAt: string;
};

const memoryPreferences: Record<string, StoredUiLayoutPreference> = {};

function storageKey(userId: string, audience: UiLayoutAudience) {
  return `mx.ui.layout.${audience}.${userId}`;
}

function browserStorage(): BrowserStorage | null {
  const candidate = globalThis as unknown as { localStorage?: BrowserStorage };
  return candidate.localStorage || null;
}

function isUiLayoutPresetId(value: unknown): value is UiLayoutPresetId {
  return (
    value === 'empire-command' ||
    value === 'mistress-creator' ||
    value === 'sub-dashboard' ||
    value === 'little-black-book' ||
    value === 'style-marketplace' ||
    value === 'vertical-live-room'
  );
}

export function defaultUiLayoutPresetForAudience(audience: UiLayoutAudience): UiLayoutPresetId {
  if (audience === 'HEADMISTRESS' || audience === 'ADMIN') return 'empire-command';
  if (audience === 'MISTRESS') return 'mistress-creator';
  if (audience === 'SUB') return 'sub-dashboard';
  return 'style-marketplace';
}

export function loadUiLayoutPreference(userId: string, audience: UiLayoutAudience): StoredUiLayoutPreference {
  const key = storageKey(userId, audience);
  const fallback =
    memoryPreferences[key] ||
    {
      presetId: defaultUiLayoutPresetForAudience(audience),
      audience,
      locked: false,
      updatedAt: new Date().toISOString(),
    };

  try {
    const storedValue = browserStorage()?.getItem(key);
    if (!storedValue) return fallback;
    const parsed = JSON.parse(storedValue) as Partial<StoredUiLayoutPreference>;
    if (!isUiLayoutPresetId(parsed.presetId)) return fallback;

    return {
      presetId: parsed.presetId,
      audience,
      locked: Boolean(parsed.locked),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return fallback;
  }
}

export function saveUiLayoutPreference(
  userId: string,
  audience: UiLayoutAudience,
  preference: Pick<StoredUiLayoutPreference, 'presetId' | 'locked'>,
) {
  const key = storageKey(userId, audience);
  const storedPreference: StoredUiLayoutPreference = {
    ...preference,
    audience,
    updatedAt: new Date().toISOString(),
  };

  memoryPreferences[key] = storedPreference;

  try {
    browserStorage()?.setItem(key, JSON.stringify(storedPreference));
  } catch {
    // Memory storage keeps app sessions usable on native/dev surfaces without browser localStorage.
  }

  return storedPreference;
}

export function clearUiLayoutPreference(userId: string, audience: UiLayoutAudience) {
  const key = storageKey(userId, audience);
  delete memoryPreferences[key];

  try {
    browserStorage()?.removeItem(key);
  } catch {
    // Ignore storage failures; callers can fall back to the role default.
  }
}
