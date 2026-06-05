import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, type DimensionValue } from 'react-native';
import { getAdminStripeWebhookHealth, type AdminStripeWebhookHealth } from '../../api/adminCommandApi';
import { mxTheme } from '../../theme/mxTheme';
import {
  ADMIN_ANALYTICS_METRICS,
  ADMIN_ANALYTICS_NAV_ITEMS,
  ADMIN_API_KEYS,
  ADMIN_CONVERSATION_TRENDS,
  ADMIN_OPERATION_EVENTS,
  ADMIN_SUBSCRIPTION_SEGMENTS,
  ADMIN_SYSTEM_SERVICES,
  ADMIN_TOP_CONTENT,
  ADMIN_WEBHOOKS,
  formatAnalyticsCurrency,
  formatAnalyticsNumber,
  formatMetricValue,
  formatPercentValue,
  getSystemStatusLabel,
  getSystemStatusTone,
  type AdminAnalyticsMetric,
  type AdminAnalyticsNavItem,
  type AdminOperationEvent,
  type AdminSystemService,
  type AdminTrendPoint,
} from './adminAnalyticsModel';

type DateRangePreset = '7d' | '30d' | '90d';
type WebhookHealthStatus = 'loading' | 'ready' | 'error';

const PROJECT_OPTIONS = ['Default Project', 'Creator Ops', 'Platform Core'];
const DATE_RANGE_OPTIONS: Array<{ id: DateRangePreset; label: string }> = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
];

function panelStyle(borderColor = mxTheme.colors.border) {
  return {
    backgroundColor: '#0f0f14',
    borderColor,
    borderWidth: 1,
    borderRadius: mxTheme.radius.lg,
    padding: mxTheme.spacing.md,
  };
}

function severityTone(severity: AdminOperationEvent['severity']) {
  if (severity === 'success') return mxTheme.colors.success;
  if (severity === 'warning') return mxTheme.colors.warning;
  return '#60a5fa';
}

function webhookHealthTone(status?: string) {
  if (status === 'healthy' || status === 'ready') return mxTheme.colors.success;
  if (status === 'critical' || status === 'blocked') return '#fb7185';
  return '#f5c542';
}

function MetricSparkline({ metric }: { metric: AdminAnalyticsMetric }) {
  const maxPoint = Math.max(...metric.sparkline, 1);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 42, marginTop: 10 }}>
      {metric.sparkline.map((point, index) => (
        <View
          key={`${metric.id}-${index}`}
          style={{
            backgroundColor: index === metric.sparkline.length - 1 ? metric.tone : `${metric.tone}88`,
            borderRadius: 999,
            height: Math.max(8, Math.round((point / maxPoint) * 40)),
            flex: 1,
          }}
        />
      ))}
    </View>
  );
}

