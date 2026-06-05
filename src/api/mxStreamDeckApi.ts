import { apiRequest } from './apiClient';

export type MxStreamDeckRole = 'MISTRESS' | 'SUB' | 'HEADMISTRESS';

export type MxStreamDeckSetupSession = {
  id: string;
  pluginId: 'mx-stream-deck';
  role: MxStreamDeckRole;
  status: 'pending' | 'approved' | 'expired' | 'revoked';
  setupUrl: string;
  webFallbackRoute: string;
  qrSvg: string;
  qrSvgDataUri: string;
  qrImageUrl: string;
  deviceId: string | null;
  deviceLabel: string | null;
  platform: string | null;
  createdAt: string;
  expiresAt: string;
  approvedAt: string | null;
  token: string | null;
  requiredClaims: string[];
};

export type MxStreamDeckSavedButton = {
  id: string;
  pluginId: 'mx-stream-deck';
  role: MxStreamDeckRole;
  label: string;
  group: string;
  action: string;
  tone: string;
  payload: Record<string, unknown>;
  sortOrder: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MxStreamDeckDevice = {
  id: string;
  pluginId: 'mx-stream-deck';
  ownerUserId: string;
  role: MxStreamDeckRole;
  deviceLabel: string | null;
  platform: string | null;
  status: string;
  pairedSetupSessionId: string | null;
  metadata: Record<string, unknown>;
  pairedAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MxStreamDeckQueuedAction = {
  id: string;
  pluginId: 'mx-stream-deck';
  role: MxStreamDeckRole;
  action: string;
  status: 'queued';
  contractKey: string | null;
  guardedDispatch: boolean;
  dispatchStatus: string;
  executionStatus: string;
  executionMessage?: string | null;
  contractEvent: Record<string, unknown> | null;
  dispatchedAt: string | null;
  executedAt: string | null;
  queuedAt: string;
};

export type MxStreamDeckActionLog = {
  id: string;
  pluginId: 'mx-stream-deck';
  ownerUserId: string;
  role: MxStreamDeckRole;
  buttonId: string | null;
  deviceId: string | null;
  targetUserId: string | null;
  label: string;
  group: string;
  action: string;
  payload: Record<string, unknown>;
  contractKey: string | null;
  guardedDispatch: boolean;
  dispatchStatus: string;
  executionStatus: string;
  executionMessage: string | null;
  contractEvent: Record<string, unknown> | null;
  dispatchedAt: string | null;
  executedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MxStreamDeckAdminReview = {
  pluginId: 'mx-stream-deck';
  setupSessions: MxStreamDeckSetupSession[];
  devices: MxStreamDeckDevice[];
  buttons: MxStreamDeckSavedButton[];
  actionLogs: MxStreamDeckActionLog[];
  summary: {
    setupSessions: number;
    devices: number;
    buttons: number;
    actionLogs: number;
  };
};

export type MxStreamDeckActionRetentionResult = {
  pluginId: 'mx-stream-deck';
  olderThanDays: number;
  cutoff: string;
  statuses: string[];
  matchedActionLogs: number;
  deletedActionLogs: number;
  dryRun: boolean;
  ranAt: string;
};

export function createMxStreamDeckSetupSession(body: {
  role: MxStreamDeckRole;
  deviceLabel?: string;
  platform?: string;
}) {
  return apiRequest<MxStreamDeckSetupSession>('/plugins/mx-stream-deck/setup-sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listMxStreamDeckButtons(role: MxStreamDeckRole) {
  return apiRequest<MxStreamDeckSavedButton[]>(`/plugins/mx-stream-deck/buttons?role=${encodeURIComponent(role)}`);
}

export function listMxStreamDeckDevices() {
  return apiRequest<MxStreamDeckDevice[]>('/plugins/mx-stream-deck/devices');
}

export function saveMxStreamDeckButton(body: {
  role: MxStreamDeckRole;
  label: string;
  group?: string;
  action: string;
  tone?: string;
  payload?: Record<string, unknown>;
  sortOrder?: number;
}) {
  return apiRequest<MxStreamDeckSavedButton>('/plugins/mx-stream-deck/buttons', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function queueMxStreamDeckAction(body: {
  role: MxStreamDeckRole;
  buttonId?: string;
  deviceId?: string;
  label?: string;
  group?: string;
  action: string;
  payload?: Record<string, unknown>;
  targetUserId?: string;
}) {
  return apiRequest<MxStreamDeckQueuedAction>('/plugins/mx-stream-deck/actions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listMxStreamDeckActions(params: {
  role?: MxStreamDeckRole;
  contractKey?: string;
  executionStatus?: string;
  take?: number;
} = {}) {
  const search = new URLSearchParams();
  if (params.role) search.set('role', params.role);
  if (params.contractKey) search.set('contractKey', params.contractKey);
  if (params.executionStatus) search.set('executionStatus', params.executionStatus);
  if (params.take) search.set('take', String(params.take));
  const query = search.toString();
  return apiRequest<MxStreamDeckActionLog[]>(`/plugins/mx-stream-deck/actions${query ? `?${query}` : ''}`);
}

export function dispatchMxStreamDeckAction(actionId: string, body: {
  mode?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
} = {}) {
  return apiRequest<MxStreamDeckActionLog>(`/plugins/mx-stream-deck/actions/${encodeURIComponent(actionId)}/dispatch`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateMxStreamDeckActionStatus(actionId: string, body: {
  status: 'accepted' | 'completed' | 'rejected' | 'failed';
  message?: string;
  evidence?: Record<string, unknown>;
  downstreamId?: string;
}) {
  return apiRequest<MxStreamDeckActionLog>(`/plugins/mx-stream-deck/actions/${encodeURIComponent(actionId)}/status`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getMxStreamDeckAdminReview(params: { role?: MxStreamDeckRole; status?: string; take?: number } = {}) {
  const search = new URLSearchParams();
  if (params.role) search.set('role', params.role);
  if (params.status) search.set('status', params.status);
  if (params.take) search.set('take', String(params.take));
  const query = search.toString();
  return apiRequest<MxStreamDeckAdminReview>(`/plugins/mx-stream-deck/admin/review${query ? `?${query}` : ''}`);
}

export function expireMxStreamDeckSetupSessions() {
  return apiRequest<{
    pluginId: 'mx-stream-deck';
    expiredSetupSessions: number;
    memoryExpired: number;
    ranAt: string;
  }>('/plugins/mx-stream-deck/admin/retention/expire-setup-sessions', {
    method: 'POST',
  });
}

export function cleanupMxStreamDeckActionLogs(body: {
  olderThanDays?: number;
  executionStatus?: string;
  dryRun?: boolean;
} = {}) {
  return apiRequest<MxStreamDeckActionRetentionResult>('/plugins/mx-stream-deck/admin/retention/action-logs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
