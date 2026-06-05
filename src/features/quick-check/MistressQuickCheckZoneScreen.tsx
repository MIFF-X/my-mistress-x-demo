import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { BookingRecord, listBookings } from '../../api/bookingsApi';
import { listMarketplaceSellerOrders, MarketplaceSellerOrder } from '../../api/marketplaceApi';
import { AppNotification, listNotifications, NotificationType } from '../../api/notificationsApi';
import {
  listAdminQuickCheckReviewQueue,
  listHostQuickCheckIntake,
  QuickCheckIntakeItem,
  QuickCheckIntakeKind,
  QuickCheckIntakeStatus,
  QuickCheckPolicyGuardSnapshot,
  recordQuickCheckPolicyGuardHandoff,
  reviewQuickCheckIntake,
} from '../../api/quickCheckApi';
import { listRolodexCards, RolodexCard, RolodexCardStyle } from '../../api/rolodexApi';
import { getCurrentUser } from '../../state/authStore';
import { mxTheme } from '../../theme/mxTheme';

type QuickCheckView =
  | 'notifications'
  | 'bookings'
  | 'chat'
  | 'rolodex'
  | 'marketplaceOrders'
  | 'keeperAllowance'
  | 'subVault'
  | 'quickCheckZone';

type QuickCheckLaneId =
  | 'confessions'
  | 'affirmations'
  | 'secrets'
  | 'contracts'
  | 'bookings'
  | 'requests'
  | 'rolodex'
  | 'salesFulfilment'
  | 'messages';

type LaneSource = 'live' | 'nearby' | 'planned';

type QuickCheckLane = {
  id: QuickCheckLaneId;
  title: string;
  category: string;
  detail: string;
  count: number;
  tone: string;
  source: LaneSource;
  targetView: QuickCheckView;
  newestAt?: string;
};

type QuickCheckSignal = {
  id: string;
  laneId: QuickCheckLaneId;
  title: string;
  detail: string;
  createdAt: string;
  tone: string;
  targetView: QuickCheckView;
  intakeItemId?: string;
  intakeKind?: QuickCheckIntakeKind;
  intakeStatus?: QuickCheckIntakeStatus;
  intakeAuditCount?: number;
  intakeLatestAudit?: string;
  intakeReviewNote?: string;
  intakePolicyGuards?: QuickCheckPolicyGuardSnapshot[];
};

type HistoryKindFilter = 'ALL' | QuickCheckIntakeKind;
type HistoryStatusFilter = 'ALL' | QuickCheckIntakeStatus;

type QuickCheckHistoryFilterView = {
  id: string;
  label: string;
  search: string;
  kind: HistoryKindFilter;
  status: HistoryStatusFilter;
  updatedAt: string;
};

type QuickCheckAuditHandoffFormat = 'JSON' | 'CSV';

type QuickCheckAuditHandoffRow = {
  id: string;
  kind: QuickCheckIntakeKind;
  status: QuickCheckIntakeStatus;
  title: string;
  requesterUserId: string;
  hostUserId: string;
  message: string;
  reviewNote?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  latestAuditAction?: string;
  latestAuditActor?: string;
  latestAuditAt?: string;
  latestAuditNote?: string;
  auditEventCount: number;
};

type QuickCheckAuditHandoffPacket = {
  generatedAt: string;
  generatedByUserId: string;
  filters: {
    search: string;
    kind: HistoryKindFilter;
    status: HistoryStatusFilter;
  };
  totals: {
    matchingRows: number;
    exportedRows: number;
  };
  rows: QuickCheckAuditHandoffRow[];
};

type QuickCheckGuardIndicator = {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: string;
};

type LoadResult<T> = {
  data: T;
  error?: string;
};

type MistressQuickCheckZoneScreenProps = {
  handoffItemId?: string;
  handoffLabel?: string;
  handoffRequestedAt?: string;
  onOpenModule?: (view: string) => void;
};

const CLOSED_BOOKING_STATUSES = new Set(['COMPLETED', 'CANCELLED']);
const CLOSED_INTAKE_STATUSES = new Set<QuickCheckIntakeStatus>(['RESOLVED', 'DISMISSED']);
const REVIEW_ACTIONS: Array<{ label: string; status: QuickCheckIntakeStatus; tone: string }> = [
  { label: 'In Review', status: 'IN_REVIEW', tone: mxTheme.colors.warning },
  { label: 'Resolve', status: 'RESOLVED', tone: mxTheme.colors.success },
  { label: 'Dismiss', status: 'DISMISSED', tone: mxTheme.colors.muted },
];
const HISTORY_KIND_FILTERS: Array<{ label: string; value: HistoryKindFilter; tone: string }> = [
  { label: 'All Types', value: 'ALL', tone: mxTheme.colors.accent },
  { label: 'Confessions', value: 'CONFESSION', tone: '#ff9abf' },
  { label: 'Affirmations', value: 'AFFIRMATION', tone: '#a855f7' },
  { label: 'Secrets', value: 'SECRET', tone: '#60a5fa' },
  { label: 'Requests', value: 'CUSTOM_REQUEST', tone: '#f97316' },
];
const HISTORY_STATUS_FILTERS: Array<{ label: string; value: HistoryStatusFilter; tone: string }> = [
  { label: 'All Statuses', value: 'ALL', tone: mxTheme.colors.accent },
  { label: 'Resolved', value: 'RESOLVED', tone: mxTheme.colors.success },
  { label: 'Dismissed', value: 'DISMISSED', tone: mxTheme.colors.muted },
];
const REVIEW_NOTE_PRESETS = [
  { label: 'Handled', note: 'Handled in Quick Check review.' },
  { label: 'Follow Up', note: 'Needs follow-up from Quick Check history review.' },
  { label: 'Safety Review', note: 'Flagged for Headmistress safety review.' },
  { label: 'Duplicate', note: 'Duplicate or already handled request.' },
];
const QUICK_CHECK_HISTORY_FILTER_STORAGE_VERSION = 1;
const QUICK_CHECK_HISTORY_FILTER_VIEW_LIMIT = 6;
const QUICK_CHECK_AUDIT_HANDOFF_ROW_LIMIT = 50;
const memoryHistoryFilterViews: Record<string, QuickCheckHistoryFilterView[]> = {};
const QUICK_CHECK_SURFACE_GUARDS: QuickCheckGuardIndicator[] = [
  {
    id: 'consent-gate',
    label: 'Consent Gate',
    status: 'VISIBLE',
    detail: 'Sensitive intake shows consent and permission status before review actions.',
    tone: mxTheme.colors.warning,
  },
  {
    id: 'audit-trail',
    label: 'Audit Trail',
    status: 'LIVE',
    detail: 'Status changes write audit history and feed the Headmistress handoff packet.',
    tone: mxTheme.colors.success,
  },
  {
    id: 'compliance-handoff',
    label: 'Compliance Handoff',
    status: 'READY',
    detail: 'Filtered reviewed rows can be exported for Headmistress review.',
    tone: mxTheme.colors.accent,
  },
];
const LANE_GUARDS: Partial<Record<QuickCheckLaneId, QuickCheckGuardIndicator[]>> = {
  confessions: [
    { id: 'confession-consent', label: 'Consent', status: 'CHECK', detail: 'Confirm submission scope before closure.', tone: mxTheme.colors.warning },
    { id: 'confession-audit', label: 'Audit', status: 'REQUIRED', detail: 'Review action should keep a note.', tone: mxTheme.colors.accent },
  ],
  secrets: [
    { id: 'secret-permission', label: 'Permission', status: 'LOCKED', detail: 'Vault-adjacent access needs visible permission status.', tone: '#60a5fa' },
    { id: 'secret-compliance', label: 'Compliance', status: 'HIGH', detail: 'Route unsafe or unclear context to Headmistress review.', tone: '#ff6b6b' },
  ],
  contracts: [
    { id: 'contract-consent', label: 'Consent', status: 'REQUIRED', detail: 'Agreement changes need consent and expiry visibility.', tone: mxTheme.colors.warning },
    { id: 'contract-audit', label: 'Audit', status: 'REQUIRED', detail: 'Promises and pledges need durable review notes.', tone: mxTheme.colors.accent },
  ],
  requests: [
    { id: 'request-scope', label: 'Scope', status: 'CHECK', detail: 'Custom requests need safe scope before fulfilment.', tone: '#f97316' },
    { id: 'request-handoff', label: 'Handoff', status: 'READY', detail: 'Escalate unclear requests through Headmistress handoff.', tone: mxTheme.colors.accent },
  ],
};
const OPEN_ORDER_STATUSES = new Set([
  'PENDING_APPROVAL',
  'APPROVED_PENDING_PAYMENT',
  'FULFILMENT_PENDING',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'READY_FOR_PICKUP',
]);