function MetricCard({ metric }: { metric: AdminAnalyticsMetric }) {
  return (
    <View style={{ ...panelStyle(`${metric.tone}66`), flex: 1, minWidth: 190, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>{metric.label}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>{formatMetricValue(metric)}</Text>
        </View>
        <View style={{ backgroundColor: `${metric.tone}24`, borderColor: metric.tone, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ color: metric.tone, fontSize: 11, fontWeight: '900' }}>{metric.shortLabel}</Text>
        </View>
      </View>
      <Text style={{ color: mxTheme.colors.success, fontSize: 12, fontWeight: '800' }}>{metric.deltaLabel}</Text>
      <MetricSparkline metric={metric} />
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? '#8b5cf6' : '#15151b',
        borderColor: active ? '#c084fc' : '#2a2a33',
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: active ? '#fff' : '#d6d6dc', fontSize: 12, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function HeaderControls({
  project,
  dateRange,
  onProjectChange,
  onDateRangeChange,
}: {
  project: string;
  dateRange: DateRangePreset;
  onProjectChange: (project: string) => void;
  onDateRangeChange: (range: DateRangePreset) => void;
}) {
  return (
    <View style={{ gap: 8, alignItems: 'flex-end' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
        {PROJECT_OPTIONS.map((option) => (
          <FilterChip key={option} label={option} active={project === option} onPress={() => onProjectChange(option)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
        {DATE_RANGE_OPTIONS.map((option) => (
          <FilterChip key={option.id} label={option.label} active={dateRange === option.id} onPress={() => onDateRangeChange(option.id)} />
        ))}
      </View>
    </View>
  );
}

function BarRow({
  label,
  value,
  detail,
  maxValue,
  tone,
}: {
  label: string;
  value: number;
  detail?: string;
  maxValue: number;
  tone: string;
}) {
  const width = `${Math.max(6, Math.round((value / Math.max(maxValue, 1)) * 100))}%` as DimensionValue;

  return (
    <View style={{ gap: 7 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ color: mxTheme.colors.text, fontWeight: '900', flex: 1 }}>{label}</Text>
        <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{formatAnalyticsNumber(value)}</Text>
      </View>
      {detail ? <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{detail}</Text> : null}
      <View style={{ backgroundColor: '#191922', borderRadius: 999, height: 7, overflow: 'hidden' }}>
        <View style={{ backgroundColor: tone, borderRadius: 999, height: 7, width }} />
      </View>
    </View>
  );
}

function TrendPanel({ trends, maxConversations }: { trends: AdminTrendPoint[]; maxConversations: number }) {
  return (
    <View style={{ ...panelStyle('#2d2248'), flex: 2, minWidth: 300, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <View>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Conversations Overview</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4 }}>Daily activity and revenue pull-through</Text>
        </View>
        <Text style={{ color: '#c084fc', fontSize: 12, fontWeight: '900' }}>LIVE ROLLUP</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 178 }}>
        {trends.map((point) => {
          const height = Math.max(22, Math.round((point.conversations / Math.max(maxConversations, 1)) * 150));
          return (
            <View key={point.label} style={{ flex: 1, gap: 7, alignItems: 'center' }}>
              <View style={{ backgroundColor: '#101016', borderRadius: 999, borderWidth: 1, borderColor: '#2a1f3c', width: '100%', height: 150, justifyContent: 'flex-end', overflow: 'hidden' }}>
                <View style={{ backgroundColor: '#8b5cf6', borderRadius: 999, height }} />
              </View>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 10, textAlign: 'center' }}>{point.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {trends.slice(-3).map((point) => (
          <View key={`${point.label}-summary`} style={{ backgroundColor: '#15151d', borderRadius: 12, padding: 10, flex: 1, minWidth: 140 }}>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>{point.label}</Text>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900', marginTop: 4 }}>{formatAnalyticsNumber(point.conversations)} conversations</Text>
            <Text style={{ color: '#d4af37', fontSize: 12, marginTop: 3 }}>{formatAnalyticsCurrency(point.revenue)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TopContentPanel({ maxValue }: { maxValue: number }) {
  return (
    <View style={{ ...panelStyle('#2d2248'), flex: 1, minWidth: 280, gap: 14 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Top Characters & Content</Text>
      {ADMIN_TOP_CONTENT.map((row) => (
        <BarRow key={row.id} label={row.title} value={row.value} detail={`${row.type} - ${formatPercentValue(row.share)} share`} maxValue={maxValue} tone={row.tone} />
      ))}
    </View>
  );
}

function SubscriptionPanel({ total }: { total: number }) {
  return (
    <View style={{ ...panelStyle('#2d2248'), flex: 1, minWidth: 280, gap: 12 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Subscription Overview</Text>
      <View style={{ backgroundColor: '#15151d', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 }}>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>TOTAL ACTIVE</Text>
        <Text style={{ color: mxTheme.colors.text, fontSize: 28, fontWeight: '900' }}>{formatAnalyticsNumber(total)}</Text>
      </View>
      {ADMIN_SUBSCRIPTION_SEGMENTS.map((segment) => (
        <BarRow key={segment.id} label={segment.label} value={segment.count} detail={`${formatPercentValue(segment.share)} of total`} maxValue={total} tone={segment.tone} />
      ))}
    </View>
  );
}

function ServiceStatusRow({ service }: { service: AdminSystemService }) {
  const tone = getSystemStatusTone(service.status);

  return (
    <View style={{ borderTopColor: '#252531', borderTopWidth: 1, paddingTop: 10, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{service.label}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{service.note}</Text>
        </View>
        <View style={{ backgroundColor: `${tone}1f`, borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
          <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{getSystemStatusLabel(service.status)}</Text>
        </View>
      </View>
      <Text style={{ color: '#b8b8c4', fontSize: 11 }}>{service.latencyMs}ms latency - {service.uptime.toFixed(2)}% uptime</Text>
    </View>
  );
}

function SystemStatusPanel({ degradedCount, watchCount }: { degradedCount: number; watchCount: number }) {
  return (
    <View style={{ ...panelStyle(degradedCount > 0 ? mxTheme.colors.warning : mxTheme.colors.success), flex: 1, minWidth: 280, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <View>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>System Status</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4 }}>Services, latency, and uptime</Text>
        </View>
        <Text style={{ color: degradedCount > 0 ? mxTheme.colors.warning : mxTheme.colors.success, fontWeight: '900' }}>
          {degradedCount > 0 ? `${degradedCount} degraded` : `${watchCount} watch`}
        </Text>
      </View>
      {ADMIN_SYSTEM_SERVICES.map((service) => (
        <ServiceStatusRow key={service.id} service={service} />
      ))}
    </View>
  );
}

function AdminNavPanel({
  activeItem,
  onSelect,
}: {
  activeItem: AdminAnalyticsNavItem;
  onSelect: (item: AdminAnalyticsNavItem) => void;
}) {
  return (
    <View style={{ ...panelStyle('#2d2248'), flex: 1, minWidth: 280, gap: 12 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Admin Navigation</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {ADMIN_ANALYTICS_NAV_ITEMS.map((item) => {
          const active = activeItem.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item)}
              style={{
                backgroundColor: active ? `${item.tone}2d` : '#15151d',
                borderColor: active ? item.tone : '#2a2a33',
                borderWidth: 1,
                borderRadius: 12,
                padding: 10,
                minWidth: 130,
                flexGrow: 1,
              }}
            >
              <Text style={{ color: item.tone, fontSize: 11, fontWeight: '900' }}>{item.badge}</Text>
              <Text style={{ color: mxTheme.colors.text, fontWeight: '900', marginTop: 4 }}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function OperationsFeedPanel() {
  return (
    <View style={{ ...panelStyle('#2d2248'), flex: 1, minWidth: 280, gap: 12 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Recent Operations</Text>
      {ADMIN_OPERATION_EVENTS.map((event) => (
        <View key={event.id} style={{ borderTopColor: '#252531', borderTopWidth: 1, paddingTop: 10, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900', flex: 1 }}>{event.label}</Text>
            <Text style={{ color: severityTone(event.severity), fontSize: 11, fontWeight: '900' }}>{event.age}</Text>
          </View>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{event.area}</Text>
        </View>
      ))}
    </View>
  );
}

function ApiKeysPanel({ onAction }: { onAction: (label: string) => void }) {
  return (
    <View style={{ ...panelStyle('#3b2b12'), flex: 1, minWidth: 280, gap: 12 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>API Keys</Text>
      {ADMIN_API_KEYS.map((row) => {
        const rotate = row.status === 'rotate';
        return (
          <View key={row.id} style={{ borderTopColor: '#2f2b20', borderTopWidth: 1, paddingTop: 10, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{row.label}</Text>
                <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{row.scope}</Text>
              </View>
              <Text style={{ color: rotate ? mxTheme.colors.warning : mxTheme.colors.success, fontSize: 11, fontWeight: '900' }}>{rotate ? 'ROTATE' : 'ACTIVE'}</Text>
            </View>
            <Text style={{ color: '#b8b8c4', fontSize: 11 }}>Last used {row.lastUsed}</Text>
          </View>
        );
      })}
      <Pressable onPress={() => onAction('API key rotation')} style={{ backgroundColor: '#241b08', borderColor: '#d4af37', borderWidth: 1, borderRadius: 10, padding: 10 }}>
        <Text style={{ color: '#d4af37', textAlign: 'center', fontWeight: '900' }}>Open Key Review</Text>
      </Pressable>
    </View>
  );
}

function WebhooksPanel({
  health,
  status,
  onAction,
  onRefresh,
}: {
  health: AdminStripeWebhookHealth | null;
  status: WebhookHealthStatus;
  onAction: (label: string) => void;
  onRefresh: () => void;
}) {
  const readiness = health?.providerReadiness;
  const readinessTone = webhookHealthTone(readiness?.status);
  const healthTone = webhookHealthTone(health?.status);

  return (
    <View style={{ ...panelStyle('#183248'), flex: 1, minWidth: 280, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Webhooks</Text>
          <Text style={{ color: healthTone, fontSize: 11, fontWeight: '900', marginTop: 3 }}>{status === 'loading' ? 'LOADING' : health?.status?.toUpperCase() ?? 'OFFLINE'}</Text>
        </View>
        <Pressable onPress={onRefresh} style={{ backgroundColor: '#0d2234', borderColor: '#60a5fa', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
          <Text style={{ color: '#60a5fa', fontSize: 11, fontWeight: '900' }}>Refresh</Text>
        </Pressable>
      </View>

      {readiness ? (
        <View style={{ backgroundColor: '#0b1724', borderColor: readinessTone, borderWidth: 1, borderRadius: 12, padding: 10, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>Stripe Provider Readiness</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{readiness.environment} / {readiness.accountMode} / {readiness.webhookPath}</Text>
            </View>
            <Text style={{ color: readinessTone, fontSize: 11, fontWeight: '900' }}>{readiness.status.toUpperCase()}</Text>
          </View>
          {readiness.missingRequired.length ? (
            <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '800' }}>Missing: {readiness.missingRequired.join(', ')}</Text>
          ) : (
            <Text style={{ color: mxTheme.colors.success, fontSize: 11, fontWeight: '800' }}>Required account and webhook wiring configured</Text>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {readiness.checklist.map((check) => {
              const checkTone = check.status === 'pass' ? mxTheme.colors.success : check.status === 'fail' ? '#fb7185' : '#f5c542';
              return (
                <View key={check.key} style={{ backgroundColor: '#111827', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
                  <Text style={{ color: checkTone, fontSize: 10, fontWeight: '900' }}>{check.label}: {check.status}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {ADMIN_WEBHOOKS.map((row) => (
        <View key={row.id} style={{ borderTopColor: '#213344', borderTopWidth: 1, paddingTop: 10, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{row.label}</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{row.target}</Text>
            </View>
            <Text style={{ color: '#60a5fa', fontSize: 11, fontWeight: '900' }}>{formatPercentValue(row.successRate)}</Text>
          </View>
          <Text style={{ color: '#b8b8c4', fontSize: 11 }}>Last delivery {row.lastDelivery}</Text>
        </View>
      ))}
      {health ? (
        <Text style={{ color: '#b8b8c4', fontSize: 11 }}>
          Alerts {health.totals.alertCount} / unprocessed {health.totals.unprocessedWebhookCount} / payout drift {health.totals.payoutDriftCount}
        </Text>
      ) : null}
      <Pressable onPress={() => onAction('webhook delivery inspector')} style={{ backgroundColor: '#0d2234', borderColor: '#60a5fa', borderWidth: 1, borderRadius: 10, padding: 10 }}>
        <Text style={{ color: '#60a5fa', textAlign: 'center', fontWeight: '900' }}>Inspect Deliveries</Text>
      </Pressable>
    </View>
  );
}

export function AdminAnalyticsStatusScreen() {
  const [project, setProject] = useState(PROJECT_OPTIONS[0]);
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
  const [activeNavId, setActiveNavId] = useState('analytics');
  const [notice, setNotice] = useState('Admin analytics scaffold is active. Production read models, log retention, and provider webhooks are next.');
  const [webhookHealth, setWebhookHealth] = useState<AdminStripeWebhookHealth | null>(null);
  const [webhookHealthStatus, setWebhookHealthStatus] = useState<WebhookHealthStatus>('loading');
  const [webhookHealthRefreshKey, setWebhookHealthRefreshKey] = useState(0);

  const activeNavItem = useMemo(
    () => ADMIN_ANALYTICS_NAV_ITEMS.find((item) => item.id === activeNavId) || ADMIN_ANALYTICS_NAV_ITEMS[0],
    [activeNavId],
  );
  const trendPoints = useMemo(() => {
    if (dateRange === '7d') return ADMIN_CONVERSATION_TRENDS.slice(-4);
    if (dateRange === '90d') return ADMIN_CONVERSATION_TRENDS;
    return ADMIN_CONVERSATION_TRENDS.slice(-6);
  }, [dateRange]);
  const maxConversations = useMemo(() => Math.max(...trendPoints.map((point) => point.conversations), 1), [trendPoints]);
  const maxTopContent = useMemo(() => Math.max(...ADMIN_TOP_CONTENT.map((row) => row.value), 1), []);
  const subscriptionTotal = useMemo(() => ADMIN_SUBSCRIPTION_SEGMENTS.reduce((sum, segment) => sum + segment.count, 0), []);
  const degradedCount = useMemo(() => ADMIN_SYSTEM_SERVICES.filter((service) => service.status === 'degraded').length, []);
  const watchCount = useMemo(() => ADMIN_SYSTEM_SERVICES.filter((service) => service.status === 'watch').length, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWebhookHealth() {
      setWebhookHealthStatus('loading');

      try {
        const health = await getAdminStripeWebhookHealth();
        if (cancelled) return;
        setWebhookHealth(health);
        setWebhookHealthStatus('ready');
      } catch {
        if (cancelled) return;
        setWebhookHealth(null);
        setWebhookHealthStatus('error');
      }
    }

    loadWebhookHealth();

    return () => {
      cancelled = true;
    };
  }, [webhookHealthRefreshKey]);

  function selectNavItem(item: AdminAnalyticsNavItem) {
    setActiveNavId(item.id);
    setNotice(`${item.label} console selected for ${project}. Production routing will attach this panel to admin providers.`);
  }

  function handleOperationalAction(label: string) {
    setNotice(`${label} workflow queued in the scaffold. Backend audit logging and permission checks are the next integration point.`);
  }

  function refreshWebhookHealth() {
    setWebhookHealthRefreshKey((current) => current + 1);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 280 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 26, fontWeight: '900' }}>Admin Analytics</Text>
          <Text style={{ color: '#c084fc', marginTop: 6 }}>Project command, health, logs, keys, webhooks, and growth telemetry.</Text>
        </View>
        <HeaderControls project={project} dateRange={dateRange} onProjectChange={setProject} onDateRangeChange={setDateRange} />
      </View>

      <View style={{ ...panelStyle(activeNavItem.tone), gap: 8 }}>
        <Text style={{ color: activeNavItem.tone, fontSize: 11, fontWeight: '900' }}>{project.toUpperCase()} - {activeNavItem.badge}</Text>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>{activeNavItem.label}</Text>
        <Text style={{ color: '#d6d6dc', fontSize: 12 }}>{notice}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ADMIN_ANALYTICS_METRICS.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <TrendPanel trends={trendPoints} maxConversations={maxConversations} />
        <TopContentPanel maxValue={maxTopContent} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <SubscriptionPanel total={subscriptionTotal} />
        <SystemStatusPanel degradedCount={degradedCount} watchCount={watchCount} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <AdminNavPanel activeItem={activeNavItem} onSelect={selectNavItem} />
        <OperationsFeedPanel />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <ApiKeysPanel onAction={handleOperationalAction} />
        <WebhooksPanel
          health={webhookHealth}
          status={webhookHealthStatus}
          onAction={handleOperationalAction}
          onRefresh={refreshWebhookHealth}
        />
      </View>
    </ScrollView>
  );
}
