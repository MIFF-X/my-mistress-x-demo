import {
  DashboardLayoutPreset,
  DashboardRole,
  DashboardWidgetLayoutItem,
  normalizeDashboardLayout,
} from './dashboardWidgetRegistry';

type BrowserStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type StoredDashboardLayout = {
  items: DashboardWidgetLayoutItem[];
  locked: boolean;
  preset: DashboardLayoutPreset;
  updatedAt: string;
};

const memoryLayouts: Record<string, StoredDashboardLayout> = {};

function storageKey(userId: string, role: DashboardRole) {
  return `mx.dashboard.layout.${role}.${userId}`;
}

function browserStorage(): BrowserStorage | null {
  const candidate = globalThis as unknown as { localStorage?: BrowserStorage };
  return candidate.localStorage || null;
}

export function loadDashboardLayoutState(userId: string, role: DashboardRole): StoredDashboardLayout | null {
  const key = storageKey(userId, role);
  const fallback = memoryLayouts[key] || null;

  try {
    const storedValue = browserStorage()?.getItem(key);
    if (!storedValue) return fallback;
    const parsed = JSON.parse(storedValue) as Partial<StoredDashboardLayout>;
    if (!Array.isArray(parsed.items)) return fallback;
    return {
      items: normalizeDashboardLayout(parsed.items, role),
      locked: Boolean(parsed.locked),
      preset: parsed.preset || 'role-default',
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return fallback;
  }
}

export function saveDashboardLayoutState(userId: string, role: DashboardRole, state: Omit<StoredDashboardLayout, 'updatedAt'>) {
  const key = storageKey(userId, role);
  const storedLayout: StoredDashboardLayout = {
    ...state,
    items: normalizeDashboardLayout(state.items, role),
    updatedAt: new Date().toISOString(),
  };
  memoryLayouts[key] = storedLayout;

  try {
    browserStorage()?.setItem(key, JSON.stringify(storedLayout));
  } catch {
    // The in-memory copy keeps the current session usable when persistent storage is unavailable.
  }

  return storedLayout;
}

export function clearDashboardLayoutState(userId: string, role: DashboardRole) {
  const key = storageKey(userId, role);
  delete memoryLayouts[key];

  try {
    browserStorage()?.removeItem(key);
  } catch {
    // Ignore storage failures; the caller will load a fresh preset.
  }
}
