export type AdminAnalyticsMetricKind = 'currency' | 'number' | 'compact' | 'percent';

export type AdminAnalyticsMetric = {
  id: string;
  label: string;
  value: number;
  kind: AdminAnalyticsMetricKind;
  deltaLabel: string;
  tone: string;
  shortLabel: string;
  sparkline: number[];
};

export type AdminAnalyticsNavItem = {
  id: string;
  label: string;
  badge: string;
  tone: string;
};

export type AdminTrendPoint = {
  label: string;
  conversations: number;
  revenue: number;
};

export type AdminTopContentRow = {
  id: string;
  title: string;
  type: string;
  value: number;
  share: number;
  tone: string;
};

export type AdminSubscriptionSegment = {
  id: string;
  label: string;
  count: number;
  share: number;
  tone: string;
};

export type AdminSystemStatus = 'operational' | 'degraded' | 'watch';

export type AdminSystemService = {
  id: string;
  label: string;
  status: AdminSystemStatus;
  latencyMs: number;
  uptime: number;
  note: string;
};

export type AdminOperationEvent = {
  id: string;
  label: string;
  area: string;
  age: string;
  severity: 'info' | 'success' | 'warning';
};

export type AdminApiKeyRow = {
  id: string;
  label: string;
  scope: string;
  lastUsed: string;
  status: 'active' | 'rotate';
};

export type AdminWebhookRow = {
  id: string;
  label: string;
  target: string;
  successRate: number;
  lastDelivery: string;
};

export const ADMIN_ANALYTICS_NAV_ITEMS: AdminAnalyticsNavItem[] = [
  { id: 'models', label: 'AI Models', badge: 'AI', tone: '#8b5cf6' },
  { id: 'conversations', label: 'Conversations', badge: 'CHAT', tone: '#38bdf8' },
  { id: 'characters', label: 'Characters', badge: 'CHAR', tone: '#f472b6' },
  { id: 'subscriptions', label: 'Subscriptions', badge: 'SUBS', tone: '#7dd3fc' },
  { id: 'payments', label: 'Payments', badge: 'PAY', tone: '#d4af37' },
  { id: 'analytics', label: 'Analytics', badge: 'LIVE', tone: '#2dd4bf' },
  { id: 'users', label: 'Users', badge: 'USR', tone: '#fb7185' },
  { id: 'content', label: 'Content', badge: 'CNT', tone: '#a855f7' },
  { id: 'api-keys', label: 'API Keys', badge: 'KEY', tone: '#f59e0b' },
  { id: 'webhooks', label: 'Webhooks', badge: 'HOOK', tone: '#60a5fa' },
  { id: 'logs', label: 'Logs', badge: 'LOG', tone: '#c084fc' },
  { id: 'status', label: 'System Status', badge: 'OK', tone: '#1D9E75' },
];

export const ADMIN_ANALYTICS_METRICS: AdminAnalyticsMetric[] = [
  {
    id: 'conversations',
    label: 'Total Conversations',
    value: 128456,
    kind: 'number',
    deltaLabel: '+12.5% vs prior period',
    tone: '#8b5cf6',
    shortLabel: 'CNV',
    sparkline: [24, 38, 31, 44, 40, 55, 51, 66, 61, 73],
  },
  {
    id: 'active-users',
    label: 'Active Users',
    value: 8942,
    kind: 'number',
    deltaLabel: '+8.2% vs prior period',
    tone: '#a855f7',
    shortLabel: 'USR',
    sparkline: [18, 25, 22, 34, 29, 36, 44, 39, 50, 57],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: 45678.9,
    kind: 'currency',
    deltaLabel: '+15.3% vs prior period',
    tone: '#d4af37',
    shortLabel: 'REV',
    sparkline: [20, 28, 25, 36, 34, 48, 44, 58, 61, 72],
  },
  {
    id: 'tokens',
    label: 'Tokens Used',
    value: 24500000,
    kind: 'compact',
    deltaLabel: '+18.7% vs prior period',
    tone: '#38bdf8',
    shortLabel: 'TOK',
    sparkline: [14, 23, 27, 29, 42, 39, 51, 63, 57, 71],
  },
];

export const ADMIN_CONVERSATION_TRENDS: AdminTrendPoint[] = [
  { label: 'Apr 20', conversations: 3180, revenue: 9100 },
  { label: 'Apr 23', conversations: 4260, revenue: 10450 },
  { label: 'Apr 27', conversations: 7980, revenue: 13880 },
  { label: 'May 1', conversations: 4380, revenue: 12620 },
  { label: 'May 5', conversations: 5120, revenue: 15840 },
  { label: 'May 9', conversations: 6940, revenue: 19050 },
  { label: 'May 13', conversations: 9250, revenue: 24420 },
  { label: 'May 18', conversations: 7120, revenue: 22890 },
];

