import { apiRequest } from './apiClient';

export type AbacusTelemetryModelStats = {
  model: string;
  requests: number;
  errors: number;
  tokens: number;
  errorRate: number;
};

export type AbacusTelemetryRequestClassStats = {
  requestClass: string;
  requests: number;
  errors: number;
  errorRate: number;
};

export type AbacusTelemetryFailingPrompt = {
  promptPreview: string;
  count: number;
  latestError: string | null;
  latestAt: string | Date;
};

export type AbacusTelemetrySummary = {
  range: string;
  generatedAt: string;
  scope: 'global' | 'user' | string;
  totals: {
    requests: number;
    successes: number;
    errors: number;
    errorRate: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  latency: {
    p50Ms: number | null;
    p95Ms: number | null;
  };
  feedback: {
    total: number;
    positive: number;
    negative: number;
    coverageRate: number;
  };
  byModel: AbacusTelemetryModelStats[];
  byRequestClass: AbacusTelemetryRequestClassStats[];
  topFailingPrompts: AbacusTelemetryFailingPrompt[];
};

export type AbacusTelemetryExportRow = {
  requestId: string;
  createdAt: string | Date;
  provider: string;
  model: string | null;
  requestClass: string | null;
  status: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  latencyMs: number | null;
  feedbackSignal: string | null;
  feedbackReasonTags: unknown;
  feedbackCreatedAt: string | Date | null;
  promptPreview: string | null;
  responsePreview: string | null;
  errorMessage: string | null;
};

export type AbacusTelemetryExport = {
  range: string;
  generatedAt: string;
  scope: string;
  rows: AbacusTelemetryExportRow[];
};

export type AbacusOutputAuditStatus = 'saved' | 'review' | 'draft';

export type AbacusOutputAuditEvent = {
  id: string;
  title: string;
  area: string;
  outputType: string;
  actor: string;
  status: AbacusOutputAuditStatus;
  createdAt: string;
  sourceRequestId: string | null;
  note: string | null;
  createdBy: string;
};

export type AbacusOutputAuditEventsResponse = {
  events: AbacusOutputAuditEvent[];
  updatedAt: string | null;
  updatedBy: string | null;
};

export type SaveAbacusOutputAuditInput = {
  title: string;
  area: string;
  outputType: string;
  status?: AbacusOutputAuditStatus;
  actor?: string;
  sourceRequestId?: string | null;
  note?: string | null;
};

export type AbacusOutputApprovalStatus = 'approved' | 'rejected' | 'changes_requested';

export type AbacusOutputApproval = {
  eventId: string;
  status: AbacusOutputApprovalStatus;
  note: string | null;
  reviewedBy: string;
  reviewedAt: string;
};

export type AbacusOutputApprovalQueueItem = {
  event: AbacusOutputAuditEvent;
  approval: AbacusOutputApproval | null;
  state: AbacusOutputApprovalStatus | 'pending';
};

export type AbacusDownstreamExecutionStatus = 'queued' | 'blocked' | 'dispatched';

export type AbacusDownstreamProviderDispatchPlan = {
  providerId: string | null;
  providerName: string | null;
  providerMode: string | null;
  adapter: string;
  target: string;
  status: 'held' | 'ready' | 'sent';
  detail: string;
  reference: string | null;
  payload: {
    queueItemId: string;
    eventId: string;
    title: string;
    area: string;
    outputType: string;
    target: string;
    approvalNote: string | null;
    approvedBy: string;
    approvedAt: string;
  };
};

export type AbacusDownstreamExecutionQueueItem = {
  id: string;
  eventId: string;
  title: string;
  area: string;
  outputType: string;
  target: string;
  status: AbacusDownstreamExecutionStatus;
  dispatchMode: 'internal_queue';
  dispatchStatus: 'waiting_for_provider' | 'approval_blocked' | 'dispatched';
  detail: string;
  note: string | null;
  providerId: string | null;
  providerName: string | null;
  providerReference: string | null;
  providerDispatchPlan: AbacusDownstreamProviderDispatchPlan | null;
  dispatchNote: string | null;
  dispatchedBy: string | null;
  dispatchedAt: string | null;
  approvedBy: string;
  approvedAt: string;
  queuedAt: string;
  updatedAt: string;
};

export type AbacusDownstreamDispatchReadiness = {
  status: 'idle' | 'unknown' | 'blocked' | 'review' | 'ready';
  title: string;
  detail: string;
  dispatchableCount: number;
  blockers?: string[];
  checks: string[];
  activeAlertCount?: number;
  readyProviderCount?: number;
  stagingReady?: boolean;
  tone: string;
};

export type AbacusDownstreamProviderValidationCheck = {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
};

export type AbacusDownstreamProviderValidationItem = {
  itemId: string;
  eventId: string;
  title: string;
  target: string;
  providerId: string | null;
  providerName: string | null;
  adapter: string;
  status: 'held' | 'ready' | 'sent';
  reference: string | null;
  checks: AbacusDownstreamProviderValidationCheck[];
};

export type AbacusDownstreamProviderValidationReport = {
  generatedAt: string;
  status: 'idle' | 'blocked' | 'review' | 'ready';
  title: string;
  detail: string;
  queueCount: number;
  readyCount: number;
  heldCount: number;
  sentCount: number;
  blockedCount: number;
  checks: AbacusDownstreamProviderValidationCheck[];
  items: AbacusDownstreamProviderValidationItem[];
};

export type UpdateAbacusDownstreamExecutionInput = {
  status: AbacusDownstreamExecutionStatus;
  providerReference?: string | null;
  providerId?: string | null;
  note?: string | null;
};

export type AbacusOutputApprovalsResponse = {
  queue: AbacusOutputApprovalQueueItem[];
  approvals: AbacusOutputApproval[];
  dispatchQueue: AbacusDownstreamExecutionQueueItem[];
  dispatchReadiness?: AbacusDownstreamDispatchReadiness;
  dispatchValidation?: AbacusDownstreamProviderValidationReport;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  queuedDispatchCount: number;
  blockedDispatchCount: number;
  updatedAt: string | null;
  updatedBy: string | null;
  dispatchUpdatedAt: string | null;
  dispatchUpdatedBy: string | null;
};

export type ReviewAbacusOutputApprovalInput = {
  status: AbacusOutputApprovalStatus;
  note?: string | null;
};

export type BulkReviewAbacusOutputApprovalsInput = ReviewAbacusOutputApprovalInput & {
  eventIds: string[];
};

export type SubmitAbacusFeedbackInput = {
  signal: 'positive' | 'negative';
  reasonTags?: string[];
  note?: string;
};

export type AbacusOpsConfigProviderProfile = {
  id: string;
  name: string;
  mode?: string;
  status?: string;
  latencyMs?: number;
  costTier?: string;
  telemetry?: string;
  capabilities?: string[];
  note?: string;
};

export type AbacusOpsConfigAutomationRule = {
  id: string;
  title: string;
  trigger?: string;
  action?: string;
  status?: string;
  adapter?: string | null;
  lastRun?: string;
  lastRunStatus?: string | null;
  lastRunAdapter?: string | null;
  lastRunSummary?: string | null;
  lastRunActions?: AbacusAutomationRunAction[];
  tone?: string;
};

export type SaveAbacusAutomationRuleInput = {
  title?: string;
  trigger?: string;
  action?: string;
  status?: 'active' | 'draft' | 'paused';
  tone?: string;
};

export type RunAbacusAutomationRuleInput = {
  note?: string;
};

export type AbacusAutomationRunAction = {
  type: string;
  label: string;
  status: string;
  detail: string;
};

export type AbacusAutomationExecution = {
  adapterId: string;
  adapterLabel: string;
  status: string;
  summary: string;
  actions: AbacusAutomationRunAction[];
  outputAuditDraft: {
    title: string;
    area: string;
    outputType: string;
    note: string;
  };
};

export type AbacusOpsConfigRoutePolicy = {
  id: string;
  requestClass: string;
  model: string;
  maxTokens?: number;
  escalation?: string;
};

export type AbacusOpsConfigReviewGate = {
  id: string;
  title: string;
  area?: string;
  requiredRole?: string;
  status?: string;
  checks?: string[];
};

export type AbacusOpsConfig = {
  providerProfiles: AbacusOpsConfigProviderProfile[];
  automationRules: AbacusOpsConfigAutomationRule[];
  routePolicies: AbacusOpsConfigRoutePolicy[];
  reviewGates: AbacusOpsConfigReviewGate[];
};

export type AbacusOpsConfigResponse = {
  config: AbacusOpsConfig;
  persisted: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type AbacusProviderHealthStatus = 'ready' | 'degraded' | 'blocked';

export type AbacusProviderHealthCheck = {
  id: string;
  label: string;
  envKey?: string;
  required?: boolean;
  configured?: boolean;
  status: 'ready' | 'missing' | 'defaulted' | 'warning';
  detail: string;
};

export type AbacusProviderHealthProvider = {
  id: string;
  name: string;
  mode: string;
  status: AbacusProviderHealthStatus;
  configured: boolean;
  readinessScore: number;
  checks: AbacusProviderHealthCheck[];
  missingSecrets: string[];
  warnings: string[];
};

export type AbacusProviderHealthAlertAcknowledgement = {
  alertId: string;
  note: string | null;
  acknowledgedBy: string;
  acknowledgedAt: string;
};

export type AbacusProviderHealthAlert = {
  id: string;
  title: string;
  severity: 'critical' | 'warning';
  source: 'secret' | 'provider' | 'staging';
  detail: string;
  providerId?: string;
  envKey?: string;
  acknowledged: boolean;
  acknowledgement: AbacusProviderHealthAlertAcknowledgement | null;
};

export type AbacusProviderHealthResponse = {
  generatedAt: string;
  status: AbacusProviderHealthStatus;
  providerCount: number;
  readyProviderCount: number;
  degradedProviderCount: number;
  blockedProviderCount: number;
  missingRequiredSecrets: string[];
  checks: AbacusProviderHealthCheck[];
  providers: AbacusProviderHealthProvider[];
  alerts?: AbacusProviderHealthAlert[];
  activeAlertCount?: number;
  acknowledgedAlertCount?: number;
  acknowledgementHistory?: AbacusProviderHealthAlertAcknowledgement[];
  staging: {
    ready: boolean;
    environment: string;
    activeRoutePolicies: number;
    activeReviewGates: number;
    failFastKeyGuard: boolean;
    persistedConfig: boolean;
    updatedAt: string | null;
  };
};

export type AbacusRequestReviewStatus = 'open' | 'assigned' | 'reviewing' | 'resolved' | 'dismissed';
export type AbacusRequestReviewPriority = 'low' | 'medium' | 'high' | 'critical';

export type AbacusRequestReview = {
  requestId: string;
  status: AbacusRequestReviewStatus;
  priority: AbacusRequestReviewPriority;
  assigneeId: string | null;
  note: string | null;
  updatedBy: string;
  updatedAt: string;
};

export type AbacusRequestReviewsResponse = {
  reviews: AbacusRequestReview[];
  updatedAt: string | null;
  updatedBy: string | null;
};

export type SaveAbacusRequestReviewInput = {
  status: AbacusRequestReviewStatus;
  priority?: AbacusRequestReviewPriority;
  assigneeId?: string | null;
  note?: string | null;
};

export function getAbacusTelemetrySummary(range = '7d') {
  return apiRequest<AbacusTelemetrySummary>(`/ai-persona/ops/summary?range=${encodeURIComponent(range)}`);
}

export function exportAbacusTelemetry(range = '7d') {
  return apiRequest<AbacusTelemetryExport>(`/ai-persona/ops/export?range=${encodeURIComponent(range)}`);
}

export function submitAbacusFeedback(requestId: string, input: SubmitAbacusFeedbackInput) {
  return apiRequest<{
    requestId: string;
    feedbackSignal: string | null;
    feedbackReasonTags: unknown;
    feedbackCreatedAt: string | Date | null;
  }>(`/ai-persona/calls/${encodeURIComponent(requestId)}/feedback`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getAbacusOpsConfig() {
  return apiRequest<AbacusOpsConfigResponse>('/ai-persona/ops/config');
}

export function listAbacusOutputAudits() {
  return apiRequest<AbacusOutputAuditEventsResponse>('/ai-persona/ops/output-audits');
}

export function saveAbacusOutputAudit(input: SaveAbacusOutputAuditInput) {
  return apiRequest<AbacusOutputAuditEventsResponse & { event: AbacusOutputAuditEvent }>('/ai-persona/ops/output-audits', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listAbacusOutputApprovals() {
  return apiRequest<AbacusOutputApprovalsResponse>('/ai-persona/ops/output-approvals');
}

export function listAbacusDownstreamExecutionQueue() {
  return apiRequest<{
    queue: AbacusDownstreamExecutionQueueItem[];
    dispatchReadiness?: AbacusDownstreamDispatchReadiness;
    dispatchValidation?: AbacusDownstreamProviderValidationReport;
    queuedCount: number;
    blockedCount: number;
    dispatchedCount: number;
    updatedAt: string | null;
    updatedBy: string | null;
  }>('/ai-persona/ops/downstream-queue');
}

export function validateAbacusDownstreamProviderDispatch() {
  return apiRequest<{
    queue: AbacusDownstreamExecutionQueueItem[];
    dispatchReadiness?: AbacusDownstreamDispatchReadiness;
    dispatchValidation: AbacusDownstreamProviderValidationReport;
    updatedAt: string | null;
    updatedBy: string | null;
  }>('/ai-persona/ops/downstream-queue/validation');
}

export function updateAbacusDownstreamExecutionItem(itemId: string, input: UpdateAbacusDownstreamExecutionInput) {
  return apiRequest<{
    item: AbacusDownstreamExecutionQueueItem;
    queue: AbacusDownstreamExecutionQueueItem[];
    dispatchReadiness?: AbacusDownstreamDispatchReadiness;
    dispatchValidation?: AbacusDownstreamProviderValidationReport;
    queuedCount: number;
    blockedCount: number;
    dispatchedCount: number;
    updatedAt: string | null;
    updatedBy: string | null;
  }>(
    `/ai-persona/ops/downstream-queue/${encodeURIComponent(itemId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
}

export function reviewAbacusOutputApproval(eventId: string, input: ReviewAbacusOutputApprovalInput) {
  return apiRequest<{
    approval: AbacusOutputApproval;
    approvals: AbacusOutputApproval[];
    event: AbacusOutputAuditEvent;
    dispatchQueue: AbacusDownstreamExecutionQueueItem[];
    dispatchReadiness?: AbacusDownstreamDispatchReadiness;
    dispatchValidation?: AbacusDownstreamProviderValidationReport;
    updatedAt: string | null;
    updatedBy: string | null;
    dispatchUpdatedAt: string | null;
    dispatchUpdatedBy: string | null;
  }>(
    `/ai-persona/ops/output-approvals/${encodeURIComponent(eventId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
}

export function bulkReviewAbacusOutputApprovals(input: BulkReviewAbacusOutputApprovalsInput) {
  return apiRequest<AbacusOutputApprovalsResponse & { reviewed: AbacusOutputApproval[]; events: AbacusOutputAuditEvent[] }>(
    '/ai-persona/ops/output-approvals/bulk',
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
}

export function getAbacusProviderHealth() {
  return apiRequest<AbacusProviderHealthResponse>('/ai-persona/ops/provider-health');
}

export function acknowledgeAbacusProviderHealthAlert(alertId: string, input: { note?: string } = {}) {
  return apiRequest<{
    acknowledgement: AbacusProviderHealthAlertAcknowledgement;
    acknowledgementHistory: AbacusProviderHealthAlertAcknowledgement[];
    updatedAt: string | null;
    updatedBy: string | null;
  }>(`/ai-persona/ops/provider-health/alerts/${encodeURIComponent(alertId)}/acknowledgement`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function updateAbacusOpsConfig(config: Partial<AbacusOpsConfig>) {
  return apiRequest<AbacusOpsConfigResponse>('/ai-persona/ops/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export function saveAbacusAutomationRule(ruleId: string, input: SaveAbacusAutomationRuleInput) {
  return apiRequest<AbacusOpsConfigResponse & { rule: AbacusOpsConfigAutomationRule }>(
    `/ai-persona/ops/automation-rules/${encodeURIComponent(ruleId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
}

export function deleteAbacusAutomationRule(ruleId: string) {
  return apiRequest<AbacusOpsConfigResponse & { deletedRuleId: string }>(
    `/ai-persona/ops/automation-rules/${encodeURIComponent(ruleId)}`,
    { method: 'DELETE' },
  );
}

export function runAbacusAutomationRule(ruleId: string, input: RunAbacusAutomationRuleInput = {}) {
  return apiRequest<AbacusOpsConfigResponse & {
    rule: AbacusOpsConfigAutomationRule;
    outputEvent: AbacusOutputAuditEvent;
    events: AbacusOutputAuditEvent[];
    run: {
      id: string;
      ruleId: string;
      ranAt: string;
      status: string;
      note: string | null;
      runBy: string;
      execution: AbacusAutomationExecution;
    };
  }>(
    `/ai-persona/ops/automation-rules/${encodeURIComponent(ruleId)}/run`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function listAbacusRequestReviews() {
  return apiRequest<AbacusRequestReviewsResponse>('/ai-persona/ops/reviews');
}

export function saveAbacusRequestReview(requestId: string, input: SaveAbacusRequestReviewInput) {
  return apiRequest<AbacusRequestReviewsResponse & { review: AbacusRequestReview }>(
    `/ai-persona/ops/reviews/${encodeURIComponent(requestId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
}
