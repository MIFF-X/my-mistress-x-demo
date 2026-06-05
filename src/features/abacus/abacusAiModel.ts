import type {
  AbacusAutomationRunAction,
  AbacusDownstreamDispatchReadiness,
  AbacusDownstreamExecutionQueueItem,
  AbacusProviderHealthResponse,
  AbacusTelemetryExportRow,
  AbacusTelemetrySummary,
} from '../../api/abacusApi';

export type AbacusInsightKind = 'prediction' | 'content' | 'schedule' | 'risk' | 'action';

export type AbacusInsight = {
  id: string;
  kind: AbacusInsightKind;
  title: string;
  value: string;
  detail: string;
  confidence: number;
  trendLabel: string;
  tone: string;
  glyph: string;
};

export type AbacusStudioTask = {
  id: string;
  title: string;
  description: string;
  outputLabel: string;
  status: 'ready' | 'draft' | 'queued';
  tone: string;
};

export type AbacusProviderStatus = 'ready' | 'missing-key' | 'degraded';

export type AbacusProviderProfile = {
  id: string;
  name: string;
  mode: 'local' | 'remote' | 'router';
  status: AbacusProviderStatus;
  latencyMs: number;
  costTier: 'low' | 'medium' | 'high';
  telemetry: 'off' | 'limited' | 'managed';
  capabilities: string[];
  note: string;
};

export type AbacusAutomationRule = {
  id: string;
  title: string;
  trigger: string;
  action: string;
  status: 'active' | 'draft' | 'paused';
  adapter?: string | null;
  lastRun: string;
  lastRunStatus?: string | null;
  lastRunAdapter?: string | null;
  lastRunSummary?: string | null;
  lastRunActions?: AbacusAutomationRunAction[];
  tone: string;
};

export type AbacusReviewGate = {
  id: string;
  title: string;
  area: string;
  requiredRole: string;
  status: 'active' | 'draft' | 'paused';
  checks: string[];
  tone: string;
};

export type AbacusAuditEvent = {
  id: string;
  title: string;
  area: string;
  outputType: string;
  actor: string;
  createdAt: string;
  status: 'saved' | 'review' | 'draft';
};

export type AbacusSuggestedAction = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  tone: string;
};

export type AbacusDownstreamProviderReadiness = AbacusDownstreamDispatchReadiness;

export const ABACUS_INSIGHTS: AbacusInsight[] = [
  {
    id: 'revenue-prediction',
    kind: 'prediction',
    title: 'AI Revenue Prediction',
    value: '$156,843.00',
    detail: 'Predicted for the next 7 days from content sales, subscriptions, tips, and booked sessions.',
    confidence: 86,
    trendLabel: '+25.9% forecast',
    tone: '#8b5cf6',
    glyph: 'REV',
  },
  {
    id: 'best-content',
    kind: 'content',
    title: 'Best Content Type',
    value: 'FemDom Clips',
    detail: 'Highest conversion rate from recent creator campaigns and repeat buyers.',
    confidence: 78,
    trendLabel: 'Video leads',
    tone: '#f472b6',
    glyph: 'CNT',
  },
  {
    id: 'peak-activity',
    kind: 'schedule',
    title: 'Peak Activity Time',
    value: '9PM - 1AM EST',
    detail: 'Best window for drops, messages, live room reminders, and offer tests.',
    confidence: 82,
    trendLabel: '4 hour window',
    tone: '#38bdf8',
    glyph: 'CLK',
  },
  {
    id: 'churn-risk',
    kind: 'risk',
    title: 'Churn Risk',
    value: '23 members',
    detail: 'Members with lower activity, failed renewals, or missed high-intent messages.',
    confidence: 73,
    trendLabel: 'Needs review',
    tone: '#f5c542',
    glyph: 'RISK',
  },
  {
    id: 'next-action',
    kind: 'action',
    title: 'Suggested Next Offer',
    value: 'Weekend Bundle',
    detail: 'Bundle one clip, one sticker drop, and one limited live-room ticket.',
    confidence: 80,
    trendLabel: 'Ready to draft',
    tone: '#2dd4bf',
    glyph: 'ACT',
  },
];

