import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssetPackCategory, AssetPackManifest, AssetPackTier } from './assetPackTypes';

export type StylingEngineBackendPack = {
  id: string;
  name: string;
  tier: AssetPackTier;
  category: AssetPackCategory;
  price: number;
  formats: string[];
  description: string;
  qualityMode: string;
  assets: Array<{ id: string; name: string; type: string; formats: string[]; tags: string[] }>;
};

export type StylingEngineCreateRequest = {
  name: string;
  category: AssetPackCategory;
  tier?: AssetPackTier;
  prompt?: string;
  styleGuide?: Record<string, unknown>;
  manifest?: Record<string, unknown>;
};

export type StylingEngineExportBundle = {
  packId: string;
  packName: string;
  exportedAt: string;
  bundleName: string;
  manifestPath: string;
  svgRoot: string;
  formats: string[];
  readyForDownload: boolean;
  nextStep: string;
  magneticConnector: {
    featureKey: string;
    event: string;
  };
};

// Asset-bundle backend (3-tier item → set → bundle) — the Magnetic-backed pack store.
export type AssetBundleSummary = {
  id: string;
  name: string;
  description?: string | null;
  tier: string;
  creditCost: number;
  marketSection?: string | null;
  status: string;
  bundleSets?: Array<{ set?: { id: string; name: string; members?: unknown[] } }>;
};

const TOKEN_KEYS = ['mx.authToken', 'authToken', 'accessToken', 'token'];

function getApiBaseUrl() {
  const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;
  return (env.EXPO_PUBLIC_API_URL || env.REACT_APP_API_URL || '').replace(/\/$/, '');
}

async function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    const token = await AsyncStorage.getItem(key);
    if (token) return token;
  }
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Styling Engine request failed with ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }

  return data as T;
}

export const stylingEngineApi = {
  listPacks(filters: { tier?: string; category?: string } = {}) {
    const query = new URLSearchParams();
    if (filters.tier && filters.tier !== 'all') query.set('tier', filters.tier);
    if (filters.category && filters.category !== 'all') query.set('category', filters.category);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<StylingEngineBackendPack[]>(`/style-packs/styling-engine/packs${suffix}`);
  },

  createPack(body: StylingEngineCreateRequest) {
    return request<Record<string, unknown>>('/style-packs/styling-engine/packs', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  previewPack(packId: string) {
    return request<StylingEngineBackendPack & { magneticConnector?: Record<string, unknown> }>(`/style-packs/styling-engine/packs/${encodeURIComponent(packId)}/preview`);
  },

  exportPack(packId: string) {
    return request<StylingEngineExportBundle>(`/style-packs/styling-engine/packs/${encodeURIComponent(packId)}/export`, {
      method: 'POST',
    });
  },

  createFromManifest(manifest: AssetPackManifest) {
    return this.createPack({
      name: manifest.name,
      category: manifest.category,
      tier: manifest.tier,
      prompt: manifest.description,
      manifest: manifest as unknown as Record<string, unknown>,
      styleGuide: {
        theme: manifest.theme,
        qualityMode: manifest.qualityMode,
        formats: manifest.formats,
      },
    });
  },

  // ── Asset-bundle backend (Magnetic feature: mistress-x-asset-bundles) ──────
  listAssetBundles(filters: { tier?: string; marketSection?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (filters.tier && filters.tier !== 'all') query.set('tier', filters.tier);
    if (filters.marketSection) query.set('marketSection', filters.marketSection);
    if (filters.status) query.set('status', filters.status);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<AssetBundleSummary[]>(`/asset-bundles${suffix}`);
  },

  getAssetBundle(bundleId: string) {
    return request<AssetBundleSummary>(`/asset-bundles/${encodeURIComponent(bundleId)}`);
  },

  importAssetBundleManifest(body: { bundle: Record<string, unknown>; sets: unknown[] }) {
    return request<{ bundleId: string; totalSets: number; totalItems: number }>('/asset-bundles/import', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
