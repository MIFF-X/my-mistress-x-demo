import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import {
  closeMarketplaceFulfilmentSlaProviderIncidentTicket,
  createMarketplaceSellerOrderReceiptExportBatch,
  exportMarketplaceSellerOrderReceiptsCsv,
  getMarketplaceOrderReceipt,
  inspectMarketplaceFulfilmentSlaProviderIncidentTicketConfig,
  listMarketplaceFulfilmentAnalytics,
  listMarketplaceFulfilmentSlaAlertJobStatus,
  listMarketplaceFulfilmentSlaProviderWebhookRetryQueue,
  listMarketplaceFulfilmentEvents,
  listMarketplaceFulfilmentSlaPolicy,
  listMarketplaceOrderTimeline,
  listMarketplaceSellerOrderReceiptExportBatches,
  listMarketplaceSellerOrders,
  MarketplaceFulfilmentAnalytics,
  MarketplaceFulfilmentEvent,
  MarketplaceFulfilmentSlaAlertJobStatus,
  MarketplaceFulfilmentSlaProviderIncidentConfigCheck,
  MarketplaceFulfilmentSlaProviderWebhookRetryQueue,
  MarketplaceFulfilmentSlaPolicy,
  MarketplaceFulfilmentSlaPolicyRule,
  MarketplaceFulfilmentSlaSeverity,
  MarketplaceOrder,
  MarketplaceOrderReceipt,
  MarketplaceOrderTimelineItem,
  MarketplaceProcessorReconciliation,
  MarketplaceSellerOrder,
  MarketplaceStoreReceiptExportBatch,
  MarketplaceWorld,
  reconcileMarketplaceSellerOrderProcessorFees,
  reviewMarketplaceFulfilmentSlaProviderWebhookDeadLetter,
  retryMarketplaceFulfilmentSlaProviderWebhookDispatch,
  runMarketplaceFulfilmentSlaAlertJob,
  runMarketplaceFulfilmentSlaProviderWebhookRetryQueue,
  testMarketplaceFulfilmentSlaProviderIncidentTicket,
  updateMarketplaceFulfilmentSlaPolicy,
  validateMarketplaceFulfilmentSlaProviderIncidentSandbox,
} from '../../api/marketplaceApi';
import { getCurrentUser } from '../../state/authStore';
import { ActionPillButton } from '../buttons/ActionPillButton';
import { MarketplaceOrderFulfilmentControl } from './MarketplaceOrderFulfilmentControl';

const STORE_RECEIPT_EXPORT_FILE_NAME = 'marketplace-store-receipts.csv';

