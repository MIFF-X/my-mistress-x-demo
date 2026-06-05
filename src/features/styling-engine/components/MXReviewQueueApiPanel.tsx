import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { createMagneticDownloadableBundle, getMagneticReviewQueueSummary, listMagneticDownloadableBundles, listMagneticReviewAuditHistory, listMagneticReviewRecords, updateMagneticReviewRecord } from '../magneticReviewQueueApi';
import type { MXMagneticDownloadableBundle, MXMagneticReviewAuditRecord, MXMagneticReviewQueueSummary, MXMagneticReviewRecord, MXMagneticReviewStatus } from '../magneticReviewQueueModel';

type MXReviewQueueApiPanelProps = {
  compact?: boolean;
};

type ReviewAction = 'approve' | 'reject' | 'publish';

const colors = {
  panel: '#080806',
  card: '#0e0c07',
  border: '#2a2208',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#7a6230',
  cyan: '#00e5ff',
  green: '#4ade80',
  red: '#ef4444',
  muted: '#9a927f',
};

const emptySummary: MXMagneticReviewQueueSummary = {
  blocked: 0,
  internalReview: 0,
  marketplaceReview: 0,
  approved: 0,
  published: 0,
  total: 0,
};

function statColor(label: string) {
  if (label === 'Blocked') return colors.red;
  if (label === 'Internal') return colors.gold;
  if (label === 'Marketplace') return colors.green;
  if (label === 'Approved') return colors.cyan;
  if (label === 'Published') return colors.green;
  return colors.muted;
}

function actionColor(action: ReviewAction) {
  if (action === 'approve') return colors.cyan;
  if (action === 'publish') return colors.green;
  return colors.red;
}

function actionLabel(action: ReviewAction) {
  if (action === 'approve') return 'Approve';
  if (action === 'publish') return 'Publish';
  return 'Reject';
}

function actionStatus(action: ReviewAction): MXMagneticReviewStatus {
  if (action === 'approve') return 'approved';
  if (action === 'publish') return 'published';
  return 'rejected';
}

function auditColor(action: string) {
  if (action === 'approved') return colors.cyan;
  if (action === 'published') return colors.green;
  if (action === 'rejected') return colors.red;
  if (action === 'submitted' || action === 'resubmitted') return colors.gold;
  return colors.muted;
}

function StatTile({ label, value }: { label: string; value: number }) {
  const color = statColor(label);
  return (
    <View style={{ flexGrow: 1, flexBasis: 120, borderColor: color, borderWidth: 1, borderRadius: 12, backgroundColor: colors.card, padding: 10, gap: 4 }}>
      <Text style={{ color, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ color: colors.goldLight, fontSize: 18, fontWeight: '900' }}>{value}</Text>
    </View>
  );
}

function AuditRow({ audit }: { audit: MXMagneticReviewAuditRecord }) {
  const color = auditColor(audit.action);
  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 10, backgroundColor: colors.card, padding: 8, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Text style={{ color, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>{audit.action}</Text>
        <Text style={{ color: colors.goldDark, fontSize: 8 }}>{new Date(audit.createdAt).toLocaleString()}</Text>
      </View>
      <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 13 }}>
        Status: {audit.fromStatus || 'new'} → {audit.toStatus || 'unknown'} · Lane: {audit.fromLane || 'new'} → {audit.toLane || 'unknown'}
      </Text>
      <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 13 }}>Actor: {audit.actorUserId}</Text>
      {audit.note ? <Text style={{ color: colors.goldLight, fontSize: 9, lineHeight: 13 }}>{audit.note}</Text> : null}
    </View>
  );
}

function BundleRow({ bundle }: { bundle: MXMagneticDownloadableBundle }) {
  const color = bundle.status === 'ready' ? colors.green : bundle.status === 'failed' || bundle.status === 'revoked' ? colors.red : colors.gold;
  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 10, backgroundColor: colors.card, padding: 8, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Text numberOfLines={1} style={{ color: colors.goldLight, fontSize: 10, fontWeight: '900', flex: 1, minWidth: 160 }}>{bundle.requestedFileName}</Text>
        <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 }}>
          <Text style={{ color, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{bundle.status}</Text>
        </View>
      </View>
      <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 13 }}>Format: {bundle.outputFormat} · Includes manifest/cards/components/tokens/audit</Text>
      <Text numberOfLines={1} style={{ color: colors.goldDark, fontSize: 9 }}>Bundle: {bundle.id}</Text>
    </View>
  );
}

