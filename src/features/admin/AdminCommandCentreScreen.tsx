import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  AdminLedgerTransaction,
  AdminOverview,
  AdminUser,
  getAdminOverview,
  listAdminLedger,
  listAdminUsers,
} from '../../api/adminApi';
import {
  AdminBooking,
  AdminBookingReviewBatchHistory,
  AdminBookingReviewBatchHistoryFilters,
  AdminBookingReviewBatchReplayDetail,
  AdminBookingReconciliation,
  AdminBookingReview,
  AdminBookingReviewDetail,
  AdminBookingReviewFilters,
  AdminComplianceOverview,
  AdminGiftsGoals,
  AdminLiveShow,
  AdminMarketplaceWorlds,
  AdminModerationItem,
  AdminModerationStatus,
  AdminPlugin,
  AdminPpvItem,
  AdminStickerPack,
  executeAdminBookingChargebackClawback,
  executeAdminBookingRefund,
  exportAdminBookingReviewBatchPacket,
  exportAdminBookingReviewBatchReplayAlertHandoff,
  exportAdminBookingReviewBatchReplayAlertsCsv,
  exportAdminBookingReviewBatchReplayReportCsv,
  exportAdminBookingReviewPacket,
  exportAdminBookingReviewsCsv,
  getAdminBookingReconciliation,
  getAdminBookingReviewBatchReplayDetail,
  getAdminBookingReviewDetail,
  getAdminComplianceOverview,
  getAdminGiftsGoals,
  getAdminMarketplaceWorlds,
  listAdminBookings,
  listAdminBookingReviewBatchHistory,
  listAdminBookingReviews,
  listAdminLiveShows,
  listAdminModeration,
  listAdminPlugins,
  listAdminPpv,
  listAdminStickerPacks,
  openAdminBookingChargebackReview,
  openAdminBookingDispute,
  openAdminBookingProviderFollowUp,
  openAdminBookingRefundReview,
  replayAdminBookingReviewBatch,
  retryFailedAdminBookingReviewBatchRows,
  seedAdminPremiumGiftCatalogue,
  updateAdminBookingReviewWorkflow,
  updateAdminBookingReviewWorkflowBatch,
} from '../../api/adminCommandApi';
import {
  approveMarketplaceApprovalRequest,
  declineMarketplaceApprovalRequest,
  getMarketplaceOrderReceipt,
  MarketplaceOrderReceipt,
} from '../../api/marketplaceApi';
import { AdminPluginStatusActionsPanel } from './AdminPluginStatusActionsPanel';
import { BookingReviewReplayDetailPanel } from './BookingReviewReplayDetailPanel';
import { BookingReviewReplayOperationsPanel } from './BookingReviewReplayOperationsPanel';
import {
  adminComplianceSummaryCards,
  buildAdminComplianceSummary,
} from './adminComplianceSummaryHelpers';
import { getCurrentUser } from '../../state/authStore';

const COUNT_LABELS: Record<keyof AdminOverview['counts'], string> = {
  totalUsers: 'Total Users',
  activeUsers: 'Active Users',
  mistressCount: 'Mistresses',
  subCount: 'Subs',
  walletTransactions: 'Wallet Transactions',
  ppvItems: 'PPV Items',
  liveShows: 'Live Shows',
  paidCallBookings: 'Paid Call Bookings',
  gifts: 'Gifts',
  stickers: 'Stickers',
  stickerPacks: 'Sticker Packs',
  completedStickerPacks: 'Completed Sticker Packs',
  marketplaceProducts: 'Marketplace Products',
  approvalLockedProducts: 'Approval Locked Products',
  pendingMarketplaceApprovals: 'Pending Marketplace Approvals',
  moderationOpen: 'Open Moderation',
};

type AdminTab =
  | 'overview'
  | 'users'
  | 'ledger'
  | 'moderation'
  | 'plugins'
  | 'ppv'
  | 'liveShows'
  | 'bookings'
  | 'giftsGoals'
  | 'stickerPacks'
  | 'marketplaceWorlds'
  | 'compliance';

