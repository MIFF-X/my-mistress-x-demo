import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import {
  getAdminOverview,
  listAdminLedger,
  listAdminUsers,
} from '../../api/adminApi';
import type {
  AdminLedgerTransaction,
  AdminOverview,
  AdminUser,
} from '../../api/adminApi';
import {
  approveAdminManualTopUpRequest,
  createAdminFinanceQueueDecision,
  expireStaleAdminWishlistReservations,
  exportAdminPayoutBatchCsv,
  getAdminComplianceOverview,
  getAdminPayoutBatchReconciliation,
  importAdminPayoutBatchSettlement,
  listAdminFinanceQueueDecisions,
  listAdminModeration,
  listAdminPayoutBatches,
  listAdminWishlistReservations,
  recordAdminPayoutBatchSettlement,
  rejectAdminManualTopUpRequest,
  releaseAdminReserveHold,
  reviewAdminWishlistReservation,
  updateAdminPayoutBatchStatus,
} from '../../api/adminCommandApi';
import type {
  AdminComplianceOverview,
  AdminFinanceQueueDecision,
  AdminManualTopUpRequest,
  AdminModerationItem,
  AdminPayoutBatch,
  AdminPayoutBatchReconciliation,
  AdminPayoutRequest,
  AdminPayoutBatchSettlement,
  AdminPayoutBatchStatus,
  AdminReserveHold,
  AdminWishlistReservation,
} from '../../api/adminCommandApi';
import {
  createAdminEconomyPayoutBatch,
  getAdminEconomyBankSummary,
  getAdminEconomyPayoutHealth,
  getAdminEconomyProviderReadiness,
  listAdminEconomyReserves,
  listAdminEconomyTopUps,
  reviewAdminEconomyPayout,
} from '../../api/adminEconomyApi';
import type {
  AdminBankSummary,
  AdminEconomyProviderReadiness,
  AdminPayoutHealth,
} from '../../api/adminEconomyApi';
import {
  listQuickCheckPolicyGuardRollup,
  QuickCheckPolicyGuardRollup,
} from '../../api/quickCheckApi';
import {
  listSubVaultPolicyGuardRollup,
  SubVaultPolicyGuardRollup,
} from '../../api/subVaultApi';
import { mxTheme } from '../../theme/mxTheme';
import {
  adminComplianceSummaryCards,
  buildAdminComplianceSummary,
} from './adminComplianceSummaryHelpers';
import { AdminUserStatusActionsPanel } from './AdminUserStatusActionsPanel';

type RevenueRow = {
  key: string;
  label: string;
  tokens: string[];
};

type FinanceQueueStatus = 'PENDING' | 'PROVIDER_HANDOFF' | 'HOLD_REVIEW' | 'EXPORT_READY';
type FinanceQueueActionStatus = Exclude<FinanceQueueStatus, 'PENDING'>;

type FinanceQueueItem = {
  id: string;
  amount: number;
  detail: string;
  priority: 'High' | 'Medium' | 'Normal';
  recommendedAction: string;
  sourceId: string;
  sourceType: string;
  mistressId?: string;
  title: string;
  tone: string;
};

type PayoutBatchCandidate = {
  decision: AdminFinanceQueueDecision;
  item: FinanceQueueItem;
};

type PolicyGuardQueueRow = {
  id: string;
  surface: string;
  targetView: 'quickCheckZone' | 'subVault';
  targetItemId: string;
  handoffLabel: string;
  title: string;
  status: string;
  detail: string;
  owner: string;
  updatedAt: string;
  tone: string;
  guards: Array<{ label: string; status: string; detail: string; severity?: string }>;
};

export type PolicyGuardHandoffTarget = {
  view: 'quickCheckZone' | 'subVault';
  itemId: string;
  source: 'quick-check' | 'sub-vault';
  label: string;
};

const REVENUE_ROWS: RevenueRow[] = [
  { key: 'gifts', label: 'Gifts', tokens: ['GIFT'] },
  { key: 'chat', label: 'Chat', tokens: ['CHAT', 'MESSAGE'] },
  { key: 'ppv', label: 'PPV', tokens: ['PPV', 'UNLOCK'] },
  { key: 'live', label: 'Live Shows', tokens: ['LIVE', 'SHOW', 'TICKET'] },
  { key: 'calls', label: 'Calls', tokens: ['CALL', 'BOOKING', 'PHONE', 'VIDEO'] },
  { key: 'store', label: 'Store', tokens: ['STORE', 'MARKETPLACE', 'STICKER', 'PRODUCT', 'ORDER'] },
  { key: 'subscriptions', label: 'Subscriptions', tokens: ['SUBSCRIPTION', 'MEMBERSHIP', 'SUB'] },
];

const FINANCE_QUEUE_ACTIONS: FinanceQueueActionStatus[] = ['PROVIDER_HANDOFF', 'HOLD_REVIEW', 'EXPORT_READY'];

const PAYOUT_BATCH_STATUS_ACTIONS: Array<{ status: AdminPayoutBatchStatus; label: string }> = [
  { status: 'SCHEDULED', label: 'Schedule' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'PAID', label: 'Paid' },
  { status: 'FAILED', label: 'Failed' },
  { status: 'CANCELLED', label: 'Cancel' },
];

const FINANCE_QUEUE_LABELS: Record<FinanceQueueStatus, string> = {
  PENDING: 'Pending owner decision',
  PROVIDER_HANDOFF: 'Provider handoff',
  HOLD_REVIEW: 'Hold for review',
  EXPORT_READY: 'Export ready',
};

function asNumber(value: number | string | undefined | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function transactionRevenue(tx: AdminLedgerTransaction) {
  const platformAmount = asNumber(tx.platformAmount);
  if (platformAmount > 0) return platformAmount;
  if (tx.direction !== 'IN') return 0;
  return asNumber(tx.amount);
}

function transactionText(tx: AdminLedgerTransaction) {
  return `${tx.type || ''} ${tx.reason || ''}`.toUpperCase();
}

function transactionHasToken(tx: AdminLedgerTransaction, tokens: string[]) {
  const text = transactionText(tx);
  return tokens.some((token) => text.includes(token));
}

function isMoneyInOnly(tx: AdminLedgerTransaction) {
  return transactionHasToken(tx, ['TOP_UP', 'TOPUP', 'WALLET_TOP_UP', 'PAYMENT_INTENT', 'MANUAL_TOP_UP']);
}

function isRefundOrDispute(tx: AdminLedgerTransaction) {
  return transactionHasToken(tx, ['REFUND', 'CHARGEBACK', 'DISPUTE']);
}

function isPaymentFailure(tx: AdminLedgerTransaction) {
  return transactionHasToken(tx, ['FAILED', 'FAILURE', 'DECLINED', 'REJECTED', 'CANCELLED']);
}

function transactionGrossValue(tx: AdminLedgerTransaction) {
  const splitGross = asNumber(tx.platformAmount) + asNumber(tx.mistressAmount);
  return splitGross > 0 ? splitGross : asNumber(tx.amount);
}

function transactionCreatorValue(tx: AdminLedgerTransaction) {
  const creatorAmount = asNumber(tx.mistressAmount);
  if (creatorAmount > 0) return creatorAmount;
  return Math.max(0, transactionGrossValue(tx) - transactionRevenue(tx));
}

function formatCredits(value: number) {
  return `${Math.round(value).toLocaleString()} credits`;
}

function formatBatchMoney(value: number | string | undefined | null, currency = 'AUD') {
  return `${asNumber(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency || 'AUD'}`;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

function userLabel(user: AdminUser) {
  return user.displayName || user.username || user.email || user.id;
}

function financeQueueTone(status: FinanceQueueStatus) {
  if (status === 'PROVIDER_HANDOFF') return mxTheme.colors.success;
  if (status === 'HOLD_REVIEW') return '#ff6b6b';
  if (status === 'EXPORT_READY') return mxTheme.colors.accentSoft;
  return mxTheme.colors.warning;
}

function reserveHoldTone(status?: string | null) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'HELD') return '#ff6b6b';
  if (normalized === 'RELEASED') return mxTheme.colors.success;
  if (normalized === 'EXPIRED') return mxTheme.colors.muted;
  return mxTheme.colors.warning;
}

function wishlistReservationTone(status?: string | null) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'ACTIVE') return mxTheme.colors.accentSoft;
  if (normalized === 'PURCHASED') return mxTheme.colors.success;
  if (normalized === 'EXPIRED') return mxTheme.colors.warning;
  if (normalized === 'CANCELLED') return mxTheme.colors.muted;
  return mxTheme.colors.warning;
}

function automaticFinanceQueueStatus(item: FinanceQueueItem): FinanceQueueActionStatus {
  const sourceType = item.sourceType.toLowerCase();
  const recommendedAction = item.recommendedAction.toLowerCase();

  if (
    sourceType.includes('dispute')
    || sourceType.includes('failure')
    || sourceType.includes('money_in')
    || item.priority === 'High'
    || recommendedAction.includes('hold')
    || recommendedAction.includes('review source')
  ) {
    return 'HOLD_REVIEW';
  }

  return 'PROVIDER_HANDOFF';
}

function payoutBatchStatusTone(status: string) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID') return mxTheme.colors.success;
  if (normalized === 'FAILED') return '#ff6b6b';
  if (normalized === 'PROCESSING') return mxTheme.colors.accentSoft;
  if (normalized === 'CANCELLED') return mxTheme.colors.muted;
  return mxTheme.colors.warning;
}

function payoutBatchReconciliationTone(reconciliation?: AdminPayoutBatchReconciliation) {
  if (!reconciliation) return mxTheme.colors.accentSoft;
  return reconciliation.needsReview ? mxTheme.colors.warning : mxTheme.colors.success;
}

function policyGuardTone(severity?: string) {
  if (severity === 'ESCALATED' || severity === 'BLOCKED') return '#ff6b6b';
  if (severity === 'WARNING') return mxTheme.colors.warning;
  if (severity === 'CLEAR') return mxTheme.colors.success;
  return mxTheme.colors.accentSoft;
}

function policyGuardRowTone(guards: PolicyGuardQueueRow['guards']) {
  if (guards.some((guard) => guard.severity === 'ESCALATED' || guard.severity === 'BLOCKED')) return '#ff6b6b';
  if (guards.some((guard) => guard.severity === 'WARNING')) return mxTheme.colors.warning;
  return mxTheme.colors.success;
}

function policyGuardSummary(guards: PolicyGuardQueueRow['guards']) {
  const visible = guards.filter((guard) => guard.severity !== 'CLEAR' && guard.severity !== 'INFO');
  const rows = visible.length ? visible : guards.slice(0, 2);
  return rows.map((guard) => `${guard.label}: ${guard.status}`).join(' / ') || 'No active guard flags';
}

function payoutBatchSettlementFromMetadata(batch: AdminPayoutBatch) {
  const settlement = batch.metadata?.providerSettlement;
  if (!settlement || typeof settlement !== 'object' || Array.isArray(settlement)) return null;
  return settlement as AdminPayoutBatchSettlement;
}

function isAdminReserveHold(value: unknown): value is AdminReserveHold {
  return Boolean(value && typeof value === 'object' && 'id' in value);
}

function manualTopUpCredits(request: AdminManualTopUpRequest) {
  return asNumber(request.creditsToAdd ?? request.amountCredits ?? request.amount);
}

function manualTopUpReferenceText(reference?: Record<string, unknown> | null) {
  if (!reference) return 'No reference supplied';
  const parts = [
    reference.reference ? `Reference: ${String(reference.reference)}` : null,
    reference.payId ? `PayID: ${String(reference.payId)}` : null,
    reference.instructions ? String(reference.instructions) : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' / ') : JSON.stringify(reference);
}

function payoutRequestTone(status?: string | null) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID') return mxTheme.colors.success;
  if (normalized === 'APPROVED' || normalized === 'BATCHED') return mxTheme.colors.accentSoft;
  if (normalized === 'REJECTED') return '#ff6b6b';
  return mxTheme.colors.warning;
}

function canApprovePayoutRequest(status?: string | null) {
  return ['REQUESTED', 'REVIEW'].includes(String(status || '').toUpperCase());
}

function canRejectPayoutRequest(status?: string | null) {
  return !['PAID', 'REJECTED'].includes(String(status || '').toUpperCase());
}

function canMarkPayoutRequestPaid(status?: string | null) {
  return ['APPROVED', 'BATCHED', 'PROCESSING'].includes(String(status || '').toUpperCase());
}

function payoutBatchSettlementImportTemplate(batch: AdminPayoutBatch) {
  const providerReference = `manual-${String(batch.id).slice(0, 48)}`;
  const settledAt = batch.processedAt || batch.updatedAt || batch.createdAt;
  return [
    'batchId,providerReference,status,amount,feeAmount,settledAt,note',
    `${batch.id},${providerReference},SETTLED,${asNumber(batch.totalAmount).toFixed(2)},0.00,${settledAt},Provider settlement import`,
  ].join('\n');
}

