import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, type DimensionValue } from 'react-native';
import {
  acknowledgeAbacusProviderHealthAlert,
  bulkReviewAbacusOutputApprovals,
  type AbacusAutomationRunAction,
  type AbacusDownstreamExecutionQueueItem,
  deleteAbacusAutomationRule,
  exportAbacusTelemetry,
  getAbacusProviderHealth,
  getAbacusTelemetrySummary,
  getAbacusOpsConfig,
  listAbacusOutputApprovals,
  listAbacusOutputAudits,
  listAbacusRequestReviews,
  reviewAbacusOutputApproval,
  runAbacusAutomationRule,
  saveAbacusAutomationRule,
  saveAbacusRequestReview,
  saveAbacusOutputAudit,
  updateAbacusOpsConfig,
  updateAbacusDownstreamExecutionItem,
  validateAbacusDownstreamProviderDispatch,
  type AbacusOpsConfigResponse,
  type AbacusOutputApprovalQueueItem,
  type AbacusOutputApprovalStatus,
  type AbacusOutputAuditEvent,
  type AbacusDownstreamProviderValidationReport,
  type AbacusProviderHealthAlert,
  type AbacusProviderHealthResponse,
  type AbacusRequestReview,
  type AbacusRequestReviewPriority,
  type AbacusRequestReviewStatus,
  type AbacusTelemetryExport,
  type AbacusTelemetryExportRow,
  type AbacusTelemetryFailingPrompt,
  type AbacusTelemetrySummary,
} from '../../api/abacusApi';
import { mxTheme } from '../../theme/mxTheme';
import {
  ABACUS_AUDIT_EVENTS,
  ABACUS_AUTOMATION_RULES,
  ABACUS_PROVIDER_PROFILES,
  ABACUS_REVIEW_GATES,
  ABACUS_STUDIO_TASKS,
  buildDownstreamProviderReadiness,
  buildTelemetryExportCsv,
  buildTelemetryInsights,
  buildTelemetryProviderProfiles,
  buildTelemetrySuggestedActions,
  getProviderStatusLabel,
  getProviderStatusTone,
  getStudioTaskStatusLabel,
  type AbacusAuditEvent,
  type AbacusAutomationRule,
  type AbacusDownstreamProviderReadiness,
  type AbacusInsight,
  type AbacusProviderProfile,
  type AbacusReviewGate,
  type AbacusStudioTask,
  type AbacusSuggestedAction,
} from './abacusAiModel';

type TelemetryStatus = 'loading' | 'ready' | 'error';
type ExportStatus = 'idle' | 'loading' | 'ready' | 'error';
type OpsConfigStatus = 'loading' | 'ready' | 'saving' | 'error';
type ProviderHealthPanelStatus = 'loading' | 'ready' | 'error';
type AuditTrailStatus = 'loading' | 'ready' | 'saving' | 'error';
type AutomationActionStatus = 'idle' | 'saving' | 'error';
type DownstreamValidationStatus = 'idle' | 'loading' | 'ready' | 'error';
type RequestReviewPanelStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'error';
type RequestReviewQueueFilter = 'all' | 'errors' | 'unassigned' | 'active' | 'sla';
type ApprovalQueueFilter = 'needs_review' | 'changes_requested' | 'sla' | 'approved' | 'rejected' | 'all';

type RequestReviewQueueStats = {
  total: number;
  errors: number;
  unassigned: number;
  active: number;
  slaRisk: number;
};

type ApprovalQueueStats = {
  total: number;
  needsReview: number;
  changesRequested: number;
  approved: number;
  rejected: number;
  slaRisk: number;
};

type DownstreamQueueStats = {
  total: number;
  queued: number;
  blocked: number;
  dispatched: number;
};

const OUTPUT_APPROVAL_SLA_HOURS = 48;

const REQUEST_REVIEW_FILTERS: Array<{ id: RequestReviewQueueFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'errors', label: 'Errors' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'active', label: 'Active review' },
  { id: 'sla', label: 'SLA risk' },
];

