import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  createSubVaultItem,
  listMySubVaultItems,
  listSharedSubVaultItems,
  listSubVaultReviewQueue,
  recordSubVaultPolicyGuardHandoff,
  reviewSubVaultItem,
  revokeSubVaultItem,
  shareSubVaultItem,
  submitSubVaultItem,
  SubVaultItem,
  SubVaultItemCategory,
  SubVaultPolicyGuardSnapshot,
} from '../../api/subVaultApi';
import { getCurrentUser } from '../../state/authStore';

const CATEGORIES: SubVaultItemCategory[] = [
  'IDENTITY_VERIFICATION',
  'AGE_VERIFICATION',
  'CONSENT_DOCUMENT',
  'TRIBUTE_RECEIPT',
  'CUSTOM_ATTESTATION',
];

type VaultGuardIndicator = {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: string;
};

const VAULT_SURFACE_GUARDS: VaultGuardIndicator[] = [
  {
    id: 'vault-consent',
    label: 'Consent',
    status: 'REQUIRED',
    detail: 'References must carry consent state before sharing or review.',
    tone: '#d4af37',
  },
  {
    id: 'vault-review',
    label: 'Review',
    status: 'ADMIN',
    detail: 'Submitted verification rows stay in the Headmistress/Admin queue.',
    tone: '#1D9E75',
  },
  {
    id: 'vault-revoke',
    label: 'Revocation',
    status: 'VISIBLE',
    detail: 'Revoked items keep their safety state visible after access is removed.',
    tone: '#ff9abf',
  },
];

function canReview(role?: string) {
  return role === 'HEADMISTRESS' || role === 'ADMIN';
}

function statusColor(status: string) {
  if (status === 'VERIFIED') return '#1D9E75';
  if (status === 'SUBMITTED') return '#d4af37';
  if (status === 'REJECTED' || status === 'REVOKED') return '#ff6b6b';
  return '#aaa';
}

function policySeverityTone(severity?: SubVaultPolicyGuardSnapshot['severity']) {
  if (severity === 'CLEAR') return '#1D9E75';
  if (severity === 'BLOCKED') return '#ff6b6b';
  if (severity === 'WARNING') return '#d4af37';
  return '#aaa';
}

function parseShareIds(value: string) {
  return Array.from(new Set(value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)));
}

function formatVaultDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function vaultAuditActionLabel(action?: string) {
  return String(action || 'audit')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readableVaultAuditMetadata(metadata?: Record<string, unknown>) {
  if (!metadata || typeof metadata !== 'object') return null;
  const note = metadata.note ? String(metadata.note) : null;
  const label = metadata.handoffLabel ? `Handoff: ${String(metadata.handoffLabel)}` : null;
  const requestedAt = metadata.requestedAt ? `Requested: ${formatVaultDate(String(metadata.requestedAt)) || String(metadata.requestedAt)}` : null;
  return [note, label, requestedAt].filter(Boolean).join(' / ') || null;
}

function vaultGuardsForItem(item: SubVaultItem): VaultGuardIndicator[] {
  if (item.policyGuards?.length) {
    return item.policyGuards.map((guard) => ({
      id: guard.id,
      label: guard.label,
      status: guard.status,
      detail: guard.detail,
      tone: policySeverityTone(guard.severity),
    }));
  }

  return [
    {
      id: 'item-consent',
      label: 'Consent',
      status: item.consentGranted ? 'GRANTED' : 'NEEDED',
      detail: item.consentGranted ? item.consentVersion : 'Consent must be granted before trusted sharing.',
      tone: item.consentGranted ? '#1D9E75' : '#ff9abf',
    },
    {
      id: 'item-review',
      label: 'Review',
      status: item.status,
      detail: item.reviewedAt ? `Reviewed ${formatVaultDate(item.reviewedAt) || item.reviewedAt}` : 'Awaiting review state.',
      tone: statusColor(item.status),
    },
    {
      id: 'item-sharing',
      label: 'Sharing',
      status: item.sharedWithUserIds.length ? 'ACTIVE' : 'PRIVATE',
      detail: item.sharedWithUserIds.length ? `${item.sharedWithUserIds.length} active share target(s)` : 'No active share targets.',
      tone: item.sharedWithUserIds.length ? '#d4af37' : '#777',
    },
  ];
}

function policyBlocks(item: SubVaultItem, key: 'blocksShare' | 'blocksSubmit' | 'blocksReview', fallback: boolean) {
  if (!item.policyGuards?.length) return fallback;
  return item.policyGuards.some((guard) => Boolean(guard[key]));
}

function prioritizeFocusedItems(items: SubVaultItem[], focusedItemId?: string | null) {
  if (!focusedItemId) return items;
  return items.slice().sort((a, b) => {
    if (a.id === focusedItemId) return -1;
    if (b.id === focusedItemId) return 1;
    return 0;
  });
}

function VaultGuardPill({ guard }: { guard: VaultGuardIndicator }) {
  return (
    <View style={{ borderColor: guard.tone, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#050505' }}>
      <Text style={{ color: guard.tone, fontSize: 10, fontWeight: '900' }}>{guard.label.toUpperCase()} / {guard.status.toUpperCase()}</Text>
    </View>
  );
}

function VaultGuardPanel({ guards }: { guards: VaultGuardIndicator[] }) {
  return (
    <View style={{ backgroundColor: '#111', borderColor: '#282828', borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>Vault Guard Indicators</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {guards.map((guard) => (
          <View key={guard.id} style={{ flexGrow: 1, flexBasis: 190, gap: 5 }}>
            <VaultGuardPill guard={guard} />
            <Text style={{ color: '#aaa', fontSize: 11, lineHeight: 16 }}>{guard.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function VaultItemCard({
  item,
  shareDraft,
  onSubmit,
  onRevoke,
  onShare,
  onShareDraftChange,
  focused,
}: {
  item: SubVaultItem;
  shareDraft?: string;
  onSubmit?: () => void;
  onRevoke?: () => void;
  onShare?: () => void;
  onShareDraftChange?: (value: string) => void;
  focused?: boolean;
}) {
  const color = statusColor(item.status);
  const submittedAt = formatVaultDate(item.submittedAt);
  const reviewedAt = formatVaultDate(item.reviewedAt);
  const revokedAt = formatVaultDate(item.revokedAt);
  const guards = vaultGuardsForItem(item);
  const auditHistory = item.auditHistory || [];
  const sharingBlocked = policyBlocks(item, 'blocksShare', item.status !== 'VERIFIED' || !item.consentGranted);
  const submitBlocked = policyBlocks(item, 'blocksSubmit', (item.status !== 'DRAFT' && item.status !== 'REJECTED') || !item.consentGranted);
  const canSubmitReview = !submitBlocked;

  return (
    <View style={{ backgroundColor: focused ? '#171207' : '#111', borderRadius: 16, padding: 14, borderWidth: focused ? 2 : 1, borderColor: focused ? '#d4af37' : '#282828', marginBottom: 10 }}>
      {focused ? <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900', marginBottom: 8 }}>HEADMISTRESS HANDOFF TARGET</Text> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{item.title}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{item.category}</Text>
        </View>
        <Text style={{ color, fontWeight: '900' }}>{item.status}</Text>
      </View>

      {item.redactedSummary ? <Text style={{ color: '#aaa', marginTop: 8 }}>{item.redactedSummary}</Text> : null}
      {item.evidenceRef ? <Text style={{ color: '#777', fontSize: 11, marginTop: 6 }}>Reference: {item.evidenceRef}</Text> : null}
      <Text style={{ color: '#777', fontSize: 11, marginTop: 6 }}>
        Consent: {item.consentGranted ? 'granted' : 'not granted'} / {item.consentVersion}
      </Text>
      <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>Updated: {formatVaultDate(item.updatedAt) || item.updatedAt}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {guards.map((guard) => <VaultGuardPill key={`${item.id}-${guard.id}`} guard={guard} />)}
      </View>

      {submittedAt ? <Text style={{ color: '#d4af37', fontSize: 11, marginTop: 4 }}>Submitted: {submittedAt}</Text> : null}
      {reviewedAt ? (
        <Text style={{ color: '#1D9E75', fontSize: 11, marginTop: 4 }}>
          Reviewed: {reviewedAt}{item.reviewedByUserId ? ` by ${item.reviewedByUserId}` : ''}
        </Text>
      ) : null}
      {revokedAt ? <Text style={{ color: '#ff6b6b', fontSize: 11, marginTop: 4 }}>Revoked: {revokedAt}</Text> : null}
      {item.reviewNotes ? <Text style={{ color: '#aaa', fontSize: 12, marginTop: 6 }}>Review note: {item.reviewNotes}</Text> : null}

      {auditHistory.length ? (
        <View style={{ backgroundColor: '#080808', borderColor: '#2d2d2d', borderWidth: 1, borderRadius: 12, padding: 10, gap: 7, marginTop: 10 }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>Audit Trail</Text>
          {auditHistory.slice(0, 3).map((entry) => {
            const metadata = readableVaultAuditMetadata(entry.metadata);
            return (
              <View key={entry.id} style={{ borderLeftColor: entry.action === 'POLICY_HANDOFF_OPENED' ? '#d4af37' : statusColor(item.status), borderLeftWidth: 3, paddingLeft: 8, gap: 2 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{vaultAuditActionLabel(entry.action)}</Text>
                <Text style={{ color: '#777', fontSize: 10 }}>{formatVaultDate(entry.createdAt) || entry.createdAt} by {entry.actorUserId || 'system'}</Text>
                {metadata ? <Text style={{ color: '#aaa', fontSize: 10, lineHeight: 15 }}>{metadata}</Text> : null}
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={{ marginTop: 8 }}>
        <Text style={{ color: '#777', fontSize: 11, fontWeight: '900', marginBottom: 6 }}>
          Shared with {item.sharedWithUserIds.length} user{item.sharedWithUserIds.length === 1 ? '' : 's'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {item.sharedWithUserIds.length ? item.sharedWithUserIds.map((userId) => (
            <View key={userId} style={{ backgroundColor: '#050505', borderColor: '#333', borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
              <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{userId}</Text>
            </View>
          )) : <Text style={{ color: '#777', fontSize: 11 }}>No active shares.</Text>}
        </View>
      </View>

      {onShareDraftChange ? (
        <TextInput
          value={shareDraft}
          onChangeText={onShareDraftChange}
          placeholder="User IDs to share with, comma separated"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, marginTop: 10 }}
        />
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {onShare ? (
          <Pressable
            onPress={onShare}
            disabled={sharingBlocked}
            style={{ backgroundColor: sharingBlocked ? '#151515' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, opacity: sharingBlocked ? 0.55 : 1 }}
          >
            <Text style={{ color: sharingBlocked ? '#777' : '#fff', fontWeight: '900' }}>{sharingBlocked ? 'Verify Before Sharing' : 'Apply Sharing'}</Text>
          </Pressable>
        ) : null}
        {onSubmit && canSubmitReview ? (
          <Pressable onPress={onSubmit} style={{ backgroundColor: '#2b2208', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 }}>
            <Text style={{ color: '#d4af37', fontWeight: '900' }}>Submit Review</Text>
          </Pressable>
        ) : null}
        {onRevoke && item.status !== 'REVOKED' ? (
          <Pressable onPress={onRevoke} style={{ backgroundColor: '#26101a', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 }}>
            <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Revoke</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type SubVaultScreenProps = {
  handoffItemId?: string;
  handoffLabel?: string;
  handoffRequestedAt?: string;
};

export function SubVaultScreen({
  handoffItemId,
  handoffLabel,
  handoffRequestedAt,
}: SubVaultScreenProps = {}) {
  const currentUser = getCurrentUser();
  const reviewer = canReview(currentUser?.role);
  const [items, setItems] = useState<SubVaultItem[]>([]);
  const [sharedItems, setSharedItems] = useState<SubVaultItem[]>([]);
  const [reviewQueue, setReviewQueue] = useState<SubVaultItem[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SubVaultItemCategory>('AGE_VERIFICATION');
  const [redactedSummary, setRedactedSummary] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [shareDrafts, setShareDrafts] = useState<Record<string, string>>({});
  const [reviewNoteDrafts, setReviewNoteDrafts] = useState<Record<string, string>>({});
  const [consentGranted, setConsentGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [focusedHandoffItemId, setFocusedHandoffItemId] = useState<string | null>(null);
  const [handledPolicyHandoffKey, setHandledPolicyHandoffKey] = useState<string | null>(null);
  const [loadedVaultOnce, setLoadedVaultOnce] = useState(false);

  useEffect(() => {
    void loadVault();
  }, []);

  async function loadVault() {
    try {
      setLoading(true);
      setError(null);
      const [mine, shared, nextReviewQueue] = await Promise.all([
        listMySubVaultItems(),
        listSharedSubVaultItems(),
        reviewer ? listSubVaultReviewQueue() : Promise.resolve([]),
      ]);
      setItems(mine);
      setSharedItems(shared);
      setReviewQueue(nextReviewQueue);
      setShareDrafts(
        mine.reduce<Record<string, string>>((drafts, item) => {
          drafts[item.id] = item.sharedWithUserIds.join(', ');
          return drafts;
        }, {}),
      );
      setReviewNoteDrafts(
        nextReviewQueue.reduce<Record<string, string>>((drafts, item) => {
          drafts[item.id] = item.reviewNotes || '';
          return drafts;
        }, {}),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sub Vault failed to load.');
    } finally {
      setLoading(false);
      setLoadedVaultOnce(true);
    }
  }

  useEffect(() => {
    if (!handoffItemId || !handoffRequestedAt) return;
    const handoffKey = `${handoffRequestedAt}:${handoffItemId}`;
    if (handledPolicyHandoffKey === handoffKey) return;

    const target = [...reviewQueue, ...items, ...sharedItems].find((item) => item.id === handoffItemId);
    if (!target && !loadedVaultOnce) return;
    if (!target && loading) return;

    setHandledPolicyHandoffKey(handoffKey);
    setFocusedHandoffItemId(handoffItemId);
    if (target) {
      setError(null);
      setNotice(`Opened Headmistress policy handoff: ${handoffLabel || target.title}. Saving audit event...`);
      void recordSubVaultPolicyGuardHandoff(target.id, {
        label: handoffLabel || target.title,
        requestedAt: handoffRequestedAt,
        source: 'headmistress_dashboard',
      })
        .then((updated) => {
          mergeVaultItem(updated);
          setNotice(`Opened Headmistress policy handoff: ${handoffLabel || target.title}. Audit event saved.`);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Sub Vault policy handoff audit failed to save.');
        });
    } else {
      setNotice(null);
      setError(`Headmistress policy handoff ${handoffItemId} is not in the loaded Sub Vault lists.`);
    }
  }, [handledPolicyHandoffKey, handoffItemId, handoffLabel, handoffRequestedAt, items, loadedVaultOnce, loading, reviewQueue, sharedItems]);

  async function handleCreate() {
    if (!title.trim()) {
      setError('Sub Vault item title is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setNotice(null);
      await createSubVaultItem({
        title: title.trim(),
        category,
        redactedSummary: redactedSummary.trim() || undefined,
        evidenceRef: evidenceRef.trim() || undefined,
        consentGranted,
      });
      setTitle('');
      setRedactedSummary('');
      setEvidenceRef('');
      setConsentGranted(false);
      setNotice('Sub Vault item created.');
      await loadVault();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sub Vault item failed to create.');
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(action: () => Promise<SubVaultItem>, message: string) {
    try {
      setSaving(true);
      setError(null);
      setNotice(null);
      await action();
      setNotice(message);
      await loadVault();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sub Vault update failed.');
    } finally {
      setSaving(false);
    }
  }

  function mergeVaultItem(updated: SubVaultItem) {
    const replaceItem = (item: SubVaultItem) => item.id === updated.id ? updated : item;
    setItems((current) => current.map(replaceItem));
    setSharedItems((current) => current.map(replaceItem));
    setReviewQueue((current) => current.map(replaceItem));
  }

  function updateShareDraft(itemId: string, value: string) {
    setShareDrafts((current) => ({ ...current, [itemId]: value }));
  }

  function updateReviewNoteDraft(itemId: string, value: string) {
    setReviewNoteDrafts((current) => ({ ...current, [itemId]: value }));
  }

  function shareDraftForItem(item: SubVaultItem) {
    return shareDrafts[item.id] ?? item.sharedWithUserIds.join(', ');
  }

  function reviewNoteForItem(item: SubVaultItem) {
    return reviewNoteDrafts[item.id] ?? item.reviewNotes ?? '';
  }

  const focusedItems = useMemo(() => prioritizeFocusedItems(items, focusedHandoffItemId), [focusedHandoffItemId, items]);
  const focusedSharedItems = useMemo(() => prioritizeFocusedItems(sharedItems, focusedHandoffItemId), [focusedHandoffItemId, sharedItems]);
  const focusedReviewQueue = useMemo(() => prioritizeFocusedItems(reviewQueue, focusedHandoffItemId), [focusedHandoffItemId, reviewQueue]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Sub Vault / Verification Vault</Text>
        <Text style={{ color: '#aaa', marginTop: 6 }}>
          Consent-first reference storage for verification badges, review, sharing, and revocation.
        </Text>
      </View>

      <VaultGuardPanel guards={VAULT_SURFACE_GUARDS} />

      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#1D9E75' }}>{notice}</Text> : null}
      {loading ? <Text style={{ color: '#999' }}>Loading Sub Vault...</Text> : null}

      <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 14, gap: 10 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Create Reference</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Reference title"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10 }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((option) => {
            const active = option === category;
            return (
              <Pressable
                key={option}
                onPress={() => setCategory(option)}
                style={{ backgroundColor: active ? '#d4af37' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 }}
              >
                <Text style={{ color: active ? '#000' : '#fff', fontWeight: '900', fontSize: 11 }}>{option.replace(/_/g, ' ')}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={redactedSummary}
          onChangeText={setRedactedSummary}
          placeholder="Redacted summary"
          placeholderTextColor="#777"
          multiline
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, minHeight: 70 }}
        />
        <TextInput
          value={evidenceRef}
          onChangeText={setEvidenceRef}
          placeholder="Provider-safe evidence reference"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10 }}
        />
        <Pressable
          onPress={() => setConsentGranted((value) => !value)}
          style={{ backgroundColor: consentGranted ? '#143b2f' : '#26101a', borderRadius: 12, padding: 12 }}
        >
          <Text style={{ color: consentGranted ? '#1D9E75' : '#ff9abf', fontWeight: '900' }}>
            {consentGranted ? 'Consent granted' : 'Grant consent before saving'}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleCreate}
          disabled={saving}
          style={{ backgroundColor: saving ? '#333' : '#ff0055', borderRadius: 12, padding: 12 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>{saving ? 'Saving...' : 'Save Reference'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={loadVault} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Refresh Sub Vault</Text>
      </Pressable>

      <View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>My Vault Items</Text>
        {!loading && items.length === 0 ? <Text style={{ color: '#777' }}>No Sub Vault items yet.</Text> : null}
        {focusedItems.map((item) => (
          <VaultItemCard
            key={item.id}
            item={item}
            focused={focusedHandoffItemId === item.id}
            shareDraft={shareDraftForItem(item)}
            onShareDraftChange={(value) => updateShareDraft(item.id, value)}
            onShare={() => updateItem(() => shareSubVaultItem(item.id, parseShareIds(shareDraftForItem(item))), 'Sharing updated.')}
            onSubmit={() => updateItem(() => submitSubVaultItem(item.id), 'Item submitted for review.')}
            onRevoke={() => updateItem(() => revokeSubVaultItem(item.id), 'Item revoked.')}
          />
        ))}
      </View>

      <View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>Shared With Me</Text>
        {!loading && sharedItems.length === 0 ? <Text style={{ color: '#777' }}>No shared Sub Vault items.</Text> : null}
        {focusedSharedItems.map((item) => <VaultItemCard key={item.id} item={item} focused={focusedHandoffItemId === item.id} />)}
      </View>

      {reviewer ? (
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>Review Queue</Text>
          {!loading && reviewQueue.length === 0 ? <Text style={{ color: '#777' }}>No submitted items waiting for review.</Text> : null}
          {focusedReviewQueue.map((item) => {
            const reviewNote = reviewNoteForItem(item).trim();
            const reviewBlocked = !reviewNote || policyBlocks(item, 'blocksReview', item.status !== 'SUBMITTED');

            return (
              <View key={item.id}>
                <VaultItemCard item={item} focused={focusedHandoffItemId === item.id} />
                <TextInput
                  value={reviewNoteForItem(item)}
                  onChangeText={(value) => updateReviewNoteDraft(item.id, value)}
                  placeholder="Review note for this reference"
                  placeholderTextColor="#777"
                  multiline
                  style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, minHeight: 64, marginTop: -4, marginBottom: 8 }}
                />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -4, marginBottom: 12 }}>
                  <Pressable
                    disabled={reviewBlocked}
                    onPress={() => updateItem(
                      () => reviewSubVaultItem(item.id, 'VERIFY', reviewNote),
                      'Item verified.',
                    )}
                    style={{ backgroundColor: reviewBlocked ? '#173329' : '#1D9E75', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, opacity: reviewBlocked ? 0.55 : 1 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '900' }}>Verify</Text>
                  </Pressable>
                  <Pressable
                    disabled={reviewBlocked}
                    onPress={() => updateItem(
                      () => reviewSubVaultItem(item.id, 'REJECT', reviewNote),
                      'Item rejected.',
                    )}
                    style={{ backgroundColor: '#26101a', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, opacity: reviewBlocked ? 0.55 : 1 }}
                  >
                    <Text style={{ color: reviewBlocked ? '#777' : '#ff9abf', fontWeight: '900' }}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}
