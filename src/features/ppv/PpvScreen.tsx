import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  createPpvItem,
  listPpvItems,
  PpvAccessType,
  PpvItem,
  PpvMediaType,
  PpvReviewStatus,
  PpvVisibility,
  unlockPpvItem,
} from '../../api/ppvApi';
import { listWalletTransactions, WalletTransaction } from '../../api/walletApi';
import { getCurrentUser } from '../../state/authStore';

const ACCESS_TYPES: PpvAccessType[] = ['TIMED', 'BUY_TO_KEEP', 'SUBSCRIPTION_INCLUDED'];
const MEDIA_TYPES: PpvMediaType[] = ['VIDEO', 'PHOTO', 'AUDIO', 'TEXT'];
const VISIBILITY_TYPES: PpvVisibility[] = ['PUBLIC', 'SUBSCRIBERS', 'PRIVATE'];
const DURATION_PRESETS = [15, 30, 60, 180, 1440];
type PpvFilter = 'ALL' | 'UNLOCKED' | 'LOCKED' | 'MINE';

const FILTERS: { id: PpvFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'UNLOCKED', label: 'Unlocked' },
  { id: 'LOCKED', label: 'Locked' },
  { id: 'MINE', label: 'My drops' },
];

const ACCESS_TYPE_COPY: Record<PpvAccessType, { label: string; description: string; badge: string }> = {
  TIMED: {
    label: 'Timed viewing',
    description: 'Sub unlocks access for a limited viewing window set by the Mistress.',
    badge: 'COUNTDOWN',
  },
  BUY_TO_KEEP: {
    label: 'Buy to keep',
    description: 'Sub unlocks permanent access to this PPV item after purchase.',
    badge: 'KEEP',
  },
  SUBSCRIPTION_INCLUDED: {
    label: 'Subscription bundle',
    description: 'Included for eligible subscribers, with normal price shown for everyone else.',
    badge: 'BUNDLE',
  },
};

const MEDIA_TYPE_COPY: Record<PpvMediaType, { label: string; badge: string }> = {
  VIDEO: { label: 'Video', badge: 'VID' },
  PHOTO: { label: 'Photo', badge: 'PIC' },
  AUDIO: { label: 'Audio', badge: 'AUD' },
  TEXT: { label: 'Text', badge: 'TXT' },
};

const VISIBILITY_COPY: Record<PpvVisibility, { label: string; description: string; badge: string }> = {
  PUBLIC: {
    label: 'Public',
    description: 'Visible in the PPV vault for eligible viewers.',
    badge: 'PUBLIC',
  },
  SUBSCRIBERS: {
    label: 'Subscribers',
    description: 'Visible only to active subscribers for this creator.',
    badge: 'SUBS',
  },
  PRIVATE: {
    label: 'Private',
    description: 'Visible only to the owner until it is made available.',
    badge: 'PRIVATE',
  },
};

const REVIEW_STATUS_COPY: Record<PpvReviewStatus, { label: string; color: string }> = {
  PENDING_REVIEW: { label: 'Pending review', color: '#d4af37' },
  APPROVED: { label: 'Approved', color: '#1D9E75' },
  NEEDS_CHANGES: { label: 'Needs changes', color: '#ff6b6b' },
};