const BOOKING_REVIEW_STATUS_FILTERS = ['ALL', 'OPEN', 'IN_REVIEW', 'ESCALATED', 'RESOLVED'];
const BOOKING_REVIEW_WORKFLOW_ACTIONS: Array<{ label: string; status: AdminModerationStatus; tone: string }> = [
  { label: 'Assign / Review', status: 'IN_REVIEW', tone: '#d4af37' },
  { label: 'Escalate', status: 'ESCALATED', tone: '#ff9abf' },
  { label: 'Resolve', status: 'RESOLVED', tone: '#1D9E75' },
  { label: 'Dismiss', status: 'DISMISSED', tone: '#441122' },
];
const BOOKING_REVIEW_KIND_FILTERS = [
  { label: 'All reviews', value: 'ALL' },
  { label: 'Refunds', value: 'booking_refund_review' },
  { label: 'Disputes', value: 'booking_dispute' },
  { label: 'Provider', value: 'booking_provider_follow_up' },
  { label: 'Chargebacks', value: 'booking_chargeback_review' },
];
const BOOKING_REVIEW_BATCH_OUTCOME_FILTERS: Array<{ label: string; value: NonNullable<AdminBookingReviewBatchHistoryFilters['outcome']> }> = [
  { label: 'All Batches', value: 'ALL' },
  { label: 'Failed Rows', value: 'FAILED' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Successful', value: 'SUCCESSFUL' },
  { label: 'Replayed', value: 'REPLAYED' },
];
const BOOKING_REPLAY_ALERT_STATUS_FILTERS = [
  { label: 'All Alerts', value: 'ALL' },
  { label: 'Unacknowledged', value: 'UNACKNOWLEDGED' },
  { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
  { label: 'Escalated', value: 'ESCALATED' },
];
const BOOKING_REPLAY_REMINDER_STATUS_FILTERS = [
  { label: 'All Reminders', value: 'ALL' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'No Reminder', value: 'NONE' },
];
const BOOKING_REVIEW_EXPORT_FILE_NAME = 'booking-review-packets.csv';

function userLabel(user?: { username?: string; displayName?: string | null; role?: string; id?: string } | null) {
  if (!user) return 'Unknown user';
  return `${user.displayName || user.username || user.id || 'Unknown'}${user.role ? ` · ${user.role}` : ''}`;
}

function panelStyle() {
  return { backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 8 } as const;
}

function smallTextStyle(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function statusColor(status: string) {
  if (status === 'ACTIVE') return '#1D9E75';
  if (status === 'APPROVED') return '#d4af37';
  if (status === 'COMPLETED') return '#777';
  if (status === 'CANCELLED') return '#ff6b6b';
  if (status === 'REFUNDED') return '#ff6b6b';
  if (status === 'FULFILMENT_PENDING') return '#d4af37';
  if (['PROCESSING', 'PACKED', 'SHIPPED', 'READY_FOR_PICKUP', 'DELIVERED'].includes(status)) return '#1D9E75';
  if (status === 'PENDING_APPROVAL') return '#d4af37';
  if (status === 'APPROVED_PENDING_PAYMENT') return '#ff9abf';
  return '#ff9abf';
}

function storeReviewActionLabel(status: string) {
  if (status === 'PENDING_APPROVAL') return 'Seller approval decision needed';
  if (status === 'APPROVED_PENDING_PAYMENT') return 'Buyer payment is still pending';
  if (status === 'COMPLETED' || status === 'FULFILMENT_PENDING') return 'Seller fulfilment update needed';
  if (['PROCESSING', 'PACKED', 'SHIPPED', 'READY_FOR_PICKUP', 'DELIVERED'].includes(status)) return 'Track fulfilment progress';
  if (status === 'CANCELLED' || status === 'REFUNDED') return 'Review exception, refund, or dispute notes';
  return 'Review marketplace order state';
}

function canLoadStoreReceipt(status: string) {
  return [
    'COMPLETED',
    'FULFILMENT_PENDING',
    'FULFILLED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'READY_FOR_PICKUP',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ].includes(status);
}

function pendingAgeLabel(createdAt: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m waiting`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h waiting`;
  return `${Math.floor(hours / 24)}d waiting`;
}

function bookingReviewBatchFailedAgeHours(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (!Number.isFinite(createdTime)) return null;
  return Math.max(0, Math.floor((Date.now() - createdTime) / 36e5));
}

function isStaleBookingReviewFailure(createdAt: string, failedCount: number, replayed: boolean) {
  const ageHours = bookingReviewBatchFailedAgeHours(createdAt);
  return failedCount > 0 && !replayed && ageHours !== null && ageHours >= 24;
}

function bookingReviewBatchAlertRollups(rows: AdminBookingReviewBatchHistory[]) {
  return rows.reduce(
    (summary, row) => {
      const metadata = (row.metadata || {}) as Record<string, unknown>;
      const failures = bookingReviewBatchFailures(row);
      const failedCount = Number(metadata.failed || failures.length || 0);
      const replayed = metadata.replayAction === true || Boolean(metadata.sourceBatchId);
      const stale = isStaleBookingReviewFailure(row.createdAt, failedCount, replayed);
      const alertStatus = String(metadata.latestAlertStatus || (stale ? 'UNACKNOWLEDGED' : '')).toUpperCase();
      if (stale) summary.stale += 1;
      if (alertStatus === 'UNACKNOWLEDGED') summary.unacknowledged += 1;
      if (alertStatus === 'ACKNOWLEDGED') summary.acknowledged += 1;
      if (alertStatus === 'ESCALATED') summary.escalated += 1;
      if (metadata.latestAlertAssignedToId) summary.assigned += 1;
      if (metadata.retryReminderDueAt) summary.reminders += 1;
      if (metadata.retryReminderOverdue === true || alertStatus === 'RETRY_REMINDER_OVERDUE') summary.overdueReminders += 1;
      if (alertStatus === 'RETRY_REMINDER_SNOOZED') summary.snoozedReminders += 1;
      if (alertStatus === 'RETRY_REMINDER_CLEARED') summary.clearedReminders += 1;
      return summary;
    },
    { stale: 0, unacknowledged: 0, acknowledged: 0, escalated: 0, assigned: 0, reminders: 0, overdueReminders: 0, snoozedReminders: 0, clearedReminders: 0 },
  );
}

function bookingReviewReminderSlaCards(rows: AdminBookingReviewBatchHistory[]) {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return rows.reduce(
    (summary, row) => {
      const metadata = (row.metadata || {}) as Record<string, unknown>;
      const alertStatus = String(metadata.latestAlertStatus || '').toUpperCase();
      const dueAt = metadata.retryReminderDueAt ? new Date(String(metadata.retryReminderDueAt)).getTime() : Number.NaN;
      const activeReminder = Boolean(metadata.retryReminderDueAt) && alertStatus !== 'RETRY_REMINDER_CLEARED';
      const overdue = metadata.retryReminderOverdue === true || alertStatus === 'RETRY_REMINDER_OVERDUE' || (activeReminder && Number.isFinite(dueAt) && dueAt < now);
      if (activeReminder) summary.active += 1;
      if (overdue) summary.overdue += 1;
      if (activeReminder && !overdue && Number.isFinite(dueAt) && dueAt <= now + oneDayMs) summary.dueSoon += 1;
      if (alertStatus === 'RETRY_REMINDER_SNOOZED') summary.snoozed += 1;
      if (alertStatus === 'RETRY_REMINDER_CLEARED') summary.cleared += 1;
      return summary;
    },
    { active: 0, overdue: 0, dueSoon: 0, snoozed: 0, cleared: 0 },
  );
}

function bookingReviewStaleOwnerDrilldowns(rows: AdminBookingReviewBatchHistory[]) {
  const ownerRows = new Map<string, {
    ownerId: string;
    label: string;
    staleCount: number;
    overdueCount: number;
    reminderCount: number;
    nextDueAt: string | null;
  }>();

  rows.forEach((row) => {
    const metadata = (row.metadata || {}) as Record<string, unknown>;
    const failures = bookingReviewBatchFailures(row);
    const failedCount = Number(metadata.failed || failures.length || 0);
    const replayed = metadata.replayAction === true || Boolean(metadata.sourceBatchId);
    const stale = isStaleBookingReviewFailure(row.createdAt, failedCount, replayed);
    const ownerId = String(metadata.latestAlertAssignedToId || 'UNASSIGNED').trim() || 'UNASSIGNED';
    const alertStatus = String(metadata.latestAlertStatus || '').toUpperCase();
    const dueAt = metadata.retryReminderDueAt ? String(metadata.retryReminderDueAt) : null;
    const overdue = metadata.retryReminderOverdue === true || alertStatus === 'RETRY_REMINDER_OVERDUE';
    if (!stale && !dueAt && !overdue) return;

    const current = ownerRows.get(ownerId) || {
      ownerId,
      label: ownerId === 'UNASSIGNED' ? 'Unassigned' : ownerId,
      staleCount: 0,
      overdueCount: 0,
      reminderCount: 0,
      nextDueAt: null,
    };
    if (stale) current.staleCount += 1;
    if (overdue) current.overdueCount += 1;
    if (dueAt) {
      current.reminderCount += 1;
      if (!current.nextDueAt || new Date(dueAt).getTime() < new Date(current.nextDueAt).getTime()) {
        current.nextDueAt = dueAt;
      }
    }
    ownerRows.set(ownerId, current);
  });

  return Array.from(ownerRows.values())
    .sort((a, b) => b.overdueCount - a.overdueCount || b.staleCount - a.staleCount || a.label.localeCompare(b.label));
}

function worldLabel(value?: string | null) {
  return value ? value.replace(/_/g, ' ') : 'Unknown world';
}

function moneyLabel(value: number | string | null | undefined) {
  return Number(value || 0).toFixed(2);
}

function browserExportApi() {
  const scope = globalThis as any;

  return {
    BlobRef: scope.Blob,
    documentRef: scope.document,
    urlRef: scope.URL || scope.webkitURL,
  };
}

function downloadTextFile(text: string, fileName: string, mimeType: string) {
  if (!text.trim()) return `${fileName} is empty.`;

  const { BlobRef, documentRef, urlRef } = browserExportApi();
  if (!BlobRef || !documentRef?.createElement || !urlRef?.createObjectURL) {
    return `${fileName} is ready below for manual save.`;
  }

  const blob = new BlobRef([text], { type: mimeType });
  const url = urlRef.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  documentRef.body?.appendChild(link);
  link.click();
  link.remove?.();
  urlRef.revokeObjectURL?.(url);

  return `${fileName} download started.`;
}

function bookingReviewPacketFileName(reviewId: string) {
  return `booking-review-packet-${reviewId}.json`;
}

function bookingReviewBatchPacketFileName(batchId: string) {
  return `booking-review-batch-${batchId}.json`;
}

function bookingReviewBatchHistoryId(batch: AdminBookingReviewBatchHistory) {
  const metadata = (batch.metadata || {}) as Record<string, unknown>;
  return String(metadata.batchId || batch.targetId || batch.id);
}

function bookingReviewBatchFailures(batch: AdminBookingReviewBatchHistory) {
  const metadata = (batch.metadata || {}) as Record<string, unknown>;
  return Array.isArray(metadata.failures) ? metadata.failures : [];
}

function ppmSessionKindLabel(value?: string | null) {
  if (!value) return 'Unknown session';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function minutesFromSecondsLabel(seconds: number | string | null | undefined) {
  const minutes = Number(seconds || 0) / 60;
  return `${minutes.toFixed(minutes >= 10 || minutes === 0 ? 0 : 1)} min`;
}

function fundProgress(current: number | string, target: number | string) {
  const targetAmount = Number(target || 0);
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.round((Number(current || 0) / targetAmount) * 100));
}

export function AdminCommandCentreScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ledger, setLedger] = useState<AdminLedgerTransaction[]>([]);
  const [moderation, setModeration] = useState<AdminModerationItem[]>([]);
  const [plugins, setPlugins] = useState<AdminPlugin[]>([]);
  const [ppvItems, setPpvItems] = useState<AdminPpvItem[]>([]);
  const [liveShows, setLiveShows] = useState<AdminLiveShow[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingReviews, setBookingReviews] = useState<AdminBookingReview[]>([]);
  const [bookingReconciliation, setBookingReconciliation] = useState<AdminBookingReconciliation | null>(null);
  const [bookingReviewFilters, setBookingReviewFilters] = useState<AdminBookingReviewFilters>({ status: 'ALL', reviewKind: 'ALL' });
  const [bookingReviewDetail, setBookingReviewDetail] = useState<AdminBookingReviewDetail | null>(null);
  const [bookingReviewExportText, setBookingReviewExportText] = useState('');
  const [bookingReviewExportNotice, setBookingReviewExportNotice] = useState<string | null>(null);
  const [bookingReviewWorkflowNotes, setBookingReviewWorkflowNotes] = useState<Record<string, string>>({});
  const [bookingReviewAssignees, setBookingReviewAssignees] = useState<Record<string, string>>({});
  const [selectedBookingReviewIds, setSelectedBookingReviewIds] = useState<string[]>([]);
  const [bookingReviewBatchNote, setBookingReviewBatchNote] = useState('');
  const [bookingReviewBatchAssignee, setBookingReviewBatchAssignee] = useState('');
  const [bookingReviewBatchHistory, setBookingReviewBatchHistory] = useState<AdminBookingReviewBatchHistory[]>([]);
  const [bookingReviewBatchOutcomeFilter, setBookingReviewBatchOutcomeFilter] = useState<NonNullable<AdminBookingReviewBatchHistoryFilters['outcome']>>('ALL');
  const [bookingReviewBatchAlertFilter, setBookingReviewBatchAlertFilter] = useState('ALL');
  const [bookingReviewBatchAlertOwnerFilter, setBookingReviewBatchAlertOwnerFilter] = useState('');
  const [bookingReviewBatchReminderFilter, setBookingReviewBatchReminderFilter] = useState('ALL');
  const [bookingReviewBatchReplayDetail, setBookingReviewBatchReplayDetail] = useState<AdminBookingReviewBatchReplayDetail | null>(null);
  const [bookingActionNotes, setBookingActionNotes] = useState<Record<string, string>>({});
  const [bookingRefundAmounts, setBookingRefundAmounts] = useState<Record<string, string>>({});
  const [giftsGoals, setGiftsGoals] = useState<AdminGiftsGoals | null>(null);
  const [stickerPacks, setStickerPacks] = useState<AdminStickerPack[]>([]);
  const [marketplaceWorlds, setMarketplaceWorlds] = useState<AdminMarketplaceWorlds | null>(null);
  const [marketplaceOrderReceipts, setMarketplaceOrderReceipts] = useState<Record<string, MarketplaceOrderReceipt | null>>({});
  const [marketplaceSellerFilter, setMarketplaceSellerFilter] = useState('ALL');
  const [marketplaceWorldFilter, setMarketplaceWorldFilter] = useState('ALL');
  const [compliance, setCompliance] = useState<AdminComplianceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const pendingApprovals = marketplaceWorlds?.pendingApprovals || [];
  const storeReviewQueue = marketplaceWorlds?.storeReviewQueue || [];
  const storeReviewSummary = marketplaceWorlds?.storeReviewSummary;
  const complianceSummary = useMemo(
    () => buildAdminComplianceSummary(compliance, overview?.counts.moderationOpen ?? moderation.length),
    [compliance, moderation.length, overview?.counts.moderationOpen],
  );

  const sellerApprovalRows = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number }>();
    pendingApprovals.forEach((approval) => {
      const seller = approval.product?.mistress;
      const id = seller?.id || approval.product?.mistressId || 'UNKNOWN_SELLER';
      const existing = map.get(id) || { id, label: userLabel(seller), count: 0 };
      existing.count += 1;
      map.set(id, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [pendingApprovals]);

  const worldApprovalRows = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number }>();
    pendingApprovals.forEach((approval) => {
      const id = approval.product?.world || 'UNKNOWN_WORLD';
      const existing = map.get(id) || { id, label: worldLabel(id), count: 0 };
      existing.count += 1;
      map.set(id, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [pendingApprovals]);

  const filteredPendingApprovals = useMemo(
    () => pendingApprovals.filter((approval) => {
      const sellerId = approval.product?.mistress?.id || approval.product?.mistressId || 'UNKNOWN_SELLER';
      const world = approval.product?.world || 'UNKNOWN_WORLD';
      const sellerMatches = marketplaceSellerFilter === 'ALL' || marketplaceSellerFilter === sellerId;
      const worldMatches = marketplaceWorldFilter === 'ALL' || marketplaceWorldFilter === world;
      return sellerMatches && worldMatches;
    }),
    [pendingApprovals, marketplaceSellerFilter, marketplaceWorldFilter],
  );

  const bookingReviewsByBookingId = useMemo(() => {
    const map = new Map<string, AdminBookingReview[]>();
    bookingReviews.forEach((review) => {
      if (!review.targetId) return;
      const rows = map.get(review.targetId) || [];
      rows.push(review);
      map.set(review.targetId, rows);
    });
    return map;
  }, [bookingReviews]);

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) loadUsers();
    if (activeTab === 'ledger' && ledger.length === 0) loadLedger();
    if (activeTab === 'moderation' && moderation.length === 0) loadModeration();
    if (activeTab === 'plugins' && plugins.length === 0) loadPlugins();
    if (activeTab === 'ppv' && ppvItems.length === 0) loadPpv();
    if (activeTab === 'liveShows' && liveShows.length === 0) loadLiveShows();
    if (activeTab === 'bookings' && bookings.length === 0) loadBookings();
    if (activeTab === 'giftsGoals' && !giftsGoals) loadGiftsGoals();
    if (activeTab === 'stickerPacks' && stickerPacks.length === 0) loadStickerPacks();
    if (activeTab === 'marketplaceWorlds' && !marketplaceWorlds) loadMarketplaceWorlds();
    if (activeTab === 'compliance' && !compliance) loadCompliance();
  }, [activeTab]);

  async function withSectionLoader(run: () => Promise<void>, fallback: string) {
    try {
      setSectionLoading(true);
      setError(null);
      await run();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setSectionLoading(false);
    }
  }

  async function loadOverview() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin overview failed to load');
    } finally {
      setLoading(false);
    }
  }

  function loadUsers() {
    return withSectionLoader(async () => setUsers(await listAdminUsers()), 'Admin users failed to load');
  }

  function loadLedger() {
    return withSectionLoader(async () => setLedger(await listAdminLedger()), 'Admin ledger failed to load');
  }

  function loadModeration() {
    return withSectionLoader(async () => setModeration(await listAdminModeration()), 'Moderation failed to load');
  }

  function loadPlugins() {
    return withSectionLoader(async () => setPlugins(await listAdminPlugins()), 'Plugins failed to load');
  }

  function handlePluginUpdated(updated: AdminPlugin) {
    setPlugins((current) => current.map((plugin) => plugin.id === updated.id ? updated : plugin));
  }

  function loadPpv() {
    return withSectionLoader(async () => setPpvItems(await listAdminPpv()), 'PPV failed to load');
  }

  function loadLiveShows() {
    return withSectionLoader(async () => setLiveShows(await listAdminLiveShows()), 'Live shows failed to load');
  }

  function loadBookings() {
    return withSectionLoader(async () => {
      const [bookingRows, reconciliation, filteredReviews, batchHistory] = await Promise.all([
        listAdminBookings(),
        getAdminBookingReconciliation(),
        listAdminBookingReviews(bookingReviewFilters),
        listAdminBookingReviewBatchHistory({
          limit: 10,
          outcome: bookingReviewBatchOutcomeFilter,
          alertStatus: bookingReviewBatchAlertFilter,
          assignedToId: bookingReviewBatchAlertOwnerFilter.trim() || undefined,
          reminderStatus: bookingReviewBatchReminderFilter,
        }),
      ]);
      setBookings(bookingRows);
      setBookingReviews(filteredReviews);
      setBookingReconciliation(reconciliation);
      setBookingReviewBatchHistory(batchHistory);
    }, 'Bookings failed to load');
  }

  function applyBookingReviewFilters(nextFilters: AdminBookingReviewFilters) {
    const filters = { ...bookingReviewFilters, ...nextFilters };
    setBookingReviewFilters(filters);
    setBookingReviewDetail(null);
    setBookingReviewExportText('');
    setBookingReviewExportNotice(null);
    setSelectedBookingReviewIds([]);
    return withSectionLoader(async () => {
      setBookingReviews(await listAdminBookingReviews(filters));
    }, 'Booking review filters failed to load');
  }

  function applyBookingReviewBatchOutcomeFilter(outcome: NonNullable<AdminBookingReviewBatchHistoryFilters['outcome']>) {
    setBookingReviewBatchOutcomeFilter(outcome);
    return withSectionLoader(async () => {
      setBookingReviewBatchHistory(await listAdminBookingReviewBatchHistory({
        limit: 10,
        outcome,
        alertStatus: bookingReviewBatchAlertFilter,
        assignedToId: bookingReviewBatchAlertOwnerFilter.trim() || undefined,
        reminderStatus: bookingReviewBatchReminderFilter,
      }));
    }, 'Booking review batch history failed to load');
  }

  function applyBookingReviewBatchAlertFilters(alertStatus = bookingReviewBatchAlertFilter, assignedToId = bookingReviewBatchAlertOwnerFilter) {
    setBookingReviewBatchAlertFilter(alertStatus);
    setBookingReviewBatchAlertOwnerFilter(assignedToId);
    return withSectionLoader(async () => {
      setBookingReviewBatchHistory(await listAdminBookingReviewBatchHistory({
        limit: 10,
        outcome: bookingReviewBatchOutcomeFilter,
        alertStatus,
        assignedToId: assignedToId.trim() || undefined,
        reminderStatus: bookingReviewBatchReminderFilter,
      }));
    }, 'Booking review replay alert filters failed to load');
  }

  function applyBookingReviewBatchReminderFilter(reminderStatus = bookingReviewBatchReminderFilter) {
    setBookingReviewBatchReminderFilter(reminderStatus);
    return withSectionLoader(async () => {
      setBookingReviewBatchHistory(await listAdminBookingReviewBatchHistory({
        limit: 10,
        outcome: bookingReviewBatchOutcomeFilter,
        alertStatus: bookingReviewBatchAlertFilter,
        assignedToId: bookingReviewBatchAlertOwnerFilter.trim() || undefined,
        reminderStatus,
      }));
    }, 'Booking review replay reminder filters failed to load');
  }

  async function handleBookingReviewDetail(review: AdminBookingReview) {
    try {
      setError(null);
      setActionMessage(null);
      setBookingReviewDetail(await getAdminBookingReviewDetail(review.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking review detail failed to load');
    }
  }

  async function handleBookingReviewCsvExport(action: 'load' | 'download') {
    try {
      setError(null);
      setBookingReviewExportNotice(null);
      const csvText = await exportAdminBookingReviewsCsv(bookingReviewFilters);
      setBookingReviewExportText(csvText);
      setBookingReviewExportNotice(
        action === 'download'
          ? downloadTextFile(csvText, BOOKING_REVIEW_EXPORT_FILE_NAME, 'text/csv;charset=utf-8')
          : 'Booking review packet CSV loaded.',
      );
    } catch (err) {
      setBookingReviewExportNotice(err instanceof Error ? err.message : 'Booking review CSV export failed.');
    }
  }

  async function handleBookingReviewPacketDownload(reviewId: string) {
    try {
      setError(null);
      setBookingReviewExportNotice(null);
      const packetText = await exportAdminBookingReviewPacket(reviewId);
      const fileName = bookingReviewPacketFileName(reviewId);
      setBookingReviewExportText(packetText);
      setBookingReviewExportNotice(downloadTextFile(packetText, fileName, 'application/json;charset=utf-8'));
    } catch (err) {
      setBookingReviewExportNotice(err instanceof Error ? err.message : 'Booking review packet export failed.');
    }
  }

  async function handleBookingReviewWorkflow(review: AdminBookingReview, status: AdminModerationStatus) {
    try {
      setError(null);
      setActionMessage(null);
      const currentAdmin = getCurrentUser();
      const assignedToId = (bookingReviewAssignees[review.id] || '').trim()
        || (status === 'IN_REVIEW' ? currentAdmin?.id : undefined);
      const note = (bookingReviewWorkflowNotes[review.id] || '').trim()
        || `${status.replace(/_/g, ' ').toLowerCase()} booking review packet ${review.id}.`;
      const updated = await updateAdminBookingReviewWorkflow(review.id, {
        status,
        assignedToId,
        note,
        resolutionNote: status === 'RESOLVED' || status === 'DISMISSED' ? note : undefined,
      });

      setBookingReviews((current) => current.map((row) => row.id === updated.id ? updated : row));
      setBookingReviewDetail((current) => (
        current?.review.id === updated.id ? { ...current, review: updated } : current
      ));
      setActionMessage(`Booking review packet moved to ${updated.status}.`);
      await Promise.all([loadBookings(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking review workflow action failed.');
    }
  }

  function toggleBookingReviewSelection(reviewId: string) {
    setSelectedBookingReviewIds((current) => (
      current.includes(reviewId)
        ? current.filter((id) => id !== reviewId)
        : [...current, reviewId]
    ));
  }

  function selectAllVisibleBookingReviews() {
    setSelectedBookingReviewIds(Array.from(new Set(bookingReviews.map((review) => review.id))));
  }

  async function handleBookingReviewBatchWorkflow(status: AdminModerationStatus) {
    try {
      setError(null);
      setActionMessage(null);
      const currentAdmin = getCurrentUser();
      const assignedToId = bookingReviewBatchAssignee.trim()
        || (status === 'IN_REVIEW' ? currentAdmin?.id : undefined);
      const note = bookingReviewBatchNote.trim()
        || `${status.replace(/_/g, ' ').toLowerCase()} ${selectedBookingReviewIds.length} booking review packet(s).`;
      const result = await updateAdminBookingReviewWorkflowBatch({
        reviewIds: selectedBookingReviewIds,
        status,
        assignedToId,
        note,
        resolutionNote: status === 'RESOLVED' || status === 'DISMISSED' ? note : undefined,
      });

      const updatedById = new Map(result.items.map((item) => [item.id, item]));
      setBookingReviews((current) => current.map((row) => updatedById.get(row.id) || row));
      setBookingReviewDetail((current) => (
        current && updatedById.has(current.review.id)
          ? { ...current, review: updatedById.get(current.review.id)! }
          : current
      ));
      setSelectedBookingReviewIds((current) => current.filter((id) => !updatedById.has(id)));
      setActionMessage(`Batch ${result.batchId} updated ${result.summary.updated} review packet(s); ${result.summary.failed} failed.`);
      await Promise.all([loadBookings(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking review batch workflow action failed.');
    }
  }

  async function handleBookingReviewBatchPacketDownload(batchId: string) {
    try {
      setError(null);
      setBookingReviewExportNotice(null);
      const packetText = await exportAdminBookingReviewBatchPacket(batchId);
      setBookingReviewExportText(packetText);
      setBookingReviewExportNotice(downloadTextFile(packetText, bookingReviewBatchPacketFileName(batchId), 'application/json;charset=utf-8'));
    } catch (err) {
      setBookingReviewExportNotice(err instanceof Error ? err.message : 'Booking review batch packet export failed.');
    }
  }

  async function handleBookingReviewBatchReplayDetail(batchId: string) {
    try {
      setError(null);
      setActionMessage(null);
      setBookingReviewBatchReplayDetail(await getAdminBookingReviewBatchReplayDetail(batchId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking review replay detail failed to load.');
    }
  }

  async function handleBookingReviewBatchReplayReportDownload(batchId: string) {
    try {
      setError(null);
      setBookingReviewExportNotice(null);
      const csvText = await exportAdminBookingReviewBatchReplayReportCsv(batchId);
      setBookingReviewExportText(csvText);
      setBookingReviewExportNotice(downloadTextFile(csvText, `booking-review-replay-report-${batchId}.csv`, 'text/csv;charset=utf-8'));
    } catch (err) {
      setBookingReviewExportNotice(err instanceof Error ? err.message : 'Booking review replay report export failed.');
    }
  }

  async function handleBookingReviewReplayAlertExport(kind: 'csv' | 'handoff') {
    try {
      setError(null);
      setBookingReviewExportNotice(null);
      const filters = {
        limit: 100,
        outcome: bookingReviewBatchOutcomeFilter,
        alertStatus: bookingReviewBatchAlertFilter,
        assignedToId: bookingReviewBatchAlertOwnerFilter.trim() || undefined,
        reminderStatus: bookingReviewBatchReminderFilter,
      };
      const exportText = kind === 'csv'
        ? await exportAdminBookingReviewBatchReplayAlertsCsv(filters)
        : await exportAdminBookingReviewBatchReplayAlertHandoff(filters);
      const fileName = kind === 'csv'
        ? 'booking-review-replay-alerts.csv'
        : 'booking-review-replay-alert-handoff.json';
      const mimeType = kind === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8';
      setBookingReviewExportText(exportText);
      setBookingReviewExportNotice(downloadTextFile(exportText, fileName, mimeType));
    } catch (err) {
      setBookingReviewExportNotice(err instanceof Error ? err.message : 'Booking review replay alert export failed.');
    }
  }

  async function handleBookingReviewBatchReplay(batch: AdminBookingReviewBatchHistory) {
    try {
      setError(null);
      setActionMessage(null);
      const metadata = (batch.metadata || {}) as Record<string, unknown>;
      const batchId = bookingReviewBatchHistoryId(batch);
      const overrideNote = bookingReviewBatchNote.trim();
      const overrideAssignee = bookingReviewBatchAssignee.trim();
      const replayBody: { note?: string; resolutionNote?: string; assignedToId?: string } = {};
      if (overrideAssignee) replayBody.assignedToId = overrideAssignee;
      if (overrideNote) {
        replayBody.note = overrideNote;
        if (['RESOLVED', 'DISMISSED'].includes(String(metadata.status || '').toUpperCase())) {
          replayBody.resolutionNote = overrideNote;
        }
      }

      const result = await replayAdminBookingReviewBatch(batchId, replayBody);
      setActionMessage(`Replayed batch ${batchId} as ${result.replayBatchId || result.batchId}: ${result.summary.updated} updated / ${result.summary.failed} failed.`);
      await Promise.all([loadBookings(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking review batch replay failed.');
    }
  }

  async function handleBookingReviewBatchFailedRetry(batch: AdminBookingReviewBatchHistory) {
    try {
      setError(null);
      setActionMessage(null);
      const batchId = bookingReviewBatchHistoryId(batch);
      const overrideNote = bookingReviewBatchNote.trim();
      const overrideAssignee = bookingReviewBatchAssignee.trim();
      const retryBody: { note?: string; resolutionNote?: string; assignedToId?: string } = {};
      if (overrideAssignee) retryBody.assignedToId = overrideAssignee;
      if (overrideNote) retryBody.note = overrideNote;

      const result = await retryFailedAdminBookingReviewBatchRows(batchId, retryBody);
      setActionMessage(`Retried failed rows from ${batchId} as ${result.replayBatchId || result.batchId}: ${result.summary.updated} updated / ${result.summary.failed} failed.`);
      await Promise.all([loadBookings(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking review failed-row retry failed.');
    }
  }

  function loadGiftsGoals() {
    return withSectionLoader(async () => setGiftsGoals(await getAdminGiftsGoals()), 'Gifts and goals failed to load');
  }

  function loadStickerPacks() {
    return withSectionLoader(async () => setStickerPacks(await listAdminStickerPacks()), 'Sticker packs failed to load');
  }

  function loadMarketplaceWorlds() {
    return withSectionLoader(async () => {
      const nextWorlds = await getAdminMarketplaceWorlds();
      const receiptEntries = await Promise.all(
        (nextWorlds.storeReviewQueue || []).slice(0, 25).map(async (order) => {
          if (!canLoadStoreReceipt(String(order.status || '').toUpperCase())) return [order.id, null] as const;
          try {
            return [order.id, await getMarketplaceOrderReceipt(order.id)] as const;
          } catch {
            return [order.id, null] as const;
          }
        }),
      );

      setMarketplaceWorlds(nextWorlds);
      setMarketplaceOrderReceipts(Object.fromEntries(receiptEntries));
    }, 'Marketplace worlds failed to load');
  }

  function loadCompliance() {
    return withSectionLoader(async () => setCompliance(await getAdminComplianceOverview()), 'Compliance failed to load');
  }

  async function handleApproveMarketplaceApproval(orderId: string) {
    try {
      setError(null);
      setActionMessage(null);
      await approveMarketplaceApprovalRequest(orderId);
      setActionMessage('Marketplace approval request approved.');
      await Promise.all([loadMarketplaceWorlds(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval action failed');
    }
  }

  async function handleDeclineMarketplaceApproval(orderId: string) {
    try {
      setError(null);
      setActionMessage(null);
      await declineMarketplaceApprovalRequest(orderId);
      setActionMessage('Marketplace approval request declined.');
      await Promise.all([loadMarketplaceWorlds(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decline action failed');
    }
  }

  function getBookingActionPayload(booking: AdminBooking) {
    const note = bookingActionNotes[booking.id]?.trim();
    const rawAmount = bookingRefundAmounts[booking.id]?.trim();
    const parsedAmount = rawAmount ? Number(rawAmount) : NaN;
    const amount = Number.isFinite(parsedAmount) ? parsedAmount : undefined;

    return {
      reason: note || `Command Centre review for ${booking.type.toLowerCase()} booking ${booking.id}`,
      note,
      amount,
      requestedAmount: amount,
      metadata: { source: 'admin_command_centre' },
    };
  }

  async function handleBookingDispute(booking: AdminBooking) {
    try {
      setError(null);
      setActionMessage(null);
      await openAdminBookingDispute(booking.id, getBookingActionPayload(booking));
      setActionMessage('Booking dispute opened and escalated to moderation.');
      await Promise.all([loadBookings(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking dispute action failed');
    }
  }

  async function handleBookingRefundReview(booking: AdminBooking) {
    try {
      setError(null);
      setActionMessage(null);
      await openAdminBookingRefundReview(booking.id, getBookingActionPayload(booking));
      setActionMessage('Booking refund review opened.');
      await Promise.all([loadBookings(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking refund review action failed');
    }
  }

  async function handleBookingProviderFollowUp(booking: AdminBooking) {
    try {
      setError(null);
      setActionMessage(null);
      await openAdminBookingProviderFollowUp(booking.id, getBookingActionPayload(booking));
      setActionMessage('Booking provider follow-up opened for bridge reconciliation.');
      await Promise.all([loadBookings(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking provider follow-up action failed');
    }
  }

  async function handleBookingChargebackReview(booking: AdminBooking) {
    try {
      setError(null);
      setActionMessage(null);
      await openAdminBookingChargebackReview(booking.id, getBookingActionPayload(booking));
      setActionMessage('Booking chargeback review opened for payment reconciliation.');
      await Promise.all([loadBookings(), loadLedger(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking chargeback review action failed');
    }
  }

  async function handleBookingChargebackClawback(booking: AdminBooking) {
    try {
      setError(null);
      setActionMessage(null);
      await executeAdminBookingChargebackClawback(booking.id, getBookingActionPayload(booking));
      setActionMessage('Booking chargeback clawback executed against the host wallet.');
      await Promise.all([loadBookings(), loadLedger(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking chargeback clawback failed');
    }
  }

  async function handleBookingRefundExecution(booking: AdminBooking) {
    try {
      setError(null);
      setActionMessage(null);
      await executeAdminBookingRefund(booking.id, getBookingActionPayload(booking));
      setActionMessage('Booking refund executed and credited to the sub wallet.');
      await Promise.all([loadBookings(), loadLedger(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking refund execution failed');
    }
  }

  async function handleSeedPremiumGiftCatalogue() {
    try {
      setError(null);
      setActionMessage(null);
      const result = await seedAdminPremiumGiftCatalogue();
      setActionMessage(`Premium gift catalogue seeded: ${result.seeded} gifts ready.`);
      await Promise.all([loadGiftsGoals(), loadOverview()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Premium gift catalogue seed failed');
    }
  }

  function renderTabButton(tab: AdminTab, label: string) {
    const active = activeTab === tab;

    return (
      <Pressable
        onPress={() => setActiveTab(tab)}
        style={{
          backgroundColor: active ? '#ff0055' : '#111',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 999,
          marginRight: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800' }}>{label}</Text>
      </Pressable>
    );
  }

  function renderRefreshButton(label: string, onPress: () => void) {
    return (
      <Pressable onPress={onPress} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>{label}</Text>
      </Pressable>
    );
  }

  function renderOverview() {
    return (
      <>
        {renderRefreshButton('Refresh Overview', loadOverview)}
        {loading ? <Text style={{ color: '#999' }}>Loading command centre...</Text> : null}
        {overview ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {(Object.keys(overview.counts) as Array<keyof AdminOverview['counts']>).map((key) => (
                <View key={key} style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
                  <Text style={{ color: '#aaa', fontSize: 11 }}>{COUNT_LABELS[key] || key}</Text>
                  <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{overview.counts[key]}</Text>
                </View>
              ))}
            </View>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Recent Transactions</Text>
            {overview.recentTransactions.map((tx) => (
              <View key={tx.id} style={panelStyle()}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{tx.type}</Text>
                <Text style={{ color: tx.direction === 'IN' ? '#1D9E75' : '#ff0055' }}>{tx.direction} · {tx.amount} credits</Text>
                <Text style={smallTextStyle('#777')}>{tx.reason || 'No reason'} · {new Date(tx.createdAt).toLocaleString()}</Text>
              </View>
            ))}
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8 }}>Recent Notifications</Text>
            {overview.recentNotifications.map((notification) => (
              <View key={notification.id} style={panelStyle()}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{notification.title}</Text>
                <Text style={smallTextStyle()}>{notification.type} · {notification.read ? 'read' : 'unread'} · {new Date(notification.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </>
        ) : null}
      </>
    );
  }

  function renderUsers() {
    return (
      <>
        {renderRefreshButton('Refresh Users', loadUsers)}
        {users.map((user) => (
          <View key={user.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{user.displayName || user.username}</Text>
            <Text style={smallTextStyle()}>{user.email}</Text>
            <Text style={{ color: '#ff9abf', marginTop: 6 }}>{user.role} · {user.status} · {user.isAdult ? 'Adult verified' : 'Adult not confirmed'}</Text>
            <Text style={smallTextStyle()}>Wallet: {user.wallet?.balance ?? 0} {user.wallet?.currency || 'CREDITS'}</Text>
            <Text style={smallTextStyle('#777')}>Joined: {new Date(user.createdAt).toLocaleString()}</Text>
          </View>
        ))}
      </>
    );
  }

  function renderLedger() {
    return (
      <>
        {renderRefreshButton('Refresh Ledger', loadLedger)}
        {ledger.map((tx) => (
          <View key={tx.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{tx.type}</Text>
            <Text style={{ color: tx.direction === 'IN' ? '#1D9E75' : '#ff0055', marginTop: 4 }}>{tx.direction} · {tx.amount} credits</Text>
            <Text style={smallTextStyle('#ff9abf')}>Platform: {tx.platformAmount ?? 0} · Mistress: {tx.mistressAmount ?? 0}</Text>
            <Text style={smallTextStyle()}>From: {userLabel(tx.sender)}</Text>
            <Text style={smallTextStyle()}>To: {userLabel(tx.receiver)}</Text>
            <Text style={smallTextStyle('#777')}>{tx.reason || 'No reason'} · {new Date(tx.createdAt).toLocaleString()}</Text>
          </View>
        ))}
      </>
    );
  }

  function renderModeration() {
    return (
      <>
        {renderRefreshButton('Refresh Moderation', loadModeration)}
        {moderation.map((item) => (
          <View key={item.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{item.title}</Text>
            <Text style={{ color: '#ff9abf', marginTop: 4 }}>{item.priority} · {item.status} · {item.area}</Text>
            <Text style={smallTextStyle()}>{item.description || 'No description'}</Text>
            <Text style={smallTextStyle('#777')}>Reporter: {userLabel(item.reporter)} · Assigned: {userLabel(item.assigned)}</Text>
          </View>
        ))}
      </>
    );
  }

  function renderPlugins() {
    return (
      <>
        {renderRefreshButton('Refresh Plugins', loadPlugins)}
        {plugins.map((plugin) => (
          <View key={plugin.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{plugin.name}</Text>
            <Text style={{ color: '#ff9abf', marginTop: 4 }}>{plugin.area} · {plugin.status}</Text>
            <Text style={smallTextStyle()}>{plugin.description || 'No description'}</Text>
            <Text style={smallTextStyle('#777')}>Entitlements loaded: {plugin.entitlements.length}</Text>
            <AdminPluginStatusActionsPanel plugin={plugin} onUpdated={handlePluginUpdated} />
          </View>
        ))}
      </>
    );
  }

  function renderPpv() {
    return (
      <>
        {renderRefreshButton('Refresh PPV', loadPpv)}
        {ppvItems.map((item) => (
          <View key={item.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{item.title}</Text>
            <Text style={{ color: item.isActive ? '#1D9E75' : '#ff0055', marginTop: 4 }}>{item.isActive ? 'Active' : 'Inactive'} · {item.accessType} · {item.price} credits</Text>
            <Text style={smallTextStyle()}>Owner: {userLabel(item.mistress)}</Text>
            <Text style={smallTextStyle('#777')}>Unlocks loaded: {item.unlocks.length} · Created: {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        ))}
      </>
    );
  }

  function renderLiveShows() {
    return (
      <>
        {renderRefreshButton('Refresh Live Shows', loadLiveShows)}
        {liveShows.map((show) => (
          <View key={show.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{show.title}</Text>
            <Text style={{ color: '#ff9abf', marginTop: 4 }}>{show.status} · {show.ticketPrice} credits</Text>
            <Text style={smallTextStyle()}>Host: {userLabel(show.mistress)}</Text>
            <Text style={smallTextStyle('#777')}>Tickets loaded: {show.tickets.length} · Chat: {show.chatEnabled ? 'on' : 'off'} · Gifts: {show.giftsEnabled ? 'on' : 'off'}</Text>
          </View>
        ))}
      </>
    );
  }

  function renderBookings() {
    const replayAlertRollups = bookingReviewBatchAlertRollups(bookingReviewBatchHistory);
    const reminderSlaRollups = bookingReviewReminderSlaCards(bookingReviewBatchHistory);
    const staleOwnerDrilldowns = bookingReviewStaleOwnerDrilldowns(bookingReviewBatchHistory);
    return (
      <>
        {renderRefreshButton('Refresh Bookings', loadBookings)}
        {actionMessage ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{actionMessage}</Text> : null}
        <View style={panelStyle()}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Booking Review Filters</Text>
          <Text style={smallTextStyle('#777')}>Filter admin cancellation, refund, provider, and chargeback rows without losing the full reconciliation summary.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            {BOOKING_REVIEW_STATUS_FILTERS.map((status) => (
              <Pressable
                key={status}
                onPress={() => applyBookingReviewFilters({ status })}
                style={{
                  backgroundColor: bookingReviewFilters.status === status ? '#d4af37' : '#222',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: bookingReviewFilters.status === status ? '#000' : '#fff', fontWeight: '900' }}>{status.replace(/_/g, ' ')}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
            {BOOKING_REVIEW_KIND_FILTERS.map((kind) => (
              <Pressable
                key={kind.value}
                onPress={() => applyBookingReviewFilters({ reviewKind: kind.value })}
                style={{
                  backgroundColor: bookingReviewFilters.reviewKind === kind.value ? '#ff9abf' : '#222',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: bookingReviewFilters.reviewKind === kind.value ? '#000' : '#fff', fontWeight: '900' }}>{kind.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={smallTextStyle('#aaa')}>Showing {bookingReviews.length} matching review row(s).</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            <Pressable
              onPress={() => handleBookingReviewCsvExport('load')}
              style={{ backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
            >
              <Text style={{ color: '#fff', fontWeight: '900' }}>Load Packet CSV</Text>
            </Pressable>
            <Pressable
              onPress={() => handleBookingReviewCsvExport('download')}
              style={{ backgroundColor: '#1D9E75', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
            >
              <Text style={{ color: '#fff', fontWeight: '900' }}>Download CSV</Text>
            </Pressable>
          </View>
          {bookingReviewExportNotice ? <Text style={smallTextStyle('#1D9E75')}>{bookingReviewExportNotice}</Text> : null}
          {bookingReviewExportText ? (
            <View style={{ backgroundColor: '#050505', borderRadius: 10, padding: 10, marginTop: 8 }}>
              <Text numberOfLines={8} style={{ color: '#aaa', fontSize: 11 }}>{bookingReviewExportText}</Text>
            </View>
          ) : null}
          <View style={{ borderTopColor: '#222', borderTopWidth: 1, marginTop: 12, paddingTop: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Batch Review Actions</Text>
            <Text style={smallTextStyle('#777')}>{selectedBookingReviewIds.length} selected review packet(s).</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              <Pressable
                onPress={selectAllVisibleBookingReviews}
                disabled={!bookingReviews.length}
                style={{ backgroundColor: '#222', opacity: bookingReviews.length ? 1 : 0.5, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Select Visible</Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedBookingReviewIds([])}
                disabled={!selectedBookingReviewIds.length}
                style={{ backgroundColor: '#222', opacity: selectedBookingReviewIds.length ? 1 : 0.5, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Clear</Text>
              </Pressable>
            </View>
            <TextInput
              value={bookingReviewBatchAssignee}
              onChangeText={setBookingReviewBatchAssignee}
              placeholder="Batch assignee user id"
              placeholderTextColor="#777"
              style={{ backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 9, marginTop: 4 }}
            />
            <TextInput
              value={bookingReviewBatchNote}
              onChangeText={setBookingReviewBatchNote}
              placeholder="Batch workflow note"
              placeholderTextColor="#777"
              multiline
              style={{ backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 9, minHeight: 46, marginTop: 8 }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {BOOKING_REVIEW_WORKFLOW_ACTIONS.map((action) => (
                <Pressable
                  key={action.status}
                  onPress={() => handleBookingReviewBatchWorkflow(action.status)}
                  disabled={!selectedBookingReviewIds.length || sectionLoading}
                  style={{
                    backgroundColor: action.tone,
                    opacity: selectedBookingReviewIds.length && !sectionLoading ? 1 : 0.5,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    marginRight: 6,
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>Batch {action.label}</Text>
                </Pressable>
              ))}
            </View>
            {bookingReviewBatchHistory.length || bookingReviewBatchOutcomeFilter !== 'ALL' ? (
              <View style={{ backgroundColor: '#050505', borderRadius: 10, padding: 10, marginTop: 10 }}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>Recent Batch History</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                  {[
                    { label: 'Stale Alerts', value: replayAlertRollups.stale, tone: '#ff6b6b' },
                    { label: 'Unacknowledged', value: replayAlertRollups.unacknowledged, tone: '#ff9abf' },
                    { label: 'Escalated', value: replayAlertRollups.escalated, tone: '#ff6b6b' },
                    { label: 'Assigned', value: replayAlertRollups.assigned, tone: '#1D9E75' },
                    { label: 'Reminders', value: replayAlertRollups.reminders, tone: '#d4af37' },
                    { label: 'Overdue Reminders', value: replayAlertRollups.overdueReminders, tone: '#ff6b6b' },
                    { label: 'Due <24h', value: reminderSlaRollups.dueSoon, tone: '#d4af37' },
                    { label: 'Snoozed', value: reminderSlaRollups.snoozed, tone: '#1D9E75' },
                    { label: 'Cleared', value: reminderSlaRollups.cleared, tone: '#777' },
                  ].map((card) => (
                    <View key={card.label} style={{ backgroundColor: '#111', width: '48%', padding: 9, borderRadius: 10, marginRight: '2%', marginBottom: 8 }}>
                      <Text style={{ color: '#aaa', fontSize: 11 }}>{card.label}</Text>
                      <Text style={{ color: card.tone, fontSize: 18, fontWeight: '900' }}>{card.value}</Text>
                    </View>
                  ))}
                </View>
                {staleOwnerDrilldowns.length ? (
                  <View style={{ backgroundColor: '#111', borderRadius: 10, padding: 10, marginTop: 4 }}>
                    <Text style={{ color: '#fff', fontWeight: '900' }}>Stale Owner Drilldown</Text>
                    {staleOwnerDrilldowns.slice(0, 4).map((owner) => (
                      <Pressable
                        key={owner.ownerId}
                        onPress={() => applyBookingReviewBatchAlertFilters(bookingReviewBatchAlertFilter, owner.ownerId === 'UNASSIGNED' ? '' : owner.ownerId)}
                        disabled={sectionLoading}
                        style={{ borderTopColor: '#222', borderTopWidth: 1, paddingTop: 7, marginTop: 7, opacity: sectionLoading ? 0.5 : 1 }}
                      >
                        <Text style={{ color: owner.overdueCount ? '#ff6b6b' : '#d4af37', fontWeight: '900' }}>
                          {owner.label}: {owner.staleCount} stale / {owner.overdueCount} overdue
                        </Text>
                        <Text style={smallTextStyle('#777')}>
                          {owner.reminderCount} reminder(s){owner.nextDueAt ? ` - next due ${new Date(owner.nextDueAt).toLocaleString()}` : ''}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                  {BOOKING_REVIEW_BATCH_OUTCOME_FILTERS.map((filter) => (
                    <Pressable
                      key={filter.value}
                      onPress={() => applyBookingReviewBatchOutcomeFilter(filter.value)}
                      disabled={sectionLoading}
                      style={{
                        backgroundColor: bookingReviewBatchOutcomeFilter === filter.value ? '#ff9abf' : '#222',
                        opacity: sectionLoading ? 0.5 : 1,
                        paddingVertical: 7,
                        paddingHorizontal: 9,
                        borderRadius: 9,
                        marginRight: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ color: bookingReviewBatchOutcomeFilter === filter.value ? '#000' : '#fff', fontWeight: '900' }}>{filter.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                  {BOOKING_REPLAY_ALERT_STATUS_FILTERS.map((filter) => (
                    <Pressable
                      key={filter.value}
                      onPress={() => applyBookingReviewBatchAlertFilters(filter.value, bookingReviewBatchAlertOwnerFilter)}
                      disabled={sectionLoading}
                      style={{
                        backgroundColor: bookingReviewBatchAlertFilter === filter.value ? '#d4af37' : '#222',
                        opacity: sectionLoading ? 0.5 : 1,
                        paddingVertical: 7,
                        paddingHorizontal: 9,
                        borderRadius: 9,
                        marginRight: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ color: bookingReviewBatchAlertFilter === filter.value ? '#000' : '#fff', fontWeight: '900' }}>{filter.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                  {BOOKING_REPLAY_REMINDER_STATUS_FILTERS.map((filter) => (
                    <Pressable
                      key={filter.value}
                      onPress={() => applyBookingReviewBatchReminderFilter(filter.value)}
                      disabled={sectionLoading}
                      style={{
                        backgroundColor: bookingReviewBatchReminderFilter === filter.value ? '#1D9E75' : '#222',
                        opacity: sectionLoading ? 0.5 : 1,
                        paddingVertical: 7,
                        paddingHorizontal: 9,
                        borderRadius: 9,
                        marginRight: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ color: bookingReviewBatchReminderFilter === filter.value ? '#000' : '#fff', fontWeight: '900' }}>{filter.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                  <TextInput
                    value={bookingReviewBatchAlertOwnerFilter}
                    onChangeText={setBookingReviewBatchAlertOwnerFilter}
                    placeholder="Alert owner user id"
                    placeholderTextColor="#777"
                    style={{ backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 9, flex: 1, marginRight: 6 }}
                  />
                  <Pressable
                    onPress={() => applyBookingReviewBatchAlertFilters(bookingReviewBatchAlertFilter, bookingReviewBatchAlertOwnerFilter)}
                    disabled={sectionLoading}
                    style={{ backgroundColor: '#1D9E75', opacity: sectionLoading ? 0.5 : 1, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '900' }}>Apply</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                  <Pressable
                    onPress={() => handleBookingReviewReplayAlertExport('csv')}
                    disabled={sectionLoading}
                    style={{ backgroundColor: '#222', opacity: sectionLoading ? 0.5 : 1, paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, marginRight: 6, marginBottom: 6 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '900' }}>Alert CSV</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleBookingReviewReplayAlertExport('handoff')}
                    disabled={sectionLoading}
                    style={{ backgroundColor: '#d4af37', opacity: sectionLoading ? 0.5 : 1, paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, marginRight: 6, marginBottom: 6 }}
                  >
                    <Text style={{ color: '#000', fontWeight: '900' }}>Owner Handoff</Text>
                  </Pressable>
                </View>
                {!bookingReviewBatchHistory.length ? <Text style={smallTextStyle('#777')}>No batch history rows match this outcome filter.</Text> : null}
                {bookingReviewBatchHistory.slice(0, 4).map((batch) => {
                  const metadata = (batch.metadata || {}) as Record<string, unknown>;
                  const batchId = bookingReviewBatchHistoryId(batch);
                  const failures = bookingReviewBatchFailures(batch);
                  const failedCount = Number(metadata.failed || failures.length || 0);
                  const replayed = metadata.replayAction === true || Boolean(metadata.sourceBatchId);
                  const staleFailedRows = isStaleBookingReviewFailure(batch.createdAt, failedCount, replayed);
                  return (
                    <View key={batch.id} style={{ borderTopColor: '#222', borderTopWidth: 1, marginTop: 8, paddingTop: 8 }}>
                      <Text style={smallTextStyle('#aaa')}>
                        {batchId}: {String(metadata.updated || 0)} updated / {String(failedCount)} failed{replayed ? ' - replay' : ''} - {userLabel(batch.actor)} - {new Date(batch.createdAt).toLocaleString()}
                      </Text>
                      {metadata.latestAlertStatus ? (
                        <Text style={smallTextStyle(metadata.latestAlertStatus === 'ESCALATED' ? '#ff6b6b' : '#d4af37')}>
                          Replay alert {String(metadata.latestAlertStatus).toLowerCase()}{metadata.latestAlertAssignedToId ? ` / owner ${String(metadata.latestAlertAssignedToId)}` : ''}
                        </Text>
                      ) : null}
                      {metadata.retryReminderDueAt ? (
                        <Text style={smallTextStyle(metadata.retryReminderOverdue === true ? '#ff6b6b' : '#d4af37')}>
                          Retry reminder due {new Date(String(metadata.retryReminderDueAt)).toLocaleString()}{metadata.retryReminderOverdue === true ? ' - overdue' : ''}
                        </Text>
                      ) : null}
                      {staleFailedRows ? (
                        <View style={{ alignSelf: 'flex-start', backgroundColor: '#441122', borderColor: '#ff6b6b', borderWidth: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, marginTop: 6 }}>
                          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>
                            Stale failed rows - {bookingReviewBatchFailedAgeHours(batch.createdAt)}h waiting
                          </Text>
                        </View>
                      ) : null}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                        <Pressable
                          onPress={() => handleBookingReviewBatchPacketDownload(batchId)}
                          style={{ backgroundColor: '#222', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, marginRight: 6, marginBottom: 6 }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '900' }}>Download Batch Packet</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleBookingReviewBatchReplayDetail(batchId)}
                          disabled={sectionLoading}
                          style={{ backgroundColor: '#222', opacity: sectionLoading ? 0.5 : 1, paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, marginRight: 6, marginBottom: 6 }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '900' }}>Replay Detail</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleBookingReviewBatchReplayReportDownload(batchId)}
                          style={{ backgroundColor: '#1D9E75', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, marginRight: 6, marginBottom: 6 }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '900' }}>Replay CSV</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleBookingReviewBatchReplay(batch)}
                          disabled={sectionLoading}
                          style={{ backgroundColor: '#d4af37', opacity: sectionLoading ? 0.5 : 1, paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, marginRight: 6, marginBottom: 6 }}
                        >
                          <Text style={{ color: '#000', fontWeight: '900' }}>Replay Batch</Text>
                        </Pressable>
                        {failures.length ? (
                          <Pressable
                            onPress={() => handleBookingReviewBatchFailedRetry(batch)}
                            disabled={sectionLoading}
                            style={{ backgroundColor: '#ff6b6b', opacity: sectionLoading ? 0.5 : 1, paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, marginRight: 6, marginBottom: 6 }}
                          >
                            <Text style={{ color: '#fff', fontWeight: '900' }}>Retry Failed Rows</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
                <BookingReviewReplayOperationsPanel
                  batchHistory={bookingReviewBatchHistory}
                  replayDetail={bookingReviewBatchReplayDetail}
                  alertOwnerId={bookingReviewBatchAlertOwnerFilter}
                  onOwnerSelected={(ownerId) => {
                    setBookingReviewBatchAlertOwnerFilter(ownerId);
                    applyBookingReviewBatchAlertFilters(bookingReviewBatchAlertFilter, ownerId);
                  }}
                  onOwnerCsvExport={(csvText) => {
                    setBookingReviewExportText(csvText);
                    setBookingReviewExportNotice(downloadTextFile(
                      csvText,
                      'booking-replay-owner-drilldown.csv',
                      'text/csv;charset=utf-8',
                    ));
                  }}
                  onAlertUpdated={(detail) => {
                    setBookingReviewBatchReplayDetail(detail);
                    loadBookings();
                  }}
                  onStatus={setActionMessage}
                  onDownloadReplayCsv={handleBookingReviewBatchReplayReportDownload}
                />
              </View>
            ) : null}
          </View>
        </View>
        {bookingReconciliation ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Open Disputes</Text>
              <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{bookingReconciliation.counts.openDisputes}</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Refund Reviews</Text>
              <Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '900' }}>{bookingReconciliation.counts.openRefundReviews}</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Provider Follow-Up</Text>
              <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{bookingReconciliation.counts.providerFollowUps}</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Chargeback Reviews</Text>
              <Text style={{ color: '#ff6b6b', fontSize: 22, fontWeight: '900' }}>{bookingReconciliation.counts.chargebackReviews}</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Chargeback Clawbacks</Text>
              <Text style={{ color: '#ff6b6b', fontSize: 22, fontWeight: '900' }}>{bookingReconciliation.counts.executedChargebackClawbacks}</Text>
              <Text style={smallTextStyle('#777')}>{bookingReconciliation.counts.chargebackClawbackAmountTotal} credits held</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Receipt Rows</Text>
              <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{bookingReconciliation.counts.receiptRows}</Text>
              <Text style={smallTextStyle('#777')}>Call, refund, and chargeback ledger rows</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>PPM Rows</Text>
              <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{bookingReconciliation.counts.ppmRows}</Text>
              <Text style={smallTextStyle('#777')}>{minutesFromSecondsLabel(bookingReconciliation.counts.ppmBillableSecondsTotal)} billable</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>PPM Holds</Text>
              <Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '900' }}>{moneyLabel(bookingReconciliation.counts.ppmHoldTotal)}</Text>
              <Text style={smallTextStyle('#777')}>{bookingReconciliation.counts.ppmHoldRows} prepaid rows</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>PPM Refunds</Text>
              <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{moneyLabel(bookingReconciliation.counts.ppmRefundTotal)}</Text>
              <Text style={smallTextStyle('#777')}>{bookingReconciliation.counts.ppmRefundRows} early-end rows</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>PPM Overages</Text>
              <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{moneyLabel(bookingReconciliation.counts.ppmOverageTotal)}</Text>
              <Text style={smallTextStyle('#777')}>{bookingReconciliation.counts.ppmOverageRows} extended rows</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>PPM Net Adjustment</Text>
              <Text style={{ color: bookingReconciliation.counts.ppmNetAdjustmentTotal < 0 ? '#1D9E75' : '#ff9abf', fontSize: 22, fontWeight: '900' }}>
                {moneyLabel(bookingReconciliation.counts.ppmNetAdjustmentTotal)}
              </Text>
              <Text style={smallTextStyle('#777')}>Overages minus refunds</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Executed Refunds</Text>
              <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{bookingReconciliation.counts.executedRefunds}</Text>
              <Text style={smallTextStyle('#777')}>{bookingReconciliation.counts.refundAmountTotal} credits returned</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Bridge Provider</Text>
              <Text style={{ color: bookingReconciliation.counts.providerNeedsConfig ? '#ff6b6b' : '#1D9E75', fontSize: 14, fontWeight: '900', marginTop: 4 }}>
                {bookingReconciliation.provider.providerConfigStatus || 'unknown'}
              </Text>
              <Text style={smallTextStyle('#777')}>Connected {bookingReconciliation.counts.bridgeConnected} · Expired {bookingReconciliation.counts.bridgeExpired}</Text>
            </View>
            {bookingReconciliation.providerReadiness ? (
              <View style={{ backgroundColor: '#111', width: '98%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
                <Text style={{ color: '#aaa', fontSize: 11 }}>Provider Production Readiness</Text>
                <Text style={{ color: bookingReconciliation.providerReadiness.ready ? '#1D9E75' : '#d4af37', fontSize: 14, fontWeight: '900', marginTop: 4 }}>
                  {bookingReconciliation.providerReadiness.ready ? 'ready' : `${bookingReconciliation.providerReadiness.remaining.length} items left`}
                </Text>
                {bookingReconciliation.providerReadiness.remaining.slice(0, 4).map((item) => (
                  <Text key={item} style={smallTextStyle('#777')}>{item}</Text>
                ))}
              </View>
            ) : null}
            {bookingReconciliation.ppmSummary.bySessionKind.length ? (
              <View style={{ backgroundColor: '#111', width: '98%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
                <Text style={{ color: '#aaa', fontSize: 11 }}>PPM Session Mix</Text>
                {bookingReconciliation.ppmSummary.bySessionKind.slice(0, 6).map((row) => (
                  <View key={row.sessionKind} style={{ borderTopColor: '#222', borderTopWidth: 1, paddingTop: 8, marginTop: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: '900' }}>{ppmSessionKindLabel(row.sessionKind)}</Text>
                    <Text style={smallTextStyle('#ddd')}>
                      {row.rows} rows · {minutesFromSecondsLabel(row.billableSecondsTotal)} · holds {moneyLabel(row.holdTotal)} · refunds {moneyLabel(row.refundTotal)} · overages {moneyLabel(row.overageTotal)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
        {bookingReconciliation?.ppmRows.length ? (
          <View style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Recent PPM Ledger Rows</Text>
            {bookingReconciliation.ppmRows.slice(0, 6).map((row) => (
              <View key={row.id} style={{ borderTopColor: '#222', borderTopWidth: 1, paddingTop: 8, marginTop: 8 }}>
                <Text style={{ color: '#ff9abf', fontWeight: '900' }}>{ppmSessionKindLabel(row.reason)}</Text>
                <Text style={smallTextStyle('#ddd')}>
                  {row.direction} · {moneyLabel(row.amount)} credits · {minutesFromSecondsLabel(Number(row.metadata?.billableSeconds || 0))}
                </Text>
                <Text style={smallTextStyle('#777')}>From {userLabel(row.sender)} to {userLabel(row.receiver)} · {new Date(row.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {bookingReviewDetail ? (
          <View style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Booking Review Detail</Text>
            <Text style={{ color: '#ff9abf', fontWeight: '900', marginTop: 4 }}>{bookingReviewDetail.review.title}</Text>
            <Text style={smallTextStyle('#ddd')}>
              {bookingReviewDetail.review.type} Â· {bookingReviewDetail.review.status} Â· {String((bookingReviewDetail.review.metadata || {}).reviewKind || 'review')}
            </Text>
            <Text style={smallTextStyle()}>{bookingReviewDetail.review.description || 'No description recorded.'}</Text>
            {bookingReviewDetail.booking ? (
              <Text style={smallTextStyle('#aaa')}>
                Booking {bookingReviewDetail.booking.id}: {bookingReviewDetail.booking.status} Â· {bookingReviewDetail.booking.price} credits Â· Sub {userLabel(bookingReviewDetail.booking.subUser)} Â· Host {userLabel(bookingReviewDetail.booking.hostUser)}
              </Text>
            ) : null}
            <Text style={smallTextStyle('#777')}>
              Related reviews {bookingReviewDetail.relatedReviews.length} Â· refunds/chargebacks {bookingReviewDetail.refunds.length} Â· audits {bookingReviewDetail.auditLogs.length}
            </Text>
            <Text style={smallTextStyle('#777')}>Workflow actions {(bookingReviewDetail.actions || []).length}</Text>
            {(bookingReviewDetail.actions || []).slice(0, 4).map((action) => (
              <Text key={action.id} style={smallTextStyle('#aaa')}>
                {action.action} - {userLabel(action.actor)} - {action.note || 'No note'} - {new Date(action.createdAt).toLocaleString()}
              </Text>
            ))}
            {bookingReviewDetail.auditLogs.slice(0, 4).map((audit) => (
              <Text key={audit.id} style={smallTextStyle('#777')}>{audit.action} Â· {new Date(audit.createdAt).toLocaleString()}</Text>
            ))}
          </View>
        ) : null}
        {bookingReviewDetail ? (
          <Pressable
            onPress={() => handleBookingReviewPacketDownload(bookingReviewDetail.review.id)}
            style={{ backgroundColor: '#1D9E75', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, marginBottom: 12, alignSelf: 'flex-start' }}
          >
            <Text style={{ color: '#fff', fontWeight: '900' }}>Download Selected Review Packet</Text>
          </Pressable>
        ) : null}
        {bookings.map((booking) => (
          <View key={booking.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{booking.type} Booking</Text>
            <Text style={{ color: statusColor(booking.status), marginTop: 4 }}>{booking.status} · {booking.price} credits · {booking.durationMinutes} mins</Text>
            <Text style={smallTextStyle()}>Sub: {userLabel(booking.subUser)}</Text>
            <Text style={smallTextStyle()}>Host: {userLabel(booking.hostUser)}</Text>
            <Text style={smallTextStyle('#777')}>Scheduled: {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString() : 'Not set'}</Text>
            <Text style={smallTextStyle('#777')}>Created: {new Date(booking.createdAt).toLocaleString()}</Text>
            {booking.notes ? <Text style={smallTextStyle('#ddd')}>{booking.notes}</Text> : null}

            <Text style={{ color: '#ff9abf', fontWeight: '900', marginTop: 12, marginBottom: 6 }}>Command Centre Actions</Text>
            <TextInput
              value={bookingRefundAmounts[booking.id] || ''}
              onChangeText={(value) => setBookingRefundAmounts((current) => ({ ...current, [booking.id]: value }))}
              placeholder={`Review/refund/clawback amount, max ${booking.price}`}
              placeholderTextColor="#777"
              keyboardType="decimal-pad"
              style={{ backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 }}
            />
            <TextInput
              value={bookingActionNotes[booking.id] || ''}
              onChangeText={(value) => setBookingActionNotes((current) => ({ ...current, [booking.id]: value }))}
              placeholder="Reason / admin note"
              placeholderTextColor="#777"
              multiline
              style={{ backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 10, minHeight: 54, marginBottom: 8 }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
              <Pressable
                onPress={() => handleBookingDispute(booking)}
                style={{ backgroundColor: '#441122', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Open Dispute</Text>
              </Pressable>
              <Pressable
                onPress={() => handleBookingRefundReview(booking)}
                style={{ backgroundColor: '#d4af37', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
              >
                <Text style={{ color: '#000', fontWeight: '900' }}>Refund Review</Text>
              </Pressable>
              <Pressable
                onPress={() => handleBookingProviderFollowUp(booking)}
                style={{ backgroundColor: '#222', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Provider Follow-Up</Text>
              </Pressable>
              <Pressable
                onPress={() => handleBookingChargebackReview(booking)}
                style={{ backgroundColor: '#7a1122', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Chargeback Review</Text>
              </Pressable>
              <Pressable
                onPress={() => handleBookingChargebackClawback(booking)}
                style={{ backgroundColor: '#551111', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, marginRight: 6, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Execute Clawback</Text>
              </Pressable>
              <Pressable
                onPress={() => handleBookingRefundExecution(booking)}
                style={{ backgroundColor: '#1D9E75', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Execute Refund</Text>
              </Pressable>
            </View>

            {(bookingReviewsByBookingId.get(booking.id) || []).map((review) => (
              <View key={review.id} style={{ backgroundColor: '#1a1a1a', borderRadius: 10, padding: 10, marginTop: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>{review.title}</Text>
                <Text style={smallTextStyle('#ff9abf')}>{review.type} · {review.status} · {review.area}</Text>
                <Text style={smallTextStyle()}>{review.description || 'No review description.'}</Text>
                <Text style={smallTextStyle('#777')}>Created: {new Date(review.createdAt).toLocaleString()}</Text>
                <Pressable
                  onPress={() => toggleBookingReviewSelection(review.id)}
                  style={{
                    backgroundColor: selectedBookingReviewIds.includes(review.id) ? '#1D9E75' : '#222',
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    marginTop: 8,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>
                    {selectedBookingReviewIds.includes(review.id) ? 'Selected' : 'Select for Batch'}
                  </Text>
                </Pressable>
                <TextInput
                  value={bookingReviewAssignees[review.id] || ''}
                  onChangeText={(value) => setBookingReviewAssignees((current) => ({ ...current, [review.id]: value }))}
                  placeholder={review.assignedToId ? `Assigned to ${review.assignedToId}` : 'Assignee user id'}
                  placeholderTextColor="#777"
                  style={{ backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 9, marginTop: 8 }}
                />
                <TextInput
                  value={bookingReviewWorkflowNotes[review.id] || ''}
                  onChangeText={(value) => setBookingReviewWorkflowNotes((current) => ({ ...current, [review.id]: value }))}
                  placeholder="Workflow note"
                  placeholderTextColor="#777"
                  multiline
                  style={{ backgroundColor: '#222', color: '#fff', borderRadius: 10, padding: 9, minHeight: 46, marginTop: 8 }}
                />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                  {BOOKING_REVIEW_WORKFLOW_ACTIONS.map((action) => {
                    const active = review.status === action.status;

                    return (
                      <Pressable
                        key={action.status}
                        onPress={() => handleBookingReviewWorkflow(review, action.status)}
                        disabled={active || sectionLoading}
                        style={{
                          backgroundColor: active ? '#333' : action.tone,
                          opacity: active || sectionLoading ? 0.6 : 1,
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderRadius: 10,
                          marginRight: 6,
                          marginBottom: 6,
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '900' }}>{active ? `${action.label} ✓` : action.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  onPress={() => handleBookingReviewDetail(review)}
                  style={{ backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginTop: 8, alignSelf: 'flex-start' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>View Detail</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ))}
        {bookings.length === 0 ? <Text style={{ color: '#777' }}>No paid call bookings found.</Text> : null}
      </>
    );
  }

  function renderGiftsGoals() {
    const summary = giftsGoals?.counts;
    const funds = giftsGoals?.goalFunds || [];
    const contributions = giftsGoals?.goalContributions || [];
    const giftDefinitions = giftsGoals?.giftDefinitions || [];

    return (
      <>
        {renderRefreshButton('Refresh Gifts & Goals', loadGiftsGoals)}
        <Pressable
          onPress={handleSeedPremiumGiftCatalogue}
          style={{ backgroundColor: '#d4af37', padding: 10, borderRadius: 10, marginBottom: 12 }}
        >
          <Text style={{ color: '#000', textAlign: 'center', fontWeight: '900' }}>Seed Premium Gift Catalogue</Text>
        </Pressable>
        {actionMessage ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{actionMessage}</Text> : null}
        {summary ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Premium Gifts</Text>
              <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{summary.premiumGiftDefinitions}</Text>
              <Text style={smallTextStyle('#777')}>{summary.activeGiftDefinitions} active of {summary.giftDefinitions}</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Virtual Gift Revenue</Text>
              <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{moneyLabel(summary.virtualGiftGrossTotal)}</Text>
              <Text style={smallTextStyle('#777')}>Platform {moneyLabel(summary.virtualGiftPlatformTotal)} · Mistress {moneyLabel(summary.virtualGiftMistressTotal)}</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Goal Funds</Text>
              <Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '900' }}>{summary.activeGoalFunds}</Text>
              <Text style={smallTextStyle('#777')}>{summary.publicGoalFunds} public · {summary.goalFunds} total</Text>
            </View>
            <View style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Goal Contributions</Text>
              <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{moneyLabel(summary.goalGrossTotal)}</Text>
              <Text style={smallTextStyle('#777')}>Platform {moneyLabel(summary.goalPlatformTotal)} · Mistress {moneyLabel(summary.goalMistressTotal)}</Text>
            </View>
          </View>
        ) : null}

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Goal Funds</Text>
        {funds.map((fund) => {
          const progress = fundProgress(fund.currentAmount, fund.targetAmount);
          return (
            <View key={fund.id} style={panelStyle()}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{fund.title}</Text>
              <Text style={{ color: fund.status === 'ACTIVE' ? '#1D9E75' : '#d4af37', marginTop: 4 }}>
                {fund.status} · {fund.category} · {progress}% funded
              </Text>
              <Text style={smallTextStyle('#ff9abf')}>{moneyLabel(fund.currentAmount)} / {moneyLabel(fund.targetAmount)} credits</Text>
              <Text style={smallTextStyle()}>Mistress: {userLabel(fund.mistress)}</Text>
              <Text style={smallTextStyle('#777')}>Visibility: {fund.visibility} · Receipts: {fund._count?.contributions ?? 0}</Text>
              {fund.description ? <Text style={smallTextStyle('#ddd')}>{fund.description}</Text> : null}
            </View>
          );
        })}
        {funds.length === 0 ? <Text style={{ color: '#777', marginBottom: 12 }}>No goal funds found yet.</Text> : null}

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8 }}>Recent Goal Receipts</Text>
        {contributions.slice(0, 12).map((contribution) => (
          <View key={contribution.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{contribution.receiptNumber}</Text>
            <Text style={{ color: '#1D9E75', marginTop: 4 }}>{moneyLabel(contribution.amount)} credits · {contribution.goalFund?.title || contribution.goalFundId}</Text>
            <Text style={smallTextStyle('#ff9abf')}>Platform {moneyLabel(contribution.platformAmount)} · Mistress {moneyLabel(contribution.mistressAmount)}</Text>
            <Text style={smallTextStyle()}>Contributor: {userLabel(contribution.contributor)}</Text>
            <Text style={smallTextStyle()}>Mistress: {userLabel(contribution.goalFund?.mistress)}</Text>
            {contribution.message ? <Text style={smallTextStyle('#ddd')}>{contribution.message}</Text> : null}
            <Text style={smallTextStyle('#777')}>{new Date(contribution.createdAt).toLocaleString()}</Text>
          </View>
        ))}
        {contributions.length === 0 ? <Text style={{ color: '#777', marginBottom: 12 }}>No goal contribution receipts found.</Text> : null}

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8 }}>Gift Catalogue</Text>
        {giftDefinitions.map((gift) => (
          <View key={gift.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{gift.name}</Text>
            <Text style={{ color: gift.isActive ? '#1D9E75' : '#ff6b6b', marginTop: 4 }}>
              {gift.isActive ? 'Active' : 'Inactive'} · {moneyLabel(gift.price)} credits
            </Text>
            <Text style={smallTextStyle('#ff9abf')}>Icon: {gift.emoji || 'none'} · Animation: {gift.animation || 'none'}</Text>
            <Text style={smallTextStyle('#777')}>Owned rows: {gift._count?.ownedGifts ?? 0}</Text>
          </View>
        ))}
        {giftDefinitions.length === 0 ? <Text style={{ color: '#777' }}>No gift definitions found.</Text> : null}
      </>
    );
  }

  function renderStickerPacks() {
    return (
      <>
        {renderRefreshButton('Refresh Sticker Packs', loadStickerPacks)}
        {stickerPacks.map((pack) => (
          <View key={pack.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>📚 {pack.title}</Text>
            <Text style={{ color: pack.isActive ? '#1D9E75' : '#ff0055', marginTop: 4 }}>
              {pack.isActive ? 'Active' : 'Inactive'} · {pack.theme || 'STANDARD'} · {pack.price ? `${pack.price} credits` : 'Free'}
            </Text>
            <Text style={smallTextStyle()}>Creator: {userLabel(pack.creator)}</Text>
            <Text style={smallTextStyle('#ff9abf')}>Items: {pack.items.length} · Progress rows: {pack.userProgress.length}</Text>
            {pack.description ? <Text style={smallTextStyle('#ddd')}>{pack.description}</Text> : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {pack.items.slice(0, 10).map((item) => (
                <View key={item.id} style={{ backgroundColor: '#222', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 11 }}>{item.rarity} · {item.sticker?.title || item.stickerId}</Text>
                </View>
              ))}
            </View>
            <Text style={smallTextStyle('#777')}>Created: {new Date(pack.createdAt).toLocaleString()}</Text>
          </View>
        ))}
        {stickerPacks.length === 0 ? <Text style={{ color: '#777' }}>No sticker packs found.</Text> : null}
      </>
    );
  }

  function renderFilterChip(label: string, active: boolean, onPress: () => void, count?: number, color = '#ff0055') {
    return (
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: active ? color : '#222',
          borderRadius: 999,
          paddingVertical: 7,
          paddingHorizontal: 10,
          marginRight: 7,
          marginBottom: 7,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{label}{typeof count === 'number' ? ` · ${count}` : ''}</Text>
      </Pressable>
    );
  }

  function renderMarketplaceWorlds() {
    const summary = marketplaceWorlds?.summary || [];
    const products = marketplaceWorlds?.products || [];

    return (
      <>
        {renderRefreshButton('Refresh Marketplace Worlds', loadMarketplaceWorlds)}
        {actionMessage ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{actionMessage}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
          {summary.map((row) => (
            <View key={row.world} style={{ backgroundColor: '#111', width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>{row.world}</Text>
              <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{row._count._all}</Text>
              <Text style={smallTextStyle('#777')}>Stock: {row._sum.stock ?? 0}</Text>
            </View>
          ))}
        </View>

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Seller Approval Queue</Text>
        <Text style={{ color: '#aaa', marginBottom: 8 }}>
          Review pending Private Vault / manual approval requests by seller and world before approving or declining.
        </Text>

        <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 6 }}>Filter by seller</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {renderFilterChip('All sellers', marketplaceSellerFilter === 'ALL', () => setMarketplaceSellerFilter('ALL'), pendingApprovals.length)}
          {sellerApprovalRows.map((seller) => renderFilterChip(
            seller.label,
            marketplaceSellerFilter === seller.id,
            () => setMarketplaceSellerFilter(seller.id),
            seller.count,
            '#d4af37',
          ))}
        </View>

        <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 6 }}>Filter by world</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {renderFilterChip('All worlds', marketplaceWorldFilter === 'ALL', () => setMarketplaceWorldFilter('ALL'), pendingApprovals.length)}
          {worldApprovalRows.map((world) => renderFilterChip(
            world.label,
            marketplaceWorldFilter === world.id,
            () => setMarketplaceWorldFilter(world.id),
            world.count,
            '#1D9E75',
          ))}
        </View>

        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 8 }}>Pending Approval Requests</Text>
        {filteredPendingApprovals.map((approval) => {
          const price = Number(approval.product?.price ?? 0);
          return (
            <View key={approval.id} style={{ ...panelStyle(), borderColor: '#d4af37', borderWidth: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{approval.product?.title || approval.productId}</Text>
                  <Text style={{ color: '#d4af37', marginTop: 4 }}>{approval.status} · {price} credits</Text>
                </View>
                <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{pendingAgeLabel(approval.createdAt)}</Text>
              </View>
              <Text style={smallTextStyle('#ff9abf')}>World: {approval.product?.world || 'Unknown'} · Reveal: {approval.product?.revealMode || 'Unknown'}</Text>
              <Text style={smallTextStyle()}>Buyer: {userLabel(approval.buyer)}</Text>
              <Text style={smallTextStyle()}>Seller: {userLabel(approval.product?.mistress)}</Text>
              <Text style={smallTextStyle('#aaa')}>Seller queue note: approve only when the seller is ready to unlock payment access for this buyer.</Text>
              <Text style={smallTextStyle('#777')}>Requested: {new Date(approval.createdAt).toLocaleString()}</Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Pressable
                  onPress={() => handleApproveMarketplaceApproval(approval.id)}
                  style={{ backgroundColor: '#1D9E75', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, marginRight: 8, flex: 1 }}
                >
                  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Approve</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDeclineMarketplaceApproval(approval.id)}
                  style={{ backgroundColor: '#441122', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, flex: 1 }}
                >
                  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Decline</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
        {filteredPendingApprovals.length === 0 ? <Text style={{ color: '#777', marginBottom: 12 }}>No pending marketplace approval requests for these filters.</Text> : null}

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8 }}>Store Review Queue</Text>
        <Text style={{ color: '#aaa', marginBottom: 8 }}>
          Command Centre view of paid orders, approval waits, fulfilment handoff, and refund/cancel exceptions across store worlds.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            ['Queue', storeReviewSummary?.queueCount ?? storeReviewQueue.length, '#ff9abf'],
            ['Approval', storeReviewSummary?.pendingApprovalCount ?? 0, '#d4af37'],
            ['Payment Wait', storeReviewSummary?.approvedPendingPaymentCount ?? 0, '#ff9abf'],
            ['Fulfilment', storeReviewSummary?.fulfilmentQueueCount ?? 0, '#d4af37'],
            ['In Progress', storeReviewSummary?.inProgressCount ?? 0, '#1D9E75'],
            ['Exceptions', storeReviewSummary?.exceptionCount ?? 0, '#ff6b6b'],
          ].map(([label, value, tone]) => (
            <View key={String(label)} style={{ backgroundColor: '#111', width: '31%', padding: 10, borderRadius: 12, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 10 }}>{label}</Text>
              <Text style={{ color: String(tone), fontSize: 18, fontWeight: '900' }}>{String(value)}</Text>
            </View>
          ))}
        </View>
        <View style={{ ...panelStyle(), borderColor: '#d4af37', borderWidth: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Loaded gross under review</Text>
          <Text style={{ color: '#d4af37', marginTop: 4, fontSize: 22, fontWeight: '900' }}>{moneyLabel(storeReviewSummary?.grossCredits ?? 0)} credits</Text>
          <Text style={smallTextStyle('#aaa')}>Paid store rows only. Provider receipts, payout export, and dispute settlement stay in the finance queues.</Text>
        </View>
        {storeReviewQueue.slice(0, 10).map((order) => {
          const status = String(order.status || 'UNKNOWN').toUpperCase();
          const tone = statusColor(status);
          const price = Number(order.product?.price ?? 0);
          const receipt = marketplaceOrderReceipts[order.id];

          return (
            <View key={order.id} style={{ ...panelStyle(), borderColor: tone, borderWidth: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{order.product?.title || order.productId}</Text>
                  <Text style={{ color: tone, marginTop: 4 }}>{status} / {price} credits</Text>
                </View>
                <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{pendingAgeLabel(order.updatedAt || order.createdAt)}</Text>
              </View>
              <Text style={smallTextStyle('#ff9abf')}>Next action: {storeReviewActionLabel(status)}</Text>
              {receipt ? (
                <Text style={smallTextStyle('#d4af37')}>
                  Receipt {receipt.receiptNumber}: gross {moneyLabel(receipt.grossCredits)} / platform {moneyLabel(receipt.platformAmount)} / Mistress {moneyLabel(receipt.mistressAmount)}
                </Text>
              ) : (
                <Text style={smallTextStyle('#777')}>{canLoadStoreReceipt(status) ? 'Receipt not loaded for this row yet.' : 'Receipt appears after payment is complete.'}</Text>
              )}
              <Text style={smallTextStyle('#aaa')}>World: {order.product?.world || 'Unknown'} / Reveal: {order.product?.revealMode || 'Unknown'}</Text>
              <Text style={smallTextStyle()}>Buyer: {userLabel(order.buyer)}</Text>
              <Text style={smallTextStyle()}>Seller: {userLabel(order.product?.mistress)}</Text>
              <Text style={smallTextStyle('#777')}>Updated: {new Date(order.updatedAt || order.createdAt).toLocaleString()}</Text>
            </View>
          );
        })}
        {storeReviewQueue.length === 0 ? <Text style={{ color: '#777', marginBottom: 12 }}>No marketplace store rows need Command Centre review.</Text> : null}

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8 }}>Marketplace Listings</Text>
        {products.map((product) => (
          <View key={product.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{product.title}</Text>
            <Text style={{ color: product.requiresApproval ? '#d4af37' : '#1D9E75', marginTop: 4 }}>
              {product.world} · {product.price} credits · Stock {product.stock}
            </Text>
            <Text style={smallTextStyle('#ff9abf')}>Visibility: {product.visibility} · Reveal: {product.revealMode}</Text>
            <Text style={smallTextStyle()}>Seller: {userLabel(product.mistress)}</Text>
            <Text style={smallTextStyle('#777')}>Orders loaded: {product.orders.length} · Approval: {product.requiresApproval ? 'required' : 'not required'}</Text>
            {product.description ? <Text style={smallTextStyle('#ddd')}>{product.description}</Text> : null}
          </View>
        ))}
        {products.length === 0 ? <Text style={{ color: '#777' }}>No marketplace products found.</Text> : null}
      </>
    );
  }

  function renderCompliance() {
    const summaryCards = adminComplianceSummaryCards(complianceSummary);

    return (
      <>
        {renderRefreshButton('Refresh Compliance', loadCompliance)}
        <View style={{ ...panelStyle(), borderColor: complianceSummary.riskTone, borderWidth: 1, marginBottom: 10 }}>
          <Text style={{ color: complianceSummary.riskTone, fontSize: 11, fontWeight: '900' }}>
            {complianceSummary.riskLabel.toUpperCase()}
          </Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 }}>
            {complianceSummary.actionLabel}
          </Text>
          <Text style={smallTextStyle('#ccc')}>{complianceSummary.actionDetail}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {summaryCards.map((card) => (
            <View key={card.label} style={{ backgroundColor: '#111', borderColor: card.tone, borderWidth: 1, width: '48%', padding: 12, borderRadius: 14, marginRight: '2%', marginBottom: 8 }}>
              <Text style={{ color: '#aaa', fontSize: 11 }}>{card.label}</Text>
              <Text style={{ color: card.tone, fontSize: 22, fontWeight: '900' }}>{card.value}</Text>
              <Text style={smallTextStyle('#777')}>{card.hint}</Text>
            </View>
          ))}
        </View>
        {compliance ? (
          <>
            {compliance.recentAuditLogs.map((log) => (
              <View key={log.id} style={panelStyle()}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{log.action}</Text>
                <Text style={smallTextStyle()}>Actor: {userLabel(log.actor)} · Target: {log.targetId || 'none'}</Text>
                <Text style={smallTextStyle('#777')}>{new Date(log.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </>
        ) : null}
      </>
    );
  }

  function renderActiveTab() {
    if (sectionLoading) return <Text style={{ color: '#999' }}>Loading section...</Text>;
    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'users') return renderUsers();
    if (activeTab === 'ledger') return renderLedger();
    if (activeTab === 'moderation') return renderModeration();
    if (activeTab === 'plugins') return renderPlugins();
    if (activeTab === 'ppv') return renderPpv();
    if (activeTab === 'liveShows') return renderLiveShows();
    if (activeTab === 'bookings') return renderBookings();
    if (activeTab === 'giftsGoals') return renderGiftsGoals();
    if (activeTab === 'stickerPacks') return renderStickerPacks();
    if (activeTab === 'marketplaceWorlds') return renderMarketplaceWorlds();
    if (activeTab === 'compliance') return renderCompliance();
    return null;
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 10 }}>Headmistress Command Centre</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
        {renderTabButton('overview', 'Overview')}
        {renderTabButton('users', 'Users')}
        {renderTabButton('ledger', 'Ledger')}
        {renderTabButton('moderation', 'Moderation')}
        {renderTabButton('plugins', 'Plugins')}
        {renderTabButton('ppv', 'PPV')}
        {renderTabButton('liveShows', 'Live Shows')}
        {renderTabButton('bookings', 'Bookings')}
        {renderTabButton('giftsGoals', 'Gifts & Goals')}
        {renderTabButton('stickerPacks', 'Sticker Packs')}
        {renderTabButton('marketplaceWorlds', 'Marketplace Worlds')}
        {renderTabButton('compliance', 'Compliance')}
      </View>
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {renderActiveTab()}
    </ScrollView>
  );
}