function payoutBatchCsv(candidates: PayoutBatchCandidate[]) {
  const header = 'itemId,status,sourceId,mistressId,title,amount,currency,decisionAt';
  const rows = candidates.map(({ decision, item }) => [
    item.id,
    decision.status,
    item.sourceId,
    item.mistressId || '',
    item.title.replace(/,/g, ' '),
    item.amount.toFixed(2),
    decision.currency || 'CREDITS',
    decision.createdAt,
  ].join(','));
  return [header, ...rows].join('\n');
}

function payoutBatchExportFileName(batchId: string) {
  const safeId = String(batchId || 'draft').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80);
  return `payout-batch-${safeId}.csv`;
}

function browserExportApi() {
  const scope = globalThis as any;

  return {
    BlobRef: scope.Blob,
    documentRef: scope.document,
    urlRef: scope.URL || scope.webkitURL,
    clipboard: scope.navigator?.clipboard,
  };
}

function downloadCsvFile(csvText: string, fileName: string) {
  if (!csvText.trim()) return 'Load payout batch CSV first.';

  const { BlobRef, documentRef, urlRef } = browserExportApi();
  if (!BlobRef || !documentRef?.createElement || !urlRef?.createObjectURL) {
    return 'Payout batch CSV is ready below for manual save or share.';
  }

  const blob = new BlobRef([csvText], { type: 'text/csv;charset=utf-8' });
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

async function copyCsvText(csvText: string) {
  const { clipboard } = browserExportApi();
  if (!csvText.trim() || !clipboard?.writeText) return false;
  await clipboard.writeText(csvText);
  return true;
}

async function shareCsvText(csvText: string, fileName: string) {
  if (!csvText.trim()) return 'Load payout batch CSV first.';

  const share = (Share as any)?.share;
  if (!share) return 'Payout batch CSV is ready below for manual share.';

  await share({
    title: fileName,
    message: csvText,
  });

  return 'Payout batch CSV share sheet opened.';
}

function panelStyle(borderColor = mxTheme.colors.border) {
  return {
    backgroundColor: mxTheme.colors.surface,
    borderColor,
    borderWidth: 1,
    borderRadius: mxTheme.radius.md,
    padding: mxTheme.spacing.md,
    marginBottom: mxTheme.spacing.md,
  } as const;
}

function miniCardStyle() {
  return {
    backgroundColor: mxTheme.colors.surfaceSoft,
    borderColor: mxTheme.colors.border,
    borderWidth: 1,
    borderRadius: mxTheme.radius.sm,
    padding: mxTheme.spacing.md,
    width: '48%' as const,
    marginRight: '2%' as const,
    marginBottom: mxTheme.spacing.sm,
  };
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginTop: mxTheme.spacing.lg, marginBottom: mxTheme.spacing.sm }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>{title}</Text>
      {subtitle ? <Text style={{ color: mxTheme.colors.muted, marginTop: 4 }}>{subtitle}</Text> : null}
    </View>
  );
}