function canCreatePpv(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

function formatExpiry(expiresAt?: string | null) {
  if (!expiresAt) return null;
  return new Date(expiresAt).toLocaleString();
}

function getExpiryTime(expiresAt?: string | null) {
  if (!expiresAt) return null;
  const time = new Date(expiresAt).getTime();
  return Number.isFinite(time) ? time : null;
}

function isExpired(item: PpvItem, now: number) {
  const expiryTime = getExpiryTime(item.expiresAt);
  return Boolean(item.isUnlocked && expiryTime && expiryTime <= now);
}

function hasOpenAccess(item: PpvItem, now: number) {
  if (item.isOwner) return true;
  if (!item.isUnlocked) return false;
  return !isExpired(item, now);
}

function timeRemainingLabel(expiresAt: string | null | undefined, now: number) {
  const expiryTime = getExpiryTime(expiresAt);
  if (!expiryTime) return null;

  const remainingMs = expiryTime - now;
  if (remainingMs <= 0) return 'Expired';

  const remainingMinutes = Math.ceil(remainingMs / 60000);
  if (remainingMinutes >= 1440) return `${Math.ceil(remainingMinutes / 1440)}d left`;
  if (remainingMinutes >= 60) return `${Math.ceil(remainingMinutes / 60)}h left`;
  return `${remainingMinutes}m left`;
}

function numericPrice(value: number | string | undefined | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function durationLabel(minutes?: number | string | null) {
  const parsed = Number(minutes ?? 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  if (parsed >= 1440) return `${Math.round(parsed / 1440)} day${parsed === 1440 ? '' : 's'}`;
  if (parsed >= 60) return `${Math.round(parsed / 60)} hour${parsed === 60 ? '' : 's'}`;
  return `${parsed} mins`;
}

function priceLabel(item: PpvItem) {
  const original = numericPrice(item.price);
  const effective = numericPrice(item.effectivePrice ?? item.price);
  if (item.subscriptionIncluded) return `Included with ${item.subscriptionPlanName || item.subscriptionTier || 'subscription'}`;
  if (effective < original) return `${effective} credits with subscription - normally ${original}`;
  return `${original} credits`;
}

function unlockButtonLabel(item: PpvItem, isUnlocked: boolean, isUnlocking: boolean) {
  if (isUnlocked) return 'Unlocked';
  if (isUnlocking) return 'Unlocking...';
  if (item.isUnlocked) return 'Renew PPV';
  if (item.subscriptionIncluded) return 'Unlock Included PPV';
  const original = numericPrice(item.price);
  const effective = numericPrice(item.effectivePrice ?? item.price);
  if (effective < original) return `Unlock PPV - ${effective} credits`;
  return 'Unlock PPV';
}

function isKnownMediaType(mediaType: unknown): mediaType is PpvMediaType {
  return typeof mediaType === 'string' && Object.prototype.hasOwnProperty.call(MEDIA_TYPE_COPY, mediaType);
}

function getMediaTypeCopy(mediaType?: PpvMediaType | string | null) {
  return MEDIA_TYPE_COPY[isKnownMediaType(mediaType) ? mediaType : 'VIDEO'];
}

function isKnownVisibility(visibility: unknown): visibility is PpvVisibility {
  return typeof visibility === 'string' && Object.prototype.hasOwnProperty.call(VISIBILITY_COPY, visibility);
}

function getVisibilityCopy(visibility?: PpvVisibility | string | null) {
  return VISIBILITY_COPY[isKnownVisibility(visibility) ? visibility : 'PUBLIC'];
}

function isKnownReviewStatus(reviewStatus: unknown): reviewStatus is PpvReviewStatus {
  return typeof reviewStatus === 'string' && Object.prototype.hasOwnProperty.call(REVIEW_STATUS_COPY, reviewStatus);
}

function getReviewStatusCopy(reviewStatus?: PpvReviewStatus | string | null) {
  return REVIEW_STATUS_COPY[isKnownReviewStatus(reviewStatus) ? reviewStatus : 'PENDING_REVIEW'];
}

function isPpvTransaction(tx: WalletTransaction) {
  const metadata = tx.metadata && typeof tx.metadata === 'object' && !Array.isArray(tx.metadata) ? tx.metadata : {};
  const type = String(tx.type || '').toUpperCase();
  const reason = String(tx.reason || '').toLowerCase();
  return (
    type === 'PPV_UNLOCK' ||
    type === 'PPV_PURCHASE' ||
    type === 'PPV_SALE' ||
    reason === 'ppv_unlock' ||
    reason === 'ppv_purchase' ||
    typeof metadata.ppvItemId === 'string' ||
    typeof metadata.ppvContentId === 'string' ||
    typeof metadata.ppvContentId === 'number'
  );
}

function ppvTransactionItemId(tx: WalletTransaction) {
  const metadata = tx.metadata && typeof tx.metadata === 'object' && !Array.isArray(tx.metadata) ? tx.metadata : {};
  if (typeof metadata.ppvItemId === 'string') return metadata.ppvItemId;
  if (typeof metadata.ppvContentId === 'string' || typeof metadata.ppvContentId === 'number') return String(metadata.ppvContentId);
  return null;
}

function ppvTransactionMetaLabel(tx: WalletTransaction) {
  const metadata = tx.metadata && typeof tx.metadata === 'object' && !Array.isArray(tx.metadata) ? tx.metadata : {};
  const mediaType = typeof metadata.mediaType === 'string' ? getMediaTypeCopy(metadata.mediaType).label : 'PPV';
  const accessType = typeof metadata.accessType === 'string' ? ACCESS_TYPE_COPY[metadata.accessType as PpvAccessType]?.label : null;
  return accessType ? `${mediaType} - ${accessType}` : mediaType;
}

function ppvTransactionAmountLabel(tx: WalletTransaction, currentUserId?: string) {
  const gross = numericPrice(tx.amount);
  const mistressAmount = numericPrice(tx.mistressAmount);
  if (tx.receiverUserId === currentUserId && mistressAmount > 0) {
    return `Received ${mistressAmount} credits - gross ${gross}`;
  }

  return `Paid ${gross} credits`;
}

export function PpvScreen() {
  const currentUser = getCurrentUser();
  const [items, setItems] = useState<PpvItem[]>([]);
  const [ppvTransactions, setPpvTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PpvFilter>('ALL');
  const [now, setNow] = useState(() => Date.now());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState<PpvMediaType>('VIDEO');
  const [visibility, setVisibility] = useState<PpvVisibility>('PUBLIC');
  const [price, setPrice] = useState('10');
  const [accessType, setAccessType] = useState<PpvAccessType>('TIMED');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const ppvSummary = useMemo(() => {
    const unlocked = items.filter((item) => hasOpenAccess(item, now)).length;
    const mine = items.filter((item) => item.isOwner || item.mistressUserId === currentUser?.id).length;
    const locked = items.filter((item) => !hasOpenAccess(item, now)).length;
    const expiringSoon = items.filter((item) => {
      const expiryTime = getExpiryTime(item.expiresAt);
      return Boolean(hasOpenAccess(item, now) && expiryTime && expiryTime - now <= 60 * 60 * 1000);
    }).length;
    const pendingReview = items.filter((item) => item.reviewStatus === 'PENDING_REVIEW').length;

    return {
      total: items.length,
      unlocked,
      locked,
      mine,
      expiringSoon,
      pendingReview,
    };
  }, [currentUser?.id, items, now]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeFilter === 'UNLOCKED') return hasOpenAccess(item, now);
      if (activeFilter === 'LOCKED') return !hasOpenAccess(item, now);
      if (activeFilter === 'MINE') return item.isOwner || item.mistressUserId === currentUser?.id;
      return true;
    });
  }, [activeFilter, currentUser?.id, items, now]);

  const itemTitleById = useMemo(() => {
    return new Map(items.map((item) => [item.id, item.title]));
  }, [items]);

  const recentPpvTransactions = useMemo(() => ppvTransactions.slice(0, 5), [ppvTransactions]);

  async function loadPpvTransactions() {
    try {
      const tx = await listWalletTransactions();
      setPpvTransactions(tx.filter(isPpvTransaction));
    } catch {
      setPpvTransactions([]);
    }
  }

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      const [data, tx] = await Promise.all([
        listPpvItems(),
        listWalletTransactions().catch(() => [] as WalletTransaction[]),
      ]);
      setItems(data);
      setPpvTransactions(tx.filter(isPpvTransaction));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PPV items failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(item: PpvItem) {
    try {
      setUnlockingId(item.id);
      setError(null);
      const res = await unlockPpvItem(item.id);
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                isUnlocked: Boolean(res.unlocked),
                isOwner: Boolean(res.isOwner || entry.isOwner),
                expiresAt: res.expiresAt ?? entry.expiresAt ?? null,
                mediaUrl: res.mediaUrl ?? entry.mediaUrl,
                effectivePrice: res.effectivePrice ?? entry.effectivePrice,
                subscriptionIncluded: res.subscriptionIncluded ?? entry.subscriptionIncluded,
                subscriptionDiscountPercent: res.subscriptionDiscountPercent ?? entry.subscriptionDiscountPercent,
              }
            : entry,
        ),
      );
      await loadPpvTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PPV unlock failed');
    } finally {
      setUnlockingId(null);
    }
  }

  function resetCreateForm() {
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setPreviewUrl('');
    setMediaType('VIDEO');
    setVisibility('PUBLIC');
    setPrice('10');
    setDurationMinutes('60');
    setAccessType('TIMED');
  }

  async function handleCreate() {
    const numericPriceValue = Number(price);
    const numericDuration = Number(durationMinutes);

    if (!title.trim()) {
      setError('PPV title is required.');
      return;
    }

    if (!mediaUrl.trim()) {
      setError('Media URL is required until file upload storage is connected.');
      return;
    }

    if (!Number.isFinite(numericPriceValue) || numericPriceValue <= 0) {
      setError('Price must be greater than zero.');
      return;
    }

    if (accessType === 'TIMED' && (!Number.isFinite(numericDuration) || numericDuration <= 0)) {
      setError('Timed PPV needs a viewing duration.');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const created = await createPpvItem({
        title: title.trim(),
        description: description.trim() || undefined,
        mediaUrl: mediaUrl.trim(),
        previewUrl: previewUrl.trim() || undefined,
        mediaType,
        visibility,
        price: numericPriceValue,
        accessType,
        durationMinutes: accessType === 'TIMED' ? numericDuration : undefined,
      });

      setItems((current) => [{
        ...created,
        mediaType,
        visibility,
        reviewStatus: created.reviewStatus || 'PENDING_REVIEW',
        isOwner: true,
        isUnlocked: true,
        effectivePrice: 0,
      }, ...current]);
      resetCreateForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PPV creation failed');
    } finally {
      setCreating(false);
    }
  }

  const selectedAccessCopy = ACCESS_TYPE_COPY[accessType];
  const selectedMediaCopy = MEDIA_TYPE_COPY[mediaType];
  const selectedVisibilityCopy = VISIBILITY_COPY[visibility];

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 }}>
        PPV Vault
      </Text>
      <Text style={{ color: '#aaa', marginBottom: 12 }}>
        Upload premium content, set the price, choose timed access, buy-to-keep, or subscription-bundle access.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}

      <View style={{ backgroundColor: '#111', padding: 12, borderRadius: 12, marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>PPV progress</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[
            ['Total', ppvSummary.total],
            ['Unlocked', ppvSummary.unlocked],
            ['Locked', ppvSummary.locked],
            ['My drops', ppvSummary.mine],
            ['Expiring soon', ppvSummary.expiringSoon],
            ['Pending review', ppvSummary.pendingReview],
          ].map(([label, value]) => (
            <View key={label} style={{ backgroundColor: '#1b1b1b', padding: 9, borderRadius: 10, marginRight: 8, marginBottom: 8 }}>
              <Text style={{ color: '#999', fontSize: 10, fontWeight: '800' }}>{label}</Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 }}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: '#111', padding: 12, borderRadius: 12, marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>PPV transactions</Text>
        {!recentPpvTransactions.length ? (
          <Text style={{ color: '#999' }}>No paid PPV transactions yet.</Text>
        ) : null}
        {recentPpvTransactions.map((tx) => {
          const itemId = ppvTransactionItemId(tx);
          const itemTitle = itemId ? itemTitleById.get(itemId) : null;
          return (
            <View key={tx.id} style={{ backgroundColor: '#1b1b1b', padding: 10, borderRadius: 10, marginBottom: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{itemTitle || 'PPV unlock'}</Text>
              <Text style={{ color: tx.receiverUserId === currentUser?.id ? '#1D9E75' : '#ff9abf', marginTop: 3 }}>
                {ppvTransactionAmountLabel(tx, currentUser?.id)}
              </Text>
              <Text style={{ color: '#999', fontSize: 11, marginTop: 3 }}>
                {ppvTransactionMetaLabel(tx)} - {new Date(tx.createdAt).toLocaleString()}
              </Text>
            </View>
          );
        })}
      </View>

      {canCreatePpv(currentUser?.role) ? (
        <View style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>
              Create PPV
            </Text>
            <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>MISTRESS TOOL</Text>
          </View>

          <View style={{ backgroundColor: '#1b1b1b', padding: 10, borderRadius: 10, marginBottom: 10 }}>
            <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 4 }}>Upload staging</Text>
            <Text style={{ color: '#aaa', fontSize: 12 }}>
              Paste media and preview URLs for now. File upload/storage can connect later without changing this PPV flow.
            </Text>
          </View>

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Media type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {MEDIA_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setMediaType(type)}
                style={{
                  backgroundColor: mediaType === type ? '#d4af37' : '#1b1b1b',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: mediaType === type ? '#000' : '#fff', fontSize: 11, fontWeight: '800' }}>
                  {MEDIA_TYPE_COPY[type].label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Visibility</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {VISIBILITY_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setVisibility(type)}
                style={{
                  backgroundColor: visibility === type ? '#ff0055' : '#1b1b1b',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{VISIBILITY_COPY[type].label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ backgroundColor: '#1b1b1b', padding: 10, borderRadius: 10, marginBottom: 8 }}>
            <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{selectedVisibilityCopy.badge}</Text>
            <Text style={{ color: '#fff', fontWeight: '800', marginTop: 2 }}>{selectedVisibilityCopy.label}</Text>
            <Text style={{ color: '#aaa', fontSize: 12, marginTop: 3 }}>{selectedVisibilityCopy.description}</Text>
            <Text style={{ color: REVIEW_STATUS_COPY.PENDING_REVIEW.color, fontSize: 11, fontWeight: '900', marginTop: 8 }}>
              Review: {REVIEW_STATUS_COPY.PENDING_REVIEW.label}
            </Text>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#777"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor="#777"
            multiline
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, minHeight: 72 }}
          />

          <TextInput
            value={mediaUrl}
            onChangeText={setMediaUrl}
            placeholder={`Locked ${selectedMediaCopy.label.toLowerCase()} URL`}
            placeholderTextColor="#777"
            autoCapitalize="none"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />

          <TextInput
            value={previewUrl}
            onChangeText={setPreviewUrl}
            placeholder="Preview/teaser URL"
            placeholderTextColor="#777"
            autoCapitalize="none"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />

          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Price in credits"
            placeholderTextColor="#777"
            keyboardType="numeric"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Access mode</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {ACCESS_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setAccessType(type)}
                style={{
                  backgroundColor: accessType === type ? '#ff0055' : '#1b1b1b',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{ACCESS_TYPE_COPY[type].label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ backgroundColor: '#1b1b1b', padding: 10, borderRadius: 10, marginBottom: 8 }}>
            <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{selectedAccessCopy.badge}</Text>
            <Text style={{ color: '#fff', fontWeight: '800', marginTop: 2 }}>{selectedAccessCopy.label}</Text>
            <Text style={{ color: '#aaa', fontSize: 12, marginTop: 3 }}>{selectedAccessCopy.description}</Text>
          </View>

          {accessType === 'TIMED' ? (
            <>
              <TextInput
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                placeholder="Duration minutes"
                placeholderTextColor="#777"
                keyboardType="numeric"
                style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {DURATION_PRESETS.map((minutes) => (
                  <Pressable
                    key={minutes}
                    onPress={() => setDurationMinutes(String(minutes))}
                    style={{
                      backgroundColor: durationMinutes === String(minutes) ? '#d4af37' : '#1b1b1b',
                      paddingVertical: 7,
                      paddingHorizontal: 10,
                      borderRadius: 999,
                      marginRight: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: durationMinutes === String(minutes) ? '#000' : '#fff', fontSize: 11, fontWeight: '800' }}>
                      {durationLabel(minutes)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={handleCreate}
              disabled={creating}
              style={{ backgroundColor: '#ff0055', padding: 12, borderRadius: 10, flex: 1 }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>
                {creating ? 'Creating...' : 'Create PPV Item'}
              </Text>
            </Pressable>
            <Pressable
              onPress={resetCreateForm}
              style={{ backgroundColor: '#1b1b1b', padding: 12, borderRadius: 10 }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Reset</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
        Browse PPV
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
            style={{
              backgroundColor: activeFilter === filter.id ? '#ff0055' : '#1b1b1b',
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 999,
              marginRight: 6,
              marginBottom: 6,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{filter.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? <Text style={{ color: '#999' }}>Loading PPV items...</Text> : null}

      {!loading && !items.length ? (
        <Text style={{ color: '#999' }}>No PPV items available yet.</Text>
      ) : null}

      {!loading && items.length > 0 && filteredItems.length === 0 ? (
        <Text style={{ color: '#999', marginBottom: 12 }}>No PPV items match this filter.</Text>
      ) : null}

      {filteredItems.map((item) => {
        const isUnlocked = hasOpenAccess(item, now);
        const isUnlocking = unlockingId === item.id;
        const expiryLabel = formatExpiry(item.expiresAt);
        const remainingLabel = timeRemainingLabel(item.expiresAt, now);
        const expired = isExpired(item, now);
        const original = numericPrice(item.price);
        const effective = numericPrice(item.effectivePrice ?? item.price);
        const hasDiscount = effective < original && !item.subscriptionIncluded;
        const itemAccessCopy = ACCESS_TYPE_COPY[item.accessType];
        const itemMediaCopy = getMediaTypeCopy(item.mediaType);
        const itemVisibilityCopy = getVisibilityCopy(item.visibility);
        const itemReviewCopy = getReviewStatusCopy(item.reviewStatus);
        const itemDuration = durationLabel(item.durationMinutes);
        const mediaDisplay = isUnlocked
          ? item.mediaUrl || 'Media unavailable.'
          : item.previewUrl || 'Preview unavailable until the Mistress adds a teaser.';

        return (
          <View
            key={item.id}
            style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 10 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>{item.title}</Text>
                {item.description ? <Text style={{ color: '#aaa', marginTop: 4 }}>{item.description}</Text> : null}
              </View>
              <View style={{ backgroundColor: isUnlocked ? '#1D9E75' : expired ? '#7b2e2e' : '#2a2a2a', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 999, alignSelf: 'flex-start' }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{isUnlocked ? 'OPEN' : expired ? 'EXPIRED' : 'LOCKED'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              <Text style={{ color: item.subscriptionIncluded ? '#1D9E75' : hasDiscount ? '#d4af37' : '#ff9abf', marginRight: 10, fontWeight: '800' }}>
                {priceLabel(item)}
              </Text>
              <Text style={{ color: '#d4af37', marginRight: 10, fontWeight: '800' }}>{itemMediaCopy.label}</Text>
              <Text style={{ color: '#aaa', marginRight: 10 }}>{itemVisibilityCopy.label}</Text>
              <Text style={{ color: '#aaa', marginRight: 10 }}>{itemAccessCopy?.label || item.accessType}</Text>
              {itemDuration ? <Text style={{ color: '#aaa' }}>{itemDuration}</Text> : null}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              <View style={{ backgroundColor: '#1b1b1b', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 999, marginRight: 6, marginBottom: 6 }}>
                <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>{itemVisibilityCopy.badge}</Text>
              </View>
              <View style={{ backgroundColor: '#1b1b1b', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 999, marginRight: 6, marginBottom: 6 }}>
                <Text style={{ color: itemReviewCopy.color, fontSize: 10, fontWeight: '900' }}>{itemReviewCopy.label}</Text>
              </View>
            </View>

            {item.subscriptionIncluded ? (
              <View style={{ backgroundColor: '#07291f', padding: 9, borderRadius: 10, marginTop: 8 }}>
                <Text style={{ color: '#1D9E75', fontWeight: '900' }}>Included with subscription</Text>
                <Text style={{ color: '#b7f5df', fontSize: 11, marginTop: 3 }}>
                  {item.subscriptionPlanName || item.subscriptionTier || 'Active subscription'} gives PPV access without an extra unlock charge.
                </Text>
              </View>
            ) : null}

            {hasDiscount ? (
              <View style={{ backgroundColor: '#2b2208', padding: 9, borderRadius: 10, marginTop: 8 }}>
                <Text style={{ color: '#d4af37', fontWeight: '900' }}>Subscription discount applied</Text>
                <Text style={{ color: '#f7e7a8', fontSize: 11, marginTop: 3 }}>
                  {item.subscriptionDiscountPercent || 0}% off - Pay {effective} instead of {original} credits.
                </Text>
              </View>
            ) : null}

            {item.isOwner ? <Text style={{ color: '#1D9E75', marginTop: 6 }}>Owner access</Text> : null}
            {item.isUnlocked && expiryLabel ? (
              <Text style={{ color: expired ? '#ff6b6b' : '#ff9abf', marginTop: 6 }}>
                {remainingLabel ? `${remainingLabel} - ` : ''}Expires: {expiryLabel}
              </Text>
            ) : null}

            <View style={{ backgroundColor: '#1b1b1b', padding: 10, borderRadius: 10, marginTop: 10 }}>
              <Text style={{ color: isUnlocked ? '#1D9E75' : '#777', fontWeight: '800' }}>
                {isUnlocked ? `Unlocked ${itemMediaCopy.label.toLowerCase()}` : `Locked ${itemMediaCopy.label.toLowerCase()} preview`}
              </Text>
              <Text style={{ color: isUnlocked ? '#1D9E75' : '#999', marginTop: 4 }}>
                {mediaDisplay}
              </Text>
            </View>

            <Pressable
              onPress={() => handleUnlock(item)}
              disabled={isUnlocked || isUnlocking}
              style={{
                backgroundColor: isUnlocked ? '#1D9E75' : item.subscriptionIncluded ? '#1D9E75' : '#ff0055',
                padding: 10,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>
                {unlockButtonLabel(item, isUnlocked, isUnlocking)}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}