function priceLabel(price?: number | string) {
  if (price === undefined || price === null) return 'Price unavailable';
  const value = Number(price);
  if (!Number.isFinite(value)) return `${price} credits`;
  return `${value.toFixed(2)} credits`;
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function userLabel(user?: { username?: string; displayName?: string | null } | null) {
  if (!user) return 'Unknown buyer';
  return user.displayName || user.username || 'Unknown buyer';
}

function dateLabel(value?: string) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function ageLabel(hours?: number) {
  if (!hours || hours <= 0) return 'Fresh';
  if (hours < 1) return '<1h';
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

function slaColor(severity: string) {
  if (severity === 'CRITICAL') return '#ff6b6b';
  if (severity === 'WARNING') return '#d4af37';
  return '#1D9E75';
}

function canTuneMarketplaceSlaPolicy(role?: string) {
  return role === 'HEADMISTRESS' || role === 'ADMIN';
}

type SlaPolicyDraft = {
  thresholdHours: string;
  severity: MarketplaceFulfilmentSlaSeverity;
  enabled: boolean;
  recommendedAction: string;
};

const SLA_SEVERITIES: MarketplaceFulfilmentSlaSeverity[] = ['INFO', 'WARNING', 'CRITICAL'];

function createSlaPolicyDrafts(policy?: MarketplaceFulfilmentSlaPolicy | null) {
  return (policy?.rules || []).reduce<Record<string, SlaPolicyDraft>>((drafts, rule) => {
    drafts[rule.key] = {
      thresholdHours: String(rule.thresholdHours),
      severity: rule.severity,
      enabled: rule.enabled,
      recommendedAction: rule.recommendedAction,
    };

    return drafts;
  }, {});
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

function downloadCsvStatement(csvText: string) {
  if (!csvText.trim()) return 'Load store receipt export first.';

  const { BlobRef, documentRef, urlRef } = browserExportApi();
  if (!BlobRef || !documentRef?.createElement || !urlRef?.createObjectURL) {
    return 'Store receipt CSV is ready below for manual save or share.';
  }

  const blob = new BlobRef([csvText], { type: 'text/csv;charset=utf-8' });
  const url = urlRef.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = STORE_RECEIPT_EXPORT_FILE_NAME;
  link.style.display = 'none';
  documentRef.body?.appendChild(link);
  link.click();
  link.remove?.();
  urlRef.revokeObjectURL?.(url);

  return `${STORE_RECEIPT_EXPORT_FILE_NAME} download started.`;
}

async function copyCsvStatement(csvText: string) {
  const { clipboard } = browserExportApi();
  if (!csvText.trim() || !clipboard?.writeText) return false;

  await clipboard.writeText(csvText);
  return true;
}

async function shareCsvStatement(csvText: string) {
  if (!csvText.trim()) return 'Load store receipt export first.';
  const share = (Share as any)?.share;
  if (!share) return 'Store receipt CSV is ready below for manual share.';

  await share({
    title: STORE_RECEIPT_EXPORT_FILE_NAME,
    message: csvText,
  });

  return 'Store receipt CSV share sheet opened.';
}

function canLoadStoreReceipt(status: string) {
  const normalizedStatus = String(status || '').toUpperCase();
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
    'CHARGEBACK',
  ].includes(normalizedStatus);
}

const STATUS_FILTERS = [
  'ALL',
  'PENDING_APPROVAL',
  'APPROVED_PENDING_PAYMENT',
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
  'CHARGEBACK',
] as const;

const WORLD_FILTERS: Array<'ALL' | MarketplaceWorld> = [
  'ALL',
  'STANDARD',
  'VENDING_MACHINE',
  'LAUNDRY_HAMPER',
  'MYSTERY_BOX',
  'PRIVATE_VAULT',
];

export function MarketplaceSellerOrdersScreen() {
  const currentUser = getCurrentUser();
  const canTuneSlaPolicy = canTuneMarketplaceSlaPolicy(currentUser?.role);
  const [orders, setOrders] = useState<MarketplaceSellerOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [worldFilter, setWorldFilter] = useState<'ALL' | MarketplaceWorld>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orderTimelines, setOrderTimelines] = useState<Record<string, MarketplaceOrderTimelineItem[]>>({});
  const [orderReceipts, setOrderReceipts] = useState<Record<string, MarketplaceOrderReceipt | null>>({});
  const [fulfilmentAnalytics, setFulfilmentAnalytics] = useState<MarketplaceFulfilmentAnalytics | null>(null);
  const [fulfilmentEvents, setFulfilmentEvents] = useState<MarketplaceFulfilmentEvent[]>([]);
  const [slaPolicy, setSlaPolicy] = useState<MarketplaceFulfilmentSlaPolicy | null>(null);
  const [slaPolicyDrafts, setSlaPolicyDrafts] = useState<Record<string, SlaPolicyDraft>>({});
  const [slaPolicySavingKey, setSlaPolicySavingKey] = useState<string | null>(null);
  const [slaPolicyNotice, setSlaPolicyNotice] = useState<string | null>(null);
  const [slaAlertJobRunning, setSlaAlertJobRunning] = useState(false);
  const [slaAlertJobSummary, setSlaAlertJobSummary] = useState<string | null>(null);
  const [slaAlertJobStatus, setSlaAlertJobStatus] = useState<MarketplaceFulfilmentSlaAlertJobStatus | null>(null);
  const [slaProviderIncidentConfigCheck, setSlaProviderIncidentConfigCheck] = useState<MarketplaceFulfilmentSlaProviderIncidentConfigCheck | null>(null);
  const [slaProviderIncidentAction, setSlaProviderIncidentAction] = useState<string | null>(null);
  const [slaProviderWebhookRetryQueue, setSlaProviderWebhookRetryQueue] = useState<MarketplaceFulfilmentSlaProviderWebhookRetryQueue | null>(null);
  const [slaProviderWebhookRetrying, setSlaProviderWebhookRetrying] = useState<string | null>(null);
  const [slaProviderWebhookQueueRunning, setSlaProviderWebhookQueueRunning] = useState(false);
  const [processorReconciliation, setProcessorReconciliation] = useState<MarketplaceProcessorReconciliation | null>(null);
  const [storeReceiptExportText, setStoreReceiptExportText] = useState('');
  const [storeReceiptExportOpen, setStoreReceiptExportOpen] = useState(false);
  const [storeReceiptExportNotice, setStoreReceiptExportNotice] = useState<string | null>(null);
  const [storeReceiptExportBatches, setStoreReceiptExportBatches] = useState<MarketplaceStoreReceiptExportBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const [
        nextOrders,
        nextFulfilmentAnalytics,
        nextFulfilmentEvents,
        nextSlaPolicy,
        nextProcessorReconciliation,
        nextReceiptBatches,
      ] = await Promise.all([
        listMarketplaceSellerOrders({
          status: statusFilter,
          world: worldFilter,
          dateFrom,
          dateTo,
        }),
        listMarketplaceFulfilmentAnalytics(),
        listMarketplaceFulfilmentEvents(),
        listMarketplaceFulfilmentSlaPolicy({ world: worldFilter }),
        reconcileMarketplaceSellerOrderProcessorFees({
          status: statusFilter,
          world: worldFilter,
          dateFrom,
          dateTo,
        }),
        listMarketplaceSellerOrderReceiptExportBatches(),
      ]);
      const timelineEntries = await Promise.all(
        nextOrders.slice(0, 50).map(async (order) => {
          try {
            const result = await listMarketplaceOrderTimeline(order.id);
            return [order.id, result.timeline] as const;
          } catch {
            return [order.id, []] as const;
          }
        }),
      );
      const receiptEntries = await Promise.all(
        nextOrders.slice(0, 50).map(async (order) => {
          if (!canLoadStoreReceipt(order.status)) return [order.id, null] as const;
          try {
            const receipt = await getMarketplaceOrderReceipt(order.id);
            return [order.id, receipt] as const;
          } catch {
            return [order.id, null] as const;
          }
        }),
      );
      setOrders(nextOrders);
      setOrderTimelines(Object.fromEntries(timelineEntries));
      setOrderReceipts(Object.fromEntries(receiptEntries));
      setFulfilmentAnalytics(nextFulfilmentAnalytics);
      setFulfilmentEvents(nextFulfilmentEvents.items || []);
      setSlaPolicy(nextSlaPolicy);
      setSlaPolicyDrafts(createSlaPolicyDrafts(nextSlaPolicy));
      setProcessorReconciliation(nextProcessorReconciliation);
      setStoreReceiptExportBatches(nextReceiptBatches.items || []);
      void refreshSlaAlertJobStatus();
      void refreshSlaProviderWebhookRetryQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marketplace seller orders failed to load.');
    } finally {
      setLoading(false);
    }
  }

  async function refreshSlaAlertJobStatus() {
    if (!canTuneSlaPolicy) {
      setSlaAlertJobStatus(null);
      setSlaProviderIncidentConfigCheck(null);
      return null;
    }

    try {
      const [status, configCheck] = await Promise.all([
        listMarketplaceFulfilmentSlaAlertJobStatus(),
        inspectMarketplaceFulfilmentSlaProviderIncidentTicketConfig(),
      ]);
      setSlaAlertJobStatus(status);
      setSlaProviderIncidentConfigCheck(configCheck);
      return status;
    } catch {
      setSlaAlertJobStatus(null);
      setSlaProviderIncidentConfigCheck(null);
      return null;
    }
  }

  async function refreshSlaProviderWebhookRetryQueue() {
    if (!canTuneSlaPolicy) {
      setSlaProviderWebhookRetryQueue(null);
      return null;
    }

    try {
      const queue = await listMarketplaceFulfilmentSlaProviderWebhookRetryQueue();
      setSlaProviderWebhookRetryQueue(queue);
      return queue;
    } catch {
      setSlaProviderWebhookRetryQueue(null);
      return null;
    }
  }

  function handleOrderUpdated(updated: MarketplaceOrder) {
    setOrders((current) => current.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)));
    setNotice(`Order ${updated.id} updated to ${statusLabel(updated.status)}.`);
    void refreshOrderTimeline(updated.id);
    void refreshOrderReceipt(updated.id, updated.status);
    void refreshFulfilmentEvents();
  }

  async function refreshFulfilmentEvents() {
    try {
      const result = await listMarketplaceFulfilmentEvents();
      setFulfilmentEvents(result.items || []);
    } catch {
      setFulfilmentEvents((current) => current);
    }
  }

  async function refreshProcessorReconciliation() {
    try {
      const result = await reconcileMarketplaceSellerOrderProcessorFees({
        status: statusFilter,
        world: worldFilter,
        dateFrom,
        dateTo,
      });
      setProcessorReconciliation(result);
    } catch {
      setProcessorReconciliation((current) => current);
    }
  }

  async function refreshOrderTimeline(orderId: string) {
    try {
      const result = await listMarketplaceOrderTimeline(orderId);
      setOrderTimelines((current) => ({ ...current, [orderId]: result.timeline }));
    } catch {
      setOrderTimelines((current) => ({ ...current, [orderId]: current[orderId] || [] }));
    }
  }

  async function refreshOrderReceipt(orderId: string, status?: string) {
    if (status && !canLoadStoreReceipt(status)) {
      setOrderReceipts((current) => ({ ...current, [orderId]: null }));
      return;
    }

    try {
      const receipt = await getMarketplaceOrderReceipt(orderId);
      setOrderReceipts((current) => ({ ...current, [orderId]: receipt }));
    } catch {
      setOrderReceipts((current) => ({ ...current, [orderId]: null }));
    }
  }

  async function loadStoreReceiptExport(action: 'show' | 'download' | 'copy' | 'share') {
    try {
      const csvText = await exportMarketplaceSellerOrderReceiptsCsv({
        status: statusFilter,
        world: worldFilter,
        dateFrom,
        dateTo,
      });
      setStoreReceiptExportText(csvText);
      setStoreReceiptExportOpen(true);

      if (action === 'download') {
        setStoreReceiptExportNotice(downloadCsvStatement(csvText));
        return;
      }
      if (action === 'copy') {
        const copied = await copyCsvStatement(csvText);
        setStoreReceiptExportNotice(copied ? 'Store receipt CSV copied.' : 'Store receipt CSV is ready below for manual copy.');
        return;
      }
      if (action === 'share') {
        setStoreReceiptExportNotice(await shareCsvStatement(csvText));
        return;
      }

      setStoreReceiptExportNotice('Store receipt CSV loaded.');
    } catch (err) {
      setStoreReceiptExportOpen(true);
      setStoreReceiptExportNotice(err instanceof Error ? err.message : 'Store receipt CSV export failed.');
    }
  }

  async function createStoreReceiptExportBatch() {
    try {
      const batch = await createMarketplaceSellerOrderReceiptExportBatch({
        status: statusFilter,
        world: worldFilter,
        dateFrom,
        dateTo,
      });
      setStoreReceiptExportBatches((current) => [batch, ...current.filter((item) => item.id !== batch.id)]);
      setStoreReceiptExportText(batch.csvText);
      setStoreReceiptExportOpen(true);
      setStoreReceiptExportNotice(`Draft batch ${batch.id} created with ${batch.rowCount} receipt row${batch.rowCount === 1 ? '' : 's'}.`);
    } catch (err) {
      setStoreReceiptExportOpen(true);
      setStoreReceiptExportNotice(err instanceof Error ? err.message : 'Store receipt export batch failed.');
    }
  }

  function updateSlaPolicyDraft(ruleKey: string, patch: Partial<SlaPolicyDraft>) {
    setSlaPolicyDrafts((current) => ({
      ...current,
      [ruleKey]: {
        ...(current[ruleKey] || {
          thresholdHours: '',
          severity: 'INFO',
          enabled: true,
          recommendedAction: '',
        }),
        ...patch,
      },
    }));
  }

  async function saveSlaPolicyRule(rule: MarketplaceFulfilmentSlaPolicyRule) {
    const draft = slaPolicyDrafts[rule.key];
    const thresholdHours = Number(draft?.thresholdHours || rule.thresholdHours);

    if (!Number.isFinite(thresholdHours) || thresholdHours <= 0) {
      setSlaPolicyNotice('SLA threshold must be greater than zero hours.');
      return;
    }

    try {
      setSlaPolicySavingKey(rule.key);
      setSlaPolicyNotice(null);
      const policy = await updateMarketplaceFulfilmentSlaPolicy({
        world: worldFilter === 'ALL' ? undefined : worldFilter,
        note: worldFilter === 'ALL' ? 'Global seller-order SLA tuning.' : `${statusLabel(worldFilter)} SLA tuning.`,
        rules: [{
          key: rule.key,
          thresholdHours,
          severity: draft?.severity || rule.severity,
          enabled: draft?.enabled ?? rule.enabled,
          label: rule.label,
          recommendedAction: draft?.recommendedAction?.trim() || rule.recommendedAction,
        }],
      });
      const nextAnalytics = await listMarketplaceFulfilmentAnalytics();
      setSlaPolicy(policy);
      setSlaPolicyDrafts(createSlaPolicyDrafts(policy));
      setFulfilmentAnalytics(nextAnalytics);
      setSlaPolicyNotice(`${rule.label} policy updated.`);
    } catch (err) {
      setSlaPolicyNotice(err instanceof Error ? err.message : 'SLA policy update failed.');
    } finally {
      setSlaPolicySavingKey(null);
    }
  }

  async function runSlaAlertJob(dryRun: boolean) {
    try {
      setSlaAlertJobRunning(true);
      setSlaAlertJobSummary(null);
      const result = await runMarketplaceFulfilmentSlaAlertJob({
        dryRun,
        maxNotifications: 25,
      });
      const nextAnalytics = await listMarketplaceFulfilmentAnalytics();
      setFulfilmentAnalytics(nextAnalytics);
      await refreshSlaAlertJobStatus();
      await refreshSlaProviderWebhookRetryQueue();
      setSlaAlertJobSummary(
        dryRun
          ? `Dry run found ${result.candidateAlertCount} candidate alert(s), ${result.skippedDuplicateCount} duplicate(s).`
          : `Delivered ${result.deliveredCount} SLA alert(s), escalated ${result.escalatedCount} critical alert(s), provider sent ${result.providerWebhookDispatchCount}, skipped ${result.skippedDuplicateCount} duplicate(s).`,
      );
    } catch (err) {
      setSlaAlertJobSummary(err instanceof Error ? err.message : 'SLA alert job failed.');
    } finally {
      setSlaAlertJobRunning(false);
    }
  }

  async function retrySlaProviderWebhookDispatch(dispatchId: string) {
    try {
      setSlaProviderWebhookRetrying(dispatchId);
      setSlaAlertJobSummary(null);
      const retry = await retryMarketplaceFulfilmentSlaProviderWebhookDispatch(dispatchId);
      await refreshSlaAlertJobStatus();
      await refreshSlaProviderWebhookRetryQueue();
      setSlaAlertJobSummary(`Provider webhook retry ${retry.status.toLowerCase()} for order ${retry.orderId}.`);
    } catch (err) {
      setSlaAlertJobSummary(err instanceof Error ? err.message : 'Provider webhook retry failed.');
    } finally {
      setSlaProviderWebhookRetrying(null);
    }
  }

  async function runSlaProviderWebhookRetryQueue() {
    try {
      setSlaProviderWebhookQueueRunning(true);
      setSlaAlertJobSummary(null);
      const result = await runMarketplaceFulfilmentSlaProviderWebhookRetryQueue(10);
      await refreshSlaAlertJobStatus();
      await refreshSlaProviderWebhookRetryQueue();
      setSlaAlertJobSummary(`Retry queue ran ${result.attemptedCount} dispatch(es): sent ${result.sentCount}, failed ${result.failedCount}, dead-letter ${result.deadLetterCount}, tickets ${result.incidentHandoffCount}.`);
    } catch (err) {
      setSlaAlertJobSummary(err instanceof Error ? err.message : 'Provider webhook retry queue failed.');
    } finally {
      setSlaProviderWebhookQueueRunning(false);
    }
  }

  async function reviewSlaProviderWebhookDeadLetter(dispatchId: string) {
    try {
      setSlaProviderWebhookRetrying(dispatchId);
      setSlaAlertJobSummary(null);
      const reviewed = await reviewMarketplaceFulfilmentSlaProviderWebhookDeadLetter(dispatchId, 'Reviewed from seller-order SLA panel.');
      await refreshSlaAlertJobStatus();
      await refreshSlaProviderWebhookRetryQueue();
      setSlaAlertJobSummary(`Dead-letter reviewed for order ${reviewed.orderId}.`);
    } catch (err) {
      setSlaAlertJobSummary(err instanceof Error ? err.message : 'Dead-letter review failed.');
    } finally {
      setSlaProviderWebhookRetrying(null);
    }
  }

  async function sendSlaProviderIncidentTestTicket() {
    try {
      setSlaProviderIncidentAction('test-send');
      setSlaAlertJobSummary(null);
      const ticket = await testMarketplaceFulfilmentSlaProviderIncidentTicket({
        orderId: 'provider-incident-test-order',
        priority: 'HIGH',
        note: 'Manual provider incident test from Marketplace Orders.',
      });
      await refreshSlaAlertJobStatus();
      setSlaAlertJobSummary(`Provider incident test ticket ${ticket.externalTicketId || ticket.id} is ${statusLabel(ticket.providerStatus || ticket.status)}.`);
    } catch (err) {
      setSlaAlertJobSummary(err instanceof Error ? err.message : 'Provider incident test ticket failed.');
    } finally {
      setSlaProviderIncidentAction(null);
    }
  }

  async function validateSlaProviderIncidentSandbox() {
    try {
      setSlaProviderIncidentAction('sandbox-validate');
      setSlaAlertJobSummary(null);
      const result = await validateMarketplaceFulfilmentSlaProviderIncidentSandbox({
        sendLiveTest: false,
        note: 'Sandbox validation from Marketplace Orders.',
      });
      await refreshSlaAlertJobStatus();
      setSlaProviderIncidentConfigCheck(result.configCheck);
      setSlaAlertJobSummary(`Provider sandbox validation ${result.status}; test ticket ${statusLabel(result.testHandoff.providerStatus || result.testHandoff.status)}.`);
    } catch (err) {
      setSlaAlertJobSummary(err instanceof Error ? err.message : 'Provider sandbox validation failed.');
    } finally {
      setSlaProviderIncidentAction(null);
    }
  }

  async function closeSlaProviderIncidentTicket(dispatchId: string) {
    try {
      setSlaProviderIncidentAction(dispatchId);
      setSlaAlertJobSummary(null);
      const ticket = await closeMarketplaceFulfilmentSlaProviderIncidentTicket(
        dispatchId,
        'Closed from Marketplace Orders provider incident controls.',
      );
      await refreshSlaAlertJobStatus();
      setSlaAlertJobSummary(`Provider incident ticket ${ticket.externalTicketId || ticket.id} is ${statusLabel(ticket.providerStatus || ticket.status)}.`);
    } catch (err) {
      setSlaAlertJobSummary(err instanceof Error ? err.message : 'Provider incident close failed.');
    } finally {
      setSlaProviderIncidentAction(null);
    }
  }

  function clearFilters() {
    setStatusFilter('ALL');
    setWorldFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setNotice('Filters cleared. Refresh orders to reload the full queue.');
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const fulfilmentSlaAlerts = fulfilmentAnalytics?.slaAlerts || [];
  const activeSlaPolicy = slaPolicy || fulfilmentAnalytics?.slaPolicy || null;
  const latestFailedSlaProviderWebhookDispatch = slaAlertJobStatus?.providerWebhook.recentDispatches.find((dispatch) => dispatch.status === 'FAILED') || null;
  const latestReadySlaProviderWebhookRetry = slaProviderWebhookRetryQueue?.items.find((item) => item.queueState === 'READY') || null;
  const latestDeadLetterSlaProviderWebhook = slaProviderWebhookRetryQueue?.items.find((item) => item.queueState === 'DEAD_LETTER') || null;
  const latestSlaProviderIncidentHandoff = slaAlertJobStatus?.providerWebhook.incidentHandoff.recentHandoffs[0] || null;
  const activeSlaProviderIncidentConfig = slaProviderIncidentConfigCheck || slaAlertJobStatus?.providerWebhook.incidentHandoff.configCheck || null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Marketplace Orders</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Review creator sales, update fulfilment status, add tracking, and send a note from seller.
        </Text>
      </View>

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Seller Order Queue</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{orders.length} order{orders.length === 1 ? '' : 's'}</Text>
          </View>
          <ActionPillButton
            actionKey="refreshListings"
            disabled={loading}
            label={loading ? 'Loading...' : 'Apply Filters'}
            onPress={loadOrders}
          />
        </View>

        <View style={{ backgroundColor: '#080808', borderRadius: 14, borderWidth: 1, borderColor: '#242424', padding: 12, gap: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Filters</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {STATUS_FILTERS.map((status) => {
              const active = statusFilter === status;
              return (
                <Pressable
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  style={{ backgroundColor: active ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 9 }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{statusLabel(status)}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {WORLD_FILTERS.map((world) => {
              const active = worldFilter === world;
              return (
                <Pressable
                  key={world}
                  onPress={() => setWorldFilter(world)}
                  style={{ backgroundColor: active ? '#1D9E75' : '#222', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 9 }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{world === 'ALL' ? 'All Worlds' : world.replace(/_/g, ' ')}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TextInput
              value={dateFrom}
              onChangeText={setDateFrom}
              placeholder="From date YYYY-MM-DD"
              placeholderTextColor="#777"
              style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, minWidth: 160, flexGrow: 1 }}
            />
            <TextInput
              value={dateTo}
              onChangeText={setDateTo}
              placeholder="To date YYYY-MM-DD"
              placeholderTextColor="#777"
              style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, minWidth: 160, flexGrow: 1 }}
            />
          </View>

          <Pressable onPress={clearFilters} style={{ alignSelf: 'flex-start', backgroundColor: '#222', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Clear Filters</Text>
          </Pressable>
        </View>

        {fulfilmentAnalytics ? (
          <View style={{ backgroundColor: '#080808', borderRadius: 14, borderWidth: 1, borderColor: '#2b2208', padding: 12, gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
              <View>
                <Text style={{ color: '#fff', fontWeight: '900' }}>Fulfilment Health</Text>
                <Text style={{ color: '#888', fontSize: 11 }}>
                  {fulfilmentAnalytics.scope === 'all_sellers' ? 'All sellers' : 'Seller'} / refreshed {dateLabel(fulfilmentAnalytics.generatedAt)}
                </Text>
              </View>
              <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>
                {priceLabel(fulfilmentAnalytics.grossOpenCredits)} open
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                ['Open', fulfilmentAnalytics.queueCount, '#d4af37'],
                ['In Progress', fulfilmentAnalytics.inProgressCount, '#1D9E75'],
                ['Done', fulfilmentAnalytics.completedCount, '#777'],
                ['Exceptions', fulfilmentAnalytics.exceptionCount, '#ff6b6b'],
              ].map(([label, value, color]) => (
                <View key={String(label)} style={{ backgroundColor: '#151515', borderRadius: 10, borderWidth: 1, borderColor: String(color), paddingVertical: 8, paddingHorizontal: 10, minWidth: 112 }}>
                  <Text style={{ color: String(color), fontSize: 11, fontWeight: '900' }}>{label}</Text>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 }}>{String(value)}</Text>
                </View>
              ))}
            </View>

            {fulfilmentAnalytics.oldestOpenOrder ? (
              <Text style={{ color: '#aaa', fontSize: 12 }}>
                Oldest open: {fulfilmentAnalytics.oldestOpenOrder.productTitle} / {statusLabel(fulfilmentAnalytics.oldestOpenOrder.status)} / {ageLabel(fulfilmentAnalytics.oldestOpenOrder.ageHours)}
              </Text>
            ) : (
              <Text style={{ color: '#777', fontSize: 12 }}>No open fulfilment queue.</Text>
            )}

            {fulfilmentSlaAlerts.length > 0 ? (
              <View style={{ gap: 8 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>SLA Watch</Text>
                {fulfilmentSlaAlerts.slice(0, 4).map((alert) => {
                  const tone = slaColor(alert.severity);
                  return (
                    <View key={alert.key} style={{ backgroundColor: '#111', borderColor: tone, borderRadius: 10, borderWidth: 1, padding: 10, gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={{ color: tone, fontSize: 12, fontWeight: '900' }}>{alert.label}</Text>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{alert.count} order{alert.count === 1 ? '' : 's'}</Text>
                      </View>
                      {alert.oldestOrder ? (
                        <Text style={{ color: '#aaa', fontSize: 11 }}>
                          Oldest: {alert.oldestOrder.productTitle} / {statusLabel(alert.oldestOrder.status)} / {ageLabel(alert.oldestOrder.ageHours)}
                        </Text>
                      ) : null}
                      <Text style={{ color: '#777', fontSize: 11 }}>{alert.recommendedAction}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: '#777', fontSize: 12 }}>No SLA alerts for the current fulfilment queue.</Text>
            )}

            {activeSlaPolicy ? (
              <View style={{ backgroundColor: '#101010', borderRadius: 12, borderWidth: 1, borderColor: '#242424', padding: 10, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <View>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>SLA Policy</Text>
                    <Text style={{ color: '#777', fontSize: 11 }}>
                      {activeSlaPolicy.activeRuleCount} active rule{activeSlaPolicy.activeRuleCount === 1 ? '' : 's'}
                      {` / ${activeSlaPolicy.world === 'GLOBAL' ? 'Global' : statusLabel(activeSlaPolicy.world)}`}
                      {activeSlaPolicy.updatedAt ? ` / tuned ${dateLabel(activeSlaPolicy.updatedAt)}` : ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ color: canTuneSlaPolicy ? '#1D9E75' : '#888', fontSize: 11, fontWeight: '900' }}>
                      {canTuneSlaPolicy ? 'Admin tuning enabled' : 'View only'}
                    </Text>
                    <Text style={{ color: activeSlaPolicy.persistenceMode === 'database_backed' ? '#1D9E75' : '#d4af37', fontSize: 10, fontWeight: '900' }}>
                      {activeSlaPolicy.persistenceMode === 'database_backed' ? 'Database backed' : 'Local scaffold'}
                    </Text>
                  </View>
                </View>

                {activeSlaPolicy.rules.map((rule) => {
                  const draft = slaPolicyDrafts[rule.key] || {
                    thresholdHours: String(rule.thresholdHours),
                    severity: rule.severity,
                    enabled: rule.enabled,
                    recommendedAction: rule.recommendedAction,
                  };
                  const tone = slaColor(draft.severity);

                  return (
                    <View key={rule.key} style={{ borderTopWidth: 1, borderTopColor: '#222', paddingTop: 8, gap: 7 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={{ color: tone, fontSize: 12, fontWeight: '900' }}>{rule.label}</Text>
                        <Text style={{ color: '#aaa', fontSize: 11 }}>
                          {rule.source === 'WORLD_OVERRIDE' && rule.world ? `${statusLabel(rule.world)} override / ` : ''}
                          {rule.statuses.map(statusLabel).join(', ')}
                        </Text>
                      </View>

                      {canTuneSlaPolicy ? (
                        <>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            <TextInput
                              value={draft.thresholdHours}
                              onChangeText={(value) => updateSlaPolicyDraft(rule.key, { thresholdHours: value })}
                              keyboardType="numeric"
                              placeholder="Hours"
                              placeholderTextColor="#666"
                              style={{ minWidth: 86, backgroundColor: '#1b1b1b', borderRadius: 10, color: '#fff', paddingHorizontal: 10, paddingVertical: 8 }}
                            />
                            {SLA_SEVERITIES.map((severity) => {
                              const selected = draft.severity === severity;
                              return (
                                <Pressable
                                  key={severity}
                                  onPress={() => updateSlaPolicyDraft(rule.key, { severity })}
                                  style={{ backgroundColor: selected ? slaColor(severity) : '#1b1b1b', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 }}
                                >
                                  <Text style={{ color: selected ? '#000' : '#ddd', fontSize: 11, fontWeight: '900' }}>{severity}</Text>
                                </Pressable>
                              );
                            })}
                            <Pressable
                              onPress={() => updateSlaPolicyDraft(rule.key, { enabled: !draft.enabled })}
                              style={{ backgroundColor: draft.enabled ? '#0d221a' : '#2b1010', borderColor: draft.enabled ? '#1D9E75' : '#ff6b6b', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 }}
                            >
                              <Text style={{ color: draft.enabled ? '#1D9E75' : '#ff6b6b', fontSize: 11, fontWeight: '900' }}>{draft.enabled ? 'Enabled' : 'Paused'}</Text>
                            </Pressable>
                          </View>
                          <TextInput
                            value={draft.recommendedAction}
                            onChangeText={(value) => updateSlaPolicyDraft(rule.key, { recommendedAction: value })}
                            placeholder="Recommended action"
                            placeholderTextColor="#666"
                            multiline
                            style={{ backgroundColor: '#1b1b1b', borderRadius: 10, color: '#fff', minHeight: 52, paddingHorizontal: 10, paddingVertical: 8 }}
                          />
                          <Pressable
                            disabled={slaPolicySavingKey === rule.key}
                            onPress={() => { void saveSlaPolicyRule(rule); }}
                            style={{ alignSelf: 'flex-start', backgroundColor: '#d4af37', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: slaPolicySavingKey === rule.key ? 0.7 : 1 }}
                          >
                            <Text style={{ color: '#000', fontSize: 11, fontWeight: '900' }}>
                              {slaPolicySavingKey === rule.key ? 'Saving...' : 'Save Rule'}
                            </Text>
                          </Pressable>
                        </>
                      ) : (
                        <Text style={{ color: '#777', fontSize: 11 }}>
                          {rule.enabled ? `Alert after ${rule.thresholdHours}h as ${rule.severity}. ` : 'Paused. '}
                          {rule.recommendedAction}
                        </Text>
                      )}
                    </View>
                  );
                })}

                {activeSlaPolicy.overrides.length ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {activeSlaPolicy.overrides.map((override) => (
                      <Text key={override.world} style={{ color: '#d4af37', backgroundColor: '#2b2208', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        {statusLabel(override.world)} override / {override.activeRuleCount} active
                      </Text>
                    ))}
                  </View>
                ) : null}

                {canTuneSlaPolicy ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <Pressable
                      disabled={slaAlertJobRunning}
                      onPress={() => { void runSlaAlertJob(true); }}
                      style={{ backgroundColor: '#1b1b1b', borderColor: '#444', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: slaAlertJobRunning ? 0.7 : 1 }}
                    >
                      <Text style={{ color: '#ddd', fontSize: 11, fontWeight: '900' }}>
                        {slaAlertJobRunning ? 'Checking...' : 'Dry Run Alerts'}
                      </Text>
                    </Pressable>
                    <Pressable
                      disabled={slaAlertJobRunning}
                      onPress={() => { void runSlaAlertJob(false); }}
                      style={{ backgroundColor: '#1D9E75', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, opacity: slaAlertJobRunning ? 0.7 : 1 }}
                    >
                      <Text style={{ color: '#000', fontSize: 11, fontWeight: '900' }}>
                        Deliver SLA Alerts
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {slaAlertJobSummary ? <Text style={{ color: '#1D9E75', fontSize: 12 }}>{slaAlertJobSummary}</Text> : null}

                {canTuneSlaPolicy && slaAlertJobStatus ? (
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      <Text style={{ color: '#ddd', backgroundColor: '#222', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        Scheduler {slaAlertJobStatus.scheduler.enabled ? `every ${slaAlertJobStatus.scheduler.intervalMinutes}m` : 'paused'}
                      </Text>
                      <Text style={{ color: '#ddd', backgroundColor: '#222', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        Job cap {slaAlertJobStatus.scheduler.maxNotifications}
                      </Text>
                      <Text style={{ color: slaAlertJobStatus.escalation.enabled ? '#1D9E75' : '#777', backgroundColor: slaAlertJobStatus.escalation.enabled ? '#0b281f' : '#181818', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        Escalation {slaAlertJobStatus.escalation.enabled ? slaAlertJobStatus.escalation.roles.join(' + ') : 'off'}
                      </Text>
                      <Text style={{ color: '#d4af37', backgroundColor: '#2b2208', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        Delivery {statusLabel(slaAlertJobStatus.persistence.deliveryMode)}
                      </Text>
                      <Text style={{ color: slaAlertJobStatus.monitoring.ready ? '#1D9E75' : '#ffad66', backgroundColor: slaAlertJobStatus.monitoring.ready ? '#0b281f' : '#28190b', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        Monitor {slaAlertJobStatus.monitoring.ready ? 'ready' : 'needs config'}
                      </Text>
                      <Text style={{ color: slaAlertJobStatus.providerWebhook.enabled ? '#1D9E75' : '#777', backgroundColor: slaAlertJobStatus.providerWebhook.enabled ? '#0b281f' : '#181818', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        Provider {slaAlertJobStatus.providerWebhook.enabled ? slaAlertJobStatus.providerWebhook.providerName : 'webhook pending'}
                      </Text>
                      <Text style={{ color: slaAlertJobStatus.providerWebhook.retryQueue.workerEnabled ? '#1D9E75' : '#ffad66', backgroundColor: slaAlertJobStatus.providerWebhook.retryQueue.workerEnabled ? '#0b281f' : '#28190b', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        Retry worker {slaAlertJobStatus.providerWebhook.retryQueue.workerEnabled ? `${slaAlertJobStatus.providerWebhook.retryQueue.workerIntervalMinutes}m` : 'manual'}
                      </Text>
                      <Text style={{ color: slaAlertJobStatus.providerWebhook.incidentHandoff.apiConfigured ? '#1D9E75' : '#ffad66', backgroundColor: slaAlertJobStatus.providerWebhook.incidentHandoff.apiConfigured ? '#0b281f' : '#28190b', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                        Tickets {slaAlertJobStatus.providerWebhook.incidentHandoff.apiConfigured ? slaAlertJobStatus.providerWebhook.incidentHandoff.providerName : 'scaffold'}
                      </Text>
                      {slaProviderWebhookRetryQueue ? (
                        <Text style={{ color: slaProviderWebhookRetryQueue.summary.deadLetterCount ? '#ff6b6b' : '#d4af37', backgroundColor: slaProviderWebhookRetryQueue.summary.deadLetterCount ? '#2b1010' : '#2b2208', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                          Retry queue ready {slaProviderWebhookRetryQueue.summary.readyCount} / waiting {slaProviderWebhookRetryQueue.summary.waitingCount} / dead {slaProviderWebhookRetryQueue.summary.deadLetterCount}
                        </Text>
                      ) : null}
                    </View>
                    {slaAlertJobStatus.recentRuns.length ? (
                      <Text style={{ color: '#777', fontSize: 11 }}>
                        Last run: {dateLabel(slaAlertJobStatus.recentRuns[0].generatedAt)} / {slaAlertJobStatus.recentRuns[0].status} / {slaAlertJobStatus.recentRuns[0].source} / delivered {slaAlertJobStatus.recentRuns[0].deliveredCount} / escalated {slaAlertJobStatus.recentRuns[0].escalatedCount} / provider sent {slaAlertJobStatus.recentRuns[0].providerWebhookDispatchCount}
                      </Text>
                    ) : (
                      <Text style={{ color: '#777', fontSize: 11 }}>No SLA alert job runs recorded in this process yet.</Text>
                    )}
                    {slaAlertJobStatus.monitoring.lastFailureMessage ? (
                      <Text style={{ color: '#ff6b6b', fontSize: 11 }}>
                        Last failure: {slaAlertJobStatus.monitoring.lastFailureMessage}
                      </Text>
                    ) : null}
                    {slaAlertJobStatus.providerWebhook.recentDispatches.length ? (
                      <Text style={{ color: '#777', fontSize: 11 }}>
                        Provider dispatch: {slaAlertJobStatus.providerWebhook.recentDispatches[0].status} / order {slaAlertJobStatus.providerWebhook.recentDispatches[0].orderId}
                      </Text>
                    ) : null}
                    {slaProviderWebhookRetryQueue ? (
                      <Text style={{ color: '#777', fontSize: 11 }}>
                        Retry config: max {slaProviderWebhookRetryQueue.config.maxAttempts} attempt(s), {slaProviderWebhookRetryQueue.config.baseMinutes}-{slaProviderWebhookRetryQueue.config.maxMinutes}m backoff, batch {slaProviderWebhookRetryQueue.config.batchSize}
                      </Text>
                    ) : null}
                    <Text style={{ color: '#777', fontSize: 11 }}>
                      Incident handoff: {slaAlertJobStatus.providerWebhook.incidentHandoff.providerName} / {slaAlertJobStatus.providerWebhook.incidentHandoff.dispatchMode.replace(/_/g, ' ')} / callback secret {slaAlertJobStatus.providerWebhook.incidentHandoff.webhookSecretConfigured ? 'set' : 'not set'}
                    </Text>
                    {activeSlaProviderIncidentConfig ? (
                      <>
                        <Text style={{ color: activeSlaProviderIncidentConfig.create.ready ? '#1D9E75' : '#ffad66', fontSize: 11 }}>
                          Ticket provider: create {activeSlaProviderIncidentConfig.create.ready ? 'ready' : 'needs env'} / close {activeSlaProviderIncidentConfig.close.ready ? 'ready' : 'local scaffold'} / callback {activeSlaProviderIncidentConfig.callback.ready ? 'secret set' : 'secret missing'}
                        </Text>
                        <Text style={{ color: activeSlaProviderIncidentConfig.install.ready ? '#1D9E75' : '#ffad66', fontSize: 11 }}>
                          Install: {activeSlaProviderIncidentConfig.install.ready ? 'ready' : 'needs setup'} / OAuth {activeSlaProviderIncidentConfig.oauthConfigured ? 'ready' : 'not configured'} / install URL {activeSlaProviderIncidentConfig.installUrlConfigured ? 'set' : 'missing'}
                        </Text>
                        <Text style={{ color: activeSlaProviderIncidentConfig.sandbox.ready ? '#1D9E75' : '#ffad66', fontSize: 11 }}>
                          Sandbox: {activeSlaProviderIncidentConfig.sandbox.ready ? 'ready' : 'needs validation'} / mode {activeSlaProviderIncidentConfig.sandbox.modeEnabled ? 'on' : 'off'} / mapping {activeSlaProviderIncidentConfig.fieldMapping.ready ? activeSlaProviderIncidentConfig.fieldMapping.source : 'needs fix'}
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                          {Object.entries(activeSlaProviderIncidentConfig.fieldMapping.fields).slice(0, 4).map(([key, value]) => (
                            <Text key={key} style={{ color: '#777', fontSize: 10, borderColor: '#333', borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3 }}>
                              {key}: {value}
                            </Text>
                          ))}
                        </View>
                        {[
                          ...activeSlaProviderIncidentConfig.create.missingEnv,
                          ...activeSlaProviderIncidentConfig.close.missingEnv,
                          ...activeSlaProviderIncidentConfig.callback.missingEnv,
                          ...activeSlaProviderIncidentConfig.install.missingEnv,
                          ...activeSlaProviderIncidentConfig.sandbox.missingEnv,
                          ...activeSlaProviderIncidentConfig.fieldMapping.missingKeys.map((key) => `${activeSlaProviderIncidentConfig.env.fieldMappingJson}:${key}`),
                          ...(activeSlaProviderIncidentConfig.fieldMapping.errorMessage ? [activeSlaProviderIncidentConfig.env.fieldMappingJson] : []),
                        ].length ? (
                          <Text style={{ color: '#777', fontSize: 11 }}>
                            Missing provider env: {Array.from(new Set([
                              ...activeSlaProviderIncidentConfig.create.missingEnv,
                              ...activeSlaProviderIncidentConfig.close.missingEnv,
                              ...activeSlaProviderIncidentConfig.callback.missingEnv,
                              ...activeSlaProviderIncidentConfig.install.missingEnv,
                              ...activeSlaProviderIncidentConfig.sandbox.missingEnv,
                              ...activeSlaProviderIncidentConfig.fieldMapping.missingKeys.map((key) => `${activeSlaProviderIncidentConfig.env.fieldMappingJson}:${key}`),
                              ...(activeSlaProviderIncidentConfig.fieldMapping.errorMessage ? [activeSlaProviderIncidentConfig.env.fieldMappingJson] : []),
                            ])).slice(0, 4).join(', ')}
                          </Text>
                        ) : null}
                      </>
                    ) : null}
                    {slaAlertJobStatus.providerWebhook.retryQueue.lastRunAt ? (
                      <Text style={{ color: '#777', fontSize: 11 }}>
                        Retry worker last run: {dateLabel(slaAlertJobStatus.providerWebhook.retryQueue.lastRunAt)}
                      </Text>
                    ) : null}
                    {latestReadySlaProviderWebhookRetry ? (
                      <Text style={{ color: '#d4af37', fontSize: 11 }}>
                        Next retry: {latestReadySlaProviderWebhookRetry.orderId} / attempt {latestReadySlaProviderWebhookRetry.retryCount + 1}
                      </Text>
                    ) : null}
                    {latestDeadLetterSlaProviderWebhook ? (
                      <Text style={{ color: '#ff6b6b', fontSize: 11 }}>
                        Dead-letter: {latestDeadLetterSlaProviderWebhook.orderId} / attempts {latestDeadLetterSlaProviderWebhook.retryCount}
                      </Text>
                    ) : null}
                    {latestSlaProviderIncidentHandoff ? (
                      <>
                        <Text style={{ color: '#ffad66', fontSize: 11 }}>
                          Incident ticket: {latestSlaProviderIncidentHandoff.externalTicketId || latestSlaProviderIncidentHandoff.id} / {latestSlaProviderIncidentHandoff.priority} / {latestSlaProviderIncidentHandoff.status} / order {latestSlaProviderIncidentHandoff.orderId}
                        </Text>
                        <Text style={{ color: latestSlaProviderIncidentHandoff.providerStatus === 'FAILED' ? '#ff6b6b' : '#777', fontSize: 11 }}>
                          Ticket dispatch: {latestSlaProviderIncidentHandoff.providerStatus || 'pending'}{latestSlaProviderIncidentHandoff.providerStatusCode ? ` / HTTP ${latestSlaProviderIncidentHandoff.providerStatusCode}` : ''}{latestSlaProviderIncidentHandoff.lastProviderSyncAt ? ` / ${dateLabel(latestSlaProviderIncidentHandoff.lastProviderSyncAt)}` : ''}
                        </Text>
                        {latestSlaProviderIncidentHandoff.ticketUrl ? (
                          <Text style={{ color: '#777', fontSize: 11 }}>
                            Ticket URL: {latestSlaProviderIncidentHandoff.ticketUrl}
                          </Text>
                        ) : null}
                      </>
                    ) : null}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      <ActionPillButton
                        actionKey="refreshListings"
                        label="Refresh Retry Queue"
                        onPress={() => { void refreshSlaProviderWebhookRetryQueue(); }}
                        style={{ alignSelf: 'flex-start', minHeight: 30, paddingVertical: 5 }}
                        textStyle={{ fontSize: 10 }}
                      />
                      <ActionPillButton
                        actionKey="refreshListings"
                        label={slaProviderWebhookQueueRunning ? 'Running Retries' : 'Run Due Retries'}
                        onPress={() => { void runSlaProviderWebhookRetryQueue(); }}
                        disabled={slaProviderWebhookQueueRunning || !latestReadySlaProviderWebhookRetry}
                        style={{ alignSelf: 'flex-start', minHeight: 30, paddingVertical: 5, opacity: slaProviderWebhookQueueRunning || !latestReadySlaProviderWebhookRetry ? 0.65 : 1 }}
                        textStyle={{ fontSize: 10 }}
                      />
                      {latestDeadLetterSlaProviderWebhook ? (
                        <ActionPillButton
                          actionKey="refreshListings"
                          label={slaProviderWebhookRetrying === latestDeadLetterSlaProviderWebhook.id ? 'Reviewing Dead Letter' : 'Review Dead Letter'}
                          onPress={() => { void reviewSlaProviderWebhookDeadLetter(latestDeadLetterSlaProviderWebhook.id); }}
                          disabled={Boolean(slaProviderWebhookRetrying)}
                          style={{ alignSelf: 'flex-start', minHeight: 30, paddingVertical: 5, opacity: slaProviderWebhookRetrying ? 0.7 : 1 }}
                          textStyle={{ fontSize: 10 }}
                        />
                      ) : null}
                      <ActionPillButton
                        actionKey="refreshListings"
                        label={slaProviderIncidentAction === 'test-send' ? 'Sending Test Ticket' : 'Send Test Ticket'}
                        onPress={() => { void sendSlaProviderIncidentTestTicket(); }}
                        disabled={Boolean(slaProviderIncidentAction)}
                        style={{ alignSelf: 'flex-start', minHeight: 30, paddingVertical: 5, opacity: slaProviderIncidentAction ? 0.7 : 1 }}
                        textStyle={{ fontSize: 10 }}
                      />
                      <ActionPillButton
                        actionKey="refreshListings"
                        label={slaProviderIncidentAction === 'sandbox-validate' ? 'Validating Sandbox' : 'Validate Sandbox'}
                        onPress={() => { void validateSlaProviderIncidentSandbox(); }}
                        disabled={Boolean(slaProviderIncidentAction)}
                        style={{ alignSelf: 'flex-start', minHeight: 30, paddingVertical: 5, opacity: slaProviderIncidentAction ? 0.7 : 1 }}
                        textStyle={{ fontSize: 10 }}
                      />
                      {latestSlaProviderIncidentHandoff && latestSlaProviderIncidentHandoff.status !== 'CLOSED' ? (
                        <ActionPillButton
                          actionKey="refreshListings"
                          label={slaProviderIncidentAction === latestSlaProviderIncidentHandoff.dispatchId ? 'Closing Ticket' : 'Close Incident Ticket'}
                          onPress={() => { void closeSlaProviderIncidentTicket(latestSlaProviderIncidentHandoff.dispatchId); }}
                          disabled={Boolean(slaProviderIncidentAction)}
                          style={{ alignSelf: 'flex-start', minHeight: 30, paddingVertical: 5, opacity: slaProviderIncidentAction ? 0.7 : 1 }}
                          textStyle={{ fontSize: 10 }}
                        />
                      ) : null}
                    </View>
                    {latestFailedSlaProviderWebhookDispatch ? (
                      <ActionPillButton
                        actionKey="refreshListings"
                        label={slaProviderWebhookRetrying === latestFailedSlaProviderWebhookDispatch.id ? 'Retrying Provider' : 'Retry Provider Webhook'}
                        onPress={() => { void retrySlaProviderWebhookDispatch(latestFailedSlaProviderWebhookDispatch.id); }}
                        disabled={Boolean(slaProviderWebhookRetrying)}
                        style={{ alignSelf: 'flex-start', minHeight: 30, paddingVertical: 5, opacity: slaProviderWebhookRetrying ? 0.7 : 1 }}
                        textStyle={{ fontSize: 10 }}
                      />
                    ) : null}
                  </View>
                ) : null}

                {activeSlaPolicy.auditHistory.slice(0, 3).map((entry) => (
                  <Text key={entry.id} style={{ color: '#777', fontSize: 11 }}>
                    Audit: {statusLabel(entry.world)} / {dateLabel(entry.updatedAt)} / {entry.updatedRuleKeys.join(', ') || 'policy touch'}{entry.note ? ` / ${entry.note}` : ''}
                  </Text>
                ))}

                {slaPolicyNotice ? <Text style={{ color: '#d4af37', fontSize: 12 }}>{slaPolicyNotice}</Text> : null}
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {fulfilmentAnalytics.statusBreakdown
                .filter((row) => row.count > 0)
                .slice(0, 8)
                .map((row) => (
                  <Text key={row.status} style={{ color: '#bbb', backgroundColor: '#222', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
                    {row.label}: {row.count} / {priceLabel(row.grossCredits)}
                  </Text>
                ))}
            </View>

            <View style={{ backgroundColor: '#101010', borderRadius: 12, borderWidth: 1, borderColor: '#242424', padding: 10, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>Fulfilment Event Log</Text>
                <ActionPillButton
                  actionKey="loadHistory"
                  label="Refresh Events"
                  onPress={() => { void refreshFulfilmentEvents(); }}
                  style={{ minHeight: 30, paddingVertical: 5 }}
                  textStyle={{ fontSize: 10 }}
                />
              </View>
              {fulfilmentEvents.slice(0, 5).map((event) => (
                <View key={event.id} style={{ borderLeftWidth: 2, borderLeftColor: slaColor(event.severity), paddingLeft: 10, gap: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>
                    {event.productTitle} / {statusLabel(event.previousStatus)} to {statusLabel(event.status)}
                  </Text>
                  <Text style={{ color: '#999', fontSize: 11 }}>
                    {dateLabel(event.createdAt)} / {event.actorRole || 'actor'} / order {event.orderId}
                  </Text>
                  {event.sellerNote || event.fulfilmentNote || event.trackingReference ? (
                    <Text style={{ color: '#777', fontSize: 11 }}>
                      {event.sellerNote || event.fulfilmentNote || event.trackingReference}
                    </Text>
                  ) : null}
                </View>
              ))}
              {fulfilmentEvents.length === 0 ? (
                <Text style={{ color: '#777', fontSize: 12 }}>No fulfilment events recorded yet.</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={{ backgroundColor: '#080808', borderRadius: 14, borderWidth: 1, borderColor: '#242424', padding: 12, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 190 }}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>Store Receipt Export</Text>
              <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>
                CSV uses the current status, world, and date filters for records/accountant review.
              </Text>
            </View>
            <Text style={{ color: '#777', fontSize: 11 }}>{STORE_RECEIPT_EXPORT_FILE_NAME}</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <ActionPillButton actionKey="createDraft" label="Create Batch" onPress={() => { void createStoreReceiptExportBatch(); }} />
            <ActionPillButton actionKey="showExport" label="Show CSV" onPress={() => { void loadStoreReceiptExport('show'); }} />
            <ActionPillButton actionKey="downloadCsv" label="Download CSV" onPress={() => { void loadStoreReceiptExport('download'); }} />
            <ActionPillButton actionKey="copyCsv" label="Copy CSV" onPress={() => { void loadStoreReceiptExport('copy'); }} />
            <ActionPillButton actionKey="shareCsv" label="Share CSV" onPress={() => { void loadStoreReceiptExport('share'); }} />
            {storeReceiptExportOpen ? (
              <ActionPillButton actionKey="hideExport" label="Hide CSV" onPress={() => setStoreReceiptExportOpen(false)} />
            ) : null}
          </View>
          {storeReceiptExportNotice ? <Text style={{ color: '#d4af37', fontSize: 12 }}>{storeReceiptExportNotice}</Text> : null}
          {processorReconciliation ? (
            <View style={{ backgroundColor: '#101010', borderRadius: 12, borderWidth: 1, borderColor: '#2b2208', padding: 10, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 190 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>Processor Reconciliation</Text>
                  <Text style={{ color: '#777', fontSize: 11 }}>
                    {processorReconciliation.rowCount} receipt row{processorReconciliation.rowCount === 1 ? '' : 's'} / {processorReconciliation.processorRatePercent}% + {priceLabel(processorReconciliation.processorFixedCredits)}
                  </Text>
                </View>
                <ActionPillButton
                  actionKey="refreshListings"
                  label="Refresh Fees"
                  onPress={() => { void refreshProcessorReconciliation(); }}
                  style={{ minHeight: 30, paddingVertical: 5 }}
                  textStyle={{ fontSize: 10 }}
                />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ color: '#aaa', backgroundColor: '#222', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                  Gross {priceLabel(processorReconciliation.grossCredits)}
                </Text>
                <Text style={{ color: '#aaa', backgroundColor: '#222', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                  Platform {priceLabel(processorReconciliation.platformAmount)}
                </Text>
                <Text style={{ color: '#d4af37', backgroundColor: '#2b2208', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                  Est. fees {priceLabel(processorReconciliation.estimatedProcessorFee)}
                </Text>
                {processorReconciliation.adjustmentAmount > 0 ? (
                  <Text style={{ color: '#ff6b6b', backgroundColor: '#2b1010', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                    Adjustments {priceLabel(processorReconciliation.adjustmentAmount)}
                  </Text>
                ) : null}
                <Text style={{ color: '#1D9E75', backgroundColor: '#0d221a', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                  Platform net {priceLabel(processorReconciliation.platformNetAfterAdjustmentsAndProcessorFee)}
                </Text>
              </View>
              <Text style={{ color: '#777', fontSize: 11 }}>{processorReconciliation.note}</Text>
              {processorReconciliation.rows.slice(0, 3).map((row) => (
                <Text key={row.receiptNumber} style={{ color: '#999', fontSize: 11 }}>
                  {row.productTitle}: {priceLabel(row.grossCredits)} gross / {priceLabel(row.estimatedProcessorFee)} estimated fee
                </Text>
              ))}
            </View>
          ) : null}
          {storeReceiptExportBatches.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>Recent Export Batches</Text>
              {storeReceiptExportBatches.slice(0, 3).map((batch) => (
                <Pressable
                  key={batch.id}
                  onPress={() => {
                    setStoreReceiptExportText(batch.csvText);
                    setStoreReceiptExportOpen(true);
                    setStoreReceiptExportNotice(`Loaded draft batch ${batch.id}.`);
                  }}
                  style={{ backgroundColor: '#111', borderColor: '#2b2208', borderRadius: 10, borderWidth: 1, padding: 10, gap: 4 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{batch.id}</Text>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>
                      {batch.rowCount} row{batch.rowCount === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <Text style={{ color: '#aaa', fontSize: 11 }}>
                    Gross {priceLabel(batch.grossCredits)} / Platform {priceLabel(batch.platformAmount)} / Mistress {priceLabel(batch.mistressAmount)}
                  </Text>
                  {batch.adjustmentAmount > 0 ? (
                    <Text style={{ color: '#ff6b6b', fontSize: 11 }}>
                      Adjustments {priceLabel(batch.adjustmentAmount)} / Net {priceLabel(batch.netReceiptAmount)}
                    </Text>
                  ) : null}
                  <Text style={{ color: '#777', fontSize: 11 }}>{dateLabel(batch.createdAt)} / {batch.scope === 'all_sellers' ? 'All sellers' : 'Seller scope'}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={{ color: '#777', fontSize: 12 }}>No draft export batches yet.</Text>
          )}
          {storeReceiptExportOpen ? (
            <TextInput
              value={storeReceiptExportText}
              editable={false}
              multiline
              selectTextOnFocus
              style={{ backgroundColor: '#050505', borderColor: '#242424', borderWidth: 1, borderRadius: 10, color: '#ccc', fontSize: 10, minHeight: 96, padding: 8 }}
            />
          ) : null}
        </View>

        {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
        {notice ? <Text style={{ color: '#1D9E75' }}>{notice}</Text> : null}
        {!loading && orders.length === 0 ? <Text style={{ color: '#777' }}>No marketplace orders yet.</Text> : null}

        <View style={{ gap: 12 }}>
          {orders.map((order) => {
            const product = order.product;
            const timeline = orderTimelines[order.id] || [];
            const receipt = orderReceipts[order.id];
            return (
              <View key={order.id} style={{ backgroundColor: '#151515', borderRadius: 16, borderWidth: 1, borderColor: '#282828', padding: 12, gap: 12 }}>
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <View style={{ flex: 1, minWidth: 190 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{product?.title || 'Marketplace order'}</Text>
                      <Text style={{ color: '#aaa', marginTop: 3, fontSize: 12 }}>Buyer: {userLabel(order.buyer)}</Text>
                      {product?.mistress ? (
                        <Text style={{ color: '#777', marginTop: 2, fontSize: 11 }}>Seller: {userLabel(product.mistress)}</Text>
                      ) : null}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#d4af37', fontWeight: '900' }}>{priceLabel(product?.price)}</Text>
                      <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{statusLabel(order.status)}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {product?.world ? (
                      <Text style={{ color: '#aaa', backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
                        {product.world.replace(/_/g, ' ')}
                      </Text>
                    ) : null}
                    {product?.revealMode ? (
                      <Text style={{ color: '#aaa', backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
                        {product.revealMode.replace(/_/g, ' ')}
                      </Text>
                    ) : null}
                    {product?.requiresApproval ? (
                      <Text style={{ color: '#d4af37', backgroundColor: '#2b2208', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
                        approved flow
                      </Text>
                    ) : null}
                    <Text style={{ color: '#aaa', backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
                      order {order.id}
                    </Text>
                    <Text style={{ color: '#aaa', backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
                      updated {dateLabel(order.updatedAt)}
                    </Text>
                  </View>
                </View>

                <MarketplaceOrderFulfilmentControl
                  orderId={order.id}
                  currentStatus={order.status}
                  onUpdated={handleOrderUpdated}
                />

                <View style={{ backgroundColor: '#101010', borderRadius: 14, borderWidth: 1, borderColor: '#2b2208', padding: 12, gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>Store Receipt</Text>
                    <Pressable
                      onPress={() => { void refreshOrderReceipt(order.id, order.status); }}
                      style={{ backgroundColor: '#222', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>Refresh Receipt</Text>
                    </Pressable>
                  </View>
                  {receipt ? (
                    <>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <Text style={{ color: '#d4af37', backgroundColor: '#2b2208', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '900' }}>
                          {receipt.receiptNumber}
                        </Text>
                        <Text style={{ color: '#aaa', backgroundColor: '#222', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                          Gross {priceLabel(receipt.grossCredits)}
                        </Text>
                        <Text style={{ color: '#aaa', backgroundColor: '#222', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                          Platform {priceLabel(receipt.platformAmount)}
                        </Text>
                        <Text style={{ color: '#aaa', backgroundColor: '#222', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                          Mistress {priceLabel(receipt.mistressAmount)}
                        </Text>
                        {receipt.adjustmentType && receipt.adjustmentType !== 'NONE' ? (
                          <Text style={{ color: '#ff6b6b', backgroundColor: '#2b1010', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '900' }}>
                            {statusLabel(receipt.adjustmentType)} {priceLabel(receipt.adjustmentAmount)}
                          </Text>
                        ) : null}
                        <Text style={{ color: '#1D9E75', backgroundColor: '#0d221a', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11 }}>
                          Net {priceLabel(receipt.netReceiptAmount)}
                        </Text>
                      </View>
                      {receipt.adjustmentNote ? <Text style={{ color: '#ff9abf', fontSize: 11 }}>{receipt.adjustmentNote}</Text> : null}
                      <Text style={{ color: '#888', fontSize: 11 }}>{receipt.complianceNote}</Text>
                      <TextInput
                        value={receipt.statementText}
                        editable={false}
                        multiline
                        selectTextOnFocus
                        style={{ backgroundColor: '#050505', borderColor: '#242424', borderWidth: 1, borderRadius: 10, color: '#ccc', fontSize: 10, minHeight: 74, padding: 8 }}
                      />
                    </>
                  ) : (
                    <Text style={{ color: '#777', fontSize: 12 }}>
                      {canLoadStoreReceipt(order.status) ? 'Receipt not loaded yet. Refresh receipt to try again.' : 'Store receipt appears after payment is complete.'}
                    </Text>
                  )}
                </View>

                <View style={{ backgroundColor: '#101010', borderRadius: 14, borderWidth: 1, borderColor: '#242424', padding: 12, gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>Order Timeline</Text>
                    <Pressable onPress={() => { void refreshOrderTimeline(order.id); }} style={{ backgroundColor: '#222', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>Refresh Timeline</Text>
                    </Pressable>
                  </View>
                  {timeline.slice(0, 8).map((event) => (
                    <View key={event.key} style={{ borderLeftWidth: 2, borderLeftColor: '#d4af37', paddingLeft: 10, gap: 2 }}>
                      <Text style={{ color: '#fff', fontWeight: '900' }}>{event.label}</Text>
                      <Text style={{ color: '#aaa', fontSize: 11 }}>{statusLabel(event.status)} / {dateLabel(event.occurredAt)}</Text>
                      {event.note ? <Text style={{ color: '#888', fontSize: 11 }}>{event.note}</Text> : null}
                    </View>
                  ))}
                  {timeline.length === 0 ? <Text style={{ color: '#777', fontSize: 12 }}>No timeline events loaded for this order.</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