const APPROVAL_QUEUE_FILTERS: Array<{ id: ApprovalQueueFilter; label: string }> = [
  { id: 'needs_review', label: 'Needs review' },
  { id: 'changes_requested', label: 'Changes' },
  { id: 'sla', label: 'SLA risk' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

function formatTelemetryRate(value?: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function formatDateLabel(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().replace('T', ' ').slice(0, 16);
}

function formatApprovalDecision(decision: AbacusOutputApprovalStatus) {
  return decision.replace('_', ' ');
}

function normalizeOpsStatus(status?: string): 'active' | 'draft' | 'paused' {
  if (status === 'active' || status === 'paused' || status === 'draft') return status;
  return 'draft';
}

function getReviewStatusTone(status?: AbacusRequestReviewStatus | string | null) {
  if (status === 'resolved') return mxTheme.colors.success;
  if (status === 'dismissed') return '#777';
  if (status === 'reviewing') return '#38bdf8';
  if (status === 'assigned') return '#f5c542';
  return '#c084fc';
}

function getReviewPriorityTone(priority?: AbacusRequestReviewPriority | string | null) {
  if (priority === 'critical') return '#fb7185';
  if (priority === 'high') return '#f5c542';
  if (priority === 'low') return '#60a5fa';
  return '#2dd4bf';
}

function getProviderHealthTone(status?: string) {
  if (status === 'ready') return mxTheme.colors.success;
  if (status === 'blocked') return '#fb7185';
  return '#f5c542';
}

function getProviderAlertTone(alert: AbacusProviderHealthAlert) {
  if (alert.acknowledged) return '#60a5fa';
  return alert.severity === 'critical' ? '#fb7185' : '#f5c542';
}

function isReviewableApprovalItem(item: AbacusOutputApprovalQueueItem) {
  return item.state === 'pending' || item.state === 'changes_requested';
}

function getApprovalAgeHours(item: AbacusOutputApprovalQueueItem) {
  const createdAt = new Date(item.event.createdAt).getTime();
  if (Number.isNaN(createdAt)) return 0;
  return Math.max(0, Math.floor((Date.now() - createdAt) / 36e5));
}

function isApprovalSlaRisk(item: AbacusOutputApprovalQueueItem) {
  return isReviewableApprovalItem(item) && getApprovalAgeHours(item) >= OUTPUT_APPROVAL_SLA_HOURS;
}

function getAutomationRunTone(status?: string | null) {
  if (status === 'completed') return mxTheme.colors.success;
  if (status === 'blocked') return '#fb7185';
  if (status === 'ready') return '#38bdf8';
  return '#f5c542';
}

function getDownstreamQueueTone(status?: string | null) {
  if (status === 'queued') return '#38bdf8';
  if (status === 'blocked') return '#fb7185';
  if (status === 'dispatched') return mxTheme.colors.success;
  return '#f5c542';
}

function getDownstreamValidationTone(status?: string | null) {
  if (status === 'ready' || status === 'pass') return mxTheme.colors.success;
  if (status === 'blocked' || status === 'fail') return '#fb7185';
  if (status === 'sent') return '#38bdf8';
  return '#f5c542';
}

function isClosedReview(review?: AbacusRequestReview | null) {
  return review?.status === 'resolved' || review?.status === 'dismissed';
}

function isActiveReview(review?: AbacusRequestReview | null) {
  return review?.status === 'assigned' || review?.status === 'reviewing';
}

function getRequestAgeHours(row: AbacusTelemetryExportRow) {
  const createdAt = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
  if (Number.isNaN(createdAt.getTime())) return 0;
  return Math.max(0, (Date.now() - createdAt.getTime()) / 36e5);
}

function isRequestSlaRisk(row: AbacusTelemetryExportRow, review?: AbacusRequestReview | null) {
  if (isClosedReview(review)) return false;
  return row.status === 'error' || getRequestAgeHours(row) >= 24;
}

function buildReviewQueueStats(rows: AbacusTelemetryExportRow[], reviews: AbacusRequestReview[]): RequestReviewQueueStats {
  return rows.reduce<RequestReviewQueueStats>((stats, row) => {
    const review = reviews.find((item) => item.requestId === row.requestId);

    stats.total += 1;
    if (row.status === 'error') stats.errors += 1;
    if (!review || review.status === 'open') stats.unassigned += 1;
    if (isActiveReview(review)) stats.active += 1;
    if (isRequestSlaRisk(row, review)) stats.slaRisk += 1;

    return stats;
  }, { total: 0, errors: 0, unassigned: 0, active: 0, slaRisk: 0 });
}

function buildApprovalQueueStats(queue: AbacusOutputApprovalQueueItem[]): ApprovalQueueStats {
  return queue.reduce<ApprovalQueueStats>((stats, item) => {
    stats.total += 1;
    if (item.state === 'pending') stats.needsReview += 1;
    if (item.state === 'changes_requested') stats.changesRequested += 1;
    if (item.state === 'approved') stats.approved += 1;
    if (item.state === 'rejected') stats.rejected += 1;
    if (isApprovalSlaRisk(item)) stats.slaRisk += 1;

    return stats;
  }, { total: 0, needsReview: 0, changesRequested: 0, approved: 0, rejected: 0, slaRisk: 0 });
}

function buildDownstreamQueueStats(queue: AbacusDownstreamExecutionQueueItem[]): DownstreamQueueStats {
  return queue.reduce<DownstreamQueueStats>((stats, item) => {
    stats.total += 1;
    if (item.status === 'queued') stats.queued += 1;
    if (item.status === 'blocked') stats.blocked += 1;
    if (item.status === 'dispatched') stats.dispatched += 1;
    return stats;
  }, { total: 0, queued: 0, blocked: 0, dispatched: 0 });
}

function mapOutputAuditEvent(event: AbacusOutputAuditEvent): AbacusAuditEvent {
  return {
    id: event.id,
    title: event.title,
    area: event.area,
    outputType: event.outputType,
    actor: event.actor,
    createdAt: event.createdAt,
    status: event.status,
  };
}

function panelStyle(borderColor = mxTheme.colors.border) {
  return {
    backgroundColor: '#0f0f14',
    borderColor,
    borderWidth: 1,
    borderRadius: mxTheme.radius.lg,
    padding: mxTheme.spacing.md,
  };
}

function ProgressBar({ value, tone }: { value: number; tone: string }) {
  const width = `${Math.max(5, Math.min(100, value))}%` as DimensionValue;

  return (
    <View style={{ backgroundColor: '#1b1b24', borderRadius: 999, height: 8, overflow: 'hidden' }}>
      <View style={{ backgroundColor: tone, borderRadius: 999, height: 8, width }} />
    </View>
  );
}

function InsightCard({ insight }: { insight: AbacusInsight }) {
  return (
    <View style={{ ...panelStyle(`${insight.tone}66`), flex: 1, minWidth: 210, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>{insight.title}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{insight.value}</Text>
        </View>
        <View style={{ backgroundColor: `${insight.tone}24`, borderColor: insight.tone, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ color: insight.tone, fontSize: 11, fontWeight: '900' }}>{insight.glyph}</Text>
        </View>
      </View>
      <Text style={{ color: '#d6d6dc', fontSize: 12, lineHeight: 17 }}>{insight.detail}</Text>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Confidence</Text>
          <Text style={{ color: insight.tone, fontSize: 11, fontWeight: '900' }}>{insight.confidence}% - {insight.trendLabel}</Text>
        </View>
        <ProgressBar value={insight.confidence} tone={insight.tone} />
      </View>
    </View>
  );
}

function StudioTaskCard({
  task,
  active,
  onPress,
}: {
  task: AbacusStudioTask;
  active: boolean;
  onPress: (task: AbacusStudioTask) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(task)}
      style={{ ...panelStyle(active ? task.tone : '#2a2a33'), flex: 1, minWidth: 220, gap: 8 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900', flex: 1 }}>{task.title}</Text>
        <Text style={{ color: task.tone, fontSize: 11, fontWeight: '900' }}>{getStudioTaskStatusLabel(task.status).toUpperCase()}</Text>
      </View>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 17 }}>{task.description}</Text>
      <Text style={{ color: task.tone, fontSize: 12, fontWeight: '900' }}>{task.outputLabel}</Text>
    </Pressable>
  );
}

function PromptComposer({
  activeTask,
  prompt,
  onPromptChange,
  onRun,
}: {
  activeTask: AbacusStudioTask;
  prompt: string;
  onPromptChange: (value: string) => void;
  onRun: () => void;
}) {
  return (
    <View style={{ ...panelStyle(activeTask.tone), gap: 10, flex: 1, minWidth: 300 }}>
      <View>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>AI Studio</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4 }}>{activeTask.title} - {activeTask.outputLabel}</Text>
      </View>
      <TextInput
        value={prompt}
        onChangeText={onPromptChange}
        multiline
        placeholder="Describe the dashboard widget, campaign idea, layout, or automation you want Abacus AI to draft..."
        placeholderTextColor="#777"
        style={{
          minHeight: 120,
          borderColor: '#2d2d38',
          borderWidth: 1,
          borderRadius: 12,
          color: mxTheme.colors.text,
          backgroundColor: '#09090d',
          padding: 12,
          textAlignVertical: 'top',
        }}
      />
      <Pressable onPress={onRun} style={{ backgroundColor: activeTask.tone, borderRadius: 12, padding: 12 }}>
        <Text style={{ color: '#050505', textAlign: 'center', fontWeight: '900' }}>Generate Draft</Text>
      </Pressable>
    </View>
  );
}

function ProviderCard({
  provider,
  active,
  onPress,
}: {
  provider: AbacusProviderProfile;
  active: boolean;
  onPress: (provider: AbacusProviderProfile) => void;
}) {
  const statusTone = getProviderStatusTone(provider.status);

  return (
    <Pressable onPress={() => onPress(provider)} style={{ ...panelStyle(active ? statusTone : '#2a2a33'), flex: 1, minWidth: 240, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>{provider.name}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{provider.mode.toUpperCase()} - {provider.costTier.toUpperCase()} COST</Text>
        </View>
        <View style={{ backgroundColor: `${statusTone}1f`, borderColor: statusTone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
          <Text style={{ color: statusTone, fontSize: 10, fontWeight: '900' }}>{getProviderStatusLabel(provider.status)}</Text>
        </View>
      </View>
      <Text style={{ color: '#d6d6dc', fontSize: 12, lineHeight: 17 }}>{provider.note}</Text>
      <Text style={{ color: statusTone, fontSize: 11, fontWeight: '900' }}>
        {provider.latencyMs > 0 ? `${provider.latencyMs}ms latency` : 'No live request'} - telemetry {provider.telemetry}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {provider.capabilities.map((capability) => (
          <View key={capability} style={{ backgroundColor: '#181820', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
            <Text style={{ color: '#c9c9d1', fontSize: 10, fontWeight: '800' }}>{capability}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function AutomationRuleRow({
  rule,
  busy,
  onRun,
  onToggle,
  onDelete,
}: {
  rule: AbacusAutomationRule;
  busy: boolean;
  onRun: (rule: AbacusAutomationRule) => void;
  onToggle: (rule: AbacusAutomationRule) => void;
  onDelete: (rule: AbacusAutomationRule) => void;
}) {
  const statusTone = rule.status === 'active' ? mxTheme.colors.success : rule.status === 'paused' ? mxTheme.colors.warning : '#60a5fa';
  const nextStatusLabel = rule.status === 'paused' ? 'Activate' : 'Pause';
  const runTone = getAutomationRunTone(rule.lastRunStatus);
  const runActions = rule.lastRunActions ?? [];

  return (
    <View style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 10, gap: 7 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{rule.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{rule.trigger}</Text>
        </View>
        <Text style={{ color: statusTone, fontSize: 11, fontWeight: '900' }}>{rule.status.toUpperCase()}</Text>
      </View>
      <Text style={{ color: '#c9c9d1', fontSize: 12 }}>{rule.action}</Text>
      <View style={{ backgroundColor: '#101018', borderColor: '#242433', borderWidth: 1, borderRadius: 12, padding: 9, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ color: runTone, fontSize: 11, fontWeight: '900' }}>
            {(rule.lastRunStatus ?? 'not run').toUpperCase()}{rule.lastRunAdapter ? ` - ${rule.lastRunAdapter}` : ''}
          </Text>
          <Text style={{ color: '#777', fontSize: 11 }}>Adapter: {rule.adapter ?? 'auto'}</Text>
        </View>
        {rule.lastRunSummary ? (
          <Text style={{ color: '#d6d6dc', fontSize: 12, lineHeight: 17 }}>{rule.lastRunSummary}</Text>
        ) : (
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 17 }}>Run now will execute the safest matching Abacus automation adapter and keep any public action review-gated.</Text>
        )}
        {runActions.length ? (
          <View style={{ gap: 5 }}>
            {runActions.slice(0, 3).map((action: AbacusAutomationRunAction) => (
              <View key={`${rule.id}-${action.type}-${action.label}`} style={{ flexDirection: 'row', gap: 7, alignItems: 'flex-start' }}>
                <View style={{ backgroundColor: getAutomationRunTone(action.status), borderRadius: 999, height: 7, marginTop: 5, width: 7 }} />
                <Text style={{ color: '#c9c9d1', fontSize: 11, flex: 1 }}>{action.label}: {action.detail}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Text style={{ color: '#777', fontSize: 11 }}>Last run: {rule.lastRun}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Pressable disabled={busy} onPress={() => onRun(rule)} style={{ backgroundColor: '#181820', borderColor: rule.tone, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: busy ? 0.5 : 1 }}>
            <Text style={{ color: rule.tone, fontSize: 11, fontWeight: '900' }}>{busy ? 'Saving' : 'Run Now'}</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => onToggle(rule)} style={{ backgroundColor: '#181820', borderColor: statusTone, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: busy ? 0.5 : 1 }}>
            <Text style={{ color: statusTone, fontSize: 11, fontWeight: '900' }}>{nextStatusLabel}</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => onDelete(rule)} style={{ backgroundColor: '#181820', borderColor: '#fb7185', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: busy ? 0.5 : 1 }}>
            <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '900' }}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SuggestedActionCard({ action, onPress }: { action: AbacusSuggestedAction; onPress: (action: AbacusSuggestedAction) => void }) {
  return (
    <Pressable onPress={() => onPress(action)} style={{ backgroundColor: '#14141b', borderColor: `${action.tone}66`, borderWidth: 1, borderRadius: 14, padding: 12, flex: 1, minWidth: 220, gap: 7 }}>
      <Text style={{ color: action.tone, fontSize: 11, fontWeight: '900' }}>{action.priority.toUpperCase()}</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 15, fontWeight: '900' }}>{action.title}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 17 }}>{action.detail}</Text>
    </Pressable>
  );
}

function AuditTrailPanel({
  events,
  status,
  onRefresh,
}: {
  events: AbacusAuditEvent[];
  status: AuditTrailStatus;
  onRefresh: () => void;
}) {
  return (
    <View style={{ ...panelStyle('#2d2248'), flex: 1, minWidth: 280, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 170 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Output Audit Trail</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>{events.length} persisted and scaffold audit rows</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text style={{ color: status === 'error' ? '#fb7185' : status === 'saving' ? '#f5c542' : '#c084fc', fontSize: 11, fontWeight: '900' }}>{status.toUpperCase()}</Text>
          <Pressable onPress={onRefresh} style={{ backgroundColor: '#181820', borderColor: '#c084fc', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
            <Text style={{ color: '#c084fc', fontSize: 11, fontWeight: '900' }}>Refresh</Text>
          </Pressable>
        </View>
      </View>
      {events.map((event) => {
        const statusTone = event.status === 'saved' ? mxTheme.colors.success : event.status === 'review' ? mxTheme.colors.warning : '#60a5fa';
        return (
          <View key={event.id} style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 10, gap: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ color: mxTheme.colors.text, fontWeight: '900', flex: 1 }}>{event.title}</Text>
              <Text style={{ color: statusTone, fontSize: 11, fontWeight: '900' }}>{event.status.toUpperCase()}</Text>
            </View>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{event.area} - {event.outputType}</Text>
            <Text style={{ color: '#777', fontSize: 11 }}>{event.actor} - {event.createdAt}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ApprovalQueuePanel({
  queue,
  queueStats,
  filter,
  status,
  busyEventId,
  onFilterChange,
  onRefresh,
  onReview,
  onBulkReview,
}: {
  queue: AbacusOutputApprovalQueueItem[];
  queueStats: ApprovalQueueStats;
  filter: ApprovalQueueFilter;
  status: AuditTrailStatus;
  busyEventId: string | null;
  onFilterChange: (filter: ApprovalQueueFilter) => void;
  onRefresh: () => void;
  onReview: (item: AbacusOutputApprovalQueueItem, decision: AbacusOutputApprovalStatus) => void;
  onBulkReview: (decision: AbacusOutputApprovalStatus) => void;
}) {
  const reviewable = queue.filter(isReviewableApprovalItem);
  const pendingCount = queueStats.needsReview + queueStats.changesRequested;
  const bulkDisabled = !reviewable.length || status === 'saving';

  return (
    <View style={{ ...panelStyle('#f5c542'), flex: 1, minWidth: 300, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Output Approval Queue</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>{pendingCount} pending go-live review / {queueStats.total} total</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text style={{ color: status === 'error' ? '#fb7185' : '#f5c542', fontSize: 11, fontWeight: '900' }}>{status.toUpperCase()}</Text>
          <Pressable onPress={onRefresh} style={{ backgroundColor: '#181820', borderColor: '#f5c542', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
            <Text style={{ color: '#f5c542', fontSize: 11, fontWeight: '900' }}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {APPROVAL_QUEUE_FILTERS.map((option) => {
          const count = option.id === 'needs_review'
            ? queueStats.needsReview
            : option.id === 'changes_requested'
              ? queueStats.changesRequested
              : option.id === 'sla'
                ? queueStats.slaRisk
                : option.id === 'approved'
                  ? queueStats.approved
                  : option.id === 'rejected'
                    ? queueStats.rejected
                    : queueStats.total;
          const active = filter === option.id;
          const tone = option.id === 'sla' && count > 0 ? '#fb7185' : active ? '#f5c542' : '#777';

          return (
            <Pressable
              key={option.id}
              onPress={() => onFilterChange(option.id)}
              style={{
                backgroundColor: active ? '#2b2110' : '#181820',
                borderColor: tone,
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 7,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{option.label} {count}</Text>
            </Pressable>
          );
        })}
      </View>

      {queueStats.slaRisk > 0 ? (
        <View style={{ backgroundColor: 'rgba(251,113,133,0.12)', borderColor: '#fb7185', borderWidth: 1, borderRadius: 12, padding: 10 }}>
          <Text style={{ color: '#fb7185', fontSize: 12, fontWeight: '900' }}>
            {queueStats.slaRisk} output{queueStats.slaRisk === 1 ? '' : 's'} waiting over {OUTPUT_APPROVAL_SLA_HOURS}h for go-live approval
          </Text>
        </View>
      ) : null}

      {queue.slice(0, 6).map((item) => {
        const busy = busyEventId === item.event.id || status === 'saving';
        const reviewableItem = isReviewableApprovalItem(item);
        const ageHours = getApprovalAgeHours(item);
        return (
          <View key={item.event.id} style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 10, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ color: mxTheme.colors.text, fontWeight: '900', flex: 1 }}>{item.event.title}</Text>
              <Text style={{ color: item.state === 'changes_requested' ? '#fb7185' : '#f5c542', fontSize: 11, fontWeight: '900' }}>{String(item.state).toUpperCase()}</Text>
            </View>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{item.event.area} - {item.event.outputType}</Text>
            <Text style={{ color: '#777', fontSize: 11 }}>Created {formatDateLabel(item.event.createdAt)} / waiting {ageHours}h</Text>
            {isApprovalSlaRisk(item) ? (
              <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '900' }}>SLA attention needed</Text>
            ) : null}
            {item.approval?.note ? (
              <Text style={{ color: '#c9c9d1', fontSize: 11 }}>{item.approval.note}</Text>
            ) : null}
            {reviewableItem ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <Pressable disabled={busy} onPress={() => onReview(item, 'approved')} style={{ backgroundColor: '#181820', borderColor: mxTheme.colors.success, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: busy ? 0.5 : 1 }}>
                  <Text style={{ color: mxTheme.colors.success, fontSize: 11, fontWeight: '900' }}>{busy ? 'Saving' : 'Approve'}</Text>
                </Pressable>
                <Pressable disabled={busy} onPress={() => onReview(item, 'changes_requested')} style={{ backgroundColor: '#181820', borderColor: '#f5c542', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: busy ? 0.5 : 1 }}>
                  <Text style={{ color: '#f5c542', fontSize: 11, fontWeight: '900' }}>Changes</Text>
                </Pressable>
                <Pressable disabled={busy} onPress={() => onReview(item, 'rejected')} style={{ backgroundColor: '#181820', borderColor: '#fb7185', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: busy ? 0.5 : 1 }}>
                  <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '900' }}>Reject</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={{ color: '#777', fontSize: 11 }}>Reviewed {item.approval?.reviewedAt ? formatDateLabel(item.approval.reviewedAt) : 'recently'} by {item.approval?.reviewedBy ?? 'admin'}</Text>
            )}
          </View>
        );
      })}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable onPress={() => onBulkReview('approved')} disabled={bulkDisabled} style={{ backgroundColor: '#10251f', borderColor: mxTheme.colors.success, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: bulkDisabled ? 0.5 : 1 }}>
          <Text style={{ color: mxTheme.colors.success, fontSize: 11, fontWeight: '900' }}>Bulk approve {reviewable.length}</Text>
        </Pressable>
        <Pressable onPress={() => onBulkReview('changes_requested')} disabled={bulkDisabled} style={{ backgroundColor: '#2b2110', borderColor: '#f5c542', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: bulkDisabled ? 0.5 : 1 }}>
          <Text style={{ color: '#f5c542', fontSize: 11, fontWeight: '900' }}>Bulk changes {reviewable.length}</Text>
        </Pressable>
        <Pressable onPress={() => onBulkReview('rejected')} disabled={bulkDisabled} style={{ backgroundColor: '#28131a', borderColor: '#fb7185', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: bulkDisabled ? 0.5 : 1 }}>
          <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '900' }}>Bulk reject {reviewable.length}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DownstreamExecutionQueuePanel({
  queue,
  stats,
  readiness,
  validation,
  validationStatus,
  status,
  busyItemId,
  onValidate,
  onUpdate,
}: {
  queue: AbacusDownstreamExecutionQueueItem[];
  stats: DownstreamQueueStats;
  readiness: AbacusDownstreamProviderReadiness;
  validation: AbacusDownstreamProviderValidationReport | null;
  validationStatus: DownstreamValidationStatus;
  status: AuditTrailStatus;
  busyItemId: string | null;
  onValidate: () => void;
  onUpdate: (item: AbacusDownstreamExecutionQueueItem, status: 'queued' | 'blocked' | 'dispatched') => void;
}) {
  return (
    <View style={{ ...panelStyle('#38bdf8'), flex: 1, minWidth: 300, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Downstream Queue</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>{stats.queued} queued / {stats.blocked} blocked / {stats.dispatched} dispatched</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <Text style={{ color: status === 'error' ? '#fb7185' : '#38bdf8', fontSize: 11, fontWeight: '900' }}>{status.toUpperCase()}</Text>
          <Pressable onPress={onValidate} disabled={validationStatus === 'loading'} style={{ backgroundColor: '#181820', borderColor: '#2dd4bf', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: validationStatus === 'loading' ? 0.5 : 1 }}>
            <Text style={{ color: '#2dd4bf', fontSize: 11, fontWeight: '900' }}>{validationStatus === 'loading' ? 'Validating' : 'Validate'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ backgroundColor: `${readiness.tone}14`, borderColor: readiness.tone, borderWidth: 1, borderRadius: 12, padding: 10, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900', flex: 1, minWidth: 170 }}>{readiness.title}</Text>
          <Text style={{ color: readiness.tone, fontSize: 11, fontWeight: '900' }}>{readiness.status.toUpperCase()} / {readiness.dispatchableCount} READY</Text>
        </View>
        <Text style={{ color: '#c9c9d1', fontSize: 11, lineHeight: 16 }}>{readiness.detail}</Text>
        <View style={{ gap: 4 }}>
          {readiness.checks.slice(0, 3).map((check) => (
            <Text key={check} style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 15 }}>{check}</Text>
          ))}
        </View>
      </View>

      {validation ? (
        <View style={{ backgroundColor: `${getDownstreamValidationTone(validation.status)}14`, borderColor: getDownstreamValidationTone(validation.status), borderWidth: 1, borderRadius: 12, padding: 10, gap: 7 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900', flex: 1, minWidth: 170 }}>{validation.title}</Text>
            <Text style={{ color: getDownstreamValidationTone(validation.status), fontSize: 11, fontWeight: '900' }}>{validation.status.toUpperCase()}</Text>
          </View>
          <Text style={{ color: '#c9c9d1', fontSize: 11, lineHeight: 16 }}>{validation.detail}</Text>
          <Text style={{ color: '#777', fontSize: 11 }}>{validation.readyCount} ready / {validation.heldCount} held / {validation.sentCount} sent / {validation.blockedCount} blocked</Text>
          <View style={{ gap: 4 }}>
            {validation.checks.slice(0, 4).map((check) => (
              <Text key={check.id} style={{ color: getDownstreamValidationTone(check.status), fontSize: 11, lineHeight: 15 }}>{check.label}: {check.detail}</Text>
            ))}
          </View>
        </View>
      ) : null}

      {queue.length ? queue.slice(0, 5).map((item) => {
        const tone = getDownstreamQueueTone(item.status);
        const busy = busyItemId === item.id || status === 'saving';
        const plan = item.providerDispatchPlan;
        const dispatchDisabled = busy || readiness.status !== 'ready' || item.status !== 'queued' || plan?.status === 'held';
        return (
          <View key={item.id} style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 10, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ color: mxTheme.colors.text, fontWeight: '900', flex: 1 }}>{item.title}</Text>
              <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>{item.target}</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{item.area} - {item.outputType}</Text>
            <Text style={{ color: '#c9c9d1', fontSize: 11 }}>{item.detail}</Text>
            {plan ? (
              <View style={{ backgroundColor: '#101018', borderColor: '#242433', borderWidth: 1, borderRadius: 10, padding: 8, gap: 4 }}>
                <Text style={{ color: plan.status === 'ready' ? mxTheme.colors.success : plan.status === 'sent' ? '#38bdf8' : '#f5c542', fontSize: 11, fontWeight: '900' }}>
                  {plan.status.toUpperCase()} - {plan.providerName ?? 'No ready provider'} - {plan.adapter}
                </Text>
                <Text style={{ color: '#c9c9d1', fontSize: 11, lineHeight: 15 }}>{plan.detail}</Text>
              </View>
            ) : null}
            {item.providerReference ? (
              <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>Provider ref: {item.providerReference}</Text>
            ) : null}
            {item.dispatchNote ? (
              <Text style={{ color: '#c9c9d1', fontSize: 11 }}>{item.dispatchNote}</Text>
            ) : null}
            <Text style={{ color: '#777', fontSize: 11 }}>Approved {formatDateLabel(item.approvedAt)} by {item.approvedBy}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <Pressable disabled={dispatchDisabled} onPress={() => onUpdate(item, 'dispatched')} style={{ backgroundColor: '#10251f', borderColor: mxTheme.colors.success, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: dispatchDisabled ? 0.5 : 1 }}>
                <Text style={{ color: mxTheme.colors.success, fontSize: 11, fontWeight: '900' }}>{busy ? 'Saving' : 'Dispatched'}</Text>
              </Pressable>
              <Pressable disabled={busy} onPress={() => onUpdate(item, 'blocked')} style={{ backgroundColor: '#28131a', borderColor: '#fb7185', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: busy ? 0.5 : 1 }}>
                <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '900' }}>Block</Text>
              </Pressable>
              <Pressable disabled={busy} onPress={() => onUpdate(item, 'queued')} style={{ backgroundColor: '#181820', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: busy ? 0.5 : 1 }}>
                <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>Requeue</Text>
              </Pressable>
            </View>
          </View>
        );
      }) : (
        <View style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 10 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>No approved output is queued for downstream execution.</Text>
        </View>
      )}
    </View>
  );
}

function OpsConfigPanel({
  status,
  config,
  automationRules,
  reviewGates,
  onRefresh,
  onSave,
}: {
  status: OpsConfigStatus;
  config: AbacusOpsConfigResponse | null;
  automationRules: AbacusAutomationRule[];
  reviewGates: AbacusReviewGate[];
  onRefresh: () => void;
  onSave: () => void;
}) {
  return (
    <View style={{ ...panelStyle(status === 'error' ? '#fb7185' : '#2dd4bf'), flex: 1, minWidth: 300, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 190 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Persisted Ops Config</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>
            {config?.persisted ? `Saved ${config.updatedAt ?? 'recently'}` : 'Using scaffold defaults'}
          </Text>
        </View>
        <Text style={{ color: status === 'error' ? '#fb7185' : '#2dd4bf', fontSize: 11, fontWeight: '900' }}>{status.toUpperCase()}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ backgroundColor: '#14141b', borderColor: '#282833', borderWidth: 1, borderRadius: 12, padding: 10, flex: 1, minWidth: 120 }}>
          <Text style={{ color: '#2dd4bf', fontSize: 18, fontWeight: '900' }}>{config?.config.providerProfiles.length ?? 0}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Providers</Text>
        </View>
        <View style={{ backgroundColor: '#14141b', borderColor: '#282833', borderWidth: 1, borderRadius: 12, padding: 10, flex: 1, minWidth: 120 }}>
          <Text style={{ color: '#38bdf8', fontSize: 18, fontWeight: '900' }}>{automationRules.length}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Automation Rules</Text>
        </View>
        <View style={{ backgroundColor: '#14141b', borderColor: '#282833', borderWidth: 1, borderRadius: 12, padding: 10, flex: 1, minWidth: 120 }}>
          <Text style={{ color: '#f5c542', fontSize: 18, fontWeight: '900' }}>{reviewGates.length}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Review Gates</Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        {reviewGates.slice(0, 3).map((gate) => (
          <View key={gate.id} style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 8, gap: 4 }}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{gate.title}</Text>
            <Text style={{ color: gate.tone, fontSize: 11, fontWeight: '900' }}>{gate.area} / {gate.requiredRole} / {gate.status}</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{gate.checks.join(', ')}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable onPress={onSave} style={{ backgroundColor: '#2dd4bf', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
          <Text style={{ color: '#050505', fontSize: 11, fontWeight: '900' }}>{status === 'saving' ? 'Saving' : 'Save Config'}</Text>
        </Pressable>
        <Pressable onPress={onRefresh} style={{ backgroundColor: '#181820', borderColor: '#2dd4bf', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
          <Text style={{ color: '#2dd4bf', fontSize: 11, fontWeight: '900' }}>Refresh Config</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProviderHealthPanel({
  status,
  health,
  acknowledgingAlertId,
  onRefresh,
  onAcknowledge,
}: {
  status: ProviderHealthPanelStatus;
  health: AbacusProviderHealthResponse | null;
  acknowledgingAlertId: string | null;
  onRefresh: () => void;
  onAcknowledge: (alert: AbacusProviderHealthAlert) => void;
}) {
  const tone = status === 'error' ? '#fb7185' : getProviderHealthTone(health?.status);
  const statusLabel = status === 'loading' ? 'LOADING' : health?.status?.toUpperCase() ?? 'OFFLINE';
  const missingSecrets = health?.missingRequiredSecrets ?? [];
  const providerAlerts = health?.alerts ?? [];
  const activeAlerts = providerAlerts.filter((alert) => !alert.acknowledged);
  const acknowledgedAlerts = providerAlerts.filter((alert) => alert.acknowledged);

  return (
    <View style={{ ...panelStyle(tone), gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Provider Health</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>
            {health ? `Checked ${formatDateLabel(health.generatedAt)}` : 'Provider readiness checks are unavailable'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{statusLabel}</Text>
          <Pressable onPress={onRefresh} style={{ backgroundColor: '#181820', borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
            <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>Refresh Health</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ backgroundColor: '#14141b', borderColor: '#282833', borderWidth: 1, borderRadius: 12, padding: 10, flex: 1, minWidth: 140 }}>
          <Text style={{ color: mxTheme.colors.success, fontSize: 18, fontWeight: '900' }}>{health?.readyProviderCount ?? 0}/{health?.providerCount ?? 0}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Ready Providers</Text>
        </View>
        <View style={{ backgroundColor: '#14141b', borderColor: '#282833', borderWidth: 1, borderRadius: 12, padding: 10, flex: 1, minWidth: 140 }}>
          <Text style={{ color: missingSecrets.length ? '#fb7185' : mxTheme.colors.success, fontSize: 18, fontWeight: '900' }}>{missingSecrets.length}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Missing Required Secrets</Text>
        </View>
        <View style={{ backgroundColor: '#14141b', borderColor: '#282833', borderWidth: 1, borderRadius: 12, padding: 10, flex: 1, minWidth: 140 }}>
          <Text style={{ color: health?.staging.ready ? mxTheme.colors.success : '#f5c542', fontSize: 18, fontWeight: '900' }}>{health?.staging.ready ? 'Ready' : 'Review'}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Staging Readiness</Text>
        </View>
        <View style={{ backgroundColor: '#14141b', borderColor: '#282833', borderWidth: 1, borderRadius: 12, padding: 10, flex: 1, minWidth: 140 }}>
          <Text style={{ color: activeAlerts.length ? '#fb7185' : mxTheme.colors.success, fontSize: 18, fontWeight: '900' }}>{activeAlerts.length}/{providerAlerts.length}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Active Alerts</Text>
        </View>
      </View>

      {missingSecrets.length ? (
        <View style={{ backgroundColor: '#21131b', borderColor: '#fb7185', borderWidth: 1, borderRadius: 12, padding: 10, gap: 4 }}>
          <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '900' }}>MISSING</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 13, fontWeight: '800' }}>{missingSecrets.join(', ')}</Text>
        </View>
      ) : null}

      {providerAlerts.length ? (
        <View style={{ gap: 8 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>Alert History</Text>
          {providerAlerts.slice(0, 5).map((alert) => {
            const alertTone = getProviderAlertTone(alert);
            return (
              <View key={alert.id} style={{ backgroundColor: '#14141b', borderColor: alertTone, borderWidth: 1, borderRadius: 12, padding: 10, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <View style={{ flex: 1, minWidth: 180 }}>
                    <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{alert.title}</Text>
                    <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{alert.detail}</Text>
                  </View>
                  <Text style={{ color: alertTone, fontSize: 10, fontWeight: '900' }}>{alert.acknowledged ? 'ACKNOWLEDGED' : alert.severity.toUpperCase()}</Text>
                </View>
                {alert.acknowledgement ? (
                  <Text style={{ color: '#c9c9d1', fontSize: 11 }}>
                    {alert.acknowledgement.acknowledgedBy} - {formatDateLabel(alert.acknowledgement.acknowledgedAt)}
                    {alert.acknowledgement.note ? ` - ${alert.acknowledgement.note}` : ''}
                  </Text>
                ) : (
                  <Pressable
                    onPress={() => onAcknowledge(alert)}
                    disabled={acknowledgingAlertId === alert.id}
                    style={{ alignSelf: 'flex-start', backgroundColor: '#181820', borderColor: alertTone, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: acknowledgingAlertId === alert.id ? 0.55 : 1 }}
                  >
                    <Text style={{ color: alertTone, fontSize: 11, fontWeight: '900' }}>{acknowledgingAlertId === alert.id ? 'Saving' : 'Acknowledge'}</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
          {acknowledgedAlerts.length ? (
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>{acknowledgedAlerts.length} alert{acknowledgedAlerts.length === 1 ? '' : 's'} acknowledged in the current health set.</Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(health?.providers ?? []).slice(0, 4).map((provider) => {
          const providerTone = getProviderHealthTone(provider.status);
          return (
            <View key={provider.id} style={{ backgroundColor: '#14141b', borderColor: providerTone, borderWidth: 1, borderRadius: 12, padding: 10, flex: 1, minWidth: 190, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ color: mxTheme.colors.text, fontWeight: '900', flex: 1 }}>{provider.name}</Text>
                <Text style={{ color: providerTone, fontSize: 10, fontWeight: '900' }}>{provider.status.toUpperCase()}</Text>
              </View>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{provider.mode.toUpperCase()} / {provider.readinessScore}% ready</Text>
              <ProgressBar value={provider.readinessScore} tone={providerTone} />
              {provider.warnings[0] ? <Text style={{ color: '#c9c9d1', fontSize: 11 }}>{provider.warnings[0]}</Text> : null}
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(health?.checks ?? []).map((check) => {
          const checkTone = check.status === 'ready' ? mxTheme.colors.success : check.status === 'missing' ? '#fb7185' : '#f5c542';
          return (
            <View key={check.id} style={{ backgroundColor: '#181820', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9 }}>
              <Text style={{ color: checkTone, fontSize: 10, fontWeight: '900' }}>{check.label}: {check.status}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FailingPromptDrilldown({
  prompts,
  activeIndex,
  onSelect,
}: {
  prompts: AbacusTelemetryFailingPrompt[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const activePrompt = prompts[activeIndex] ?? prompts[0];

  return (
    <View style={{ ...panelStyle(activePrompt ? '#fb7185' : '#2d2248'), flex: 1, minWidth: 300, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Failing Prompts</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>{prompts.length ? `${prompts.length} prompt clusters` : 'No failing prompts in range'}</Text>
        </View>
        <Text style={{ color: activePrompt ? '#fb7185' : mxTheme.colors.success, fontSize: 11, fontWeight: '900' }}>{activePrompt ? 'REVIEW' : 'CLEAR'}</Text>
      </View>

      {activePrompt ? (
        <View style={{ backgroundColor: '#09090d', borderColor: '#2d2d38', borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
          <Text style={{ color: '#fb7185', fontSize: 11, fontWeight: '900' }}>{activePrompt.count} FAILS - {formatDateLabel(activePrompt.latestAt)}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 14, lineHeight: 19 }}>{activePrompt.promptPreview}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 17 }}>{activePrompt.latestError ?? 'No error detail captured.'}</Text>
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        {prompts.slice(0, 5).map((prompt, index) => (
          <Pressable
            key={`${prompt.promptPreview}-${index}`}
            onPress={() => onSelect(index)}
            style={{
              backgroundColor: index === activeIndex ? '#21131b' : '#14141b',
              borderColor: index === activeIndex ? '#fb7185' : '#282833',
              borderWidth: 1,
              borderRadius: 12,
              padding: 10,
              gap: 4,
            }}
          >
            <Text style={{ color: index === activeIndex ? '#fb7185' : '#c9c9d1', fontSize: 11, fontWeight: '900' }}>{prompt.count} fails</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 12 }} numberOfLines={2}>{prompt.promptPreview}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function TelemetryExportPanel({
  range,
  status,
  telemetryExport,
  csvPreview,
  onExport,
  onCopy,
  onDownload,
}: {
  range: string;
  status: ExportStatus;
  telemetryExport: AbacusTelemetryExport | null;
  csvPreview: string;
  onExport: () => void;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const rowCount = telemetryExport?.rows.length ?? 0;
  const latestRow = telemetryExport?.rows[0];

  return (
    <View style={{ ...panelStyle('#38bdf8'), flex: 1, minWidth: 300, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Telemetry Export</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>{rowCount} rows / {range}</Text>
        </View>
        <Text style={{ color: status === 'error' ? '#fb7185' : '#38bdf8', fontSize: 11, fontWeight: '900' }}>{status.toUpperCase()}</Text>
      </View>

      {latestRow ? (
        <View style={{ backgroundColor: '#09090d', borderColor: '#2d2d38', borderWidth: 1, borderRadius: 12, padding: 12, gap: 5 }}>
          <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>{latestRow.status.toUpperCase()} - {latestRow.model ?? 'unknown model'}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 13 }} numberOfLines={2}>{latestRow.promptPreview ?? 'No prompt preview'}</Text>
          <Text style={{ color: '#777', fontSize: 11 }}>{formatDateLabel(latestRow.createdAt)} / {latestRow.totalTokens ?? 0} tokens / {latestRow.latencyMs ?? 0}ms</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable onPress={onExport} style={{ backgroundColor: '#38bdf8', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
          <Text style={{ color: '#050505', fontSize: 11, fontWeight: '900' }}>{status === 'loading' ? 'Exporting' : 'Export CSV'}</Text>
        </Pressable>
        <Pressable onPress={onDownload} style={{ backgroundColor: '#181820', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
          <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>Download</Text>
        </Pressable>
        <Pressable onPress={onCopy} style={{ backgroundColor: '#181820', borderColor: '#2dd4bf', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
          <Text style={{ color: '#2dd4bf', fontSize: 11, fontWeight: '900' }}>Copy CSV</Text>
        </Pressable>
      </View>

      {csvPreview ? (
        <TextInput
          value={csvPreview}
          editable={false}
          multiline
          style={{
            minHeight: 88,
            borderColor: '#2d2d38',
            borderWidth: 1,
            borderRadius: 12,
            color: '#d6d6dc',
            backgroundColor: '#09090d',
            padding: 10,
            fontSize: 11,
            textAlignVertical: 'top',
          }}
        />
      ) : null}
    </View>
  );
}

function RequestRowReviewPanel({
  rows,
  queueStats,
  reviewFilter,
  activeRequestId,
  review,
  status,
  assigneeDraft,
  noteDraft,
  onReviewFilterChange,
  onSelectRequest,
  onAssigneeChange,
  onNoteChange,
  onRefresh,
  onSave,
  onBulkSave,
}: {
  rows: AbacusTelemetryExportRow[];
  queueStats: RequestReviewQueueStats;
  reviewFilter: RequestReviewQueueFilter;
  activeRequestId: string | null;
  review: AbacusRequestReview | null;
  status: RequestReviewPanelStatus;
  assigneeDraft: string;
  noteDraft: string;
  onReviewFilterChange: (filter: RequestReviewQueueFilter) => void;
  onSelectRequest: (requestId: string) => void;
  onAssigneeChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onRefresh: () => void;
  onSave: (status: AbacusRequestReviewStatus, priority: AbacusRequestReviewPriority) => void;
  onBulkSave: (status: AbacusRequestReviewStatus, priority: AbacusRequestReviewPriority) => void;
}) {
  const selectedRow = rows.find((row) => row.requestId === activeRequestId) ?? rows[0];
  const selectedTone = selectedRow?.status === 'error' ? '#fb7185' : '#38bdf8';
  const reviewStatus = review?.status ?? 'open';
  const reviewPriority = review?.priority ?? 'medium';
  const singleActionDisabled = !selectedRow || status === 'saving';
  const bulkActionDisabled = !rows.length || status === 'saving';

  return (
    <View style={{ ...panelStyle(selectedRow ? selectedTone : '#2d2248'), flex: 1, minWidth: 320, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 190 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Request Row Review</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>
            {queueStats.total ? `${rows.length} matching / ${queueStats.total} exported rows` : 'No exported request rows'}
          </Text>
        </View>
        <Text style={{ color: status === 'error' ? '#fb7185' : selectedTone, fontSize: 11, fontWeight: '900' }}>{status.toUpperCase()}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {REQUEST_REVIEW_FILTERS.map((filter) => {
          const count = filter.id === 'all'
            ? queueStats.total
            : filter.id === 'errors'
              ? queueStats.errors
              : filter.id === 'unassigned'
                ? queueStats.unassigned
                : filter.id === 'active'
                  ? queueStats.active
                  : queueStats.slaRisk;
          const active = reviewFilter === filter.id;
          const tone = filter.id === 'sla' && count > 0 ? '#fb7185' : active ? '#38bdf8' : '#777';

          return (
            <Pressable
              key={filter.id}
              onPress={() => onReviewFilterChange(filter.id)}
              style={{
                backgroundColor: active ? '#111827' : '#181820',
                borderColor: tone,
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 7,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{filter.label} {count}</Text>
            </Pressable>
          );
        })}
      </View>

      {queueStats.slaRisk > 0 ? (
        <View style={{ backgroundColor: 'rgba(251,113,133,0.12)', borderColor: '#fb7185', borderWidth: 1, borderRadius: 12, padding: 10 }}>
          <Text style={{ color: '#fb7185', fontSize: 12, fontWeight: '900' }}>
            {queueStats.slaRisk} request{queueStats.slaRisk === 1 ? '' : 's'} need SLA attention
          </Text>
        </View>
      ) : null}

      {selectedRow ? (
        <View style={{ backgroundColor: '#09090d', borderColor: '#2d2d38', borderWidth: 1, borderRadius: 12, padding: 12, gap: 7 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <Text style={{ color: selectedTone, fontSize: 11, fontWeight: '900' }}>{selectedRow.status.toUpperCase()} - {selectedRow.model ?? 'unknown model'}</Text>
            <Text style={{ color: '#777', fontSize: 11 }}>{formatDateLabel(selectedRow.createdAt)}</Text>
          </View>
          <Text style={{ color: mxTheme.colors.text, fontSize: 13, fontWeight: '900' }}>{selectedRow.requestId}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>{selectedRow.requestClass ?? 'unclassified'} / {selectedRow.totalTokens ?? 0} tokens / {selectedRow.latencyMs ?? 0}ms</Text>
          <Text style={{ color: '#d6d6dc', fontSize: 12, lineHeight: 17 }} numberOfLines={3}>{selectedRow.promptPreview ?? 'No prompt preview captured.'}</Text>
          <Text style={{ color: selectedRow.errorMessage ? '#fb7185' : '#9ca3af', fontSize: 12, lineHeight: 17 }} numberOfLines={3}>
            {selectedRow.errorMessage ?? selectedRow.responsePreview ?? 'No response preview captured.'}
          </Text>
        </View>
      ) : (
        <View style={{ backgroundColor: '#09090d', borderColor: '#2d2d38', borderWidth: 1, borderRadius: 12, padding: 12 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>Export telemetry to open request row details.</Text>
        </View>
      )}

      {rows.length ? (
        <View style={{ gap: 8 }}>
          {rows.slice(0, 5).map((row) => {
            const active = row.requestId === selectedRow?.requestId;
            const rowTone = row.status === 'error' ? '#fb7185' : '#38bdf8';
            return (
              <Pressable
                key={row.requestId}
                onPress={() => onSelectRequest(row.requestId)}
                style={{
                  backgroundColor: active ? '#111827' : '#14141b',
                  borderColor: active ? rowTone : '#282833',
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 10,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={{ color: rowTone, fontSize: 11, fontWeight: '900' }}>{row.status.toUpperCase()}</Text>
                  <Text style={{ color: '#777', fontSize: 11 }}>{row.model ?? 'unknown'}</Text>
                </View>
                <Text style={{ color: mxTheme.colors.text, fontSize: 12 }} numberOfLines={2}>{row.promptPreview ?? row.requestId}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={{ backgroundColor: '#14141b', borderColor: getReviewStatusTone(reviewStatus), borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <Text style={{ color: getReviewStatusTone(reviewStatus), fontSize: 11, fontWeight: '900' }}>{reviewStatus.toUpperCase()}</Text>
          <Text style={{ color: getReviewPriorityTone(reviewPriority), fontSize: 11, fontWeight: '900' }}>{reviewPriority.toUpperCase()} PRIORITY</Text>
        </View>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>
          {review ? `Updated ${formatDateLabel(review.updatedAt)} by ${review.updatedBy}` : 'No saved assignment'}
        </Text>
        <TextInput
          value={assigneeDraft}
          onChangeText={onAssigneeChange}
          placeholder="Assignee"
          placeholderTextColor="#777"
          style={{
            borderColor: '#2d2d38',
            borderWidth: 1,
            borderRadius: 12,
            color: mxTheme.colors.text,
            backgroundColor: '#09090d',
            padding: 10,
          }}
        />
        <TextInput
          value={noteDraft}
          onChangeText={onNoteChange}
          placeholder="Review note"
          placeholderTextColor="#777"
          multiline
          style={{
            minHeight: 70,
            borderColor: '#2d2d38',
            borderWidth: 1,
            borderRadius: 12,
            color: mxTheme.colors.text,
            backgroundColor: '#09090d',
            padding: 10,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable onPress={() => onSave('assigned', 'high')} disabled={singleActionDisabled} style={{ backgroundColor: '#f5c542', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: singleActionDisabled ? 0.5 : 1 }}>
          <Text style={{ color: '#050505', fontSize: 11, fontWeight: '900' }}>{status === 'saving' ? 'Saving' : 'Assign'}</Text>
        </Pressable>
        <Pressable onPress={() => onSave('reviewing', 'medium')} disabled={singleActionDisabled} style={{ backgroundColor: '#181820', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: singleActionDisabled ? 0.5 : 1 }}>
          <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>Reviewing</Text>
        </Pressable>
        <Pressable onPress={() => onSave('resolved', 'low')} disabled={singleActionDisabled} style={{ backgroundColor: '#181820', borderColor: mxTheme.colors.success, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: singleActionDisabled ? 0.5 : 1 }}>
          <Text style={{ color: mxTheme.colors.success, fontSize: 11, fontWeight: '900' }}>Resolve</Text>
        </Pressable>
        <Pressable onPress={onRefresh} style={{ backgroundColor: '#181820', borderColor: '#c084fc', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
          <Text style={{ color: '#c084fc', fontSize: 11, fontWeight: '900' }}>Refresh</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable onPress={() => onBulkSave('assigned', 'high')} disabled={bulkActionDisabled} style={{ backgroundColor: '#2b2110', borderColor: '#f5c542', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: bulkActionDisabled ? 0.5 : 1 }}>
          <Text style={{ color: '#f5c542', fontSize: 11, fontWeight: '900' }}>Bulk assign {rows.length}</Text>
        </Pressable>
        <Pressable onPress={() => onBulkSave('reviewing', 'medium')} disabled={bulkActionDisabled} style={{ backgroundColor: '#0f2233', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: bulkActionDisabled ? 0.5 : 1 }}>
          <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>Bulk reviewing {rows.length}</Text>
        </Pressable>
        <Pressable onPress={() => onBulkSave('resolved', 'low')} disabled={bulkActionDisabled} style={{ backgroundColor: '#10251f', borderColor: mxTheme.colors.success, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: bulkActionDisabled ? 0.5 : 1 }}>
          <Text style={{ color: mxTheme.colors.success, fontSize: 11, fontWeight: '900' }}>Bulk resolve {rows.length}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function AbacusAiScreen() {
  const [activeTaskId, setActiveTaskId] = useState(ABACUS_STUDIO_TASKS[0].id);
  const [activeProviderId, setActiveProviderId] = useState(ABACUS_PROVIDER_PROFILES[0].id);
  const [prompt, setPrompt] = useState('');
  const [sessionAuditEvents, setSessionAuditEvents] = useState<AbacusAuditEvent[]>([]);
  const [persistedAuditEvents, setPersistedAuditEvents] = useState<AbacusAuditEvent[]>([]);
  const [auditTrailStatus, setAuditTrailStatus] = useState<AuditTrailStatus>('loading');
  const [auditTrailRefreshKey, setAuditTrailRefreshKey] = useState(0);
  const [approvalQueue, setApprovalQueue] = useState<AbacusOutputApprovalQueueItem[]>([]);
  const [downstreamQueue, setDownstreamQueue] = useState<AbacusDownstreamExecutionQueueItem[]>([]);
  const [serverDownstreamReadiness, setServerDownstreamReadiness] = useState<AbacusDownstreamProviderReadiness | null>(null);
  const [downstreamValidation, setDownstreamValidation] = useState<AbacusDownstreamProviderValidationReport | null>(null);
  const [downstreamValidationStatus, setDownstreamValidationStatus] = useState<DownstreamValidationStatus>('idle');
  const [approvalQueueStatus, setApprovalQueueStatus] = useState<AuditTrailStatus>('loading');
  const [approvalQueueRefreshKey, setApprovalQueueRefreshKey] = useState(0);
  const [approvalBusyEventId, setApprovalBusyEventId] = useState<string | null>(null);
  const [downstreamBusyItemId, setDownstreamBusyItemId] = useState<string | null>(null);
  const [approvalQueueFilter, setApprovalQueueFilter] = useState<ApprovalQueueFilter>('needs_review');
  const [notice, setNotice] = useState('Abacus AI scaffold is active. Live telemetry loads from the backend when available.');
  const [telemetryRange, setTelemetryRange] = useState('7d');
  const [telemetrySummary, setTelemetrySummary] = useState<AbacusTelemetrySummary | null>(null);
  const [telemetryStatus, setTelemetryStatus] = useState<TelemetryStatus>('loading');
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [telemetryRefreshKey, setTelemetryRefreshKey] = useState(0);
  const [telemetryExport, setTelemetryExport] = useState<AbacusTelemetryExport | null>(null);
  const [telemetryExportCsv, setTelemetryExportCsv] = useState('');
  const [telemetryExportStatus, setTelemetryExportStatus] = useState<ExportStatus>('idle');
  const [activeFailingPromptIndex, setActiveFailingPromptIndex] = useState(0);
  const [opsConfig, setOpsConfig] = useState<AbacusOpsConfigResponse | null>(null);
  const [opsConfigStatus, setOpsConfigStatus] = useState<OpsConfigStatus>('loading');
  const [opsConfigRefreshKey, setOpsConfigRefreshKey] = useState(0);
  const [automationActionStatus, setAutomationActionStatus] = useState<AutomationActionStatus>('idle');
  const [activeAutomationActionId, setActiveAutomationActionId] = useState<string | null>(null);
  const [providerHealth, setProviderHealth] = useState<AbacusProviderHealthResponse | null>(null);
  const [providerHealthStatus, setProviderHealthStatus] = useState<ProviderHealthPanelStatus>('loading');
  const [providerHealthRefreshKey, setProviderHealthRefreshKey] = useState(0);
  const [acknowledgingProviderAlertId, setAcknowledgingProviderAlertId] = useState<string | null>(null);
  const [requestReviews, setRequestReviews] = useState<AbacusRequestReview[]>([]);
  const [requestReviewStatus, setRequestReviewStatus] = useState<RequestReviewPanelStatus>('idle');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [requestReviewFilter, setRequestReviewFilter] = useState<RequestReviewQueueFilter>('all');
  const [requestReviewAssignee, setRequestReviewAssignee] = useState('');
  const [requestReviewNote, setRequestReviewNote] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadTelemetry() {
      setTelemetryStatus('loading');
      setTelemetryError(null);

      try {
        const summary = await getAbacusTelemetrySummary(telemetryRange);
        if (cancelled) return;
        setTelemetrySummary(summary);
        setTelemetryStatus('ready');
        setNotice(`AI ops summary loaded for ${summary.range}.`);
      } catch (error) {
        if (cancelled) return;
        setTelemetrySummary(null);
        setTelemetryStatus('error');
        setTelemetryError(error instanceof Error ? error.message : 'Telemetry summary is unavailable.');
        setNotice('AI ops summary is offline, so scaffold data is shown.');
      }
    }

    loadTelemetry();

    return () => {
      cancelled = true;
    };
  }, [telemetryRange, telemetryRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadOpsConfig() {
      setOpsConfigStatus('loading');
      try {
        const config = await getAbacusOpsConfig();
        if (cancelled) return;
        setOpsConfig(config);
        setOpsConfigStatus('ready');
      } catch {
        if (cancelled) return;
        setOpsConfig(null);
        setOpsConfigStatus('error');
      }
    }

    loadOpsConfig();

    return () => {
      cancelled = true;
    };
  }, [opsConfigRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadProviderHealth() {
      setProviderHealthStatus('loading');
      try {
        const health = await getAbacusProviderHealth();
        if (cancelled) return;
        setProviderHealth(health);
        setProviderHealthStatus('ready');
      } catch {
        if (cancelled) return;
        setProviderHealth(null);
        setProviderHealthStatus('error');
      }
    }

    loadProviderHealth();

    return () => {
      cancelled = true;
    };
  }, [providerHealthRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadOutputAudits() {
      setAuditTrailStatus('loading');
      try {
        const response = await listAbacusOutputAudits();
        if (cancelled) return;
        setPersistedAuditEvents(response.events.map(mapOutputAuditEvent));
        setAuditTrailStatus('ready');
      } catch {
        if (cancelled) return;
        setPersistedAuditEvents([]);
        setAuditTrailStatus('error');
      }
    }

    loadOutputAudits();

    return () => {
      cancelled = true;
    };
  }, [auditTrailRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadOutputApprovals() {
      setApprovalQueueStatus('loading');
      try {
        const response = await listAbacusOutputApprovals();
        if (cancelled) return;
        setApprovalQueue(response.queue);
        setDownstreamQueue(response.dispatchQueue ?? []);
        setServerDownstreamReadiness(response.dispatchReadiness ?? null);
        setDownstreamValidation(response.dispatchValidation ?? null);
        setDownstreamValidationStatus(response.dispatchValidation ? 'ready' : 'idle');
        setApprovalQueueStatus('ready');
      } catch {
        if (cancelled) return;
        setApprovalQueue([]);
        setDownstreamQueue([]);
        setServerDownstreamReadiness(null);
        setDownstreamValidation(null);
        setDownstreamValidationStatus('error');
        setApprovalQueueStatus('error');
      }
    }

    loadOutputApprovals();

    return () => {
      cancelled = true;
    };
  }, [approvalQueueRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadRequestReviews() {
      setRequestReviewStatus('loading');
      try {
        const response = await listAbacusRequestReviews();
        if (cancelled) return;
        setRequestReviews(response.reviews);
        setRequestReviewStatus('ready');
      } catch {
        if (cancelled) return;
        setRequestReviews([]);
        setRequestReviewStatus('error');
      }
    }

    loadRequestReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeTask = useMemo(
    () => ABACUS_STUDIO_TASKS.find((task) => task.id === activeTaskId) || ABACUS_STUDIO_TASKS[0],
    [activeTaskId],
  );
  const telemetryInsights = useMemo(() => buildTelemetryInsights(telemetrySummary), [telemetrySummary]);
  const telemetryProviderProfiles = useMemo(() => buildTelemetryProviderProfiles(telemetrySummary), [telemetrySummary]);
  const telemetrySuggestedActions = useMemo(() => buildTelemetrySuggestedActions(telemetrySummary), [telemetrySummary]);
  const persistedAutomationRules = useMemo(() => {
    const rules = opsConfig?.config.automationRules ?? [];
    return rules.length ? rules.map((rule) => ({
      id: rule.id,
      title: rule.title,
      trigger: rule.trigger ?? 'Manual',
      action: rule.action ?? 'Review saved Abacus automation.',
      status: normalizeOpsStatus(rule.status),
      adapter: rule.adapter ?? null,
      lastRun: rule.lastRun ?? 'Not run',
      lastRunStatus: rule.lastRunStatus ?? null,
      lastRunAdapter: rule.lastRunAdapter ?? null,
      lastRunSummary: rule.lastRunSummary ?? null,
      lastRunActions: Array.isArray(rule.lastRunActions) ? rule.lastRunActions : [],
      tone: rule.tone ?? '#2dd4bf',
    })) : ABACUS_AUTOMATION_RULES;
  }, [opsConfig]);
  const persistedReviewGates = useMemo(() => {
    const gates = opsConfig?.config.reviewGates ?? [];
    return gates.length ? gates.map((gate) => ({
      id: gate.id,
      title: gate.title,
      area: gate.area ?? 'Abacus',
      requiredRole: gate.requiredRole ?? 'headmistress',
      status: normalizeOpsStatus(gate.status),
      checks: Array.isArray(gate.checks) ? gate.checks : [],
      tone: gate.status === 'active' ? '#2dd4bf' : '#f5c542',
    })) : ABACUS_REVIEW_GATES;
  }, [opsConfig]);
  const activeProvider = useMemo(
    () => telemetryProviderProfiles.find((provider) => provider.id === activeProviderId) || telemetryProviderProfiles[0] || ABACUS_PROVIDER_PROFILES[0],
    [activeProviderId, telemetryProviderProfiles],
  );
  const auditEvents = useMemo(
    () => [...sessionAuditEvents, ...persistedAuditEvents, ...ABACUS_AUDIT_EVENTS],
    [persistedAuditEvents, sessionAuditEvents],
  );
  const readyProviderCount = useMemo(() => telemetryProviderProfiles.filter((provider) => provider.status === 'ready').length, [telemetryProviderProfiles]);
  const runtimeReadyProviderCount = providerHealth?.readyProviderCount ?? readyProviderCount;
  const runtimeProviderCount = providerHealth?.providerCount ?? telemetryProviderProfiles.length;
  const activeAutomationCount = useMemo(() => persistedAutomationRules.filter((rule) => rule.status === 'active').length, [persistedAutomationRules]);
  const failingPrompts = telemetrySummary?.topFailingPrompts ?? [];
  const csvPreview = telemetryExportCsv.split('\n').slice(0, 6).join('\n');
  const telemetryExportRows = useMemo(() => telemetryExport?.rows ?? [], [telemetryExport]);
  const requestReviewQueueStats = useMemo(
    () => buildReviewQueueStats(telemetryExportRows, requestReviews),
    [requestReviews, telemetryExportRows],
  );
  const approvalQueueStats = useMemo(
    () => buildApprovalQueueStats(approvalQueue),
    [approvalQueue],
  );
  const downstreamQueueStats = useMemo(
    () => buildDownstreamQueueStats(downstreamQueue),
    [downstreamQueue],
  );
  const downstreamReadiness = useMemo(
    () => providerHealth
      ? buildDownstreamProviderReadiness(downstreamQueue, providerHealth)
      : serverDownstreamReadiness ?? buildDownstreamProviderReadiness(downstreamQueue, providerHealth),
    [downstreamQueue, providerHealth, serverDownstreamReadiness],
  );
  const filteredApprovalQueue = useMemo(() => approvalQueue.filter((item) => {
    if (approvalQueueFilter === 'needs_review') return item.state === 'pending';
    if (approvalQueueFilter === 'changes_requested') return item.state === 'changes_requested';
    if (approvalQueueFilter === 'sla') return isApprovalSlaRisk(item);
    if (approvalQueueFilter === 'approved') return item.state === 'approved';
    if (approvalQueueFilter === 'rejected') return item.state === 'rejected';
    return true;
  }), [approvalQueue, approvalQueueFilter]);
  const filteredRequestRows = useMemo(() => telemetryExportRows.filter((row) => {
    const review = requestReviews.find((item) => item.requestId === row.requestId);

    if (requestReviewFilter === 'errors') return row.status === 'error';
    if (requestReviewFilter === 'unassigned') return !review || review.status === 'open';
    if (requestReviewFilter === 'active') return isActiveReview(review);
    if (requestReviewFilter === 'sla') return isRequestSlaRisk(row, review);
    return true;
  }), [requestReviewFilter, requestReviews, telemetryExportRows]);
  const activeRequestRow = useMemo(
    () => filteredRequestRows.find((row) => row.requestId === activeRequestId) ?? filteredRequestRows[0] ?? null,
    [activeRequestId, filteredRequestRows],
  );
  const activeRequestReview = useMemo(
    () => activeRequestRow ? requestReviews.find((review) => review.requestId === activeRequestRow.requestId) ?? null : null,
    [activeRequestRow, requestReviews],
  );
  const telemetryCaption = telemetryStatus === 'ready' && telemetrySummary
    ? `${telemetrySummary.totals.requests} requests / ${formatTelemetryRate(telemetrySummary.totals.errorRate)} errors / ${formatTelemetryRate(telemetrySummary.feedback.coverageRate)} feedback`
    : telemetryStatus === 'loading'
      ? 'Loading AI ops telemetry'
      : telemetryError || 'Using scaffold telemetry';

  useEffect(() => {
    setRequestReviewAssignee(activeRequestReview?.assigneeId ?? '');
    setRequestReviewNote(activeRequestReview?.note ?? '');
  }, [activeRequestReview?.assigneeId, activeRequestReview?.note, activeRequestRow?.requestId]);

  function selectTask(task: AbacusStudioTask) {
    setActiveTaskId(task.id);
    setNotice(`${task.title} selected. Add a short brief, then generate a local scaffold draft.`);
  }

  function selectProvider(provider: AbacusProviderProfile) {
    setActiveProviderId(provider.id);
    setNotice(`${provider.name} selected. ${provider.note}`);
  }

  function refreshTelemetry() {
    setTelemetryRefreshKey((current) => current + 1);
  }

  function refreshOpsConfig() {
    setOpsConfigRefreshKey((current) => current + 1);
  }

  function refreshProviderHealth() {
    setProviderHealthRefreshKey((current) => current + 1);
  }

  function refreshAuditTrail() {
    setAuditTrailRefreshKey((current) => current + 1);
  }

  function refreshApprovalQueue() {
    setApprovalQueueRefreshKey((current) => current + 1);
  }

  async function validateDownstreamDispatchPlans() {
    setDownstreamValidationStatus('loading');
    try {
      const response = await validateAbacusDownstreamProviderDispatch();
      setDownstreamQueue(response.queue);
      setServerDownstreamReadiness(response.dispatchReadiness ?? null);
      setDownstreamValidation(response.dispatchValidation);
      setDownstreamValidationStatus('ready');
      setNotice(`${response.dispatchValidation.title}: ${response.dispatchValidation.readyCount} ready / ${response.dispatchValidation.heldCount} held.`);
    } catch (error) {
      setDownstreamValidationStatus('error');
      setNotice(error instanceof Error ? error.message : 'Downstream provider validation failed.');
    }
  }

  async function reviewOutputQueueItem(item: AbacusOutputApprovalQueueItem, decision: AbacusOutputApprovalStatus) {
    setApprovalBusyEventId(item.event.id);
    setApprovalQueueStatus('saving');
    try {
      const saved = await reviewAbacusOutputApproval(item.event.id, {
        status: decision,
        note: `${formatApprovalDecision(decision)} from Abacus dashboard: ${item.event.title}`,
      });
      setApprovalQueue((current) => current.map((queueItem) => queueItem.event.id === item.event.id
        ? {
          ...queueItem,
          state: decision,
          approval: saved.approval,
        }
        : queueItem));
      setDownstreamQueue(saved.dispatchQueue ?? []);
      setServerDownstreamReadiness(saved.dispatchReadiness ?? null);
      setDownstreamValidation(saved.dispatchValidation ?? null);
      setDownstreamValidationStatus(saved.dispatchValidation ? 'ready' : 'idle');
      setApprovalQueueStatus('ready');
      setNotice(`${item.event.title} marked ${formatApprovalDecision(decision)}.`);
    } catch (error) {
      setApprovalQueueStatus('error');
      setNotice(error instanceof Error ? error.message : 'Output approval review failed.');
    } finally {
      setApprovalBusyEventId(null);
    }
  }

  async function bulkReviewOutputQueueItems(decision: AbacusOutputApprovalStatus) {
    const reviewableItems = filteredApprovalQueue.filter(isReviewableApprovalItem);
    if (!reviewableItems.length) {
      setNotice('No filtered output approval items need a bulk review decision.');
      return;
    }

    setApprovalBusyEventId('bulk');
    setApprovalQueueStatus('saving');
    try {
      const saved = await bulkReviewAbacusOutputApprovals({
        eventIds: reviewableItems.map((item) => item.event.id),
        status: decision,
        note: `${formatApprovalDecision(decision)} bulk decision from Abacus dashboard (${approvalQueueFilter}).`,
      });
      setApprovalQueue(saved.queue);
      setDownstreamQueue(saved.dispatchQueue ?? []);
      setServerDownstreamReadiness(saved.dispatchReadiness ?? null);
      setDownstreamValidation(saved.dispatchValidation ?? null);
      setDownstreamValidationStatus(saved.dispatchValidation ? 'ready' : 'idle');
      setApprovalQueueStatus('ready');
      setNotice(`${reviewableItems.length} output approval item${reviewableItems.length === 1 ? '' : 's'} marked ${formatApprovalDecision(decision)}.`);
    } catch (error) {
      setApprovalQueueStatus('error');
      setNotice(error instanceof Error ? error.message : 'Bulk output approval review failed.');
    } finally {
      setApprovalBusyEventId(null);
    }
  }

  async function updateDownstreamQueueItem(item: AbacusDownstreamExecutionQueueItem, status: 'queued' | 'blocked' | 'dispatched') {
    setDownstreamBusyItemId(item.id);
    setApprovalQueueStatus('saving');
    try {
      const saved = await updateAbacusDownstreamExecutionItem(item.id, {
        status,
        providerId: status === 'dispatched' ? item.providerDispatchPlan?.providerId ?? item.providerId : item.providerId,
        providerReference: status === 'dispatched' ? item.providerReference ?? `manual-${item.eventId}` : item.providerReference,
        note: `${status} from Abacus dashboard: ${item.title}`,
      });
      setDownstreamQueue(saved.queue);
      setServerDownstreamReadiness(saved.dispatchReadiness ?? null);
      setDownstreamValidation(saved.dispatchValidation ?? null);
      setDownstreamValidationStatus(saved.dispatchValidation ? 'ready' : 'idle');
      setApprovalQueueStatus('ready');
      setNotice(`${item.title} downstream queue marked ${status}.`);
    } catch (error) {
      setApprovalQueueStatus('error');
      setNotice(error instanceof Error ? error.message : 'Downstream queue update failed.');
    } finally {
      setDownstreamBusyItemId(null);
    }
  }

  async function acknowledgeProviderHealthAlert(alert: AbacusProviderHealthAlert) {
    setAcknowledgingProviderAlertId(alert.id);
    try {
      await acknowledgeAbacusProviderHealthAlert(alert.id, {
        note: `Acknowledged from Abacus dashboard: ${alert.title}`,
      });
      setNotice(`${alert.title} acknowledged for provider health review.`);
      refreshProviderHealth();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Provider health acknowledgement failed.');
    } finally {
      setAcknowledgingProviderAlertId(null);
    }
  }

  async function refreshRequestReviews() {
    setRequestReviewStatus('loading');
    try {
      const response = await listAbacusRequestReviews();
      setRequestReviews(response.reviews);
      setRequestReviewStatus('ready');
      setNotice(`Loaded ${response.reviews.length} saved Abacus request reviews.`);
    } catch (error) {
      setRequestReviewStatus('error');
      setNotice(error instanceof Error ? error.message : 'Abacus request reviews are unavailable.');
    }
  }

  async function saveOpsConfig() {
    setOpsConfigStatus('saving');
    try {
      const saved = await updateAbacusOpsConfig({
        providerProfiles: telemetryProviderProfiles,
        automationRules: persistedAutomationRules,
        reviewGates: persistedReviewGates,
      });
      setOpsConfig(saved);
      setOpsConfigStatus('ready');
      setNotice('Abacus provider profiles, automation rules, and review gates saved.');
    } catch (error) {
      setOpsConfigStatus('error');
      setNotice(error instanceof Error ? error.message : 'Abacus ops config save failed.');
    }
  }

  function startAutomationAction(ruleId: string) {
    setActiveAutomationActionId(ruleId);
    setAutomationActionStatus('saving');
  }

  function finishAutomationAction() {
    setActiveAutomationActionId(null);
    setAutomationActionStatus('idle');
  }

  async function createAutomationRule() {
    const ruleId = `manual-${Date.now()}`;
    startAutomationAction(ruleId);
    try {
      const saved = await saveAbacusAutomationRule(ruleId, {
        title: 'Manual Automation Rule',
        trigger: 'Manual',
        action: 'Describe the Abacus automation action before enabling.',
        status: 'draft',
        tone: '#38bdf8',
      });
      setOpsConfig(saved);
      setNotice('Draft Abacus automation rule created.');
      finishAutomationAction();
    } catch (error) {
      setAutomationActionStatus('error');
      setNotice(error instanceof Error ? error.message : 'Automation rule creation failed.');
      setActiveAutomationActionId(null);
    }
  }

  async function runAutomationRuleNow(rule: AbacusAutomationRule) {
    startAutomationAction(rule.id);
    try {
      const saved = await runAbacusAutomationRule(rule.id, {
        note: `Manual run from Abacus dashboard: ${rule.title}`,
      });
      setOpsConfig(saved);
      setPersistedAuditEvents(saved.events.map(mapOutputAuditEvent));
      refreshApprovalQueue();
      setNotice(`${rule.title}: ${saved.run.execution.summary} Added to output approval review.`);
      finishAutomationAction();
    } catch (error) {
      setAutomationActionStatus('error');
      setNotice(error instanceof Error ? error.message : 'Automation run failed.');
      setActiveAutomationActionId(null);
    }
  }

  async function toggleAutomationRule(rule: AbacusAutomationRule) {
    startAutomationAction(rule.id);
    const status = rule.status === 'paused' ? 'active' : 'paused';
    try {
      const saved = await saveAbacusAutomationRule(rule.id, {
        title: rule.title,
        trigger: rule.trigger,
        action: rule.action,
        status,
        tone: rule.tone,
      });
      setOpsConfig(saved);
      setNotice(`${rule.title} marked ${status}.`);
      finishAutomationAction();
    } catch (error) {
      setAutomationActionStatus('error');
      setNotice(error instanceof Error ? error.message : 'Automation rule update failed.');
      setActiveAutomationActionId(null);
    }
  }

  async function removeAutomationRule(rule: AbacusAutomationRule) {
    startAutomationAction(rule.id);
    try {
      const saved = await deleteAbacusAutomationRule(rule.id);
      setOpsConfig(saved);
      setNotice(`${rule.title} deleted from Abacus automation rules.`);
      finishAutomationAction();
    } catch (error) {
      setAutomationActionStatus('error');
      setNotice(error instanceof Error ? error.message : 'Automation rule deletion failed.');
      setActiveAutomationActionId(null);
    }
  }

  async function runTelemetryExport() {
    setTelemetryExportStatus('loading');

    try {
      const exported = await exportAbacusTelemetry(telemetryRange);
      const csv = buildTelemetryExportCsv(exported.rows);
      setTelemetryExport(exported);
      setTelemetryExportCsv(csv);
      setActiveRequestId(exported.rows[0]?.requestId ?? null);
      setTelemetryExportStatus('ready');
      setNotice(`AI telemetry export ready: ${exported.rows.length} rows for ${exported.range}.`);
    } catch (error) {
      setTelemetryExportStatus('error');
      setNotice(error instanceof Error ? error.message : 'AI telemetry export failed.');
    }
  }

  async function copyTelemetryCsv() {
    if (!telemetryExportCsv) {
      await runTelemetryExport();
      return;
    }

    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (!clipboard) {
      setNotice('CSV is ready in the export preview.');
      return;
    }

    await clipboard.writeText(telemetryExportCsv);
    setNotice('AI telemetry CSV copied.');
  }

  function downloadTelemetryCsv() {
    if (!telemetryExportCsv) {
      runTelemetryExport();
      return;
    }

    if (typeof document === 'undefined') {
      setNotice('CSV is ready in the export preview.');
      return;
    }

    const blob = new Blob([telemetryExportCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `abacus-ai-telemetry-${telemetryRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('AI telemetry CSV downloaded.');
  }

  async function saveRequestReview(status: AbacusRequestReviewStatus, priority: AbacusRequestReviewPriority) {
    if (!activeRequestRow) {
      setNotice('Export telemetry before saving a request review assignment.');
      return;
    }

    setRequestReviewStatus('saving');
    try {
      const saved = await saveAbacusRequestReview(activeRequestRow.requestId, {
        status,
        priority,
        assigneeId: requestReviewAssignee.trim() || null,
        note: requestReviewNote.trim() || null,
      });
      setRequestReviews(saved.reviews);
      setRequestReviewStatus('ready');
      setNotice(`AI request ${activeRequestRow.requestId} marked ${status}.`);
    } catch (error) {
      setRequestReviewStatus('error');
      setNotice(error instanceof Error ? error.message : 'AI request review assignment failed.');
    }
  }

  async function bulkSaveRequestReviews(status: AbacusRequestReviewStatus, priority: AbacusRequestReviewPriority) {
    if (!filteredRequestRows.length) {
      setNotice('Export telemetry and choose a review filter before running a bulk request review action.');
      return;
    }

    const targetRows = filteredRequestRows;
    const assigneeId = requestReviewAssignee.trim() || null;
    const note = requestReviewNote.trim() || null;
    let latestReviews = requestReviews;

    setRequestReviewStatus('saving');
    try {
      // Review assignments are persisted as one settings record, so keep writes ordered.
      for (const row of targetRows) {
        const saved = await saveAbacusRequestReview(row.requestId, {
          status,
          priority,
          assigneeId,
          note,
        });
        latestReviews = saved.reviews;
      }

      setRequestReviews(latestReviews);
      setRequestReviewStatus('ready');
      setNotice(`${targetRows.length} AI request review${targetRows.length === 1 ? '' : 's'} marked ${status}.`);
    } catch (error) {
      setRequestReviews(latestReviews);
      setRequestReviewStatus('error');
      setNotice(error instanceof Error ? error.message : 'Bulk AI request review action failed.');
    }
  }

  async function runStudioTask() {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setNotice('Add a brief before generating a draft.');
      return;
    }

    if (activeProvider.status === 'missing-key') {
      setNotice(`${activeProvider.name} is missing a provider key. Fail-fast check stopped the draft before any request.`);
      return;
    }

    const fallbackEvent: AbacusAuditEvent = {
      id: `session-${Date.now()}`,
      title: `${activeTask.outputLabel} generated`,
      area: activeTask.title,
      outputType: activeTask.outputLabel,
      actor: activeProvider.name,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    setAuditTrailStatus('saving');
    try {
      const saved = await saveAbacusOutputAudit({
        title: fallbackEvent.title,
        area: fallbackEvent.area,
        outputType: fallbackEvent.outputType,
        actor: fallbackEvent.actor,
        status: fallbackEvent.status,
        note: trimmedPrompt.slice(0, 1000),
      });
      setPersistedAuditEvents(saved.events.map(mapOutputAuditEvent));
      setAuditTrailStatus('ready');
      setNotice(`${activeTask.outputLabel} draft persisted to the Abacus output audit trail.`);
    } catch (error) {
      setSessionAuditEvents((current) => [fallbackEvent, ...current]);
      setAuditTrailStatus('error');
      setNotice(error instanceof Error ? `${error.message}; draft kept locally for this session.` : `${activeTask.outputLabel} draft kept locally for this session.`);
    }
    setPrompt('');
  }

  function handleSuggestedAction(action: AbacusSuggestedAction) {
    setNotice(`${action.title} queued as a scaffold handoff. The production flow should create a reviewable task before sending anything live.`);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 280 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 26, fontWeight: '900' }}>Abacus AI</Text>
          <Text style={{ color: '#c084fc', marginTop: 6 }}>Insights, Studio handoffs, provider routing, automations, and output audits.</Text>
        </View>
        <View style={{ ...panelStyle('#2d2248'), minWidth: 230, gap: 4 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>RUNTIME SNAPSHOT</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>{runtimeReadyProviderCount}/{runtimeProviderCount} providers ready</Text>
          <Text style={{ color: mxTheme.colors.success, fontSize: 12, fontWeight: '900' }}>{activeAutomationCount} active automation</Text>
        </View>
      </View>

      <View style={{ ...panelStyle(activeProvider.status === 'ready' ? mxTheme.colors.success : '#f5c542'), gap: 6 }}>
        <Text style={{ color: getProviderStatusTone(activeProvider.status), fontSize: 11, fontWeight: '900' }}>{activeProvider.name.toUpperCase()}</Text>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>{notice}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Text style={{ color: '#c9c9d1', fontSize: 12, fontWeight: '800' }}>{telemetryCaption}</Text>
          {['7d', '30d'].map((range) => (
            <Pressable
              key={range}
              onPress={() => setTelemetryRange(range)}
              style={{
                backgroundColor: telemetryRange === range ? '#2d2248' : '#181820',
                borderColor: telemetryRange === range ? '#c084fc' : '#282833',
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: telemetryRange === range ? '#c084fc' : '#c9c9d1', fontSize: 11, fontWeight: '900' }}>{range}</Text>
            </Pressable>
          ))}
          <Pressable onPress={refreshTelemetry} style={{ backgroundColor: '#181820', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
            <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {telemetryInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ABACUS_STUDIO_TASKS.map((task) => (
          <StudioTaskCard key={task.id} task={task} active={task.id === activeTaskId} onPress={selectTask} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <PromptComposer activeTask={activeTask} prompt={prompt} onPromptChange={setPrompt} onRun={runStudioTask} />
        <View style={{ ...panelStyle('#2d2248'), flex: 1, minWidth: 280, gap: 12 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Suggested Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {telemetrySuggestedActions.map((action) => (
              <SuggestedActionCard key={action.id} action={action} onPress={handleSuggestedAction} />
            ))}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {telemetryProviderProfiles.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} active={provider.id === activeProvider.id} onPress={selectProvider} />
        ))}
      </View>

      <ProviderHealthPanel
        status={providerHealthStatus}
        health={providerHealth}
        acknowledgingAlertId={acknowledgingProviderAlertId}
        onRefresh={refreshProviderHealth}
        onAcknowledge={acknowledgeProviderHealthAlert}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <View style={{ ...panelStyle('#2d2248'), flex: 1, minWidth: 300, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 170 }}>
              <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Automations</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 3 }}>{persistedAutomationRules.length} saved rules</Text>
            </View>
            <Pressable
              onPress={createAutomationRule}
              disabled={automationActionStatus === 'saving'}
              style={{ backgroundColor: '#181820', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11, opacity: automationActionStatus === 'saving' ? 0.5 : 1 }}
            >
              <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '900' }}>Add Rule</Text>
            </Pressable>
          </View>
          {persistedAutomationRules.map((rule) => (
            <AutomationRuleRow
              key={rule.id}
              rule={rule}
              busy={automationActionStatus === 'saving' && activeAutomationActionId === rule.id}
              onRun={runAutomationRuleNow}
              onToggle={toggleAutomationRule}
              onDelete={removeAutomationRule}
            />
          ))}
        </View>
        <AuditTrailPanel events={auditEvents} status={auditTrailStatus} onRefresh={refreshAuditTrail} />
        <ApprovalQueuePanel
          queue={filteredApprovalQueue}
          queueStats={approvalQueueStats}
          filter={approvalQueueFilter}
          status={approvalQueueStatus}
          busyEventId={approvalBusyEventId}
          onFilterChange={setApprovalQueueFilter}
          onRefresh={refreshApprovalQueue}
          onReview={reviewOutputQueueItem}
          onBulkReview={bulkReviewOutputQueueItems}
        />
        <DownstreamExecutionQueuePanel
          queue={downstreamQueue}
          stats={downstreamQueueStats}
          readiness={downstreamReadiness}
          validation={downstreamValidation}
          validationStatus={downstreamValidationStatus}
          status={approvalQueueStatus}
          busyItemId={downstreamBusyItemId}
          onValidate={validateDownstreamDispatchPlans}
          onUpdate={updateDownstreamQueueItem}
        />
      </View>

      <OpsConfigPanel
        status={opsConfigStatus}
        config={opsConfig}
        automationRules={persistedAutomationRules}
        reviewGates={persistedReviewGates}
        onRefresh={refreshOpsConfig}
        onSave={saveOpsConfig}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <TelemetryExportPanel
          range={telemetryRange}
          status={telemetryExportStatus}
          telemetryExport={telemetryExport}
          csvPreview={csvPreview}
          onExport={runTelemetryExport}
          onCopy={copyTelemetryCsv}
          onDownload={downloadTelemetryCsv}
        />
        <RequestRowReviewPanel
          rows={filteredRequestRows}
          queueStats={requestReviewQueueStats}
          reviewFilter={requestReviewFilter}
          activeRequestId={activeRequestRow?.requestId ?? activeRequestId}
          review={activeRequestReview}
          status={requestReviewStatus}
          assigneeDraft={requestReviewAssignee}
          noteDraft={requestReviewNote}
          onReviewFilterChange={setRequestReviewFilter}
          onSelectRequest={setActiveRequestId}
          onAssigneeChange={setRequestReviewAssignee}
          onNoteChange={setRequestReviewNote}
          onRefresh={refreshRequestReviews}
          onSave={saveRequestReview}
          onBulkSave={bulkSaveRequestReviews}
        />
        <FailingPromptDrilldown
          prompts={failingPrompts}
          activeIndex={activeFailingPromptIndex}
          onSelect={setActiveFailingPromptIndex}
        />
      </View>
    </ScrollView>
  );
}