function canUseHeadmistressReviewQueue(role?: string) {
  return role === 'HEADMISTRESS' || role === 'ADMIN';
}

const LANE_KEYWORDS: Record<QuickCheckLaneId, string[]> = {
  confessions: ['confession', 'confessional', 'confess'],
  affirmations: ['affirmation', 'affirm'],
  secrets: ['secret', 'vault', 'locked box', 'secret box'],
  contracts: ['contract', 'agreement', 'pledge', 'promise', 'keeper'],
  bookings: ['booking', 'call', 'video', 'voice'],
  requests: ['request', 'custom', 'wishlist', 'tribute'],
  rolodex: ['rolodex', 'card', 'contact'],
  salesFulfilment: ['order', 'fulfil', 'shipment', 'store', 'vending', 'hamper'],
  messages: ['message', 'chat', 'dm'],
};

const LANE_TYPE_HINTS: Partial<Record<QuickCheckLaneId, NotificationType[]>> = {
  messages: ['CHAT'],
  salesFulfilment: ['MARKETPLACE'],
  rolodex: ['ROLODEX'],
  bookings: ['LIVE_SHOW'],
};

const LANE_INTAKE_KINDS: Partial<Record<QuickCheckLaneId, QuickCheckIntakeKind>> = {
  confessions: 'CONFESSION',
  affirmations: 'AFFIRMATION',
  secrets: 'SECRET',
  requests: 'CUSTOM_REQUEST',
};

function emptyResult<T>(data: T): LoadResult<T> {
  return { data };
}

async function capture<T>(promise: Promise<T>, fallback: T): Promise<LoadResult<T>> {
  try {
    return { data: await promise };
  } catch (err) {
    return {
      data: fallback,
      error: err instanceof Error ? err.message : 'Unable to load source',
    };
  }
}

function formatDate(value?: string) {
  if (!value) return 'No recent signal';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function auditActionLabel(action?: string) {
  return String(action || 'audit')
    .replace(/^quick_check_intake\./, '')
    .replace(/_/g, ' ');
}

function statusTone(status: QuickCheckIntakeStatus) {
  if (status === 'NEW') return mxTheme.colors.accent;
  if (status === 'IN_REVIEW') return mxTheme.colors.warning;
  if (status === 'RESOLVED') return mxTheme.colors.success;
  return mxTheme.colors.muted;
}

function readableValue(value: unknown) {
  if (value === undefined || value === null || value === '') return 'None';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function metadataEntries(metadata?: Record<string, unknown>) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return [];
  return Object.entries(metadata).filter(([key]) => Boolean(key.trim()));
}

function intakeSearchText(item: QuickCheckIntakeItem) {
  return [
    item.title,
    item.message,
    item.kind,
    item.status,
    item.requesterUserId,
    item.hostUserId,
    item.reviewNote,
    item.reviewedByUserId,
    ...metadataEntries(item.metadata).flatMap(([key, value]) => [key, readableValue(value)]),
    ...(item.auditHistory || []).flatMap((entry) => [
      entry.action,
      entry.fromStatus,
      entry.toStatus,
      entry.note,
      entry.actorUserId,
    ]),
    ...(item.policyGuards || []).flatMap((guard) => [
      guard.label,
      guard.status,
      guard.detail,
      guard.severity,
      ...(guard.reasons || []),
    ]),
  ].filter(Boolean).join(' ').toLowerCase();
}

function textForNotification(notification: AppNotification) {
  return `${notification.type} ${notification.title || ''} ${notification.message || ''}`.toLowerCase();
}

function notificationMatches(notification: AppNotification, laneId: QuickCheckLaneId) {
  const typeHints = LANE_TYPE_HINTS[laneId];
  if (typeHints?.includes(notification.type)) return true;
  const text = textForNotification(notification);
  return LANE_KEYWORDS[laneId].some((keyword) => text.includes(keyword));
}

function newestDate(values: Array<string | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

function sourceLabel(source: LaneSource) {
  if (source === 'live') return 'LIVE SOURCE';
  if (source === 'nearby') return 'NEARBY FEED';
  return 'NEEDS SOURCE';
}

function sourceColor(source: LaneSource) {
  if (source === 'live') return mxTheme.colors.success;
  if (source === 'nearby') return mxTheme.colors.warning;
  return mxTheme.colors.muted;
}

function statusLabel(count: number, source: LaneSource) {
  if (count > 0) return `${count} need review`;
  if (source === 'planned') return 'source needed';
  return 'clear';
}

function reviewNoteForAction(status: QuickCheckIntakeStatus, draft: string) {
  const trimmed = draft.trim();
  return trimmed || `Quick Check marked ${status.toLowerCase().replace(/_/g, ' ')}`;
}

function policySeverityTone(severity?: QuickCheckPolicyGuardSnapshot['severity']) {
  if (severity === 'CLEAR') return mxTheme.colors.success;
  if (severity === 'BLOCKED' || severity === 'ESCALATED') return '#ff6b6b';
  if (severity === 'WARNING') return mxTheme.colors.warning;
  return mxTheme.colors.accent;
}

function guardIndicatorsFromPolicySnapshots(snapshots?: QuickCheckPolicyGuardSnapshot[]): QuickCheckGuardIndicator[] {
  return (snapshots || []).map((snapshot) => ({
    id: snapshot.id,
    label: snapshot.label,
    status: snapshot.status,
    detail: snapshot.detail,
    tone: policySeverityTone(snapshot.severity),
  }));
}

function guardIndicatorsForIntakeKind(kind: QuickCheckIntakeKind): QuickCheckGuardIndicator[] {
  if (kind === 'CONFESSION') return LANE_GUARDS.confessions || [];
  if (kind === 'SECRET') return LANE_GUARDS.secrets || [];
  if (kind === 'CUSTOM_REQUEST') return LANE_GUARDS.requests || [];

  return [
    { id: 'affirmation-audit', label: 'Audit', status: 'TRACKED', detail: 'Review note and status history stay visible.', tone: mxTheme.colors.accent },
  ];
}

function guardIndicatorsForIntakeItem(item: QuickCheckIntakeItem): QuickCheckGuardIndicator[] {
  const policyGuards = guardIndicatorsFromPolicySnapshots(item.policyGuards);
  return policyGuards.length ? policyGuards : guardIndicatorsForIntakeKind(item.kind);
}

function guardIndicatorsForLane(laneId: QuickCheckLaneId) {
  return LANE_GUARDS[laneId] || [];
}

function quickCheckHistoryFilterStorageKey(userId: string) {
  return `mistress-x.quick-check.history-filters.v${QUICK_CHECK_HISTORY_FILTER_STORAGE_VERSION}.${userId}`;
}

function isHistoryKindFilter(value: unknown): value is HistoryKindFilter {
  return value === 'ALL' || value === 'CONFESSION' || value === 'AFFIRMATION' || value === 'SECRET' || value === 'CUSTOM_REQUEST';
}

function isHistoryStatusFilter(value: unknown): value is HistoryStatusFilter {
  return value === 'ALL' || value === 'NEW' || value === 'IN_REVIEW' || value === 'RESOLVED' || value === 'DISMISSED';
}

function historyKindFilterLabel(value: HistoryKindFilter) {
  return HISTORY_KIND_FILTERS.find((filter) => filter.value === value)?.label || String(value).replace(/_/g, ' ');
}

function historyStatusFilterLabel(value: HistoryStatusFilter) {
  return HISTORY_STATUS_FILTERS.find((filter) => filter.value === value)?.label || String(value).replace(/_/g, ' ');
}

function defaultHistoryFilterViewLabel(kind: HistoryKindFilter, status: HistoryStatusFilter, search: string) {
  const parts = [historyKindFilterLabel(kind), historyStatusFilterLabel(status)];
  const trimmedSearch = search.trim();
  if (trimmedSearch) parts.push(trimmedSearch.slice(0, 24));
  return parts.join(' / ');
}

function historyFilterViewSummary(view: QuickCheckHistoryFilterView) {
  const parts = [historyKindFilterLabel(view.kind), historyStatusFilterLabel(view.status)];
  if (view.search.trim()) parts.push(`Search: ${view.search.trim()}`);
  return parts.join(' - ');
}

function normalizeHistoryFilterView(value: unknown, fallbackId: string): QuickCheckHistoryFilterView | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const label = typeof record.label === 'string' && record.label.trim()
    ? record.label.trim().slice(0, 60)
    : 'Saved View';
  const updatedAt = typeof record.updatedAt === 'string' && record.updatedAt.trim()
    ? record.updatedAt
    : new Date().toISOString();

  return {
    id: typeof record.id === 'string' && record.id.trim() ? record.id : fallbackId,
    label,
    search: typeof record.search === 'string' ? record.search.slice(0, 160) : '',
    kind: isHistoryKindFilter(record.kind) ? record.kind : 'ALL',
    status: isHistoryStatusFilter(record.status) ? record.status : 'ALL',
    updatedAt,
  };
}

function parseHistoryFilterViews(raw: string) {
  const parsed = JSON.parse(raw) as unknown;
  const source = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { views?: unknown }).views)
      ? (parsed as { views: unknown[] }).views
      : [];

  return source
    .map((view, index) => normalizeHistoryFilterView(view, `history-filter-${index}`))
    .filter((view): view is QuickCheckHistoryFilterView => Boolean(view))
    .slice(0, QUICK_CHECK_HISTORY_FILTER_VIEW_LIMIT);
}