export const ADMIN_TOP_CONTENT: AdminTopContentRow[] = [
  { id: 'edge', title: 'Edge For Me', type: 'Video Clip', value: 24567, share: 19.1, tone: '#8b5cf6' },
  { id: 'hellfire', title: 'Miss Hellfire', type: 'Character', value: 18432, share: 14.3, tone: '#f472b6' },
  { id: 'professor', title: 'Professor X', type: 'Character', value: 15678, share: 12.2, tone: '#38bdf8' },
  { id: 'morgan', title: 'Queen Morgan', type: 'Character', value: 12345, share: 9.6, tone: '#d4af37' },
  { id: 'noir', title: 'Agent Noir', type: 'Character', value: 9876, share: 7.7, tone: '#2dd4bf' },
];

export const ADMIN_SUBSCRIPTION_SEGMENTS: AdminSubscriptionSegment[] = [
  { id: 'enterprise', label: 'Enterprise', count: 2345, share: 26.2, tone: '#8b5cf6' },
  { id: 'pro', label: 'Pro', count: 3456, share: 38.6, tone: '#a855f7' },
  { id: 'standard', label: 'Standard', count: 2123, share: 23.7, tone: '#60a5fa' },
  { id: 'basic', label: 'Basic', count: 1018, share: 11.4, tone: '#f472b6' },
];

export const ADMIN_SYSTEM_SERVICES: AdminSystemService[] = [
  { id: 'api', label: 'API Gateway', status: 'operational', latencyMs: 82, uptime: 99.99, note: 'Edge routes healthy' },
  { id: 'ai', label: 'AI Service', status: 'operational', latencyMs: 148, uptime: 99.94, note: 'Model queue clear' },
  { id: 'database', label: 'Database', status: 'operational', latencyMs: 34, uptime: 99.98, note: 'Primary available' },
  { id: 'storage', label: 'Storage', status: 'watch', latencyMs: 116, uptime: 99.9, note: 'Higher media egress' },
  { id: 'websocket', label: 'WebSocket', status: 'operational', latencyMs: 58, uptime: 99.96, note: 'Realtime sessions stable' },
  { id: 'payments', label: 'Payment Processor', status: 'degraded', latencyMs: 221, uptime: 99.74, note: 'Retry rate elevated' },
];

export const ADMIN_OPERATION_EVENTS: AdminOperationEvent[] = [
  { id: 'member', label: 'New member joined', area: 'Users', age: '2m ago', severity: 'success' },
  { id: 'content', label: 'Content sale recorded', area: 'Payments', age: '5m ago', severity: 'success' },
  { id: 'webhook', label: 'Webhook retry scheduled', area: 'Provider integrations', age: '12m ago', severity: 'warning' },
  { id: 'model', label: 'Model token budget refreshed', area: 'AI Models', age: '18m ago', severity: 'info' },
  { id: 'key', label: 'API key used from new region', area: 'API Keys', age: '31m ago', severity: 'warning' },
];

export const ADMIN_API_KEYS: AdminApiKeyRow[] = [
  { id: 'public', label: 'Public app client', scope: 'read:catalog write:sessions', lastUsed: '4m ago', status: 'active' },
  { id: 'ops', label: 'Ops console', scope: 'admin:analytics admin:status', lastUsed: '18m ago', status: 'active' },
  { id: 'legacy', label: 'Legacy import worker', scope: 'read:users write:imports', lastUsed: '19d ago', status: 'rotate' },
];

export const ADMIN_WEBHOOKS: AdminWebhookRow[] = [
  { id: 'payments', label: 'payment.completed', target: 'Billing worker', successRate: 99.2, lastDelivery: '3m ago' },
  { id: 'subscription', label: 'subscription.changed', target: 'Membership sync', successRate: 98.6, lastDelivery: '11m ago' },
  { id: 'content', label: 'content.published', target: 'Search index', successRate: 97.4, lastDelivery: '27m ago' },
];

export function formatAnalyticsCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatAnalyticsNumber(value: number) {
  return value.toLocaleString();
}

export function formatCompactValue(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return formatAnalyticsNumber(value);
}

export function formatPercentValue(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatMetricValue(metric: AdminAnalyticsMetric) {
  if (metric.kind === 'currency') return formatAnalyticsCurrency(metric.value);
  if (metric.kind === 'compact') return formatCompactValue(metric.value);
  if (metric.kind === 'percent') return formatPercentValue(metric.value);
  return formatAnalyticsNumber(metric.value);
}

export function getSystemStatusTone(status: AdminSystemStatus) {
  if (status === 'operational') return '#1D9E75';
  if (status === 'degraded') return '#f5c542';
  return '#60a5fa';
}

export function getSystemStatusLabel(status: AdminSystemStatus) {
  if (status === 'operational') return 'Operational';
  if (status === 'degraded') return 'Degraded';
  return 'Watch';
}