function RecordRow({ record, busyAction, bundleBusy, audits, bundles, auditOpen, bundleOpen, auditLoading, bundleLoading, onAction, onToggleAudit, onToggleBundles, onCreateBundle }: { record: MXMagneticReviewRecord; busyAction?: ReviewAction | null; bundleBusy?: boolean; audits?: MXMagneticReviewAuditRecord[]; bundles?: MXMagneticDownloadableBundle[]; auditOpen?: boolean; bundleOpen?: boolean; auditLoading?: boolean; bundleLoading?: boolean; onAction: (record: MXMagneticReviewRecord, action: ReviewAction) => void; onToggleAudit: (record: MXMagneticReviewRecord) => void; onToggleBundles: (record: MXMagneticReviewRecord) => void; onCreateBundle: (record: MXMagneticReviewRecord) => void }) {
  const color = record.lane === 'marketplace-review' ? colors.green : record.lane === 'internal-review' ? colors.gold : colors.red;
  const isTerminal = record.status === 'published' || record.status === 'rejected';
  const canBundle = record.status === 'approved' || record.status === 'published' || record.status === 'ready-for-marketplace';

  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#060606', padding: 10, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Text style={{ color: colors.goldLight, fontSize: 12, fontWeight: '900', flex: 1, minWidth: 160 }}>{record.packName}</Text>
        <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{record.status}</Text>
        </View>
      </View>
      <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 13 }}>Lane: {record.lane} · Owner: {record.reviewOwner} · {record.readiness}% ready</Text>
      <Text numberOfLines={1} style={{ color: colors.goldDark, fontSize: 9 }}>Record: {record.id}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {(['approve', 'reject', 'publish'] as ReviewAction[]).map((action) => {
          const accent = actionColor(action);
          const disabled = Boolean(busyAction) || isTerminal || (action === 'publish' && record.status !== 'approved' && record.status !== 'ready-for-marketplace');
          return (
            <Pressable
              key={action}
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => onAction(record, action)}
              style={{ flexGrow: 1, flexBasis: 96, borderColor: accent, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 9, backgroundColor: disabled ? '#090909' : '#0b0b08', opacity: disabled ? 0.45 : 1 }}
            >
              <Text style={{ color: accent, textAlign: 'center', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{busyAction === action ? 'Working' : actionLabel(action)}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" disabled={!canBundle || bundleBusy} onPress={() => onCreateBundle(record)} style={{ flexGrow: 1, flexBasis: 140, borderColor: colors.green, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 9, backgroundColor: canBundle ? '#062015' : '#090909', opacity: canBundle ? 1 : 0.42 }}>
          <Text style={{ color: colors.green, textAlign: 'center', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{bundleBusy ? 'Creating bundle' : 'Create ZIP scaffold'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={bundleLoading} onPress={() => onToggleBundles(record)} style={{ flexGrow: 1, flexBasis: 120, borderColor: colors.cyan, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 9, backgroundColor: '#090909' }}>
          <Text style={{ color: colors.cyan, textAlign: 'center', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{bundleLoading ? 'Loading bundles' : bundleOpen ? 'Hide bundles' : 'Bundles'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={auditLoading} onPress={() => onToggleAudit(record)} style={{ flexGrow: 1, flexBasis: 120, borderColor: colors.goldDark, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 9, backgroundColor: '#090909' }}>
          <Text style={{ color: colors.goldLight, textAlign: 'center', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{auditLoading ? 'Loading audit' : auditOpen ? 'Hide audit' : 'Audit history'}</Text>
        </Pressable>
      </View>

      {bundleOpen ? (
        <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#080806', padding: 8, gap: 7 }}>
          <Text style={{ color: colors.cyan, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>Downloadable bundle scaffolds</Text>
          {bundles?.length ? bundles.map((bundle) => <BundleRow key={bundle.id} bundle={bundle} />) : <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 13 }}>No downloadable bundle scaffolds loaded yet.</Text>}
        </View>
      ) : null}

      {auditOpen ? (
        <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#080806', padding: 8, gap: 7 }}>
          <Text style={{ color: colors.gold, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>Audit history</Text>
          {audits?.length ? audits.map((audit) => <AuditRow key={audit.id} audit={audit} />) : <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 13 }}>No audit entries loaded yet.</Text>}
        </View>
      ) : null}
    </View>
  );
}

export function MXReviewQueueApiPanel({ compact = false }: MXReviewQueueApiPanelProps) {
  const [summary, setSummary] = useState<MXMagneticReviewQueueSummary>(emptySummary);
  const [records, setRecords] = useState<MXMagneticReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionState, setActionState] = useState<{ recordId: string; action: ReviewAction } | null>(null);
  const [notice, setNotice] = useState('Backend review queue ready to sync.');
  const [openAuditRecordId, setOpenAuditRecordId] = useState<string | null>(null);
  const [openBundleRecordId, setOpenBundleRecordId] = useState<string | null>(null);
  const [auditLoadingRecordId, setAuditLoadingRecordId] = useState<string | null>(null);
  const [bundleLoadingRecordId, setBundleLoadingRecordId] = useState<string | null>(null);
  const [bundleCreatingRecordId, setBundleCreatingRecordId] = useState<string | null>(null);
  const [auditHistoryByRecordId, setAuditHistoryByRecordId] = useState<Record<string, MXMagneticReviewAuditRecord[]>>({});
  const [bundlesByRecordId, setBundlesByRecordId] = useState<Record<string, MXMagneticDownloadableBundle[]>>({});

  async function loadQueue(options: { silent?: boolean } = {}) {
    setLoading(true);
    if (!options.silent) setNotice('Loading Styling Engine review queue from backend...');
    try {
      const [nextSummary, nextRecords] = await Promise.all([
        getMagneticReviewQueueSummary(),
        listMagneticReviewRecords({}, {}),
      ]);
      setSummary(nextSummary);
      setRecords(nextRecords.slice(0, compact ? 3 : 6));
      if (!options.silent) setNotice(`Review queue loaded: ${nextSummary.total} record${nextSummary.total === 1 ? '' : 's'}.`);
      return nextSummary;
    } catch (error) {
      setSummary(emptySummary);
      setRecords([]);
      const message = `Review queue offline or unavailable: ${error instanceof Error ? error.message : 'unknown error'}`;
      if (!options.silent) setNotice(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function refreshQueueAfterAction(action: ReviewAction, packName: string) {
    try {
      const nextSummary = await loadQueue({ silent: true });
      setNotice(`${actionLabel(action)} action saved for ${packName}. Queue totals refreshed: ${nextSummary.total} total.`);
    } catch (error) {
      setNotice(`${actionLabel(action)} action saved for ${packName}, but auto-refresh failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async function loadAuditHistory(record: MXMagneticReviewRecord) {
    setAuditLoadingRecordId(record.id);
    try {
      const audits = await listMagneticReviewAuditHistory(record.id);
      setAuditHistoryByRecordId((current) => ({ ...current, [record.id]: audits }));
      setNotice(`Loaded ${audits.length} audit entr${audits.length === 1 ? 'y' : 'ies'} for ${record.packName}.`);
    } catch (error) {
      setNotice(`Audit history unavailable for ${record.packName}: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setAuditLoadingRecordId(null);
    }
  }

  async function loadBundles(record: MXMagneticReviewRecord) {
    setBundleLoadingRecordId(record.id);
    try {
      const bundles = await listMagneticDownloadableBundles(record.id);
      setBundlesByRecordId((current) => ({ ...current, [record.id]: bundles }));
      setNotice(`Loaded ${bundles.length} bundle scaffold${bundles.length === 1 ? '' : 's'} for ${record.packName}.`);
    } catch (error) {
      setNotice(`Bundle scaffolds unavailable for ${record.packName}: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setBundleLoadingRecordId(null);
    }
  }

  async function toggleAuditHistory(record: MXMagneticReviewRecord) {
    const nextOpen = openAuditRecordId === record.id ? null : record.id;
    setOpenAuditRecordId(nextOpen);
    if (nextOpen && !auditHistoryByRecordId[record.id]) {
      await loadAuditHistory(record);
    }
  }

  async function toggleBundles(record: MXMagneticReviewRecord) {
    const nextOpen = openBundleRecordId === record.id ? null : record.id;
    setOpenBundleRecordId(nextOpen);
    if (nextOpen && !bundlesByRecordId[record.id]) {
      await loadBundles(record);
    }
  }

  async function createBundle(record: MXMagneticReviewRecord) {
    setBundleCreatingRecordId(record.id);
    setNotice(`Creating ZIP scaffold for ${record.packName}...`);
    try {
      const bundle = await createMagneticDownloadableBundle(record.id, {
        notes: [`Created from Headmistress Review Queue API panel for ${record.packName}.`],
      });
      setBundlesByRecordId((current) => ({ ...current, [record.id]: [bundle, ...(current[record.id] || [])] }));
      setOpenBundleRecordId(record.id);
      setNotice(`ZIP scaffold created for ${record.packName}: ${bundle.requestedFileName}.`);
      await loadQueue({ silent: true });
    } catch (error) {
      setNotice(`ZIP scaffold failed for ${record.packName}: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setBundleCreatingRecordId(null);
    }
  }

  async function runReviewAction(record: MXMagneticReviewRecord, action: ReviewAction) {
    setActionState({ recordId: record.id, action });
    setNotice(`${actionLabel(action)} action running for ${record.packName}...`);
    try {
      const updated = await updateMagneticReviewRecord(record.id, {
        status: actionStatus(action),
        reviewOwner: action === 'publish' ? 'Headmistress' : record.reviewOwner,
        rejectionReason: action === 'reject' ? 'Rejected from Headmistress review queue scaffold.' : undefined,
        notes: [
          ...(record.notes || []),
          `${actionLabel(action)} action applied from Headmistress Review Queue API panel.`,
        ],
      });
      setRecords((current) => current.map((item) => item.id === updated.id ? updated : item));
      setAuditHistoryByRecordId((current) => {
        const next = { ...current };
        delete next[record.id];
        return next;
      });
      if (openAuditRecordId === record.id) {
        await loadAuditHistory(updated);
      }
      await refreshQueueAfterAction(action, updated.packName);
    } catch (error) {
      setNotice(`${actionLabel(action)} failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setActionState(null);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 16, backgroundColor: colors.panel, padding: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <View style={{ flex: 1, minWidth: 200, gap: 4 }}>
          <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.6, textTransform: 'uppercase' }}>Headmistress Review Queue API</Text>
          <Text style={{ color: colors.goldLight, fontSize: 16, fontWeight: '900' }}>Backend Queue Summary</Text>
          <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>{notice}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => loadQueue()} disabled={loading || Boolean(actionState)} style={{ borderColor: colors.gold, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: loading ? '#181207' : '#090909' }}>
          <Text style={{ color: colors.goldLight, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>{loading ? 'Syncing' : 'Refresh'}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <StatTile label="Blocked" value={summary.blocked} />
        <StatTile label="Internal" value={summary.internalReview} />
        <StatTile label="Marketplace" value={summary.marketplaceReview} />
        <StatTile label="Approved" value={summary.approved} />
        <StatTile label="Published" value={summary.published} />
      </View>

      {records.length ? (
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' }}>Latest review records</Text>
          {records.map((record) => (
            <RecordRow
              key={record.id}
              record={record}
              audits={auditHistoryByRecordId[record.id]}
              bundles={bundlesByRecordId[record.id]}
              auditOpen={openAuditRecordId === record.id}
              bundleOpen={openBundleRecordId === record.id}
              auditLoading={auditLoadingRecordId === record.id}
              bundleLoading={bundleLoadingRecordId === record.id}
              bundleBusy={bundleCreatingRecordId === record.id}
              busyAction={actionState?.recordId === record.id ? actionState.action : null}
              onAction={runReviewAction}
              onToggleAudit={toggleAuditHistory}
              onToggleBundles={toggleBundles}
              onCreateBundle={createBundle}
            />
          ))}
        </View>
      ) : (
        <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 10, backgroundColor: '#060606' }}>
          <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>No backend review records loaded yet. Submit a generated bundle review record from the Publish Gate action, then refresh this panel.</Text>
        </View>
      )}
    </View>
  );
}

export default MXReviewQueueApiPanel;