function MetricCard({ label, value, tone = mxTheme.colors.accentSoft }: { label: string; value: string | number; tone?: string }) {
  return (
    <View style={miniCardStyle()}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>{label}</Text>
      <Text style={{ color: tone, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function SmallLine({ label, value, tone = mxTheme.colors.muted }: { label: string; value: string | number; tone?: string }) {
  return (
    <Text style={{ color: tone, fontSize: 12, marginTop: 4 }}>
      {label}: {value}
    </Text>
  );
}

export function HeadmistressDashboardScreen({
  onOpenPolicyGuardHandoff,
}: {
  onOpenPolicyGuardHandoff?: (target: PolicyGuardHandoffTarget) => void;
} = {}) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ledger, setLedger] = useState<AdminLedgerTransaction[]>([]);
  const [moderation, setModeration] = useState<AdminModerationItem[]>([]);
  const [compliance, setCompliance] = useState<AdminComplianceOverview | null>(null);
  const [financeQueueDecisionRows, setFinanceQueueDecisionRows] = useState<AdminFinanceQueueDecision[]>([]);
  const [payoutBatches, setPayoutBatches] = useState<AdminPayoutBatch[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<AdminPayoutRequest[]>([]);
  const [reserveHolds, setReserveHolds] = useState<AdminReserveHold[]>([]);
  const [wishlistReservations, setWishlistReservations] = useState<AdminWishlistReservation[]>([]);
  const [manualTopUpRequests, setManualTopUpRequests] = useState<AdminManualTopUpRequest[]>([]);
  const [adminBankSummary, setAdminBankSummary] = useState<AdminBankSummary | null>(null);
  const [adminPayoutHealth, setAdminPayoutHealth] = useState<AdminPayoutHealth | null>(null);
  const [adminEconomyProviderReadiness, setAdminEconomyProviderReadiness] = useState<AdminEconomyProviderReadiness | null>(null);
  const [quickCheckPolicyRollup, setQuickCheckPolicyRollup] = useState<QuickCheckPolicyGuardRollup | null>(null);
  const [subVaultPolicyRollup, setSubVaultPolicyRollup] = useState<SubVaultPolicyGuardRollup | null>(null);
  const [financeQueueDecisions, setFinanceQueueDecisions] = useState<Record<string, FinanceQueueStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financeQueueMessage, setFinanceQueueMessage] = useState<string | null>(null);
  const [manualTopUpMessage, setManualTopUpMessage] = useState<string | null>(null);
  const [payoutBatchMessage, setPayoutBatchMessage] = useState<string | null>(null);
  const [payoutRequestMessage, setPayoutRequestMessage] = useState<string | null>(null);
  const [reserveHoldMessage, setReserveHoldMessage] = useState<string | null>(null);
  const [wishlistReservationMessage, setWishlistReservationMessage] = useState<string | null>(null);
  const [payoutBatchUpdatingId, setPayoutBatchUpdatingId] = useState<string | null>(null);
  const [payoutBatchExportingId, setPayoutBatchExportingId] = useState<string | null>(null);
  const [payoutBatchExportTextById, setPayoutBatchExportTextById] = useState<Record<string, string>>({});
  const [payoutBatchReconcilingId, setPayoutBatchReconcilingId] = useState<string | null>(null);
  const [payoutBatchReconciliationById, setPayoutBatchReconciliationById] = useState<Record<string, AdminPayoutBatchReconciliation>>({});
  const [payoutBatchSettlingId, setPayoutBatchSettlingId] = useState<string | null>(null);
  const [payoutBatchImportingId, setPayoutBatchImportingId] = useState<string | null>(null);
  const [payoutBatchSettlementImportTextById, setPayoutBatchSettlementImportTextById] = useState<Record<string, string>>({});
  const [financeQueueAutomating, setFinanceQueueAutomating] = useState(false);
  const [manualTopUpReviewNotes, setManualTopUpReviewNotes] = useState<Record<string, string>>({});
  const [manualTopUpUpdatingId, setManualTopUpUpdatingId] = useState<string | null>(null);
  const [wishlistReservationReviewNotes, setWishlistReservationReviewNotes] = useState<Record<string, string>>({});
  const [wishlistReservationUpdatingId, setWishlistReservationUpdatingId] = useState<string | null>(null);
  const [wishlistReservationSweeping, setWishlistReservationSweeping] = useState(false);
  const [payoutRequestReviewNotes, setPayoutRequestReviewNotes] = useState<Record<string, string>>({});
  const [payoutRequestUpdatingId, setPayoutRequestUpdatingId] = useState<string | null>(null);
  const [reserveHoldReleasingId, setReserveHoldReleasingId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const [
        nextOverview,
        nextUsers,
        nextLedger,
        nextModeration,
        nextCompliance,
        nextFinanceQueueDecisions,
        nextPayoutBatches,
        nextAdminBankSummary,
        nextAdminPayoutHealth,
        nextReserveHolds,
        nextAdminEconomyProviderReadiness,
        nextWishlistReservations,
        nextManualTopUps,
        nextQuickCheckPolicyRollup,
        nextSubVaultPolicyRollup,
      ] = await Promise.all([
        getAdminOverview(),
        listAdminUsers(),
        listAdminLedger(),
        listAdminModeration(),
        getAdminComplianceOverview(),
        listAdminFinanceQueueDecisions(),
        listAdminPayoutBatches(),
        getAdminEconomyBankSummary(),
        getAdminEconomyPayoutHealth(),
        listAdminEconomyReserves(),
        getAdminEconomyProviderReadiness(),
        listAdminWishlistReservations(),
        listAdminEconomyTopUps(),
        listQuickCheckPolicyGuardRollup(),
        listSubVaultPolicyGuardRollup(),
      ]);
      setOverview(nextOverview);
      setUsers(nextUsers);
      setLedger(nextLedger);
      setModeration(nextModeration);
      setCompliance(nextCompliance);
      setFinanceQueueDecisionRows(nextFinanceQueueDecisions.items || []);
      setPayoutBatches(nextPayoutBatches.items || []);
      setAdminBankSummary(nextAdminBankSummary);
      setAdminPayoutHealth(nextAdminPayoutHealth);
      setAdminEconomyProviderReadiness(nextAdminEconomyProviderReadiness);
      setPayoutRequests(nextAdminPayoutHealth.payoutRequests || []);
      setReserveHolds(nextReserveHolds.items || []);
      setWishlistReservations(nextWishlistReservations || []);
      setManualTopUpRequests(nextManualTopUps.items || []);
      setQuickCheckPolicyRollup(nextQuickCheckPolicyRollup);
      setSubVaultPolicyRollup(nextSubVaultPolicyRollup);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Headmistress dashboard failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function createDraftPayoutBatch(candidates: PayoutBatchCandidate[], exportText: string, totalAmount: number) {
    if (candidates.length === 0) {
      setPayoutBatchMessage('No provider-handoff or export-ready payout decisions are ready to batch.');
      return;
    }

    try {
      setPayoutBatchMessage(null);
      const batch = await createAdminEconomyPayoutBatch({
        method: 'manual_bank_payout',
        payoutRequestIds: [],
        metadata: {
          source: 'headmistress_dashboard',
          plannedTotalAmount: totalAmount,
          candidateDecisionIds: candidates.map(({ decision }) => decision.id),
          candidateItemIds: candidates.map(({ item }) => item.id),
          exportText,
        },
      });
      setPayoutBatches((current) => [batch, ...current.filter((row) => row.id !== batch.id)]);
      setPayoutBatchMessage(`Draft payout batch ${batch.id} created for ${formatCredits(totalAmount)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout batch creation failed');
    }
  }

  async function setPayoutBatchStatus(batch: AdminPayoutBatch, status: AdminPayoutBatchStatus) {
    const now = new Date().toISOString();
    const updatingKey = `${batch.id}:${status}`;

    try {
      setError(null);
      setPayoutBatchMessage(null);
      setPayoutBatchUpdatingId(updatingKey);
      const updated = await updateAdminPayoutBatchStatus(batch.id, {
        status,
        processedAt: status === 'PAID' ? now : undefined,
        metadata: {
          ...(batch.metadata ?? {}),
          source: 'headmistress_dashboard_status_control',
          previousStatus: batch.status,
          statusUpdatedAt: now,
        },
      });

      setPayoutBatches((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setPayoutBatchMessage(`Payout batch ${batch.id} marked ${status.toLowerCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout batch status update failed');
    } finally {
      setPayoutBatchUpdatingId(null);
    }
  }

  async function handlePayoutBatchExport(batch: AdminPayoutBatch, action: 'show' | 'download' | 'copy' | 'share') {
    const key = `${batch.id}:${action}`;

    try {
      setError(null);
      setPayoutBatchMessage(null);
      setPayoutBatchExportingId(key);
      const csvText = payoutBatchExportTextById[batch.id] || await exportAdminPayoutBatchCsv(batch.id);
      setPayoutBatchExportTextById((current) => ({ ...current, [batch.id]: csvText }));

      if (action === 'download') {
        setPayoutBatchMessage(downloadCsvFile(csvText, payoutBatchExportFileName(batch.id)));
        return;
      }

      if (action === 'copy') {
        const copied = await copyCsvText(csvText);
        setPayoutBatchMessage(copied ? 'Payout batch CSV copied.' : 'Payout batch CSV is ready below for manual copy.');
        return;
      }

      if (action === 'share') {
        setPayoutBatchMessage(await shareCsvText(csvText, payoutBatchExportFileName(batch.id)));
        return;
      }

      setPayoutBatchMessage(`Payout batch CSV loaded for ${batch.id}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout batch CSV export failed');
    } finally {
      setPayoutBatchExportingId(null);
    }
  }

  async function handlePayoutBatchReconciliation(batch: AdminPayoutBatch) {
    try {
      setError(null);
      setPayoutBatchMessage(null);
      setPayoutBatchReconcilingId(batch.id);
      const reconciliation = await getAdminPayoutBatchReconciliation(batch.id);
      setPayoutBatchReconciliationById((current) => ({ ...current, [batch.id]: reconciliation }));
      setPayoutBatchMessage(
        reconciliation.needsReview
          ? `Payout batch ${batch.id} needs review before settlement.`
          : `Payout batch ${batch.id} reconciled cleanly.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout batch reconciliation failed');
    } finally {
      setPayoutBatchReconcilingId(null);
    }
  }

  async function handlePayoutBatchSettlement(batch: AdminPayoutBatch) {
    const now = new Date().toISOString();

    try {
      setError(null);
      setPayoutBatchMessage(null);
      setPayoutBatchSettlingId(batch.id);
      const result = await recordAdminPayoutBatchSettlement(batch.id, {
        status: 'SETTLED',
        amount: asNumber(batch.totalAmount),
        feeAmount: 0,
        providerReference: `manual-${String(batch.id).slice(0, 24)}-${Date.now()}`,
        settledAt: now,
        note: 'Provider-neutral settlement evidence recorded from Headmistress dashboard.',
        metadata: {
          source: 'headmistress_dashboard_settlement',
          previousStatus: batch.status,
        },
      });
      setPayoutBatches((current) => current.map((row) => (row.id === result.batch.id ? result.batch : row)));
      setPayoutBatchReconciliationById((current) => ({ ...current, [batch.id]: result.reconciliation }));
      setPayoutBatchMessage(`Payout batch ${batch.id} settlement recorded.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout batch settlement recording failed');
    } finally {
      setPayoutBatchSettlingId(null);
    }
  }

  async function handlePayoutBatchSettlementImport(batch: AdminPayoutBatch) {
    const importText = payoutBatchSettlementImportTextById[batch.id] || payoutBatchSettlementImportTemplate(batch);

    try {
      setError(null);
      setPayoutBatchMessage(null);
      setPayoutBatchImportingId(batch.id);
      const result = await importAdminPayoutBatchSettlement(batch.id, {
        importText,
        providerName: 'headmistress_manual_import',
        metadata: {
          source: 'headmistress_dashboard_settlement_import',
        },
      });
      setPayoutBatches((current) => current.map((row) => (row.id === result.batch.id ? result.batch : row)));
      setPayoutBatchReconciliationById((current) => ({ ...current, [batch.id]: result.reconciliation }));
      setPayoutBatchMessage(`Imported ${result.importSummary.rowCount} settlement row(s) and matched ${batch.id}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout batch settlement import failed');
    } finally {
      setPayoutBatchImportingId(null);
    }
  }

  function hidePayoutBatchExport(batchId: string) {
    setPayoutBatchExportTextById((current) => {
      const next = { ...current };
      delete next[batchId];
      return next;
    });
  }

  function handleUserUpdated(updated: AdminUser) {
    setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
  }

  async function setFinanceQueueDecision(item: FinanceQueueItem, status: FinanceQueueActionStatus) {
    setFinanceQueueDecisions((current) => ({ ...current, [item.id]: status }));
    setFinanceQueueMessage(null);

    try {
      const saved = await createAdminFinanceQueueDecision({
        itemId: item.id,
        status,
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        mistressId: item.mistressId,
        amount: item.amount,
        currency: 'CREDITS',
        note: item.recommendedAction,
        metadata: {
          priority: item.priority,
          title: item.title,
          detail: item.detail,
        },
      });
      setFinanceQueueDecisionRows((current) => [saved, ...current.filter((row) => row.id !== saved.id)]);
      if (isAdminReserveHold(saved.reserveHold)) {
        const savedReserveHold = saved.reserveHold;
        setReserveHolds((current) => [savedReserveHold, ...current.filter((row) => row.id !== savedReserveHold.id)]);
      }
      setFinanceQueueMessage(`${item.title} marked ${FINANCE_QUEUE_LABELS[status].toLowerCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Finance queue decision failed');
      setFinanceQueueDecisions((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
    }
  }

  const totalRevenue = useMemo(
    () => ledger.reduce((sum, tx) => sum + transactionRevenue(tx), 0),
    [ledger],
  );

  const revenueBySystem = useMemo(
    () => REVENUE_ROWS.map((row) => ({
      ...row,
      total: ledger.reduce((sum, tx) => {
        if (!transactionHasToken(tx, row.tokens)) return sum;
        return sum + transactionRevenue(tx);
      }, 0),
    })),
    [ledger],
  );

  const financeSummary = useMemo(() => {
    const moneyInRows = ledger.filter(isMoneyInOnly);
    const revenueRows = ledger.filter((tx) => !isMoneyInOnly(tx) && !isRefundOrDispute(tx) && (
      transactionRevenue(tx) > 0 || transactionCreatorValue(tx) > 0
    ));
    const refundAndDisputeRows = ledger.filter(isRefundOrDispute);
    const failedPaymentRows = ledger.filter(isPaymentFailure);
    const refundTotal = refundAndDisputeRows.reduce((sum, tx) => sum + transactionGrossValue(tx), 0);
    const grossReceipts = revenueRows.reduce((sum, tx) => sum + transactionGrossValue(tx), 0);
    const platformFees = revenueRows.reduce((sum, tx) => sum + transactionRevenue(tx), 0);
    const creatorNet = revenueRows.reduce((sum, tx) => sum + transactionCreatorValue(tx), 0);
    const processorFeeEstimate = grossReceipts > 0
      ? (grossReceipts * 0.029) + (revenueRows.length * 0.3)
      : 0;

    return {
      creatorNet,
      failedPaymentRows,
      grossReceipts,
      manualTopUps: moneyInRows.length,
      moneyInRows,
      platformFees,
      processorFeeEstimate,
      refundAndDisputeRows,
      refundTotal,
      revenueRows,
      takeRate: grossReceipts > 0 ? (platformFees / grossReceipts) * 100 : 0,
    };
  }, [ledger]);

  const payoutReviewRows = useMemo(
    () => users
      .filter((user) => user.role === 'MISTRESS' || user.role === 'HEADMISTRESS')
      .map((user) => {
        const rows = financeSummary.revenueRows.filter((tx) => (
          tx.receiverUserId === user.id || tx.receiver?.id === user.id
        ));
        const disputedRows = financeSummary.refundAndDisputeRows.filter((tx) => (
          tx.receiverUserId === user.id || tx.receiver?.id === user.id
        ));
        const creatorNet = rows.reduce((sum, tx) => sum + transactionCreatorValue(tx), 0);
        const platformFees = rows.reduce((sum, tx) => sum + transactionRevenue(tx), 0);
        const disputeExposure = disputedRows.reduce((sum, tx) => sum + transactionGrossValue(tx), 0);

        return {
          creatorNet,
          disputeExposure,
          platformFees,
          rows: rows.length,
          user,
          walletBalance: asNumber(user.wallet?.balance),
        };
      })
      .sort((a, b) => (b.creatorNet + b.walletBalance) - (a.creatorNet + a.walletBalance))
      .slice(0, 6),
    [financeSummary, users],
  );

  const providerReadiness = useMemo(() => {
    const backendChecks = [
      ...(adminEconomyProviderReadiness?.checks || []).map((check) => ({
        key: `backend-${check.key}`,
        label: `Admin Economy: ${check.key.replace(/_/g, ' ')}`,
        status: check.status,
        detail: check.detail,
        tone: check.status === 'PASS' ? mxTheme.colors.success : check.status === 'FAIL' ? '#ff6b6b' : mxTheme.colors.warning,
      })),
      ...(adminEconomyProviderReadiness?.providers || []).slice(0, 4).map((provider) => ({
        key: `provider-${provider.key}`,
        label: `Provider ${provider.key.replace(/_/g, ' ')}`,
        status: provider.status,
        detail: `${provider.rail} rail requires ${provider.requiredEnv.join(', ') || 'deployment configuration'}.`,
        tone: provider.credentialConfigured ? mxTheme.colors.success : mxTheme.colors.warning,
      })),
    ];

    return [
      ...backendChecks,
      {
        key: 'take-rate',
        label: 'Platform take-rate',
        status: financeSummary.revenueRows.length ? 'Ledger-backed estimate visible' : 'Waiting for revenue rows',
        detail: `${financeSummary.revenueRows.length} revenue-bearing rows loaded for owner review.`,
        tone: financeSummary.revenueRows.length ? mxTheme.colors.success : mxTheme.colors.warning,
      },
      {
        key: 'payouts',
        label: 'Creator payout review',
        status: payoutReviewRows.length ? 'Review queue scaffolded' : 'No creator rows loaded',
        detail: `${adminPayoutHealth?.summary.openPayoutRequests ?? payoutReviewRows.length} open payout request(s), ${adminPayoutHealth?.summary.batchesNeedingReview ?? 0} batch review flag(s).`,
        tone: payoutReviewRows.length || (adminPayoutHealth?.summary.openPayoutRequests ?? 0) ? mxTheme.colors.success : mxTheme.colors.warning,
      },
      {
        key: 'disputes',
        label: 'Refunds and disputes',
        status: financeSummary.refundAndDisputeRows.length ? 'Needs review' : 'No loaded dispute rows',
        detail: `${financeSummary.refundAndDisputeRows.length} refund, chargeback, or dispute rows found.`,
        tone: financeSummary.refundAndDisputeRows.length ? '#ff6b6b' : mxTheme.colors.success,
      },
      {
        key: 'processor',
        label: 'Processor fees',
        status: adminEconomyProviderReadiness?.status || 'Estimate only',
        detail: adminEconomyProviderReadiness
          ? `${adminEconomyProviderReadiness.summary.configuredCount}/${adminEconomyProviderReadiness.summary.providerChecks} provider credential checks configured.`
          : 'Replace with provider fees after payment intents and webhooks are connected.',
        tone: adminEconomyProviderReadiness?.status === 'BLOCKED' ? '#ff6b6b' : mxTheme.colors.warning,
      },
    ];
  }, [adminEconomyProviderReadiness, adminPayoutHealth, financeSummary, payoutReviewRows]);

  const policyGuardQueueRows = useMemo<PolicyGuardQueueRow[]>(() => {
    const quickCheckRows = (quickCheckPolicyRollup?.items || []).map((item) => {
      const guards = item.policyGuards || [];
      return {
        id: `quick-check-${item.id}`,
        surface: 'Quick Check',
        targetView: 'quickCheckZone' as const,
        targetItemId: item.id,
        handoffLabel: 'Open Quick Check Detail',
        title: item.title,
        status: item.status.replace(/_/g, ' '),
        detail: item.message,
        owner: `Host ${item.hostUserId} / Sub ${item.requesterUserId}`,
        updatedAt: item.updatedAt || item.createdAt,
        tone: policyGuardRowTone(guards),
        guards,
      };
    });
    const vaultRows = (subVaultPolicyRollup?.items || []).map((item) => {
      const guards = item.policyGuards || [];
      return {
        id: `sub-vault-${item.id}`,
        surface: 'Sub Vault',
        targetView: 'subVault' as const,
        targetItemId: item.id,
        handoffLabel: 'Open Vault Review',
        title: item.title,
        status: String(item.status).replace(/_/g, ' '),
        detail: item.redactedSummary || item.category || 'Verification reference needs policy review.',
        owner: `Owner ${item.ownerUserId}`,
        updatedAt: item.updatedAt || item.createdAt,
        tone: policyGuardRowTone(guards),
        guards,
      };
    });

    return [...quickCheckRows, ...vaultRows]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);
  }, [quickCheckPolicyRollup, subVaultPolicyRollup]);

  const persistedFinanceQueueDecisions = useMemo(() => {
    const map = new Map<string, AdminFinanceQueueDecision>();
    financeQueueDecisionRows.forEach((row) => {
      if (!row.itemId || map.has(row.itemId)) return;
      map.set(row.itemId, row);
    });
    return map;
  }, [financeQueueDecisionRows]);

  const financeActionQueue = useMemo<FinanceQueueItem[]>(() => {
    const disputeItems = financeSummary.refundAndDisputeRows.slice(0, 4).map((tx) => ({
      id: `dispute-${tx.id}`,
      amount: transactionGrossValue(tx),
      detail: `${tx.type} ${tx.reason || 'needs owner review'}`.trim(),
      mistressId: tx.receiverUserId || tx.receiver?.id || undefined,
      priority: 'High' as const,
      recommendedAction: 'Hold funds and review source ledger, receipt, and provider event.',
      sourceId: tx.id,
      sourceType: 'ledger_dispute',
      title: `Dispute or reversal row ${tx.id.slice(0, 8)}`,
      tone: '#ff6b6b',
    }));

    const failedPaymentItems = financeSummary.failedPaymentRows.slice(0, 3).map((tx) => ({
      id: `failed-${tx.id}`,
      amount: transactionGrossValue(tx),
      detail: `${tx.type} ${tx.reason || 'payment failure signal'}`.trim(),
      mistressId: tx.receiverUserId || tx.receiver?.id || undefined,
      priority: 'High' as const,
      recommendedAction: 'Confirm provider status before crediting, retrying, or closing the payment.',
      sourceId: tx.id,
      sourceType: 'payment_failure',
      title: `Failed payment row ${tx.id.slice(0, 8)}`,
      tone: mxTheme.colors.warning,
    }));

    const payoutItems = payoutReviewRows
      .filter((row) => row.creatorNet > 0 || row.walletBalance > 0)
      .slice(0, 5)
      .map((row) => ({
        id: `payout-${row.user.id}`,
        amount: row.creatorNet || row.walletBalance,
        detail: `${row.rows} ledger split rows, ${formatCredits(row.walletBalance)} wallet balance.`,
        mistressId: row.user.id,
        priority: row.disputeExposure > 0 ? 'Medium' as const : 'Normal' as const,
        recommendedAction: row.disputeExposure > 0
          ? 'Hold payout until dispute exposure is cleared.'
          : 'Prepare provider payout handoff and creator statement.',
        sourceId: row.user.id,
        sourceType: 'payout_review',
        title: `Payout review for ${userLabel(row.user)}`,
        tone: row.disputeExposure > 0 ? mxTheme.colors.warning : mxTheme.colors.success,
      }));

    const manualMoneyInItems = financeSummary.moneyInRows.slice(0, 3).map((tx) => ({
      id: `money-in-${tx.id}`,
      amount: transactionGrossValue(tx),
      detail: `${tx.type} ${tx.reason || 'manual/provider money-in row'}`.trim(),
      mistressId: tx.receiverUserId || tx.receiver?.id || undefined,
      priority: 'Medium' as const,
      recommendedAction: 'Match provider receipt before confirming spendable balance.',
      sourceId: tx.id,
      sourceType: 'manual_money_in',
      title: `Manual money-in review ${tx.id.slice(0, 8)}`,
      tone: mxTheme.colors.warning,
    }));

    return [
      ...disputeItems,
      ...failedPaymentItems,
      ...payoutItems,
      ...manualMoneyInItems,
    ].slice(0, 12);
  }, [financeSummary, payoutReviewRows]);

  const financeQueueAutomationCandidates = useMemo(
    () => financeActionQueue.filter((item) => (
      !persistedFinanceQueueDecisions.has(item.id)
      && !financeQueueDecisions[item.id]
    )),
    [financeActionQueue, financeQueueDecisions, persistedFinanceQueueDecisions],
  );

  async function autoCreateFinanceQueueDecisions() {
    if (financeQueueAutomationCandidates.length === 0) {
      setFinanceQueueMessage('No new finance queue rows need automated review.');
      return;
    }

    try {
      setError(null);
      setFinanceQueueMessage(null);
      setFinanceQueueAutomating(true);

      const savedRows: AdminFinanceQueueDecision[] = [];
      const nextLocalDecisions: Record<string, FinanceQueueStatus> = {};

      for (const item of financeQueueAutomationCandidates) {
        const status = automaticFinanceQueueStatus(item);
        const saved = await createAdminFinanceQueueDecision({
          itemId: item.id,
          status,
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          mistressId: item.mistressId,
          amount: item.amount,
          currency: 'CREDITS',
          note: `Automated queue review: ${item.recommendedAction}`,
          metadata: {
            detail: item.detail,
            priority: item.priority,
            source: 'headmistress_dashboard_auto_queue',
            title: item.title,
          },
        });

        savedRows.push(saved);
        nextLocalDecisions[item.id] = status;
      }

      const savedIds = new Set(savedRows.map((row) => row.id));
      setFinanceQueueDecisionRows((current) => [
        ...savedRows,
        ...current.filter((row) => !savedIds.has(row.id) && !savedRows.some((saved) => saved.itemId === row.itemId)),
      ]);
      const savedReserveHolds = savedRows.map((row) => row.reserveHold).filter(isAdminReserveHold);
      if (savedReserveHolds.length) {
        const reserveIds = new Set(savedReserveHolds.map((row) => row.id));
        setReserveHolds((current) => [
          ...savedReserveHolds,
          ...current.filter((row) => !reserveIds.has(row.id)),
        ]);
      }
      setFinanceQueueDecisions((current) => ({ ...current, ...nextLocalDecisions }));
      setFinanceQueueMessage(`Automated ${savedRows.length} finance queue decision(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Finance queue automation failed');
    } finally {
      setFinanceQueueAutomating(false);
    }
  }

  async function releaseReserveHoldCase(hold: AdminReserveHold) {
    try {
      setError(null);
      setReserveHoldMessage(null);
      setReserveHoldReleasingId(hold.id);
      const released = await releaseAdminReserveHold(hold.id, {
        reason: 'Released from Headmistress reserve case review.',
        metadata: {
          source: 'headmistress_dashboard_reserve_case_review',
          sourceId: hold.sourceId,
          sourceType: hold.sourceType,
        },
      });

      setReserveHolds((current) => current.map((row) => (row.id === released.id ? released : row)));
      setReserveHoldMessage(`Reserve hold ${hold.id} released.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reserve hold release failed');
    } finally {
      setReserveHoldReleasingId(null);
    }
  }

  async function reviewWishlistReservation(reservation: AdminWishlistReservation, action: 'cancel' | 'expire') {
    const note = wishlistReservationReviewNotes[reservation.id]?.trim()
      || (action === 'cancel'
        ? 'Cancelled from Headmistress wishlist reservation review.'
        : 'Expired from Headmistress wishlist reservation review.');

    try {
      setError(null);
      setWishlistReservationMessage(null);
      setWishlistReservationUpdatingId(`${reservation.id}:${action}`);
      const updated = await reviewAdminWishlistReservation(reservation.id, { action, note });

      setWishlistReservations((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setWishlistReservationReviewNotes((current) => {
        const next = { ...current };
        delete next[reservation.id];
        return next;
      });
      setWishlistReservationMessage(`Wishlist reservation ${reservation.id} ${action === 'cancel' ? 'cancelled' : 'expired'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Wishlist reservation ${action} failed`);
    } finally {
      setWishlistReservationUpdatingId(null);
    }
  }

  async function sweepStaleWishlistReservations() {
    try {
      setError(null);
      setWishlistReservationMessage(null);
      setWishlistReservationSweeping(true);
      const result = await expireStaleAdminWishlistReservations();
      const updatedById = new Map(result.items.map((reservation) => [reservation.id, reservation]));

      setWishlistReservations((current) => current.map((row) => updatedById.get(row.id) || row));
      setWishlistReservationMessage(result.expiredCount
        ? `Expired ${result.expiredCount} stale wishlist reservation(s).`
        : 'No stale wishlist reservations needed expiring.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wishlist stale reservation sweep failed');
    } finally {
      setWishlistReservationSweeping(false);
    }
  }

  async function reviewManualTopUpRequest(request: AdminManualTopUpRequest, action: 'approve' | 'reject') {
    const note = manualTopUpReviewNotes[request.id]?.trim()
      || (action === 'approve' ? 'Approved from Headmistress manual top-up queue.' : 'Rejected from Headmistress manual top-up queue.');

    try {
      setError(null);
      setManualTopUpMessage(null);
      setManualTopUpUpdatingId(`${request.id}:${action}`);
      const updated = action === 'approve'
        ? await approveAdminManualTopUpRequest(request.id, { note })
        : await rejectAdminManualTopUpRequest(request.id, { note });

      setManualTopUpRequests((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setManualTopUpMessage(`Manual top-up ${request.id} ${action === 'approve' ? 'approved and credited' : 'rejected'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Manual top-up ${action} failed`);
    } finally {
      setManualTopUpUpdatingId(null);
    }
  }

  const pendingManualTopUpRequests = useMemo(
    () => manualTopUpRequests.filter((request) => String(request.status || '').toLowerCase().includes('pending')),
    [manualTopUpRequests],
  );

  const manualTopUpSummary = useMemo(() => ({
    pendingCount: pendingManualTopUpRequests.length,
    pendingCredits: pendingManualTopUpRequests.reduce((sum, request) => sum + manualTopUpCredits(request), 0),
    creditedCount: manualTopUpRequests.filter((request) => String(request.status || '').toLowerCase() === 'credited').length,
    rejectedCount: manualTopUpRequests.filter((request) => String(request.status || '').toLowerCase() === 'rejected').length,
  }), [manualTopUpRequests, pendingManualTopUpRequests]);

  async function reviewPayoutRequest(request: AdminPayoutRequest, action: 'approve' | 'reject' | 'mark-paid') {
    const note = payoutRequestReviewNotes[request.id]?.trim()
      || (action === 'approve'
        ? 'Approved from Headmistress payout request queue.'
        : action === 'reject'
          ? 'Rejected from Headmistress payout request queue.'
          : 'Marked paid from Headmistress payout request queue.');

    try {
      setError(null);
      setPayoutRequestMessage(null);
      setPayoutRequestUpdatingId(`${request.id}:${action}`);

      const payload = {
        note,
        reason: note,
        ...(action === 'mark-paid' ? { processorReference: `manual-payout-${request.id}-${Date.now()}` } : {}),
        metadata: {
          source: 'headmistress_dashboard_payout_request_review',
          previousStatus: request.status,
          action,
        },
      };

      const updated = await reviewAdminEconomyPayout(request.id, {
        ...payload,
        action: action === 'approve' ? 'APPROVE' : action === 'reject' ? 'REJECT' : 'MARK_PAID',
        status: action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'PAID',
      });

      setPayoutRequests((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setPayoutRequestMessage(`Payout request ${request.id} ${action === 'mark-paid' ? 'marked paid' : action === 'approve' ? 'approved' : 'rejected'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Payout request ${action} failed`);
    } finally {
      setPayoutRequestUpdatingId(null);
    }
  }

  const payoutRequestSummary = useMemo(() => {
    const pending = payoutRequests.filter((request) => canApprovePayoutRequest(request.status));
    const approved = payoutRequests.filter((request) => canMarkPayoutRequestPaid(request.status));
    return {
      pendingCount: pending.length,
      pendingTotal: pending.reduce((sum, request) => sum + asNumber(request.amount), 0),
      approvedCount: approved.length,
      paidCount: payoutRequests.filter((request) => String(request.status || '').toUpperCase() === 'PAID').length,
      rejectedCount: payoutRequests.filter((request) => String(request.status || '').toUpperCase() === 'REJECTED').length,
    };
  }, [payoutRequests]);

  const reserveHoldSummary = useMemo(() => {
    const held = reserveHolds.filter((hold) => String(hold.status || '').toUpperCase() === 'HELD');
    const released = reserveHolds.filter((hold) => String(hold.status || '').toUpperCase() === 'RELEASED');
    return {
      heldCount: held.length,
      heldTotal: held.reduce((sum, hold) => sum + asNumber(hold.amount), 0),
      releasedCount: released.length,
    };
  }, [reserveHolds]);

  const wishlistReservationSummary = useMemo(() => {
    const active = wishlistReservations.filter((reservation) => String(reservation.status || '').toUpperCase() === 'ACTIVE');
    const expired = wishlistReservations.filter((reservation) => String(reservation.status || '').toUpperCase() === 'EXPIRED');
    const purchased = wishlistReservations.filter((reservation) => String(reservation.status || '').toUpperCase() === 'PURCHASED');
    const creators = new Set(wishlistReservations.map((reservation) => reservation.mistressUserId).filter(Boolean));

    return {
      activeCount: active.length,
      creatorCount: creators.size,
      expiredCount: expired.length,
      purchasedCount: purchased.length,
    };
  }, [wishlistReservations]);

  const payoutBatchCandidates = useMemo<PayoutBatchCandidate[]>(
    () => financeActionQueue
      .map((item) => {
        const decision = persistedFinanceQueueDecisions.get(item.id);
        if (!decision) return null;
        if (!['PROVIDER_HANDOFF', 'EXPORT_READY'].includes(decision.status)) return null;
        if (item.sourceType !== 'payout_review') return null;
        return { decision, item };
      })
      .filter((row): row is PayoutBatchCandidate => Boolean(row)),
    [financeActionQueue, persistedFinanceQueueDecisions],
  );

  const payoutBatchTotal = useMemo(
    () => payoutBatchCandidates.reduce((sum, row) => sum + row.item.amount, 0),
    [payoutBatchCandidates],
  );

  const payoutExportText = useMemo(
    () => payoutBatchCsv(payoutBatchCandidates),
    [payoutBatchCandidates],
  );

  const payoutBatchStatusCounts = useMemo(
    () => payoutBatches.reduce<Record<string, number>>((totals, batch) => {
      const status = String(batch.status || 'UNKNOWN').toUpperCase();
      totals[status] = (totals[status] || 0) + 1;
      return totals;
    }, {}),
    [payoutBatches],
  );

  const topMistresses = useMemo(
    () => users
      .filter((user) => user.role === 'MISTRESS' || user.role === 'HEADMISTRESS')
      .sort((a, b) => asNumber(b.wallet?.balance) - asNumber(a.wallet?.balance))
      .slice(0, 5),
    [users],
  );

  const topSubs = useMemo(
    () => users
      .filter((user) => user.role === 'SUB')
      .sort((a, b) => asNumber(b.wallet?.balance) - asNumber(a.wallet?.balance))
      .slice(0, 5),
    [users],
  );

  const flaggedUsers = useMemo(
    () => users
      .filter((user) => user.status !== 'ACTIVE' || !user.isAdult)
      .slice(0, 6),
    [users],
  );

  const verification = useMemo(() => {
    const adultConfirmed = users.filter((user) => user.isAdult).length;
    const adultMissing = users.length - adultConfirmed;
    const pending = users.filter((user) => user.status === 'PENDING_VERIFICATION').length;
    return { adultConfirmed, adultMissing, pending };
  }, [users]);

  const complianceSummary = useMemo(
    () => buildAdminComplianceSummary(compliance, overview?.counts.moderationOpen ?? moderation.length),
    [compliance, moderation.length, overview?.counts.moderationOpen],
  );
  const complianceSummaryCards = useMemo(
    () => adminComplianceSummaryCards(complianceSummary),
    [complianceSummary],
  );

  const moderationQueue = useMemo(
    () => [...moderation]
      .sort((a, b) => Number(b.priority) - Number(a.priority))
      .slice(0, 5),
    [moderation],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background, padding: mxTheme.spacing.lg }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900' }}>Headmistress Dashboard</Text>
      <Text style={{ color: mxTheme.colors.muted, marginTop: 6, marginBottom: mxTheme.spacing.md }}>
        Platform revenue, safety, compliance, access, and audit status in one owner view.
      </Text>

      <Pressable
        onPress={refresh}
        style={{
          backgroundColor: mxTheme.colors.accent,
          borderRadius: mxTheme.radius.md,
          padding: mxTheme.spacing.md,
          marginBottom: mxTheme.spacing.md,
        }}
      >
        <Text style={{ color: mxTheme.colors.text, textAlign: 'center', fontWeight: '900' }}>
          {loading ? 'Refreshing...' : 'Refresh Dashboard'}
        </Text>
      </Pressable>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: mxTheme.spacing.md }}>{error}</Text> : null}
      {loading ? <Text style={{ color: mxTheme.colors.muted, marginBottom: mxTheme.spacing.md }}>Loading owner metrics...</Text> : null}

      <View style={panelStyle(mxTheme.colors.accent)}>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 12, fontWeight: '900' }}>Total Platform Revenue</Text>
        <Text style={{ color: mxTheme.colors.accentSoft, fontSize: 30, fontWeight: '900', marginTop: 4 }}>
          {formatCredits(totalRevenue)}
        </Text>
        <Text style={{ color: mxTheme.colors.muted, marginTop: 4 }}>
          Calculated from loaded incoming ledger rows using platform amount when present.
        </Text>
      </View>

      <SectionTitle title="Revenue By System" subtitle="Current ledger-backed totals grouped by product surface." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {revenueBySystem.map((row) => (
          <MetricCard key={row.key} label={row.label} value={formatCredits(row.total)} />
        ))}
      </View>

      <SectionTitle title="Platform Finance And Payout Review" subtitle="Owner-side money view for platform share, creator exposure, and provider handoff gaps." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Gross Receipts" value={formatCredits(financeSummary.grossReceipts)} />
        <MetricCard label="Platform Fees" value={formatCredits(financeSummary.platformFees)} tone={mxTheme.colors.accentSoft} />
        <MetricCard label="Creator Net" value={formatCredits(financeSummary.creatorNet)} tone={mxTheme.colors.success} />
        <MetricCard label="Take Rate" value={formatPercent(financeSummary.takeRate)} tone={mxTheme.colors.accentSoft} />
        <MetricCard label="Processor Fee Estimate" value={formatCredits(financeSummary.processorFeeEstimate)} tone={mxTheme.colors.warning} />
        <MetricCard label="Refund/Dispute Rows" value={financeSummary.refundAndDisputeRows.length} tone={financeSummary.refundAndDisputeRows.length ? '#ff6b6b' : mxTheme.colors.success} />
      </View>
      {adminBankSummary || adminPayoutHealth ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <MetricCard label="Open Top-Up Reviews" value={adminBankSummary?.totals.openTopUpReviewCount ?? 0} tone={(adminBankSummary?.totals.openTopUpReviewCount ?? 0) ? mxTheme.colors.warning : mxTheme.colors.success} />
          <MetricCard label="Pending Payouts" value={adminBankSummary?.totals.pendingPayoutCount ?? adminPayoutHealth?.summary.openPayoutRequests ?? 0} tone={(adminBankSummary?.totals.pendingPayoutCount ?? adminPayoutHealth?.summary.openPayoutRequests ?? 0) ? mxTheme.colors.warning : mxTheme.colors.success} />
          <MetricCard label="Held Reserves" value={formatBatchMoney(adminBankSummary?.totals.heldReserveAmount ?? 0, adminBankSummary?.currency || 'AUD')} tone={(adminBankSummary?.totals.heldReserveAmount ?? 0) ? '#ff6b6b' : mxTheme.colors.success} />
          <MetricCard label="Batch Review Flags" value={adminPayoutHealth?.summary.batchesNeedingReview ?? adminBankSummary?.totals.payoutBatchesNeedingReview ?? 0} tone={(adminPayoutHealth?.summary.batchesNeedingReview ?? adminBankSummary?.totals.payoutBatchesNeedingReview ?? 0) ? mxTheme.colors.warning : mxTheme.colors.success} />
        </View>
      ) : null}
      <View style={panelStyle()}>
        <SmallLine label="Revenue rows counted" value={financeSummary.revenueRows.length} tone={mxTheme.colors.accentSoft} />
        <SmallLine label="Manual top-up/payment-intent rows" value={financeSummary.manualTopUps} tone={financeSummary.manualTopUps ? mxTheme.colors.warning : mxTheme.colors.muted} />
        <SmallLine label="Refund/chargeback/dispute exposure" value={formatCredits(financeSummary.refundTotal)} tone={financeSummary.refundTotal ? '#ff6b6b' : mxTheme.colors.success} />
        {adminBankSummary ? <SmallLine label="Admin economy bank snapshot" value={new Date(adminBankSummary.generatedAt).toLocaleString()} tone={mxTheme.colors.accentSoft} /> : null}
        {adminEconomyProviderReadiness ? <SmallLine label="Provider readiness" value={adminEconomyProviderReadiness.status} tone={adminEconomyProviderReadiness.status === 'BLOCKED' ? '#ff6b6b' : mxTheme.colors.warning} /> : null}
        <Text style={{ color: mxTheme.colors.muted, marginTop: 8 }}>
          Processor fees are estimated for planning only until the payment provider returns real fee and dispute data.
        </Text>
      </View>

      <SectionTitle title="Creator Payout Review" subtitle="Mistress balances and ledger split rows that should feed future payout batches and statements." />
      {payoutReviewRows.map((row, index) => (
        <View key={row.user.id} style={panelStyle(row.disputeExposure ? mxTheme.colors.warning : mxTheme.colors.border)}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{index + 1}. {userLabel(row.user)}</Text>
          <SmallLine label="Estimated creator net" value={formatCredits(row.creatorNet)} tone={mxTheme.colors.success} />
          <SmallLine label="Platform fees on creator rows" value={formatCredits(row.platformFees)} tone={mxTheme.colors.accentSoft} />
          <SmallLine label="Wallet balance" value={`${row.user.wallet?.balance ?? 0} ${row.user.wallet?.currency || 'CREDITS'}`} />
          <SmallLine label="Statement rows" value={row.rows} />
          <SmallLine label="Dispute exposure" value={formatCredits(row.disputeExposure)} tone={row.disputeExposure ? '#ff6b6b' : mxTheme.colors.success} />
        </View>
      ))}
      {payoutReviewRows.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No creator payout rows loaded.</Text> : null}

      <SectionTitle title="Provider And Dispute Readiness" subtitle="What the owner view can show now versus what still needs payment-provider wiring." />
      {providerReadiness.map((item) => (
        <View key={item.key} style={panelStyle(item.tone)}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{item.label}</Text>
          <SmallLine label="Status" value={item.status} tone={item.tone} />
          <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{item.detail}</Text>
        </View>
      ))}

      <SectionTitle title="Policy Guard Rollups" subtitle="Escalated Quick Check and Sub Vault review risks surfaced for Headmistress oversight." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Quick Check Escalated" value={quickCheckPolicyRollup?.totals.escalated ?? 0} tone={(quickCheckPolicyRollup?.totals.escalated ?? 0) ? '#ff6b6b' : mxTheme.colors.success} />
        <MetricCard label="Quick Check Blocked" value={quickCheckPolicyRollup?.totals.closureBlocked ?? 0} tone={(quickCheckPolicyRollup?.totals.closureBlocked ?? 0) ? mxTheme.colors.warning : mxTheme.colors.success} />
        <MetricCard label="Unsafe Terms" value={quickCheckPolicyRollup?.totals.unsafeTerm ?? 0} tone={(quickCheckPolicyRollup?.totals.unsafeTerm ?? 0) ? '#ff6b6b' : mxTheme.colors.success} />
        <MetricCard label="Vault Submitted" value={subVaultPolicyRollup?.totals.submitted ?? 0} tone={(subVaultPolicyRollup?.totals.submitted ?? 0) ? mxTheme.colors.warning : mxTheme.colors.success} />
        <MetricCard label="Vault Warnings" value={subVaultPolicyRollup?.totals.reviewWarning ?? 0} tone={(subVaultPolicyRollup?.totals.reviewWarning ?? 0) ? mxTheme.colors.warning : mxTheme.colors.success} />
        <MetricCard label="Vault Revoked" value={subVaultPolicyRollup?.totals.revoked ?? 0} tone={(subVaultPolicyRollup?.totals.revoked ?? 0) ? '#ff6b6b' : mxTheme.colors.muted} />
      </View>
      {policyGuardQueueRows.map((row) => (
        <View key={row.id} style={panelStyle(row.tone)}>
          <Text style={{ color: row.tone, fontSize: 11, fontWeight: '900' }}>{row.surface.toUpperCase()} / {row.status.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900', marginTop: 4 }}>{row.title}</Text>
          <SmallLine label="Owner" value={row.owner} tone={mxTheme.colors.accentSoft} />
          <SmallLine label="Updated" value={row.updatedAt ? new Date(row.updatedAt).toLocaleString() : 'Not recorded'} />
          <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{row.detail}</Text>
          <Text style={{ color: row.tone, marginTop: 6, fontWeight: '900' }}>{policyGuardSummary(row.guards)}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: mxTheme.spacing.sm }}>
            {row.guards.map((guard) => {
              const tone = policyGuardTone(guard.severity);
              return (
                <View key={`${row.id}-${guard.label}-${guard.status}`} style={{ borderColor: tone, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, marginRight: 6, marginBottom: 6 }}>
                  <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{guard.label.toUpperCase()} / {guard.status.toUpperCase()}</Text>
                </View>
              );
            })}
          </View>
          {onOpenPolicyGuardHandoff ? (
            <Pressable
              onPress={() => onOpenPolicyGuardHandoff({
                view: row.targetView,
                itemId: row.targetItemId,
                source: row.targetView === 'quickCheckZone' ? 'quick-check' : 'sub-vault',
                label: row.title,
              })}
              style={{
                alignSelf: 'flex-start',
                borderColor: row.tone,
                borderRadius: 999,
                borderWidth: 1,
                marginTop: mxTheme.spacing.sm,
                paddingHorizontal: mxTheme.spacing.sm,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: row.tone, fontSize: 11, fontWeight: '900' }}>{row.handoffLabel.toUpperCase()}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      {policyGuardQueueRows.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No Quick Check or Sub Vault policy guard risks loaded.</Text> : null}

      <SectionTitle title="Wishlist Reservation Review" subtitle="Command Centre view of Sub reserve-interest signals before purchase or expiry." />
      {wishlistReservationMessage ? <Text style={{ color: mxTheme.colors.success, marginBottom: mxTheme.spacing.sm }}>{wishlistReservationMessage}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Active Interest" value={wishlistReservationSummary.activeCount} tone={wishlistReservationSummary.activeCount ? mxTheme.colors.accentSoft : mxTheme.colors.success} />
        <MetricCard label="Purchased" value={wishlistReservationSummary.purchasedCount} tone={mxTheme.colors.success} />
        <MetricCard label="Expired" value={wishlistReservationSummary.expiredCount} tone={wishlistReservationSummary.expiredCount ? mxTheme.colors.warning : mxTheme.colors.muted} />
        <MetricCard label="Creators" value={wishlistReservationSummary.creatorCount} tone={mxTheme.colors.accentSoft} />
      </View>
      <Pressable
        disabled={wishlistReservationSweeping || wishlistReservations.length === 0}
        onPress={() => { void sweepStaleWishlistReservations(); }}
        style={{
          backgroundColor: wishlistReservations.length ? mxTheme.colors.accent : mxTheme.colors.surfaceSoft,
          borderRadius: mxTheme.radius.sm,
          marginBottom: mxTheme.spacing.md,
          opacity: wishlistReservationSweeping || wishlistReservations.length === 0 ? 0.55 : 1,
          paddingHorizontal: mxTheme.spacing.md,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: mxTheme.colors.text, textAlign: 'center', fontWeight: '900' }}>
          {wishlistReservationSweeping ? 'Sweeping Stale Interest...' : 'Sweep Stale Reservations'}
        </Text>
      </Pressable>
      {wishlistReservations.slice(0, 6).map((reservation) => {
        const status = String(reservation.status || 'UNKNOWN').toUpperCase();
        const tone = wishlistReservationTone(status);
        const mistress = users.find((user) => user.id === reservation.mistressUserId);
        const buyer = users.find((user) => user.id === reservation.buyerUserId);
        const isActive = status === 'ACTIVE';
        const expireKey = `${reservation.id}:expire`;
        const cancelKey = `${reservation.id}:cancel`;

        return (
          <View key={reservation.id} style={panelStyle(tone)}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{reservation.itemTitle || reservation.itemId}</Text>
            <SmallLine label="Status" value={status} tone={tone} />
            <SmallLine label="Mistress" value={mistress ? userLabel(mistress) : reservation.mistressUserId} tone={mxTheme.colors.accentSoft} />
            <SmallLine label="Sub" value={buyer ? userLabel(buyer) : reservation.buyerUserId} />
            <SmallLine label="Expires" value={reservation.expiresAt ? new Date(reservation.expiresAt).toLocaleString() : 'Not set'} tone={tone} />
            <SmallLine label="Audit note" value={reservation.auditNote || 'wishlist.reserve_interest'} />
            {reservation.reviewNote ? <SmallLine label="Review note" value={reservation.reviewNote} tone={mxTheme.colors.warning} /> : null}
            {reservation.reviewedAt ? <SmallLine label="Reviewed" value={new Date(reservation.reviewedAt).toLocaleString()} /> : null}
            {reservation.message ? <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{reservation.message}</Text> : null}
            <TextInput
              editable={isActive}
              onChangeText={(value: string) => setWishlistReservationReviewNotes((current) => ({ ...current, [reservation.id]: value }))}
              placeholder="Command Centre review note"
              placeholderTextColor={mxTheme.colors.muted}
              style={{
                backgroundColor: mxTheme.colors.surfaceSoft,
                borderColor: mxTheme.colors.border,
                borderRadius: mxTheme.radius.sm,
                borderWidth: 1,
                color: mxTheme.colors.text,
                marginTop: mxTheme.spacing.sm,
                padding: mxTheme.spacing.sm,
              }}
              value={wishlistReservationReviewNotes[reservation.id] || ''}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: mxTheme.spacing.sm }}>
              <Pressable
                disabled={!isActive || wishlistReservationUpdatingId === expireKey}
                onPress={() => { void reviewWishlistReservation(reservation, 'expire'); }}
                style={{
                  backgroundColor: isActive ? mxTheme.colors.warning : mxTheme.colors.surfaceSoft,
                  borderRadius: mxTheme.radius.sm,
                  marginRight: 8,
                  marginBottom: 8,
                  opacity: !isActive || wishlistReservationUpdatingId === expireKey ? 0.55 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {wishlistReservationUpdatingId === expireKey ? 'Expiring...' : 'Expire Interest'}
                </Text>
              </Pressable>
              <Pressable
                disabled={!isActive || wishlistReservationUpdatingId === cancelKey}
                onPress={() => { void reviewWishlistReservation(reservation, 'cancel'); }}
                style={{
                  backgroundColor: isActive ? '#ff6b6b' : mxTheme.colors.surfaceSoft,
                  borderRadius: mxTheme.radius.sm,
                  marginBottom: 8,
                  opacity: !isActive || wishlistReservationUpdatingId === cancelKey ? 0.55 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {wishlistReservationUpdatingId === cancelKey ? 'Cancelling...' : 'Cancel Interest'}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      {wishlistReservations.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No wishlist reservations loaded for Command Centre review.</Text> : null}

      <SectionTitle title="Manual Top-Up Verification Queue" subtitle="Owner review for PayID/manual money-in requests before wallet credits are released." />
      {manualTopUpMessage ? <Text style={{ color: mxTheme.colors.success, marginBottom: mxTheme.spacing.sm }}>{manualTopUpMessage}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Pending Requests" value={manualTopUpSummary.pendingCount} tone={manualTopUpSummary.pendingCount ? mxTheme.colors.warning : mxTheme.colors.success} />
        <MetricCard label="Pending Credits" value={formatCredits(manualTopUpSummary.pendingCredits)} tone={manualTopUpSummary.pendingCredits ? mxTheme.colors.accentSoft : mxTheme.colors.success} />
        <MetricCard label="Credited" value={manualTopUpSummary.creditedCount} tone={mxTheme.colors.success} />
        <MetricCard label="Rejected" value={manualTopUpSummary.rejectedCount} tone={manualTopUpSummary.rejectedCount ? '#ff6b6b' : mxTheme.colors.muted} />
      </View>
      {manualTopUpRequests.slice(0, 6).map((request) => {
        const status = String(request.status || 'UNKNOWN').toUpperCase();
        const isPending = status.includes('PENDING');
        const owner = users.find((user) => user.id === request.userId);
        const approveKey = `${request.id}:approve`;
        const rejectKey = `${request.id}:reject`;
        return (
          <View key={request.id} style={panelStyle(isPending ? mxTheme.colors.warning : status === 'CREDITED' ? mxTheme.colors.success : '#ff6b6b')}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>Manual top-up {request.id}</Text>
            <SmallLine label="Status" value={status} tone={isPending ? mxTheme.colors.warning : status === 'CREDITED' ? mxTheme.colors.success : '#ff6b6b'} />
            <SmallLine label="Sub" value={owner ? userLabel(owner) : request.userId} tone={mxTheme.colors.accentSoft} />
            <SmallLine label="Provider" value={request.provider || request.source || 'manual'} />
            <SmallLine label="Requested amount" value={formatBatchMoney(request.amount, request.currency || 'AUD')} />
            <SmallLine label="Credits to add" value={formatCredits(manualTopUpCredits(request))} tone={mxTheme.colors.accentSoft} />
            <SmallLine label="Created" value={request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Not recorded'} />
            <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{manualTopUpReferenceText(request.reference)}</Text>
            <TextInput
              editable={isPending}
              onChangeText={(value: string) => setManualTopUpReviewNotes((current) => ({ ...current, [request.id]: value }))}
              placeholder="Review note for audit trail"
              placeholderTextColor={mxTheme.colors.muted}
              style={{
                backgroundColor: mxTheme.colors.surfaceSoft,
                borderColor: mxTheme.colors.border,
                borderRadius: mxTheme.radius.sm,
                borderWidth: 1,
                color: mxTheme.colors.text,
                marginTop: mxTheme.spacing.sm,
                padding: mxTheme.spacing.sm,
              }}
              value={manualTopUpReviewNotes[request.id] || ''}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: mxTheme.spacing.sm }}>
              <Pressable
                disabled={!isPending || manualTopUpUpdatingId === approveKey}
                onPress={() => { void reviewManualTopUpRequest(request, 'approve'); }}
                style={{
                  backgroundColor: isPending ? mxTheme.colors.success : mxTheme.colors.surfaceSoft,
                  borderRadius: mxTheme.radius.sm,
                  marginRight: 8,
                  marginBottom: 8,
                  opacity: !isPending || manualTopUpUpdatingId === approveKey ? 0.55 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {manualTopUpUpdatingId === approveKey ? 'Crediting...' : 'Approve + Credit'}
                </Text>
              </Pressable>
              <Pressable
                disabled={!isPending || manualTopUpUpdatingId === rejectKey}
                onPress={() => { void reviewManualTopUpRequest(request, 'reject'); }}
                style={{
                  backgroundColor: isPending ? '#ff6b6b' : mxTheme.colors.surfaceSoft,
                  borderRadius: mxTheme.radius.sm,
                  marginBottom: 8,
                  opacity: !isPending || manualTopUpUpdatingId === rejectKey ? 0.55 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {manualTopUpUpdatingId === rejectKey ? 'Rejecting...' : 'Reject'}
                </Text>
              </Pressable>
            </View>
            {request.walletTransactionId ? (
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Wallet transaction {request.walletTransactionId}</Text>
            ) : null}
          </View>
        );
      })}
      {manualTopUpRequests.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No manual top-up requests are waiting for review.</Text> : null}

      <SectionTitle title="Payout And Dispute Action Queue" subtitle="Local owner decisions for provider handoff, payout holds, failed payments, and export-ready rows." />
      {financeQueueMessage ? <Text style={{ color: mxTheme.colors.success, marginBottom: mxTheme.spacing.sm }}>{financeQueueMessage}</Text> : null}
      <View style={panelStyle(financeQueueAutomationCandidates.length ? mxTheme.colors.accentSoft : mxTheme.colors.border)}>
        <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>Queue Automation</Text>
        <SmallLine label="Rows needing decision" value={financeQueueAutomationCandidates.length} tone={financeQueueAutomationCandidates.length ? mxTheme.colors.warning : mxTheme.colors.success} />
        <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>
          Auto-review holds disputes, failed payments, and manual money-in checks while moving clean payout rows toward provider handoff.
        </Text>
        <Pressable
          disabled={financeQueueAutomating || financeQueueAutomationCandidates.length === 0}
          onPress={() => { void autoCreateFinanceQueueDecisions(); }}
          style={{
            backgroundColor: financeQueueAutomationCandidates.length ? mxTheme.colors.accentSoft : mxTheme.colors.surfaceSoft,
            borderRadius: mxTheme.radius.sm,
            marginTop: mxTheme.spacing.sm,
            opacity: financeQueueAutomating || financeQueueAutomationCandidates.length === 0 ? 0.55 : 1,
            padding: mxTheme.spacing.sm,
          }}
        >
          <Text style={{ color: mxTheme.colors.text, textAlign: 'center', fontWeight: '900' }}>
            {financeQueueAutomating ? 'Automating Queue...' : `Auto Queue ${financeQueueAutomationCandidates.length} Row${financeQueueAutomationCandidates.length === 1 ? '' : 's'}`}
          </Text>
        </Pressable>
      </View>
      {financeActionQueue.map((item) => {
        const persistedDecision = persistedFinanceQueueDecisions.get(item.id);
        const decision = financeQueueDecisions[item.id] || persistedDecision?.status || 'PENDING';
        return (
          <View key={item.id} style={panelStyle(item.tone)}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{item.title}</Text>
            <SmallLine label="Priority" value={item.priority} tone={item.tone} />
            <SmallLine label="Amount" value={formatCredits(item.amount)} tone={mxTheme.colors.accentSoft} />
            <SmallLine label="Decision" value={FINANCE_QUEUE_LABELS[decision]} tone={financeQueueTone(decision)} />
            <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{item.detail}</Text>
            <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{item.recommendedAction}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: mxTheme.spacing.sm }}>
              {FINANCE_QUEUE_ACTIONS.map((status) => (
                <Pressable
                  key={status}
                  onPress={() => { void setFinanceQueueDecision(item, status); }}
                  style={{
                    backgroundColor: decision === status ? financeQueueTone(status) : mxTheme.colors.surfaceSoft,
                    borderColor: financeQueueTone(status),
                    borderWidth: 1,
                    borderRadius: mxTheme.radius.sm,
                    paddingHorizontal: mxTheme.spacing.sm,
                    paddingVertical: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                    {FINANCE_QUEUE_LABELS[status]}
                  </Text>
                </Pressable>
              ))}
            </View>
            {persistedDecision ? (
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 4 }}>
                Last saved {new Date(persistedDecision.createdAt).toLocaleString()}
                {persistedDecision.reserveHoldId ? ` / reserve ${persistedDecision.reserveHoldId}` : ''}
              </Text>
            ) : null}
          </View>
        );
      })}
      {financeActionQueue.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No payout, dispute, failed-payment, or manual money-in rows loaded.</Text> : null}

      <SectionTitle title="Reserve Hold Case Review" subtitle="Hold-review decisions that need owner follow-up before creator payout release." />
      {reserveHoldMessage ? <Text style={{ color: mxTheme.colors.success, marginBottom: mxTheme.spacing.sm }}>{reserveHoldMessage}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Held Cases" value={reserveHoldSummary.heldCount} tone={reserveHoldSummary.heldCount ? '#ff6b6b' : mxTheme.colors.success} />
        <MetricCard label="Held Amount" value={formatBatchMoney(reserveHoldSummary.heldTotal, 'AUD')} tone={reserveHoldSummary.heldTotal ? mxTheme.colors.warning : mxTheme.colors.success} />
        <MetricCard label="Released Cases" value={reserveHoldSummary.releasedCount} tone={mxTheme.colors.success} />
      </View>
      {reserveHolds.slice(0, 6).map((hold) => {
        const status = String(hold.status || 'UNKNOWN').toUpperCase();
        const creator = hold.mistressId ? users.find((user) => user.id === hold.mistressId) : undefined;
        const heldAt = hold.heldAt || hold.createdAt;
        return (
          <View key={hold.id} style={panelStyle(reserveHoldTone(status))}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>Reserve {hold.id}</Text>
            <SmallLine label="Status" value={status} tone={reserveHoldTone(status)} />
            <SmallLine label="Creator" value={creator ? userLabel(creator) : hold.mistressId || 'Unknown'} tone={mxTheme.colors.accentSoft} />
            <SmallLine label="Amount" value={formatBatchMoney(hold.amount, hold.currency || 'AUD')} tone={mxTheme.colors.warning} />
            <SmallLine label="Source" value={`${hold.sourceType || 'manual'} / ${hold.sourceId || 'unlinked'}`} />
            <SmallLine label="Held at" value={heldAt ? new Date(heldAt).toLocaleString() : 'Not recorded'} />
            {hold.reason ? <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{hold.reason}</Text> : null}
            <Pressable
              disabled={status !== 'HELD' || reserveHoldReleasingId === hold.id}
              onPress={() => { void releaseReserveHoldCase(hold); }}
              style={{
                backgroundColor: status === 'HELD' ? mxTheme.colors.success : mxTheme.colors.surfaceSoft,
                borderRadius: mxTheme.radius.sm,
                marginTop: mxTheme.spacing.sm,
                opacity: status !== 'HELD' || reserveHoldReleasingId === hold.id ? 0.55 : 1,
                padding: mxTheme.spacing.sm,
              }}
            >
              <Text style={{ color: mxTheme.colors.text, textAlign: 'center', fontWeight: '900' }}>
                {reserveHoldReleasingId === hold.id ? 'Releasing Hold...' : status === 'HELD' ? 'Release Hold' : 'Hold Closed'}
              </Text>
            </Pressable>
          </View>
        );
      })}
      {reserveHolds.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No reserve hold cases loaded.</Text> : null}

      <SectionTitle title="Payout Request Review Queue" subtitle="Owner approval, rejection, and paid-state controls for Mistress cashout requests." />
      {payoutRequestMessage ? <Text style={{ color: mxTheme.colors.success, marginBottom: mxTheme.spacing.sm }}>{payoutRequestMessage}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Needs Approval" value={payoutRequestSummary.pendingCount} tone={payoutRequestSummary.pendingCount ? mxTheme.colors.warning : mxTheme.colors.success} />
        <MetricCard label="Requested Total" value={formatBatchMoney(payoutRequestSummary.pendingTotal, 'AUD')} tone={payoutRequestSummary.pendingTotal ? mxTheme.colors.accentSoft : mxTheme.colors.success} />
        <MetricCard label="Ready To Pay" value={payoutRequestSummary.approvedCount} tone={payoutRequestSummary.approvedCount ? mxTheme.colors.accentSoft : mxTheme.colors.muted} />
        <MetricCard label="Paid" value={payoutRequestSummary.paidCount} tone={mxTheme.colors.success} />
        <MetricCard label="Rejected" value={payoutRequestSummary.rejectedCount} tone={payoutRequestSummary.rejectedCount ? '#ff6b6b' : mxTheme.colors.muted} />
      </View>
      {payoutRequests.slice(0, 6).map((request) => {
        const status = String(request.status || 'UNKNOWN').toUpperCase();
        const creator = users.find((user) => user.id === request.userId);
        const approveKey = `${request.id}:approve`;
        const rejectKey = `${request.id}:reject`;
        const paidKey = `${request.id}:mark-paid`;
        const mayApprove = canApprovePayoutRequest(status);
        const mayReject = canRejectPayoutRequest(status);
        const mayMarkPaid = canMarkPayoutRequestPaid(status);
        return (
          <View key={request.id} style={panelStyle(payoutRequestTone(status))}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>Payout request {request.id}</Text>
            <SmallLine label="Status" value={status} tone={payoutRequestTone(status)} />
            <SmallLine label="Creator" value={creator ? userLabel(creator) : request.userId} tone={mxTheme.colors.accentSoft} />
            <SmallLine label="Amount" value={formatBatchMoney(request.amount, request.currency || 'AUD')} tone={mxTheme.colors.warning} />
            <SmallLine label="Provider" value={request.provider || 'manual_bank_payout'} />
            <SmallLine label="Payout account" value={request.payoutAccountId || 'Not linked'} />
            <SmallLine label="Batch" value={request.batchId || 'Not batched'} />
            <SmallLine label="Requested" value={(request.requestedAt || request.createdAt) ? new Date(request.requestedAt || request.createdAt || '').toLocaleString() : 'Not recorded'} />
            {request.note || request.reason ? <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{request.note || request.reason}</Text> : null}
            <TextInput
              editable={mayApprove || mayReject || mayMarkPaid}
              onChangeText={(value: string) => setPayoutRequestReviewNotes((current) => ({ ...current, [request.id]: value }))}
              placeholder="Decision note for payout audit trail"
              placeholderTextColor={mxTheme.colors.muted}
              style={{
                backgroundColor: mxTheme.colors.surfaceSoft,
                borderColor: mxTheme.colors.border,
                borderRadius: mxTheme.radius.sm,
                borderWidth: 1,
                color: mxTheme.colors.text,
                marginTop: mxTheme.spacing.sm,
                padding: mxTheme.spacing.sm,
              }}
              value={payoutRequestReviewNotes[request.id] || ''}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: mxTheme.spacing.sm }}>
              <Pressable
                disabled={!mayApprove || payoutRequestUpdatingId === approveKey}
                onPress={() => { void reviewPayoutRequest(request, 'approve'); }}
                style={{
                  backgroundColor: mayApprove ? mxTheme.colors.accentSoft : mxTheme.colors.surfaceSoft,
                  borderRadius: mxTheme.radius.sm,
                  marginRight: 8,
                  marginBottom: 8,
                  opacity: !mayApprove || payoutRequestUpdatingId === approveKey ? 0.55 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {payoutRequestUpdatingId === approveKey ? 'Approving...' : 'Approve'}
                </Text>
              </Pressable>
              <Pressable
                disabled={!mayMarkPaid || payoutRequestUpdatingId === paidKey}
                onPress={() => { void reviewPayoutRequest(request, 'mark-paid'); }}
                style={{
                  backgroundColor: mayMarkPaid ? mxTheme.colors.success : mxTheme.colors.surfaceSoft,
                  borderRadius: mxTheme.radius.sm,
                  marginRight: 8,
                  marginBottom: 8,
                  opacity: !mayMarkPaid || payoutRequestUpdatingId === paidKey ? 0.55 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {payoutRequestUpdatingId === paidKey ? 'Marking Paid...' : 'Mark Paid'}
                </Text>
              </Pressable>
              <Pressable
                disabled={!mayReject || payoutRequestUpdatingId === rejectKey}
                onPress={() => { void reviewPayoutRequest(request, 'reject'); }}
                style={{
                  backgroundColor: mayReject ? '#ff6b6b' : mxTheme.colors.surfaceSoft,
                  borderRadius: mxTheme.radius.sm,
                  marginBottom: 8,
                  opacity: !mayReject || payoutRequestUpdatingId === rejectKey ? 0.55 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {payoutRequestUpdatingId === rejectKey ? 'Rejecting...' : 'Reject'}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      {payoutRequests.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No payout requests loaded for review.</Text> : null}

      <SectionTitle title="Payout Batch Export Planner" subtitle="Build a provider-neutral draft payout batch from saved provider-handoff and export-ready payout decisions." />
      {payoutBatchMessage ? <Text style={{ color: mxTheme.colors.success, marginBottom: mxTheme.spacing.sm }}>{payoutBatchMessage}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Ready Decisions" value={payoutBatchCandidates.length} tone={payoutBatchCandidates.length ? mxTheme.colors.success : mxTheme.colors.warning} />
        <MetricCard label="Planned Batch Total" value={formatCredits(payoutBatchTotal)} tone={mxTheme.colors.accentSoft} />
        <MetricCard label="Draft Batches" value={payoutBatchStatusCounts.DRAFT || 0} tone={mxTheme.colors.warning} />
        <MetricCard label="In Flight" value={(payoutBatchStatusCounts.SCHEDULED || 0) + (payoutBatchStatusCounts.PROCESSING || 0)} tone={mxTheme.colors.accentSoft} />
        <MetricCard label="Paid" value={payoutBatchStatusCounts.PAID || 0} tone={mxTheme.colors.success} />
        <MetricCard label="Failed / Cancelled" value={(payoutBatchStatusCounts.FAILED || 0) + (payoutBatchStatusCounts.CANCELLED || 0)} tone={(payoutBatchStatusCounts.FAILED || 0) ? '#ff6b6b' : mxTheme.colors.muted} />
      </View>
      <View style={panelStyle(payoutBatchCandidates.length ? mxTheme.colors.success : mxTheme.colors.warning)}>
        <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>Draft Export</Text>
        <Text style={{ color: mxTheme.colors.muted, marginTop: 6, fontSize: 12 }}>{payoutExportText}</Text>
        <Pressable
          onPress={() => { void createDraftPayoutBatch(payoutBatchCandidates, payoutExportText, payoutBatchTotal); }}
          style={{
            backgroundColor: payoutBatchCandidates.length ? mxTheme.colors.success : mxTheme.colors.surfaceSoft,
            borderRadius: mxTheme.radius.sm,
            padding: mxTheme.spacing.sm,
            marginTop: mxTheme.spacing.sm,
          }}
        >
          <Text style={{ color: mxTheme.colors.text, textAlign: 'center', fontWeight: '900' }}>Create Draft Batch Record</Text>
        </Pressable>
        <Text style={{ color: mxTheme.colors.muted, marginTop: 8, fontSize: 11 }}>
          This prepares an owner-reviewed export pack. Real provider execution, bank file upload, and payout settlement are still separate production steps.
        </Text>
      </View>
      {payoutBatches.slice(0, 4).map((batch) => {
        const status = String(batch.status || 'DRAFT').toUpperCase();
        const statusTone = payoutBatchStatusTone(status);
        const storedExportText = typeof batch.metadata?.exportText === 'string' ? batch.metadata.exportText : null;
        const loadedExportText = payoutBatchExportTextById[batch.id];
        const exportText = loadedExportText || storedExportText;
        const reconciliation = payoutBatchReconciliationById[batch.id];
        const settlement = payoutBatchSettlementFromMetadata(batch);
        const settlementImportText = payoutBatchSettlementImportTextById[batch.id] || payoutBatchSettlementImportTemplate(batch);

        return (
          <View key={batch.id} style={panelStyle(statusTone)}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{batch.id}</Text>
            <SmallLine label="Status" value={status} tone={statusTone} />
            <SmallLine label="Method" value={batch.method || 'manual_bank_payout'} />
            <SmallLine label="Total" value={formatBatchMoney(batch.totalAmount, batch.currency)} tone={mxTheme.colors.accentSoft} />
            <SmallLine label="Created" value={new Date(batch.createdAt).toLocaleString()} />
            {batch.processedAt ? <SmallLine label="Processed" value={new Date(batch.processedAt).toLocaleString()} tone={mxTheme.colors.success} /> : null}
            {exportText ? (
              <Text style={{ color: mxTheme.colors.muted, marginTop: 8, fontSize: 11 }} numberOfLines={4}>
                {exportText}
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: mxTheme.spacing.sm }}>
              {PAYOUT_BATCH_STATUS_ACTIONS.map(({ status: nextStatus, label }) => {
                const active = status === nextStatus;
                const updating = payoutBatchUpdatingId === `${batch.id}:${nextStatus}`;
                const disabled = active || Boolean(payoutBatchUpdatingId);

                return (
                  <Pressable
                    key={nextStatus}
                    disabled={disabled}
                    onPress={() => { void setPayoutBatchStatus(batch, nextStatus); }}
                    style={{
                      backgroundColor: active ? payoutBatchStatusTone(nextStatus) : mxTheme.colors.surfaceSoft,
                      borderColor: payoutBatchStatusTone(nextStatus),
                      borderWidth: 1,
                      borderRadius: mxTheme.radius.sm,
                      opacity: disabled && !active ? 0.45 : 1,
                      paddingHorizontal: mxTheme.spacing.sm,
                      paddingVertical: 8,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                      {updating ? 'Saving...' : label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
              <Pressable
                disabled={Boolean(payoutBatchSettlingId)}
                onPress={() => { void handlePayoutBatchSettlement(batch); }}
                style={{
                  backgroundColor: mxTheme.colors.surfaceSoft,
                  borderColor: settlement ? mxTheme.colors.success : mxTheme.colors.accentSoft,
                  borderWidth: 1,
                  borderRadius: mxTheme.radius.sm,
                  opacity: payoutBatchSettlingId && payoutBatchSettlingId !== batch.id ? 0.45 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {payoutBatchSettlingId === batch.id ? 'Recording...' : 'Record Settlement'}
                </Text>
              </Pressable>
              <Pressable
                disabled={Boolean(payoutBatchReconcilingId)}
                onPress={() => { void handlePayoutBatchReconciliation(batch); }}
                style={{
                  backgroundColor: mxTheme.colors.surfaceSoft,
                  borderColor: payoutBatchReconciliationTone(reconciliation),
                  borderWidth: 1,
                  borderRadius: mxTheme.radius.sm,
                  opacity: payoutBatchReconcilingId && payoutBatchReconcilingId !== batch.id ? 0.45 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {payoutBatchReconcilingId === batch.id ? 'Checking...' : 'Reconcile'}
                </Text>
              </Pressable>
              <Pressable
                disabled={Boolean(payoutBatchImportingId)}
                onPress={() => { void handlePayoutBatchSettlementImport(batch); }}
                style={{
                  backgroundColor: mxTheme.colors.surfaceSoft,
                  borderColor: mxTheme.colors.warning,
                  borderWidth: 1,
                  borderRadius: mxTheme.radius.sm,
                  opacity: payoutBatchImportingId && payoutBatchImportingId !== batch.id ? 0.45 : 1,
                  paddingHorizontal: mxTheme.spacing.sm,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                  {payoutBatchImportingId === batch.id ? 'Importing...' : 'Import Settlement'}
                </Text>
              </Pressable>
              {([
                ['show', loadedExportText ? 'Hide CSV' : 'Load CSV'],
                ['download', 'Download CSV'],
                ['copy', 'Copy CSV'],
                ['share', 'Share CSV'],
              ] as Array<['show' | 'download' | 'copy' | 'share', string]>).map(([action, label]) => {
                const busy = payoutBatchExportingId === `${batch.id}:${action}`;

                return (
                  <Pressable
                    key={action}
                    disabled={Boolean(payoutBatchExportingId)}
                    onPress={() => {
                      if (action === 'show' && loadedExportText) {
                        hidePayoutBatchExport(batch.id);
                        return;
                      }
                      void handlePayoutBatchExport(batch, action);
                    }}
                    style={{
                      backgroundColor: action === 'download' ? mxTheme.colors.accent : mxTheme.colors.surfaceSoft,
                      borderColor: mxTheme.colors.accentSoft,
                      borderWidth: 1,
                      borderRadius: mxTheme.radius.sm,
                      opacity: payoutBatchExportingId && !busy ? 0.45 : 1,
                      paddingHorizontal: mxTheme.spacing.sm,
                      paddingVertical: 8,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: mxTheme.colors.text, fontSize: 11, fontWeight: '900' }}>
                      {busy ? 'Loading...' : label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={settlementImportText}
              onChangeText={(text: string) => setPayoutBatchSettlementImportTextById((current) => ({ ...current, [batch.id]: text }))}
              multiline
              selectTextOnFocus
              style={{
                backgroundColor: mxTheme.colors.background,
                borderColor: mxTheme.colors.border,
                borderRadius: mxTheme.radius.sm,
                borderWidth: 1,
                color: mxTheme.colors.text,
                fontSize: 11,
                marginTop: 4,
                minHeight: 72,
                padding: mxTheme.spacing.sm,
              }}
            />
            {loadedExportText ? (
              <TextInput
                value={loadedExportText}
                editable={false}
                multiline
                selectTextOnFocus
                style={{
                  backgroundColor: mxTheme.colors.background,
                  borderColor: mxTheme.colors.border,
                  borderRadius: mxTheme.radius.sm,
                  borderWidth: 1,
                  color: mxTheme.colors.text,
                  fontSize: 11,
                  marginTop: 4,
                  minHeight: 120,
                  padding: mxTheme.spacing.sm,
                }}
              />
            ) : null}
            {settlement ? (
              <View style={{ borderColor: mxTheme.colors.success, borderTopWidth: 1, marginTop: mxTheme.spacing.sm, paddingTop: mxTheme.spacing.sm }}>
                <SmallLine label="Settlement" value={settlement.status} tone={mxTheme.colors.success} />
                <SmallLine label="Provider Ref" value={settlement.providerReference} />
                <SmallLine label="Settled" value={new Date(settlement.settledAt).toLocaleString()} />
                <SmallLine label="Gross" value={formatBatchMoney(settlement.amount, settlement.currency)} />
                <SmallLine label="Fees" value={formatBatchMoney(settlement.feeAmount, settlement.currency)} />
                <SmallLine label="Net" value={formatBatchMoney(settlement.netAmount, settlement.currency)} tone={mxTheme.colors.success} />
                {settlement.note ? <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 6 }}>{settlement.note}</Text> : null}
              </View>
            ) : null}
            {reconciliation ? (
              <View style={{ borderColor: payoutBatchReconciliationTone(reconciliation), borderTopWidth: 1, marginTop: mxTheme.spacing.sm, paddingTop: mxTheme.spacing.sm }}>
                <SmallLine
                  label="Reconciliation"
                  value={reconciliation.readyForProvider ? 'Ready for provider payout' : reconciliation.settled ? 'Settled' : 'Needs review'}
                  tone={payoutBatchReconciliationTone(reconciliation)}
                />
                <SmallLine label="Rows" value={reconciliation.exportedRows} />
                <SmallLine label="Exported" value={formatBatchMoney(reconciliation.exportedAmount, reconciliation.currency)} />
                <SmallLine label="Difference" value={formatBatchMoney(reconciliation.difference, reconciliation.currency)} tone={Math.abs(reconciliation.difference) < 0.01 ? mxTheme.colors.success : '#ff6b6b'} />
                {reconciliation.settlement ? (
                  <>
                    <SmallLine label="Settlement Gross" value={formatBatchMoney(reconciliation.settlement.amount, reconciliation.currency)} tone={reconciliation.settlementAmountMatches ? mxTheme.colors.success : '#ff6b6b'} />
                    <SmallLine label="Settlement Fees" value={formatBatchMoney(reconciliation.settlement.feeAmount, reconciliation.currency)} />
                    <SmallLine label="Settlement Net" value={formatBatchMoney(reconciliation.settlement.netAmount, reconciliation.currency)} />
                  </>
                ) : null}
                <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 6 }}>{reconciliation.recommendation}</Text>
                {reconciliation.checks.map((check) => {
                  const tone = check.status === 'PASS' ? mxTheme.colors.success : check.status === 'FAIL' ? '#ff6b6b' : mxTheme.colors.warning;

                  return (
                    <Text key={check.key} style={{ color: tone, fontSize: 11, marginTop: 4 }}>
                      {check.label}: {check.detail}
                    </Text>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}

      <SectionTitle title="Platform Snapshot" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Total Users" value={overview?.counts.totalUsers ?? users.length} />
        <MetricCard label="Mistresses" value={overview?.counts.mistressCount ?? topMistresses.length} />
        <MetricCard label="Subs" value={overview?.counts.subCount ?? topSubs.length} />
        <MetricCard label="Open Reports" value={overview?.counts.moderationOpen ?? moderation.length} tone={mxTheme.colors.warning} />
        <MetricCard label="Pending Marketplace" value={overview?.counts.pendingMarketplaceApprovals ?? 0} tone={mxTheme.colors.warning} />
        <MetricCard label="Safety Risk Score" value={complianceSummary.riskScore} tone={complianceSummary.riskTone} />
      </View>

      <SectionTitle title="Top Mistresses" subtitle="Ranked by loaded wallet balance until richer earnings analytics lands." />
      {topMistresses.map((user, index) => (
        <View key={user.id} style={panelStyle()}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{index + 1}. {userLabel(user)}</Text>
          <SmallLine label="Status" value={`${user.role} / ${user.status}`} tone={mxTheme.colors.accentSoft} />
          <SmallLine label="Wallet" value={`${user.wallet?.balance ?? 0} ${user.wallet?.currency || 'CREDITS'}`} />
        </View>
      ))}
      {topMistresses.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No Mistress accounts loaded.</Text> : null}

      <SectionTitle title="Top Subs" subtitle="Ranked by loaded wallet balance." />
      {topSubs.map((user, index) => (
        <View key={user.id} style={panelStyle()}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{index + 1}. {userLabel(user)}</Text>
          <SmallLine label="Status" value={`${user.role} / ${user.status}`} tone={mxTheme.colors.accentSoft} />
          <SmallLine label="Wallet" value={`${user.wallet?.balance ?? 0} ${user.wallet?.currency || 'CREDITS'}`} />
        </View>
      ))}
      {topSubs.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No Sub accounts loaded.</Text> : null}

      <SectionTitle title="Reports And Moderation Queue" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Open" value={compliance?.counts.moderationOpen ?? overview?.counts.moderationOpen ?? moderation.length} tone={mxTheme.colors.warning} />
        <MetricCard label="Escalated" value={compliance?.counts.moderationEscalated ?? 0} tone="#ff6b6b" />
      </View>
      {moderationQueue.map((item) => (
        <View key={item.id} style={panelStyle(item.status === 'ESCALATED' ? '#ff6b6b' : mxTheme.colors.border)}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{item.title}</Text>
          <SmallLine label="Status" value={`${item.status} / ${item.area} / P${item.priority}`} tone={mxTheme.colors.warning} />
          <SmallLine label="Target" value={`${item.targetType || 'unknown'} ${item.targetId || ''}`.trim()} />
          {item.description ? <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{item.description}</Text> : null}
        </View>
      ))}
      {moderationQueue.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No moderation items loaded.</Text> : null}

      <SectionTitle title="Access Controls" subtitle="Block, ban, suspend, restore, and verification controls for flagged accounts." />
      {flaggedUsers.map((user) => (
        <View key={user.id} style={panelStyle(!user.isAdult || user.status === 'BANNED' ? '#ff6b6b' : mxTheme.colors.warning)}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{userLabel(user)}</Text>
          <SmallLine label="Account" value={`${user.role} / ${user.status} / ${user.isAdult ? 'age confirmed' : 'age missing'}`} />
          <AdminUserStatusActionsPanel user={user} onUpdated={handleUserUpdated} />
        </View>
      ))}
      {flaggedUsers.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No flagged account access rows loaded.</Text> : null}

      <SectionTitle title="Verification And Age Gate" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <MetricCard label="Adult Confirmed" value={verification.adultConfirmed} tone={mxTheme.colors.success} />
        <MetricCard label="Adult Missing" value={verification.adultMissing} tone={verification.adultMissing ? '#ff6b6b' : mxTheme.colors.success} />
        <MetricCard label="Pending Verification" value={verification.pending} tone={verification.pending ? mxTheme.colors.warning : mxTheme.colors.success} />
        <MetricCard label="Suspended Users" value={compliance?.counts.suspendedUsers ?? 0} tone={mxTheme.colors.warning} />
      </View>

      <SectionTitle title="Compliance Flags" />
      <View style={panelStyle()}>
        <SmallLine label="Content compliance flags" value={`${compliance?.counts.moderationOpen ?? 0} open / ${compliance?.counts.moderationEscalated ?? 0} escalated`} tone={mxTheme.colors.warning} />
        <SmallLine label="Banned users" value={compliance?.counts.bannedUsers ?? 0} tone={(compliance?.counts.bannedUsers ?? 0) ? '#ff6b6b' : mxTheme.colors.success} />
        <SmallLine label="Risk posture" value={`${complianceSummary.riskLabel} / ${complianceSummary.actionLabel}`} tone={complianceSummary.riskTone} />
        <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{complianceSummary.actionDetail}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {complianceSummaryCards.map((card) => (
          <MetricCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </View>

      <SectionTitle title="Audit Log" subtitle="Recent compliance actions, with full filtering planned for the later audit pass." />
      {compliance?.recentAuditLogs.map((log) => (
        <View key={log.id} style={panelStyle()}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{log.action}</Text>
          <SmallLine label="Actor" value={log.actor?.displayName || log.actor?.username || log.actor?.id || 'System'} />
          <SmallLine label="Target" value={log.targetId || 'none'} />
          <SmallLine label="When" value={new Date(log.createdAt).toLocaleString()} />
        </View>
      ))}
      {!compliance?.recentAuditLogs.length ? <Text style={{ color: mxTheme.colors.muted }}>No recent audit rows loaded.</Text> : null}
    </ScrollView>
  );
}