export const ABACUS_STUDIO_TASKS: AbacusStudioTask[] = [
  {
    id: 'custom-ui',
    title: 'Build Custom UI Chunk',
    description: 'Generate a dashboard panel brief with layout, fields, empty states, and implementation notes.',
    outputLabel: 'UI brief',
    status: 'ready',
    tone: '#8b5cf6',
  },
  {
    id: 'dashboard-widget',
    title: 'Generate Dashboard Widget',
    description: 'Turn a metric or workflow idea into a widget spec with role rules and sample data.',
    outputLabel: 'Widget spec',
    status: 'ready',
    tone: '#38bdf8',
  },
  {
    id: 'next-offer',
    title: 'Suggest Next Offer',
    description: 'Draft a campaign offer from recent content, peak activity, audience segments, and goals.',
    outputLabel: 'Offer draft',
    status: 'draft',
    tone: '#d4af37',
  },
  {
    id: 'campaign-summary',
    title: 'Summarise Campaign Performance',
    description: 'Summarise recent campaigns with conversions, top source, weaker links, and next test.',
    outputLabel: 'Summary',
    status: 'queued',
    tone: '#2dd4bf',
  },
];

export const ABACUS_PROVIDER_PROFILES: AbacusProviderProfile[] = [
  {
    id: 'local-private',
    name: 'Local Private Runner',
    mode: 'local',
    status: 'ready',
    latencyMs: 128,
    costTier: 'low',
    telemetry: 'off',
    capabilities: ['private drafts', 'summaries', 'offline-safe prompts'],
    note: 'No telemetry profile. Good for sensitive drafts and local testing.',
  },
  {
    id: 'hosted-reasoning',
    name: 'Hosted Reasoning',
    mode: 'remote',
    status: 'missing-key',
    latencyMs: 0,
    costTier: 'high',
    telemetry: 'managed',
    capabilities: ['complex planning', 'code export', 'automation rules'],
    note: 'Missing provider key. Fail-fast warning is scaffolded before any request is sent.',
  },
  {
    id: 'cost-router',
    name: 'Cost Router',
    mode: 'router',
    status: 'degraded',
    latencyMs: 244,
    costTier: 'medium',
    telemetry: 'limited',
    capabilities: ['low-risk routing', 'budget control', 'fallback profile'],
    note: 'Routes low-risk prompts to cheaper models and escalates nuanced tasks.',
  },
];

export const ABACUS_AUTOMATION_RULES: AbacusAutomationRule[] = [
  {
    id: 'churn-review',
    title: 'Churn Risk Review',
    trigger: 'Daily at 9:00',
    action: 'Create a review list for at-risk members and failed renewals.',
    status: 'active',
    lastRun: '2h ago',
    tone: '#f5c542',
  },
  {
    id: 'offer-draft',
    title: 'Next Offer Draft',
    trigger: 'After campaign closes',
    action: 'Draft a follow-up offer from top content, peak activity, and conversion rate.',
    status: 'draft',
    lastRun: 'Not run',
    tone: '#2dd4bf',
  },
  {
    id: 'widget-build',
    title: 'Widget Build Queue',
    trigger: 'When owner saves a UI idea',
    action: 'Generate a dashboard widget spec and send it to review.',
    status: 'paused',
    lastRun: '4d ago',
    tone: '#8b5cf6',
  },
];

export const ABACUS_REVIEW_GATES: AbacusReviewGate[] = [
  {
    id: 'generated-copy-review',
    title: 'Generated Copy Review',
    area: 'Campaigns',
    requiredRole: 'headmistress',
    status: 'active',
    checks: ['tone', 'consent-boundaries', 'pricing-claims'],
    tone: '#f5c542',
  },
  {
    id: 'widget-json-review',
    title: 'Widget JSON Review',
    area: 'Dashboards',
    requiredRole: 'admin',
    status: 'active',
    checks: ['role-access', 'empty-state', 'data-source'],
    tone: '#38bdf8',
  },
  {
    id: 'automation-run-review',
    title: 'Automation Run Review',
    area: 'Automations',
    requiredRole: 'headmistress',
    status: 'draft',
    checks: ['audience-scope', 'send-window', 'fallback-copy'],
    tone: '#2dd4bf',
  },
];

export const ABACUS_AUDIT_EVENTS: AbacusAuditEvent[] = [
  {
    id: 'audit-copy',
    title: 'Offer copy generated',
    area: 'Campaigns',
    outputType: 'Copy draft',
    actor: 'Mistress X',
    createdAt: '18m ago',
    status: 'review',
  },
  {
    id: 'audit-widget',
    title: 'Revenue widget spec saved',
    area: 'Dashboard',
    outputType: 'Widget JSON',
    actor: 'Abacus AI',
    createdAt: '42m ago',
    status: 'saved',
  },
  {
    id: 'audit-rule',
    title: 'Churn automation rule edited',
    area: 'Automations',
    outputType: 'Rule config',
    actor: 'Headmistress',
    createdAt: '1h ago',
    status: 'saved',
  },
];

