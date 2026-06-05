import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MXGeneratedAdapterBundleSummary } from './mxMagneticAdapterTypes';
import { createMagneticReviewRecord, type MXMagneticDownloadableBundle, type MXMagneticDownloadableBundleStatus, type MXMagneticReviewAuditRecord, type MXMagneticReviewQueueLane, type MXMagneticReviewRecord, type MXMagneticReviewStatus, type MXMagneticReviewQueueSummary } from './magneticReviewQueueModel';

export type MXMagneticReviewApiOptions = {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
};

export type MXMagneticReviewSubmitInput = {
  summary: MXGeneratedAdapterBundleSummary;
  readyCount: number;
  totalCount: number;
};

export type MXMagneticReviewUpdateInput = {
  lane?: MXMagneticReviewQueueLane;
  status?: MXMagneticReviewStatus;
  reviewOwner?: string;
  rejectionReason?: string;
  notes?: string[];
  marketplaceListingId?: string;
  downloadableBundleId?: string;
};

export type MXMagneticBundleCreateInput = {
  outputFormat?: 'zip';
  requestedFileName?: string;
  includeManifest?: boolean;
  includeCards?: boolean;
  includeComponents?: boolean;
  includeTokens?: boolean;
  includeAuditSummary?: boolean;
  notes?: string[];
};

export type MXMagneticBundleUpdateInput = {
  status?: MXMagneticDownloadableBundleStatus;
  storagePath?: string;
  downloadUrl?: string;
  fileSizeBytes?: number;
  checksumSha256?: string;
  failureReason?: string;
  notes?: string[];
};

const TOKEN_KEYS = ['mx.authToken', 'authToken', 'accessToken', 'token'];

function trimSlashes(value: string) {
  return value.replace(/\/+$/g, '');
}

function getEnvApiBaseUrl() {
  const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;
  return env.EXPO_PUBLIC_API_URL || env.REACT_APP_API_URL || '';
}

function getApiBaseUrl(options: MXMagneticReviewApiOptions = {}) {
  return trimSlashes(options.baseUrl || getEnvApiBaseUrl());
}

async function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    const token = await AsyncStorage.getItem(key);
    if (token) return token;
  }
  return null;
}

async function getHeaders(options: MXMagneticReviewApiOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = options.authToken || await getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }

  return data as T;
}

function getFetch(options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (!fetchImpl) {
    throw new Error('A fetch implementation is required for MX Magnetic review queue API calls.');
  }
  return fetchImpl;
}

export async function submitPreparedMagneticReviewRecord(record: MXMagneticReviewRecord, options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = getFetch(options);
  const baseUrl = getApiBaseUrl(options);

  const response = await fetchImpl(`${baseUrl}/style-packs/styling-engine/review-records`, {
    method: 'POST',
    headers: await getHeaders(options),
    body: JSON.stringify(record),
  });

  return parseJsonResponse<MXMagneticReviewRecord>(response);
}

export async function submitMagneticReviewRecord(input: MXMagneticReviewSubmitInput, options: MXMagneticReviewApiOptions = {}) {
  const record = createMagneticReviewRecord(input.summary, input.readyCount, input.totalCount);
  return submitPreparedMagneticReviewRecord(record, options);
}

export async function listMagneticReviewRecords(filters: { lane?: string; status?: string } = {}, options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = getFetch(options);
  const baseUrl = getApiBaseUrl(options);
  const params = new URLSearchParams();
  if (filters.lane) params.set('lane', filters.lane);
  if (filters.status) params.set('status', filters.status);
  const query = params.toString();

  const response = await fetchImpl(`${baseUrl}/style-packs/styling-engine/review-records${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: await getHeaders(options),
  });

  return parseJsonResponse<MXMagneticReviewRecord[]>(response);
}

export async function listMagneticReviewAuditHistory(recordId: string, options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = getFetch(options);
  const baseUrl = getApiBaseUrl(options);

  const response = await fetchImpl(`${baseUrl}/style-packs/styling-engine/review-records/${recordId}/audit-history`, {
    method: 'GET',
    headers: await getHeaders(options),
  });

  return parseJsonResponse<MXMagneticReviewAuditRecord[]>(response);
}

export async function listMagneticDownloadableBundles(recordId: string, options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = getFetch(options);
  const baseUrl = getApiBaseUrl(options);

  const response = await fetchImpl(`${baseUrl}/style-packs/styling-engine/review-records/${recordId}/bundles`, {
    method: 'GET',
    headers: await getHeaders(options),
  });

  return parseJsonResponse<MXMagneticDownloadableBundle[]>(response);
}

export async function createMagneticDownloadableBundle(recordId: string, body: MXMagneticBundleCreateInput = {}, options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = getFetch(options);
  const baseUrl = getApiBaseUrl(options);

  const response = await fetchImpl(`${baseUrl}/style-packs/styling-engine/review-records/${recordId}/bundles`, {
    method: 'POST',
    headers: await getHeaders(options),
    body: JSON.stringify({
      outputFormat: 'zip',
      includeManifest: true,
      includeCards: true,
      includeComponents: true,
      includeTokens: true,
      includeAuditSummary: true,
      ...body,
    }),
  });

  return parseJsonResponse<MXMagneticDownloadableBundle>(response);
}

export async function updateMagneticDownloadableBundle(bundleId: string, body: MXMagneticBundleUpdateInput, options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = getFetch(options);
  const baseUrl = getApiBaseUrl(options);

  const response = await fetchImpl(`${baseUrl}/style-packs/styling-engine/bundles/${bundleId}`, {
    method: 'PATCH',
    headers: await getHeaders(options),
    body: JSON.stringify(body),
  });

  return parseJsonResponse<MXMagneticDownloadableBundle>(response);
}

export async function getMagneticReviewQueueSummary(options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = getFetch(options);
  const baseUrl = getApiBaseUrl(options);

  const response = await fetchImpl(`${baseUrl}/style-packs/styling-engine/review-records/summary`, {
    method: 'GET',
    headers: await getHeaders(options),
  });

  return parseJsonResponse<MXMagneticReviewQueueSummary>(response);
}

export async function updateMagneticReviewRecord(recordId: string, body: MXMagneticReviewUpdateInput, options: MXMagneticReviewApiOptions = {}) {
  const fetchImpl = getFetch(options);
  const baseUrl = getApiBaseUrl(options);

  const response = await fetchImpl(`${baseUrl}/style-packs/styling-engine/review-records/${recordId}`, {
    method: 'PATCH',
    headers: await getHeaders(options),
    body: JSON.stringify(body),
  });

  return parseJsonResponse<MXMagneticReviewRecord>(response);
}

export function createMagneticReviewRecordPayload(input: MXMagneticReviewSubmitInput) {
  return createMagneticReviewRecord(input.summary, input.readyCount, input.totalCount);
}