async function loadHistoryFilterViews(userId: string) {
  const key = quickCheckHistoryFilterStorageKey(userId);
  const fallback = memoryHistoryFilterViews[key] || [];

  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const views = parseHistoryFilterViews(raw);
    memoryHistoryFilterViews[key] = views;
    return views;
  } catch {
    return fallback;
  }
}

async function persistHistoryFilterViews(userId: string, views: QuickCheckHistoryFilterView[]) {
  const key = quickCheckHistoryFilterStorageKey(userId);
  const limitedViews = views.slice(0, QUICK_CHECK_HISTORY_FILTER_VIEW_LIMIT);
  memoryHistoryFilterViews[key] = limitedViews;

  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        version: QUICK_CHECK_HISTORY_FILTER_STORAGE_VERSION,
        views: limitedViews,
      }),
    );
  } catch {
    // Memory fallback keeps saved views usable if device storage is unavailable.
  }

  return limitedViews;
}

function quickCheckAuditHandoffRow(item: QuickCheckIntakeItem): QuickCheckAuditHandoffRow {
  const latestAudit = item.auditHistory?.[0];

  return {
    id: item.id,
    kind: item.kind,
    status: item.status,
    title: item.title,
    requesterUserId: item.requesterUserId,
    hostUserId: item.hostUserId,
    message: item.message,
    reviewNote: item.reviewNote,
    reviewedByUserId: item.reviewedByUserId,
    reviewedAt: item.reviewedAt,
    latestAuditAction: latestAudit ? auditActionLabel(latestAudit.action) : undefined,
    latestAuditActor: latestAudit?.actorUserId,
    latestAuditAt: latestAudit?.createdAt,
    latestAuditNote: latestAudit?.note,
    auditEventCount: item.auditHistory?.length || 0,
  };
}

function buildQuickCheckAuditHandoffPacket(input: {
  generatedByUserId: string;
  search: string;
  kind: HistoryKindFilter;
  status: HistoryStatusFilter;
  matchingRows: QuickCheckIntakeItem[];
}): QuickCheckAuditHandoffPacket {
  const rows = input.matchingRows
    .slice(0, QUICK_CHECK_AUDIT_HANDOFF_ROW_LIMIT)
    .map(quickCheckAuditHandoffRow);

  return {
    generatedAt: new Date().toISOString(),
    generatedByUserId: input.generatedByUserId,
    filters: {
      search: input.search.trim(),
      kind: input.kind,
      status: input.status,
    },
    totals: {
      matchingRows: input.matchingRows.length,
      exportedRows: rows.length,
    },
    rows,
  };
}

function csvCell(value: unknown) {
  const text = value === undefined || value === null ? '' : String(value).replace(/\r?\n/g, ' ');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function quickCheckAuditHandoffCsv(packet: QuickCheckAuditHandoffPacket) {
  const headers: Array<keyof QuickCheckAuditHandoffRow> = [
    'id',
    'kind',
    'status',
    'title',
    'requesterUserId',
    'hostUserId',
    'reviewedByUserId',
    'reviewedAt',
    'reviewNote',
    'latestAuditAction',
    'latestAuditActor',
    'latestAuditAt',
    'latestAuditNote',
    'auditEventCount',
    'message',
  ];
  const rows = packet.rows.map((row) => headers.map((header) => csvCell(row[header])).join(','));
  return [
    `# Quick Check Headmistress handoff generated ${packet.generatedAt}`,
    `# filters search=${csvCell(packet.filters.search)} kind=${packet.filters.kind} status=${packet.filters.status}`,
    `# matchingRows=${packet.totals.matchingRows} exportedRows=${packet.totals.exportedRows}`,
    headers.join(','),
    ...rows,
  ].join('\n');
}

function parseCardStyle(card: RolodexCard) {
  if (!card.style || typeof card.style !== 'object' || Array.isArray(card.style)) return {} as RolodexCardStyle;
  return card.style as RolodexCardStyle;
}

function tagsText(tags: unknown) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag)).join(' ');
  if (typeof tags === 'string') return tags;
  if (tags === undefined || tags === null) return '';
  return String(tags);
}

function cardNeedsReview(card: RolodexCard) {
  const style = parseCardStyle(card);
  return style.shareStatus === 'SUBMITTED' || style.category === 'Prospect' || tagsText(card.tags).toLowerCase().includes('request');
}

function orderNeedsAction(order: MarketplaceSellerOrder) {
  return OPEN_ORDER_STATUSES.has(String(order.status || '').toUpperCase());
}

function notificationSignals(
  laneId: QuickCheckLaneId,
  notifications: AppNotification[],
  tone: string,
  targetView: QuickCheckView,
): QuickCheckSignal[] {
  return notifications
    .filter((notification) => !notification.read && notificationMatches(notification, laneId))
    .map((notification) => ({
      id: `notification-${laneId}-${notification.id}`,
      laneId,
      title: notification.title,
      detail: notification.message || notification.type.replace(/_/g, ' '),
      createdAt: notification.createdAt,
      tone,
      targetView,
    }));
}

function intakeItemsForLane(items: QuickCheckIntakeItem[], laneId: QuickCheckLaneId) {
  const kind = LANE_INTAKE_KINDS[laneId];
  if (!kind) return [];
  return items.filter((item) => item.kind === kind && !CLOSED_INTAKE_STATUSES.has(item.status));
}

function intakeSignals(
  laneId: QuickCheckLaneId,
  items: QuickCheckIntakeItem[],
  tone: string,
): QuickCheckSignal[] {
  return intakeItemsForLane(items, laneId).map((item) => ({
    id: `quick-check-intake-${item.id}`,
    laneId,
    title: item.title,
    detail: `${item.status.replace(/_/g, ' ')} - ${item.message}`,
    createdAt: item.updatedAt || item.createdAt,
    tone,
    targetView: 'quickCheckZone',
    intakeItemId: item.id,
    intakeKind: item.kind,
    intakeStatus: item.status,
    intakeAuditCount: item.auditHistory?.length || 0,
    intakeLatestAudit: item.auditHistory?.[0]
      ? `${auditActionLabel(item.auditHistory[0].action)} at ${formatDate(item.auditHistory[0].createdAt)}`
      : undefined,
    intakeReviewNote: item.reviewNote,
    intakePolicyGuards: item.policyGuards,
  }));
}

function bookingSignals(bookings: BookingRecord[], tone: string): QuickCheckSignal[] {
  return bookings
    .filter((booking) => !CLOSED_BOOKING_STATUSES.has(booking.status))
    .map((booking) => ({
      id: `booking-${booking.id}`,
      laneId: 'bookings',
      title: `${booking.type} booking ${booking.status.toLowerCase()}`,
      detail: `${booking.durationMinutes} minutes, ${booking.price} credits`,
      createdAt: booking.updatedAt || booking.createdAt,
      tone,
      targetView: 'bookings',
    }));
}