export const ABACUS_SUGGESTED_ACTIONS: AbacusSuggestedAction[] = [
  {
    id: 'save-weekend-bundle',
    title: 'Save weekend bundle draft',
    detail: 'Create a campaign draft with one clip, one sticker drop, and one live-room ticket.',
    priority: 'high',
    tone: '#8b5cf6',
  },
  {
    id: 'message-risk-list',
    title: 'Review churn-risk members',
    detail: 'Open the 23-member list before the next billing run and prepare a retention message.',
    priority: 'high',
    tone: '#f5c542',
  },
  {
    id: 'run-provider-doctor',
    title: 'Run provider doctor',
    detail: 'Check missing keys, route latency, fail-fast settings, and no-telemetry profile state.',
    priority: 'medium',
    tone: '#38bdf8',
  },
  {
    id: 'queue-widget',
    title: 'Queue custom widget',
    detail: 'Turn the revenue prediction card into a reusable dashboard widget spec.',
    priority: 'medium',
    tone: '#2dd4bf',
  },
];

export function getProviderStatusLabel(status: AbacusProviderStatus) {
  if (status === 'ready') return 'Ready';
  if (status === 'missing-key') return 'Missing Key';
  return 'Degraded';
}

export function getProviderStatusTone(status: AbacusProviderStatus) {
  if (status === 'ready') return '#1D9E75';
  if (status === 'missing-key') return '#f5c542';
  return '#fb7185';
}

export function getStudioTaskStatusLabel(status: AbacusStudioTask['status']) {
  if (status === 'ready') return 'Ready';
  if (status === 'queued') return 'Queued';
  return 'Draft';
}

function countDownstreamQueue(queue: AbacusDownstreamExecutionQueueItem[], status: AbacusDownstreamExecutionQueueItem['status']) {
  return queue.filter((item) => item.status === status).length;
}

export function buildDownstreamProviderReadiness(
  queue: AbacusDownstreamExecutionQueueItem[],
  health?: AbacusProviderHealthResponse | null,
): AbacusDownstreamProviderReadiness {
  const queued = countDownstreamQueue(queue, 'queued');
  const blocked = countDownstreamQueue(queue, 'blocked');
  const dispatched = countDownstreamQueue(queue, 'dispatched');

  if (!queue.length) {
    return {
      status: 'idle',
      title: 'No downstream handoffs queued',
      detail: 'Approved Abacus output will appear here before any external provider dispatch.',
      dispatchableCount: 0,
      tone: '#38bdf8',
      checks: ['Approve an output artifact to create a provider handoff record'],
    };
  }

  if (!health) {
    return {
      status: 'unknown',
      title: 'Provider gate unavailable',
      detail: `${queued} queued / ${blocked} blocked / ${dispatched} dispatched items need a fresh provider-health check before handoff.`,
      dispatchableCount: 0,
      tone: '#f5c542',
      checks: ['Refresh provider health', 'Confirm staging readiness', 'Record provider references after dispatch'],
    };
  }

  const activeAlerts = health.activeAlertCount ?? (health.alerts ?? []).filter((alert) => !alert.acknowledged).length;
  const missingSecrets = health.missingRequiredSecrets ?? [];
  const stagingReady = Boolean(health.staging?.ready);
  const hasReadyProvider = (health.readyProviderCount ?? 0) > 0;

  if (health.status === 'blocked' || missingSecrets.length || !stagingReady || !hasReadyProvider) {
    const blocker = missingSecrets.length
      ? `missing ${missingSecrets.join(', ')}`
      : !stagingReady
        ? 'staging readiness is not green'
        : 'no ready provider profile';
    return {
      status: 'blocked',
      title: 'Provider dispatch blocked',
      detail: `${queued} queued handoff${queued === 1 ? '' : 's'} stay internal because ${blocker}.`,
      dispatchableCount: 0,
      tone: '#fb7185',
      checks: [
        stagingReady ? 'Staging readiness green' : 'Resolve staging readiness',
        hasReadyProvider ? 'At least one provider ready' : 'Enable a ready provider profile',
        missingSecrets.length ? `Add ${missingSecrets.join(', ')}` : 'Required provider secrets present',
      ],
    };
  }

  if (health.status === 'degraded' || activeAlerts || blocked) {
    return {
      status: 'review',
      title: 'Provider handoff needs review',
      detail: `${queued} queued item${queued === 1 ? '' : 's'} can be prepared, with ${activeAlerts} active provider alert${activeAlerts === 1 ? '' : 's'} and ${blocked} blocked queue item${blocked === 1 ? '' : 's'} to review.`,
      dispatchableCount: queued,
      tone: '#f5c542',
      checks: ['Review active provider alerts', 'Clear blocked queue items', 'Capture provider references for dispatched records'],
    };
  }

  return {
    status: 'ready',
    title: 'Provider handoff ready',
    detail: `${queued} queued item${queued === 1 ? '' : 's'} can move to approved provider dispatch after operator confirmation.`,
    dispatchableCount: queued,
    tone: '#2dd4bf',
    checks: ['Provider health ready', 'Staging readiness green', 'Record provider reference and dispatch note'],
  };
}

