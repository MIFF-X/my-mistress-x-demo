import type { UiLayoutAudience, UiLayoutPresetId } from './layoutPresets';
import type { UiLayoutStylePack } from './uiLayoutStylePacks';

export type UiLayoutCustomRequestStatus = 'draft' | 'ready' | 'submitted' | 'quoted' | 'parked';

export type UiLayoutCustomRequest = {
  id: string;
  userId: string;
  audience: UiLayoutAudience;
  presetId: UiLayoutPresetId;
  requestedPackId: string;
  title: string;
  brandWords: string[];
  requiredModules: string[];
  colourNotes: string;
  inspirationNotes: string;
  budgetLabel: string;
  status: UiLayoutCustomRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateUiLayoutCustomRequestInput = {
  userId: string;
  audience: UiLayoutAudience;
  presetId: UiLayoutPresetId;
  pack: UiLayoutStylePack;
  brandWords?: string[];
  requiredModules?: string[];
  colourNotes?: string;
  inspirationNotes?: string;
  budgetLabel?: string;
};

const memoryCustomRequests: Record<string, UiLayoutCustomRequest[]> = {};

function requestKey(userId: string, audience: UiLayoutAudience) {
  return `mx.ui.layout.customRequests.${audience}.${userId}`;
}

function createRequestId(userId: string, packId: string) {
  return `ui-custom-${userId}-${packId}-${Date.now()}`.replace(/[^a-zA-Z0-9-_]/g, '-');
}

export function createUiLayoutCustomRequest(input: CreateUiLayoutCustomRequestInput): UiLayoutCustomRequest {
  const now = new Date().toISOString();
  const key = requestKey(input.userId, input.audience);
  const request: UiLayoutCustomRequest = {
    id: createRequestId(input.userId, input.pack.id),
    userId: input.userId,
    audience: input.audience,
    presetId: input.presetId,
    requestedPackId: input.pack.id,
    title: `${input.pack.title} custom request`,
    brandWords: input.brandWords || ['custom', 'layout', 'Mistress-X'],
    requiredModules: input.requiredModules || input.pack.compatiblePresets.map((preset) => preset.replace(/-/g, ' ')),
    colourNotes: input.colourNotes || `Use ${input.pack.accent} as the first accent reference.`,
    inspirationNotes: input.inspirationNotes || 'Add screenshots, brand notes and preferred dashboard modules in the future request form.',
    budgetLabel: input.budgetLabel || input.pack.priceLabel,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  memoryCustomRequests[key] = [request, ...(memoryCustomRequests[key] || [])];
  return request;
}

export function listUiLayoutCustomRequests(userId: string, audience: UiLayoutAudience) {
  return memoryCustomRequests[requestKey(userId, audience)] || [];
}

export function updateUiLayoutCustomRequestStatus(
  userId: string,
  audience: UiLayoutAudience,
  requestId: string,
  status: UiLayoutCustomRequestStatus,
) {
  const key = requestKey(userId, audience);
  memoryCustomRequests[key] = (memoryCustomRequests[key] || []).map((request) =>
    request.id === requestId ? { ...request, status, updatedAt: new Date().toISOString() } : request,
  );

  return memoryCustomRequests[key].find((request) => request.id === requestId) || null;
}