function orderSignals(orders: MarketplaceSellerOrder[], tone: string): QuickCheckSignal[] {
  return orders
    .filter(orderNeedsAction)
    .map((order) => ({
      id: `order-${order.id}`,
      laneId: 'salesFulfilment',
      title: order.product?.title || 'Marketplace order',
      detail: `${order.status.replace(/_/g, ' ')} from ${order.buyer?.displayName || order.buyer?.username || 'buyer'}`,
      createdAt: order.updatedAt || order.createdAt,
      tone,
      targetView: 'marketplaceOrders',
    }));
}

function rolodexSignals(cards: RolodexCard[], tone: string): QuickCheckSignal[] {
  return cards
    .filter(cardNeedsReview)
    .map((card) => ({
      id: `rolodex-${card.id}`,
      laneId: 'rolodex',
      title: card.displayName || card.title,
      detail: card.notes || 'Rolodex card needs review',
      createdAt: card.updatedAt || card.createdAt,
      tone,
      targetView: 'rolodex',
    }));
}

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: `${tone}88`, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 150 }}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>{label.toUpperCase()}</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 26, fontWeight: '900', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function LaneCard({ lane, onOpenModule }: { lane: QuickCheckLane; onOpenModule?: (view: string) => void }) {
  const sourceTone = sourceColor(lane.source);
  const guards = guardIndicatorsForLane(lane.id);

  return (
    <View style={{ backgroundColor: '#101016', borderColor: lane.count > 0 ? lane.tone : mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 245, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: lane.tone, fontSize: 11, fontWeight: '900' }}>{lane.category.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900' }}>{lane.title}</Text>
        </View>
        <Text style={{ color: lane.count > 0 ? lane.tone : mxTheme.colors.success, fontSize: 22, fontWeight: '900' }}>{lane.count}</Text>
      </View>
      <Text style={{ color: '#d7d7dc', fontSize: 12, lineHeight: 17 }}>{lane.detail}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <View style={{ borderColor: sourceTone, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: `${sourceTone}14` }}>
          <Text style={{ color: sourceTone, fontSize: 10, fontWeight: '900' }}>{sourceLabel(lane.source)}</Text>
        </View>
        <View style={{ borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>{statusLabel(lane.count, lane.source).toUpperCase()}</Text>
        </View>
      </View>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Newest: {formatDate(lane.newestAt)}</Text>
      {guards.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {guards.map((guard) => <GuardPill key={`${lane.id}-${guard.id}`} guard={guard} />)}
        </View>
      ) : null}
      <Pressable
        onPress={() => onOpenModule?.(lane.targetView)}
        style={{ alignSelf: 'flex-start', borderColor: lane.tone, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, marginTop: 2 }}
      >
        <Text style={{ color: lane.tone, fontSize: 11, fontWeight: '900' }}>OPEN SOURCE</Text>
      </Pressable>
    </View>
  );
}

function ReviewActionButton({
  label,
  tone,
  disabled,
  active,
  onPress,
}: {
  label: string;
  tone: string;
  disabled?: boolean;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || active}
      style={{
        borderColor: active ? tone : `${tone}88`,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 6,
        backgroundColor: active ? `${tone}20` : '#101016',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{active ? 'CURRENT' : label.toUpperCase()}</Text>
    </Pressable>
  );
}

function FilterChip({
  label,
  tone,
  active,
  onPress,
}: {
  label: string;
  tone: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderColor: active ? tone : mxTheme.colors.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
        backgroundColor: active ? `${tone}20` : '#101016',
      }}
    >
      <Text style={{ color: active ? tone : mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

function GuardPill({ guard }: { guard: QuickCheckGuardIndicator }) {
  return (
    <View style={{ borderColor: `${guard.tone}88`, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: `${guard.tone}16` }}>
      <Text style={{ color: guard.tone, fontSize: 10, fontWeight: '900' }}>{guard.label.toUpperCase()} / {guard.status.toUpperCase()}</Text>
    </View>
  );
}

function GuardIndicatorPanel({
  title,
  subtitle,
  guards,
}: {
  title: string;
  subtitle?: string;
  guards: QuickCheckGuardIndicator[];
}) {
  if (!guards.length) return null;

  return (
    <View style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: 10 }}>
      <View>
        <Text style={{ color: mxTheme.colors.text, fontSize: 15, fontWeight: '900' }}>{title}</Text>
        {subtitle ? <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {guards.map((guard) => (
          <View key={guard.id} style={{ flexGrow: 1, flexBasis: 210, borderColor: `${guard.tone}66`, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: 10, gap: 5 }}>
            <GuardPill guard={guard} />
            <Text style={{ color: '#d7d7dc', fontSize: 11, lineHeight: 16 }}>{guard.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FieldLine({ label, value }: { label: string; value?: string }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: 170 }}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
      <Text style={{ color: '#d7d7dc', fontSize: 12, lineHeight: 17, marginTop: 2 }}>{value || 'None'}</Text>
    </View>
  );
}

function QuickCheckDetailDrawer({
  item,
  busyReviewId,
  onClose,
  onReviewIntake,
}: {
  item: QuickCheckIntakeItem;
  busyReviewId?: string | null;
  onClose: () => void;
  onReviewIntake: (itemId: string, status: QuickCheckIntakeStatus) => void;
}) {
  const tone = statusTone(item.status);
  const metadata = metadataEntries(item.metadata);
  const auditHistory = item.auditHistory || [];
  const reviewDisabled = Boolean(busyReviewId);
  const guards = guardIndicatorsForIntakeItem(item);

  return (
    <View style={{ backgroundColor: '#101016', borderColor: tone, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.lg, gap: mxTheme.spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: mxTheme.spacing.md, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 220, gap: 5 }}>
          <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>QUICK CHECK DETAILS</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{item.title}</Text>
          <Text style={{ color: '#d7d7dc', fontSize: 13, lineHeight: 20 }}>{item.message}</Text>
        </View>
        <Pressable onPress={onClose} style={{ alignSelf: 'flex-start', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>CLOSE</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
        <FieldLine label="Kind" value={item.kind.replace(/_/g, ' ')} />
        <FieldLine label="Status" value={item.status.replace(/_/g, ' ')} />
        <FieldLine label="Requester" value={item.requesterUserId} />
        <FieldLine label="Host" value={item.hostUserId} />
        <FieldLine label="Created" value={formatDate(item.createdAt)} />
        <FieldLine label="Updated" value={formatDate(item.updatedAt)} />
        <FieldLine label="Reviewed by" value={item.reviewedByUserId} />
        <FieldLine label="Reviewed at" value={item.reviewedAt ? formatDate(item.reviewedAt) : undefined} />
      </View>

      <GuardIndicatorPanel
        title="Consent, Audit, Compliance Guards"
        subtitle="Review this intake with its visible safety state before changing status."
        guards={guards}
      />

      {item.reviewNote ? (
        <View style={{ borderColor: `${tone}66`, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>REVIEW NOTE</Text>
          <Text style={{ color: '#d7d7dc', fontSize: 12, lineHeight: 18, marginTop: 4 }}>{item.reviewNote}</Text>
        </View>
      ) : null}

      <View style={{ gap: 7 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>Source Metadata</Text>
        {metadata.length ? (
          metadata.map(([key, value]) => (
            <View key={key} style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900', minWidth: 120 }}>{key}</Text>
              <Text style={{ color: '#d7d7dc', fontSize: 11, lineHeight: 16, flex: 1, minWidth: 180 }}>{readableValue(value)}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>No source metadata attached.</Text>
        )}
      </View>

      <View style={{ gap: 7 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>Status Trail</Text>
        {auditHistory.length ? (
          auditHistory.map((entry) => (
            <View key={entry.id} style={{ borderLeftColor: statusTone(entry.toStatus || item.status), borderLeftWidth: 3, paddingLeft: 10, gap: 3 }}>
              <Text style={{ color: mxTheme.colors.text, fontSize: 12, fontWeight: '900' }}>
                {auditActionLabel(entry.action)}{entry.toStatus ? ` -> ${entry.toStatus.replace(/_/g, ' ')}` : ''}
              </Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{formatDate(entry.createdAt)} by {entry.actorUserId || 'system'}</Text>
              {entry.note ? <Text style={{ color: '#d7d7dc', fontSize: 11, lineHeight: 16 }}>{entry.note}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>No audit events yet.</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {REVIEW_ACTIONS.map((action) => (
          <ReviewActionButton
            key={`drawer-${item.id}-${action.status}`}
            label={busyReviewId === item.id ? 'Saving' : action.label}
            tone={action.tone}
            disabled={reviewDisabled}
            active={item.status === action.status}
            onPress={() => onReviewIntake(item.id, action.status)}
          />
        ))}
      </View>
    </View>
  );
}

function QuickCheckHistoryRow({
  item,
  onOpenDetails,
}: {
  item: QuickCheckIntakeItem;
  onOpenDetails: (itemId: string) => void;
}) {
  const tone = statusTone(item.status);
  const latestAudit = item.auditHistory?.[0];
  const guards = guardIndicatorsForIntakeItem(item);

  return (
    <View style={{ backgroundColor: '#101016', borderColor: `${tone}88`, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: 7 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 220, gap: 3 }}>
          <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{item.status.replace(/_/g, ' ')}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>{item.title}</Text>
        </View>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 10 }}>{formatDate(item.updatedAt)}</Text>
      </View>
      <Text style={{ color: '#d7d7dc', fontSize: 12 }} numberOfLines={2}>{item.message}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>
        {item.kind.replace(/_/g, ' ')} from {item.requesterUserId} - {latestAudit ? auditActionLabel(latestAudit.action) : 'no audit event'}
      </Text>
      {guards.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {guards.map((guard) => <GuardPill key={`${item.id}-${guard.id}`} guard={guard} />)}
        </View>
      ) : null}
      {item.reviewNote ? (
        <Text style={{ color: '#d7d7dc', fontSize: 11, lineHeight: 16 }} numberOfLines={2}>Note: {item.reviewNote}</Text>
      ) : null}
      <Pressable
        onPress={() => onOpenDetails(item.id)}
        style={{ alignSelf: 'flex-start', borderColor: mxTheme.colors.accent, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }}
      >
        <Text style={{ color: mxTheme.colors.accent, fontSize: 10, fontWeight: '900' }}>DETAILS</Text>
      </Pressable>
    </View>
  );
}

function SignalRow({
  signal,
  busyReviewId,
  onOpenModule,
  onReviewIntake,
  onOpenIntakeDetails,
}: {
  signal: QuickCheckSignal;
  busyReviewId?: string | null;
  onOpenModule?: (view: string) => void;
  onReviewIntake?: (itemId: string, status: QuickCheckIntakeStatus) => void;
  onOpenIntakeDetails?: (itemId: string) => void;
}) {
  const isIntakeSignal = Boolean(signal.intakeItemId);
  const reviewDisabled = Boolean(busyReviewId);
  const policyGuards = guardIndicatorsFromPolicySnapshots(signal.intakePolicyGuards);
  const guards = policyGuards.length
    ? policyGuards
    : signal.intakeKind ? guardIndicatorsForIntakeKind(signal.intakeKind) : [];

  return (
    <View style={{ backgroundColor: '#101016', borderColor: `${signal.tone}88`, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, marginBottom: mxTheme.spacing.sm, gap: 7 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: signal.tone, fontSize: 11, fontWeight: '900' }}>{signal.laneId.replace(/([A-Z])/g, ' $1').toUpperCase()}</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 10 }}>{formatDate(signal.createdAt)}</Text>
      </View>
      <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>{signal.title}</Text>
      <Text style={{ color: '#d7d7dc', fontSize: 12 }} numberOfLines={2}>{signal.detail}</Text>
      {isIntakeSignal && signal.intakeAuditCount ? (
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>
          Audit: {signal.intakeAuditCount} event{signal.intakeAuditCount === 1 ? '' : 's'}{signal.intakeLatestAudit ? ` - ${signal.intakeLatestAudit}` : ''}
        </Text>
      ) : null}
      {isIntakeSignal && signal.intakeReviewNote ? (
        <Text style={{ color: '#d7d7dc', fontSize: 11 }} numberOfLines={1}>Note: {signal.intakeReviewNote}</Text>
      ) : null}
      {guards.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {guards.map((guard) => <GuardPill key={`${signal.id}-${guard.id}`} guard={guard} />)}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
        <Pressable
          onPress={() => onOpenModule?.(signal.targetView)}
          style={{ borderColor: signal.tone, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }}
        >
          <Text style={{ color: signal.tone, fontSize: 10, fontWeight: '900' }}>OPEN SOURCE</Text>
        </Pressable>
        {isIntakeSignal && signal.intakeItemId ? (
          <>
            <Pressable
              onPress={() => onOpenIntakeDetails?.(signal.intakeItemId as string)}
              style={{ borderColor: mxTheme.colors.accent, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }}
            >
              <Text style={{ color: mxTheme.colors.accent, fontSize: 10, fontWeight: '900' }}>DETAILS</Text>
            </Pressable>
            {REVIEW_ACTIONS.map((action) => (
              <ReviewActionButton
                key={`${signal.id}-${action.status}`}
                label={busyReviewId === signal.intakeItemId ? 'Saving' : action.label}
                tone={action.tone}
                disabled={reviewDisabled}
                active={signal.intakeStatus === action.status}
                onPress={() => onReviewIntake?.(signal.intakeItemId as string, action.status)}
              />
            ))}
          </>
        ) : null}
      </View>
    </View>
  );
}

export function MistressQuickCheckZoneScreen({
  handoffItemId,
  handoffLabel,
  handoffRequestedAt,
  onOpenModule,
}: MistressQuickCheckZoneScreenProps) {
  const currentUser = getCurrentUser();
  const usesHeadmistressReviewQueue = canUseHeadmistressReviewQueue(currentUser?.role);
  const reviewerStorageId = currentUser?.id || 'anonymous';
  const [notificationsResult, setNotificationsResult] = useState<LoadResult<AppNotification[]>>(emptyResult([]));
  const [intakeResult, setIntakeResult] = useState<LoadResult<QuickCheckIntakeItem[]>>(emptyResult([]));
  const [bookingsResult, setBookingsResult] = useState<LoadResult<BookingRecord[]>>(emptyResult([]));
  const [rolodexResult, setRolodexResult] = useState<LoadResult<RolodexCard[]>>(emptyResult([]));
  const [ordersResult, setOrdersResult] = useState<LoadResult<MarketplaceSellerOrder[]>>(emptyResult([]));
  const [loading, setLoading] = useState(false);
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [selectedIntakeItemId, setSelectedIntakeItemId] = useState<string | null>(null);
  const [showIntakeHistory, setShowIntakeHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyKindFilter, setHistoryKindFilter] = useState<HistoryKindFilter>('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>('ALL');
  const [historyFilterViewName, setHistoryFilterViewName] = useState('');
  const [historyFilterViewNotice, setHistoryFilterViewNotice] = useState<string | null>(null);
  const [savedHistoryFilterViews, setSavedHistoryFilterViews] = useState<QuickCheckHistoryFilterView[]>([]);
  const [auditHandoffFormat, setAuditHandoffFormat] = useState<QuickCheckAuditHandoffFormat>('JSON');
  const [reviewNoteDraft, setReviewNoteDraft] = useState('');
  const [handledPolicyHandoffKey, setHandledPolicyHandoffKey] = useState<string | null>(null);
  const [loadedQuickChecksOnce, setLoadedQuickChecksOnce] = useState(false);

  async function loadQuickChecks() {
    setLoading(true);
    const intakeLoader = usesHeadmistressReviewQueue
      ? listAdminQuickCheckReviewQueue(true)
      : listHostQuickCheckIntake(true);
    const [nextNotifications, nextIntake, nextBookings, nextRolodex, nextOrders] = await Promise.all([
      capture(listNotifications(), [] as AppNotification[]),
      capture(intakeLoader, [] as QuickCheckIntakeItem[]),
      capture(listBookings(), [] as BookingRecord[]),
      capture(listRolodexCards(), [] as RolodexCard[]),
      capture(listMarketplaceSellerOrders(), [] as MarketplaceSellerOrder[]),
    ]);
    setNotificationsResult(nextNotifications);
    setIntakeResult(nextIntake);
    setBookingsResult(nextBookings);
    setRolodexResult(nextRolodex);
    setOrdersResult(nextOrders);
    setLoading(false);
    setLoadedQuickChecksOnce(true);
  }

  async function handleReviewIntake(itemId: string, status: QuickCheckIntakeStatus) {
    setReviewingItemId(itemId);
    setReviewNotice(null);
    setReviewError(null);

    try {
      const reviewNote = reviewNoteForAction(status, reviewNoteDraft);
      const updated = await reviewQuickCheckIntake(itemId, {
        status,
        reviewNote,
      });
      if (updated.status !== status) {
        setReviewNotice(`Policy guard kept this item ${updated.status.toLowerCase().replace(/_/g, ' ')} for Headmistress review.`);
      } else {
        setReviewNotice(`Quick Check item marked ${status.toLowerCase().replace(/_/g, ' ')}${reviewNoteDraft.trim() ? ' with review note saved' : ''}.`);
      }
      setReviewNoteDraft('');
      await loadQuickChecks();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Quick Check review action failed.');
    } finally {
      setReviewingItemId(null);
    }
  }

  function mergeIntakeItem(updated: QuickCheckIntakeItem) {
    setIntakeResult((current) => ({
      ...current,
      data: current.data.map((item) => item.id === updated.id ? updated : item),
    }));
  }

  useEffect(() => {
    loadQuickChecks();
  }, []);

  useEffect(() => {
    let isActive = true;

    loadHistoryFilterViews(reviewerStorageId).then((views) => {
      if (isActive) setSavedHistoryFilterViews(views);
    });

    return () => {
      isActive = false;
    };
  }, [reviewerStorageId]);

  function applyHistoryFilterView(view: QuickCheckHistoryFilterView) {
    setShowIntakeHistory(true);
    setHistorySearch(view.search);
    setHistoryKindFilter(view.kind);
    setHistoryStatusFilter(view.status);
    setHistoryFilterViewNotice(`Applied ${view.label}.`);
  }

  async function handleSaveHistoryFilterView() {
    const label = (historyFilterViewName.trim() || defaultHistoryFilterViewLabel(historyKindFilter, historyStatusFilter, historySearch)).slice(0, 60);
    const nextView: QuickCheckHistoryFilterView = {
      id: `history-filter-${Date.now()}`,
      label,
      search: historySearch.trim(),
      kind: historyKindFilter,
      status: historyStatusFilter,
      updatedAt: new Date().toISOString(),
    };
    const nextViews = [
      nextView,
      ...savedHistoryFilterViews.filter((view) => view.label.toLowerCase() !== label.toLowerCase()),
    ].slice(0, QUICK_CHECK_HISTORY_FILTER_VIEW_LIMIT);

    setSavedHistoryFilterViews(nextViews);
    setHistoryFilterViewName('');
    setHistoryFilterViewNotice(`Saved ${label}.`);
    await persistHistoryFilterViews(reviewerStorageId, nextViews);
  }

  async function handleRemoveHistoryFilterView(viewId: string) {
    const nextViews = savedHistoryFilterViews.filter((view) => view.id !== viewId);
    setSavedHistoryFilterViews(nextViews);
    setHistoryFilterViewNotice('Saved view removed.');
    await persistHistoryFilterViews(reviewerStorageId, nextViews);
  }

  const notifications = notificationsResult.data;
  const intakeItems = intakeResult.data;
  const bookings = bookingsResult.data;
  const rolodexCards = rolodexResult.data;
  const sellerOrders = ordersResult.data;
  const loadErrors = [notificationsResult.error, intakeResult.error, bookingsResult.error, rolodexResult.error, ordersResult.error].filter(Boolean);

  useEffect(() => {
    if (!handoffItemId || !handoffRequestedAt) return;
    const handoffKey = `${handoffRequestedAt}:${handoffItemId}`;
    if (handledPolicyHandoffKey === handoffKey) return;

    const target = intakeItems.find((item) => item.id === handoffItemId);
    if (!target && !loadedQuickChecksOnce) return;
    if (!target && loading) return;

    setHandledPolicyHandoffKey(handoffKey);
    setShowIntakeHistory(true);
    if (target) {
      setSelectedIntakeItemId(target.id);
      setReviewError(null);
      setReviewNotice(`Opened Headmistress policy handoff: ${handoffLabel || target.title}. Saving audit event...`);
      void recordQuickCheckPolicyGuardHandoff(target.id, {
        label: handoffLabel || target.title,
        requestedAt: handoffRequestedAt,
        source: 'headmistress_dashboard',
      })
        .then((updated) => {
          mergeIntakeItem(updated);
          setReviewNotice(`Opened Headmistress policy handoff: ${handoffLabel || target.title}. Audit event saved.`);
        })
        .catch((err) => {
          setReviewError(err instanceof Error ? err.message : 'Quick Check policy handoff audit failed to save.');
        });
    } else {
      setReviewNotice(null);
      setReviewError(`Headmistress policy handoff ${handoffItemId} is not in the loaded Quick Check queue.`);
    }
  }, [handledPolicyHandoffKey, handoffItemId, handoffLabel, handoffRequestedAt, intakeItems, loadedQuickChecksOnce, loading]);

  const unreadNotifications = useMemo(() => notifications.filter((notification) => !notification.read), [notifications]);
  const openIntakeItems = useMemo(() => intakeItems.filter((item) => !CLOSED_INTAKE_STATUSES.has(item.status)), [intakeItems]);
  const closedIntakeItems = useMemo(() => intakeItems.filter((item) => CLOSED_INTAKE_STATUSES.has(item.status)), [intakeItems]);
  const matchingClosedIntakeItems = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    const items = closedIntakeItems.filter((item) => {
      const matchesKind = historyKindFilter === 'ALL' || item.kind === historyKindFilter;
      const matchesStatus = historyStatusFilter === 'ALL' || item.status === historyStatusFilter;
      const matchesSearch = !query || intakeSearchText(item).includes(query);
      return matchesKind && matchesStatus && matchesSearch;
    });

    return items
      .slice()
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }, [closedIntakeItems, historyKindFilter, historySearch, historyStatusFilter]);
  const filteredClosedIntakeItems = useMemo(() => matchingClosedIntakeItems.slice(0, 12), [matchingClosedIntakeItems]);
  const auditHandoffPacket = useMemo(
    () => buildQuickCheckAuditHandoffPacket({
      generatedByUserId: reviewerStorageId,
      search: historySearch,
      kind: historyKindFilter,
      status: historyStatusFilter,
      matchingRows: matchingClosedIntakeItems,
    }),
    [historyKindFilter, historySearch, historyStatusFilter, matchingClosedIntakeItems, reviewerStorageId],
  );
  const auditHandoffExport = useMemo(
    () => auditHandoffFormat === 'JSON'
      ? JSON.stringify(auditHandoffPacket, null, 2)
      : quickCheckAuditHandoffCsv(auditHandoffPacket),
    [auditHandoffFormat, auditHandoffPacket],
  );
  const openBookings = useMemo(() => bookings.filter((booking) => !CLOSED_BOOKING_STATUSES.has(booking.status)), [bookings]);
  const openOrders = useMemo(() => sellerOrders.filter(orderNeedsAction), [sellerOrders]);
  const reviewCards = useMemo(() => rolodexCards.filter(cardNeedsReview), [rolodexCards]);
  const selectedIntakeItem = useMemo(
    () => intakeItems.find((item) => item.id === selectedIntakeItemId),
    [intakeItems, selectedIntakeItemId],
  );

  const lanes = useMemo<QuickCheckLane[]>(() => {
    const laneNotifications = (laneId: QuickCheckLaneId) => unreadNotifications.filter((notification) => notificationMatches(notification, laneId));
    const laneIntake = (laneId: QuickCheckLaneId) => intakeItemsForLane(openIntakeItems, laneId);

    return [
      {
        id: 'confessions',
        title: 'Confessions',
        category: 'Intake',
        detail: 'First-class confession and confessional-booth intake records.',
        count: laneIntake('confessions').length,
        newestAt: newestDate(laneIntake('confessions').map((item) => item.updatedAt || item.createdAt)),
        tone: '#ff9abf',
        source: 'live',
        targetView: 'quickCheckZone',
      },
      {
        id: 'affirmations',
        title: 'Affirmations',
        category: 'Intake',
        detail: 'First-class affirmation intake records from Subs.',
        count: laneIntake('affirmations').length,
        newestAt: newestDate(laneIntake('affirmations').map((item) => item.updatedAt || item.createdAt)),
        tone: '#a855f7',
        source: 'live',
        targetView: 'quickCheckZone',
      },
      {
        id: 'secrets',
        title: 'Secrets',
        category: 'Access',
        detail: 'First-class secret box and private-access intake records.',
        count: laneIntake('secrets').length,
        newestAt: newestDate(laneIntake('secrets').map((item) => item.updatedAt || item.createdAt)),
        tone: '#60a5fa',
        source: 'live',
        targetView: 'quickCheckZone',
      },
      {
        id: 'contracts',
        title: 'Contracts',
        category: 'Consent',
        detail: 'Keeper, pledge, agreement and contract signals routed through nearby modules.',
        count: laneNotifications('contracts').length,
        newestAt: newestDate(laneNotifications('contracts').map((notification) => notification.createdAt)),
        tone: mxTheme.colors.warning,
        source: 'nearby',
        targetView: 'keeperAllowance',
      },
      {
        id: 'bookings',
        title: 'Bookings',
        category: 'Calls',
        detail: 'Pending, approved and active phone/video sessions.',
        count: openBookings.length,
        newestAt: newestDate(openBookings.map((booking) => booking.updatedAt || booking.createdAt)),
        tone: mxTheme.colors.success,
        source: 'live',
        targetView: 'bookings',
      },
      {
        id: 'requests',
        title: 'Requests',
        category: 'Requests',
        detail: 'First-class custom request intake records.',
        count: laneIntake('requests').length,
        newestAt: newestDate(laneIntake('requests').map((item) => item.updatedAt || item.createdAt)),
        tone: '#f97316',
        source: 'live',
        targetView: 'quickCheckZone',
      },
      {
        id: 'rolodex',
        title: 'Rolodex',
        category: 'Relationships',
        detail: 'Shared cards, prospects and relationship cards needing review.',
        count: reviewCards.length,
        newestAt: newestDate(reviewCards.map((card) => card.updatedAt || card.createdAt)),
        tone: '#ec4899',
        source: 'live',
        targetView: 'rolodex',
      },
      {
        id: 'salesFulfilment',
        title: 'Sales Fulfilment',
        category: 'Orders',
        detail: 'Marketplace orders that still need approval, packing, delivery or review.',
        count: openOrders.length,
        newestAt: newestDate(openOrders.map((order) => order.updatedAt || order.createdAt)),
        tone: '#22c55e',
        source: 'live',
        targetView: 'marketplaceOrders',
      },
      {
        id: 'messages',
        title: 'Messages',
        category: 'Chat',
        detail: 'Unread paid or standard chat notifications.',
        count: laneNotifications('messages').length,
        newestAt: newestDate(laneNotifications('messages').map((notification) => notification.createdAt)),
        tone: '#38bdf8',
        source: 'live',
        targetView: 'chat',
      },
    ];
  }, [openBookings, openIntakeItems, openOrders, reviewCards, unreadNotifications]);

  const signals = useMemo(() => {
    const laneTone = new Map(lanes.map((lane) => [lane.id, lane.tone]));
    const rows = [
      ...intakeSignals('confessions', openIntakeItems, laneTone.get('confessions') || '#ff9abf'),
      ...intakeSignals('affirmations', openIntakeItems, laneTone.get('affirmations') || '#a855f7'),
      ...intakeSignals('secrets', openIntakeItems, laneTone.get('secrets') || '#60a5fa'),
      ...notificationSignals('contracts', unreadNotifications, laneTone.get('contracts') || mxTheme.colors.warning, 'keeperAllowance'),
      ...intakeSignals('requests', openIntakeItems, laneTone.get('requests') || '#f97316'),
      ...notificationSignals('messages', unreadNotifications, laneTone.get('messages') || '#38bdf8', 'chat'),
      ...bookingSignals(openBookings, laneTone.get('bookings') || mxTheme.colors.success),
      ...rolodexSignals(reviewCards, laneTone.get('rolodex') || '#ec4899'),
      ...orderSignals(openOrders, laneTone.get('salesFulfilment') || '#22c55e'),
    ];

    return rows
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [lanes, openBookings, openIntakeItems, openOrders, reviewCards, unreadNotifications]);

  const totalActionCount = lanes.reduce((count, lane) => count + lane.count, 0);
  const liveSourceCount = lanes.filter((lane) => lane.source === 'live').length;
  const nearbySourceCount = lanes.filter((lane) => lane.source === 'nearby').length;
  const activeHistoryFilterCount = [
    historySearch.trim(),
    historyKindFilter !== 'ALL',
    historyStatusFilter !== 'ALL',
  ].filter(Boolean).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.xl }}>
      <View style={{ gap: mxTheme.spacing.sm }}>
        <Text style={{ color: mxTheme.colors.accent, fontSize: 12, fontWeight: '900' }}>MISTRESS DASHBOARD</Text>
        <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Quick Check Zone</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>
          Confessions, affirmations, secrets, contracts, bookings, requests, Rolodex cards, sales fulfilment and messages in one operating panel.
        </Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 12, fontWeight: '800' }}>
          Signed in as {currentUser?.displayName || currentUser?.username || 'current user'} - {usesHeadmistressReviewQueue ? 'Headmistress-wide review queue' : 'Host queue'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
        <MetricCard label="Needs Action" value={totalActionCount} tone={totalActionCount ? mxTheme.colors.warning : mxTheme.colors.success} />
        <MetricCard label="Live Sources" value={liveSourceCount} tone={mxTheme.colors.success} />
        <MetricCard label="Nearby Feeds" value={nearbySourceCount} tone={mxTheme.colors.warning} />
        <MetricCard label="Latest Signals" value={signals.length} tone={signals.length ? mxTheme.colors.accentSoft : mxTheme.colors.success} />
        <MetricCard label="Reviewed Intake" value={closedIntakeItems.length} tone={closedIntakeItems.length ? mxTheme.colors.muted : mxTheme.colors.success} />
        <MetricCard label="Review Scope" value={usesHeadmistressReviewQueue ? 'All Hosts' : 'Host'} tone={usesHeadmistressReviewQueue ? mxTheme.colors.warning : mxTheme.colors.accent} />
      </View>

      <GuardIndicatorPanel
        title="Quick Check Guard Indicators"
        subtitle="High-risk inbox rows show consent, audit, and compliance state before review actions."
        guards={QUICK_CHECK_SURFACE_GUARDS}
      />

      {loadErrors.length ? (
        <View style={{ backgroundColor: '#180b10', borderColor: '#ff6b6b', borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 12, fontWeight: '900' }}>SOURCE WARNINGS</Text>
          {loadErrors.map((error) => (
            <Text key={error} style={{ color: '#ffd6e2', fontSize: 12 }}>{error}</Text>
          ))}
        </View>
      ) : null}

      {reviewNotice || reviewError ? (
        <View style={{ backgroundColor: reviewError ? '#180b10' : '#071a14', borderColor: reviewError ? '#ff6b6b' : mxTheme.colors.success, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md }}>
          <Text style={{ color: reviewError ? '#ff9abf' : mxTheme.colors.success, fontSize: 12, fontWeight: '900' }}>
            {reviewError ? reviewError : reviewNotice}
          </Text>
        </View>
      ) : null}

      {selectedIntakeItem ? (
        <QuickCheckDetailDrawer
          item={selectedIntakeItem}
          busyReviewId={reviewingItemId}
          onClose={() => setSelectedIntakeItemId(null)}
          onReviewIntake={handleReviewIntake}
        />
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
        {lanes.map((lane) => (
          <LaneCard key={lane.id} lane={lane} onOpenModule={onOpenModule} />
        ))}
      </View>

      <View style={{ gap: mxTheme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: mxTheme.spacing.md, flexWrap: 'wrap' }}>
          <View>
            <Text style={{ color: mxTheme.colors.text, fontSize: 21, fontWeight: '900' }}>Recent Signals</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>{loading ? 'Refreshing sources...' : `${signals.length} visible rows`}</Text>
          </View>
          <Pressable onPress={loadQuickChecks} disabled={loading} style={{ borderColor: mxTheme.colors.accent, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, opacity: loading ? 0.55 : 1 }}>
            <Text style={{ color: mxTheme.colors.accent, fontSize: 11, fontWeight: '900' }}>{loading ? 'REFRESHING' : 'REFRESH'}</Text>
          </Pressable>
        </View>
        {signals.length ? (
          signals.map((signal) => (
            <SignalRow
              key={signal.id}
              signal={signal}
              busyReviewId={reviewingItemId}
              onOpenModule={onOpenModule}
              onReviewIntake={handleReviewIntake}
              onOpenIntakeDetails={setSelectedIntakeItemId}
            />
          ))
        ) : (
          <View style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.lg }}>
            <Text style={{ color: mxTheme.colors.success, fontSize: 15, fontWeight: '900' }}>No current quick-check rows.</Text>
            <Text style={{ color: mxTheme.colors.muted, marginTop: 6, lineHeight: 19 }}>Live sources are clear or waiting for backend events.</Text>
          </View>
        )}
      </View>

      <View style={{ gap: mxTheme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: mxTheme.spacing.md, flexWrap: 'wrap' }}>
          <View>
            <Text style={{ color: mxTheme.colors.text, fontSize: 21, fontWeight: '900' }}>Reviewed Intake History</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>
              {showIntakeHistory
                ? `${filteredClosedIntakeItems.length} shown from ${closedIntakeItems.length} reviewed rows${activeHistoryFilterCount ? ` - ${activeHistoryFilterCount} active filters` : ''}`
                : `${closedIntakeItems.length} reviewed rows hidden`}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowIntakeHistory((value) => !value)}
            style={{ borderColor: showIntakeHistory ? mxTheme.colors.warning : mxTheme.colors.accent, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text style={{ color: showIntakeHistory ? mxTheme.colors.warning : mxTheme.colors.accent, fontSize: 11, fontWeight: '900' }}>
              {showIntakeHistory ? 'HIDE HISTORY' : 'SHOW HISTORY'}
            </Text>
          </Pressable>
        </View>

        {showIntakeHistory ? (
          <View style={{ gap: mxTheme.spacing.sm }}>
            <TextInput
              value={historySearch}
              onChangeText={setHistorySearch}
              placeholder="Search reviewed intake by title, message, requester, metadata, note, or audit trail"
              placeholderTextColor={mxTheme.colors.muted}
              style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, color: mxTheme.colors.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 }}
            />
            <View style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: 10 }}>
              <View style={{ gap: 7 }}>
                <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>INTAKE TYPE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                  {HISTORY_KIND_FILTERS.map((filter) => (
                    <FilterChip
                      key={`kind-filter-${filter.value}`}
                      label={filter.label}
                      tone={filter.tone}
                      active={historyKindFilter === filter.value}
                      onPress={() => setHistoryKindFilter(filter.value)}
                    />
                  ))}
                </View>
              </View>
              <View style={{ gap: 7 }}>
                <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>REVIEW STATUS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                  {HISTORY_STATUS_FILTERS.map((filter) => (
                    <FilterChip
                      key={`status-filter-${filter.value}`}
                      label={filter.label}
                      tone={filter.tone}
                      active={historyStatusFilter === filter.value}
                      onPress={() => setHistoryStatusFilter(filter.value)}
                    />
                  ))}
                </View>
              </View>
            </View>
            <View style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: 9 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <View style={{ flex: 1, minWidth: 220 }}>
                  <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>Saved Filter Views</Text>
                  <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 2 }}>{savedHistoryFilterViews.length} saved</Text>
                </View>
                <Pressable
                  onPress={() => { void handleSaveHistoryFilterView(); }}
                  style={{ borderColor: mxTheme.colors.accent, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }}
                >
                  <Text style={{ color: mxTheme.colors.accent, fontSize: 10, fontWeight: '900' }}>SAVE VIEW</Text>
                </Pressable>
              </View>
              <TextInput
                value={historyFilterViewName}
                onChangeText={setHistoryFilterViewName}
                placeholder="View name"
                placeholderTextColor={mxTheme.colors.muted}
                style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, color: mxTheme.colors.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 }}
              />
              {historyFilterViewNotice ? (
                <Text style={{ color: mxTheme.colors.accent, fontSize: 11, fontWeight: '800' }}>{historyFilterViewNotice}</Text>
              ) : null}
              {savedHistoryFilterViews.length ? (
                savedHistoryFilterViews.map((view) => (
                  <View key={view.id} style={{ borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.sm, gap: 7 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <View style={{ flex: 1, minWidth: 210 }}>
                        <Text style={{ color: mxTheme.colors.text, fontSize: 13, fontWeight: '900' }}>{view.label}</Text>
                        <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 }}>{historyFilterViewSummary(view)}</Text>
                        <Text style={{ color: mxTheme.colors.muted, fontSize: 10, marginTop: 2 }}>Updated {formatDate(view.updatedAt)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'flex-start' }}>
                        <Pressable onPress={() => applyHistoryFilterView(view)} style={{ borderColor: mxTheme.colors.accent, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }}>
                          <Text style={{ color: mxTheme.colors.accent, fontSize: 10, fontWeight: '900' }}>APPLY</Text>
                        </Pressable>
                        <Pressable onPress={() => { void handleRemoveHistoryFilterView(view.id); }} style={{ borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }}>
                          <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>REMOVE</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>No saved filter views.</Text>
              )}
            </View>
            <View style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: 9 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <View style={{ flex: 1, minWidth: 220 }}>
                  <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>Headmistress Audit Handoff</Text>
                  <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 }}>
                    {auditHandoffPacket.totals.exportedRows} export rows from {auditHandoffPacket.totals.matchingRows} filtered matches
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                  {(['JSON', 'CSV'] as QuickCheckAuditHandoffFormat[]).map((format) => (
                    <FilterChip
                      key={`audit-handoff-format-${format}`}
                      label={format}
                      tone={mxTheme.colors.accent}
                      active={auditHandoffFormat === format}
                      onPress={() => setAuditHandoffFormat(format)}
                    />
                  ))}
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                <View style={{ borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }}>
                  <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>{historyKindFilterLabel(historyKindFilter).toUpperCase()}</Text>
                </View>
                <View style={{ borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }}>
                  <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>{historyStatusFilterLabel(historyStatusFilter).toUpperCase()}</Text>
                </View>
                {historySearch.trim() ? (
                  <View style={{ borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }}>
                    <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>SEARCH ACTIVE</Text>
                  </View>
                ) : null}
              </View>
              <TextInput
                value={auditHandoffExport}
                editable={false}
                multiline
                selectTextOnFocus
                style={{ minHeight: 150, backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, color: '#d7d7dc', paddingHorizontal: 12, paddingVertical: 10, fontSize: 11, lineHeight: 16, textAlignVertical: 'top' }}
              />
            </View>
            <View style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, gap: 9 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <View style={{ flex: 1, minWidth: 220 }}>
                  <Text style={{ color: mxTheme.colors.text, fontSize: 14, fontWeight: '900' }}>Review Note Presets</Text>
                  <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 }}>The next review action saves this note into the item history.</Text>
                </View>
                {reviewNoteDraft ? (
                  <Pressable onPress={() => setReviewNoteDraft('')} style={{ borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }}>
                    <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>CLEAR NOTE</Text>
                  </Pressable>
                ) : null}
              </View>
              <TextInput
                value={reviewNoteDraft}
                onChangeText={setReviewNoteDraft}
                placeholder="Write or choose a saved review note for the next action"
                placeholderTextColor={mxTheme.colors.muted}
                multiline
                style={{ minHeight: 72, backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, color: mxTheme.colors.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, textAlignVertical: 'top' }}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {REVIEW_NOTE_PRESETS.map((preset) => (
                  <FilterChip
                    key={`note-preset-${preset.label}`}
                    label={preset.label}
                    tone={mxTheme.colors.accent}
                    active={reviewNoteDraft === preset.note}
                    onPress={() => setReviewNoteDraft(preset.note)}
                  />
                ))}
              </View>
            </View>
            {filteredClosedIntakeItems.length ? (
              filteredClosedIntakeItems.map((item) => (
                <QuickCheckHistoryRow key={item.id} item={item} onOpenDetails={setSelectedIntakeItemId} />
              ))
            ) : (
              <View style={{ backgroundColor: '#101016', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.lg }}>
                <Text style={{ color: mxTheme.colors.muted, fontSize: 13, lineHeight: 19 }}>No reviewed intake matches this search.</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