function clampPercent(value: number) {
  return Math.max(5, Math.min(100, Math.round(value)));
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toLocaleString() : '0';
}

function formatRate(value: number) {
  return `${Math.round((Number.isFinite(value) ? value : 0) * 100)}%`;
}

function formatLatency(value: number | null) {
  return typeof value === 'number' ? `${value}ms` : 'n/a';
}

function formatCost(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '$0.00';
  return `$${value.toFixed(value < 1 ? 4 : 2)}`;
}

function errorTone(errorRate: number) {
  if (errorRate >= 0.2) return '#fb7185';
  if (errorRate >= 0.05) return '#f5c542';
  return '#2dd4bf';
}

function feedbackTone(coverageRate: number) {
  if (coverageRate >= 0.75) return '#2dd4bf';
  if (coverageRate >= 0.35) return '#f5c542';
  return '#fb7185';
}

function csvCell(value: unknown) {
  if (value === null || typeof value === 'undefined') return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildTelemetryInsights(summary?: AbacusTelemetrySummary | null): AbacusInsight[] {
  if (!summary) return ABACUS_INSIGHTS;

  const topFailure = summary.topFailingPrompts[0];
  const topModel = [...summary.byModel].sort((a, b) => b.requests - a.requests)[0];
  const topClass = [...summary.byRequestClass].sort((a, b) => b.requests - a.requests)[0];
  const errorHealth = 100 - ((summary.totals.errorRate || 0) * 100);
  const feedbackCoverage = (summary.feedback.coverageRate || 0) * 100;
  const latencyTarget = typeof summary.latency.p95Ms === 'number'
    ? Math.max(5, 100 - (summary.latency.p95Ms / 50))
    : 50;

  return [
    {
      id: 'telemetry-requests',
      kind: 'prediction',
      title: 'AI Requests',
      value: formatNumber(summary.totals.requests),
      detail: `${formatNumber(summary.totals.successes)} success / ${formatNumber(summary.totals.errors)} errors across ${summary.range}.`,
      confidence: clampPercent(errorHealth),
      trendLabel: `${formatRate(summary.totals.errorRate)} errors`,
      tone: errorTone(summary.totals.errorRate),
      glyph: 'REQ',
    },
    {
      id: 'telemetry-latency',
      kind: 'schedule',
      title: 'AI Latency',
      value: formatLatency(summary.latency.p95Ms),
      detail: `p50 ${formatLatency(summary.latency.p50Ms)} / p95 ${formatLatency(summary.latency.p95Ms)} from recent generated outputs.`,
      confidence: clampPercent(latencyTarget),
      trendLabel: 'p95 window',
      tone: typeof summary.latency.p95Ms === 'number' && summary.latency.p95Ms > 3000 ? '#f5c542' : '#38bdf8',
      glyph: 'LAT',
    },
    {
      id: 'telemetry-spend',
      kind: 'content',
      title: 'Token Spend',
      value: formatCost(summary.totals.estimatedCostUsd),
      detail: `${formatNumber(summary.totals.totalTokens)} tokens; top model ${topModel?.model ?? 'not loaded yet'}.`,
      confidence: clampPercent(summary.totals.totalTokens > 0 ? 82 : 40),
      trendLabel: `${summary.scope} scope`,
      tone: '#8b5cf6',
      glyph: 'TOK',
    },
    {
      id: 'telemetry-feedback',
      kind: 'risk',
      title: 'Feedback Coverage',
      value: formatRate(summary.feedback.coverageRate),
      detail: `${formatNumber(summary.feedback.positive)} positive / ${formatNumber(summary.feedback.negative)} negative across ${formatNumber(summary.feedback.total)} reviewed outputs.`,
      confidence: clampPercent(feedbackCoverage),
      trendLabel: 'review loop',
      tone: feedbackTone(summary.feedback.coverageRate),
      glyph: 'FDBK',
    },
    {
      id: 'telemetry-next-action',
      kind: 'action',
      title: topFailure ? 'Top Failing Prompt' : 'Route Policy',
      value: topFailure ? `${topFailure.count} fails` : (topClass?.requestClass ?? 'No route data'),
      detail: topFailure
        ? `${topFailure.promptPreview} - ${topFailure.latestError ?? 'latest error unavailable'}`
        : `${topClass?.requests ?? 0} requests in the busiest route class.`,
      confidence: clampPercent(topFailure ? 45 : 80),
      trendLabel: topFailure ? 'Needs review' : 'Policy ready',
      tone: topFailure ? '#fb7185' : '#2dd4bf',
      glyph: topFailure ? 'FAIL' : 'ROUTE',
    },
  ];
}

export function buildTelemetryProviderProfiles(summary?: AbacusTelemetrySummary | null): AbacusProviderProfile[] {
  if (!summary?.byModel?.length) return ABACUS_PROVIDER_PROFILES;

  return summary.byModel.map((modelStats) => ({
    id: `model-${modelStats.model}`,
    name: modelStats.model,
    mode: 'remote',
    status: modelStats.errorRate >= 0.2 ? 'degraded' : 'ready',
    latencyMs: summary.latency.p50Ms ?? 0,
    costTier: modelStats.tokens > 10000 ? 'medium' : 'low',
    telemetry: 'managed',
    capabilities: [
      `${formatNumber(modelStats.requests)} requests`,
      `${formatNumber(modelStats.tokens)} tokens`,
      `${formatRate(modelStats.errorRate)} errors`,
    ],
    note: modelStats.errors
      ? `${modelStats.errors} failed request${modelStats.errors === 1 ? '' : 's'} in ${summary.range}.`
      : `No failed requests in ${summary.range}.`,
  }));
}

export function buildTelemetrySuggestedActions(summary?: AbacusTelemetrySummary | null): AbacusSuggestedAction[] {
  if (!summary) return ABACUS_SUGGESTED_ACTIONS;

  const actions: AbacusSuggestedAction[] = [];
  const topFailure = summary.topFailingPrompts[0];

  if (summary.totals.errorRate >= 0.05) {
    actions.push({
      id: 'review-error-rate',
      title: 'Review AI error rate',
      detail: `${formatRate(summary.totals.errorRate)} of AI requests failed in ${summary.range}; inspect provider keys, timeout settings, and prompt classes.`,
      priority: summary.totals.errorRate >= 0.2 ? 'high' : 'medium',
      tone: errorTone(summary.totals.errorRate),
    });
  }

  if (topFailure) {
    actions.push({
      id: 'review-failing-prompt',
      title: 'Review top failing prompt',
      detail: `${topFailure.promptPreview} failed ${topFailure.count} time${topFailure.count === 1 ? '' : 's'}; latest error: ${topFailure.latestError ?? 'unknown'}.`,
      priority: 'high',
      tone: '#fb7185',
    });
  }

  if (summary.feedback.coverageRate < 0.5 && summary.totals.requests > 0) {
    actions.push({
      id: 'increase-feedback-coverage',
      title: 'Increase AI feedback coverage',
      detail: `${formatRate(summary.feedback.coverageRate)} of outputs have thumbs feedback; ask reviewers to score the next generated drafts.`,
      priority: 'medium',
      tone: feedbackTone(summary.feedback.coverageRate),
    });
  }

  if (typeof summary.latency.p95Ms === 'number' && summary.latency.p95Ms > 3000) {
    actions.push({
      id: 'triage-ai-latency',
      title: 'Triage slow AI route',
      detail: `p95 latency is ${formatLatency(summary.latency.p95Ms)}; route low-risk prompts to the cheaper model or reduce max tokens.`,
      priority: 'medium',
      tone: '#f5c542',
    });
  }

  if (!actions.length) {
    actions.push({
      id: 'keep-ai-review-loop',
      title: 'Keep AI review loop active',
      detail: `${formatNumber(summary.totals.requests)} requests are within policy for ${summary.range}; continue collecting feedback and audit rows.`,
      priority: 'low',
      tone: '#2dd4bf',
    });
  }

  return actions.slice(0, 4);
}

export function buildTelemetryExportCsv(rows: AbacusTelemetryExportRow[]) {
  const headers = [
    'requestId',
    'createdAt',
    'provider',
    'model',
    'requestClass',
    'status',
    'promptTokens',
    'completionTokens',
    'totalTokens',
    'latencyMs',
    'feedbackSignal',
    'feedbackReasonTags',
    'feedbackCreatedAt',
    'promptPreview',
    'responsePreview',
    'errorMessage',
  ];

  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header as keyof AbacusTelemetryExportRow])).join(',')),
  ].join('\n');
}
