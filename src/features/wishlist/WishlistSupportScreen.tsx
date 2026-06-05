import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import {
  createWishlistItem,
  deleteWishlistItem,
  listWishlistForMistress,
  listWishlistReservationsForMistress,
  purchaseWishlistItem,
  reserveWishlistItem,
  WishlistItem,
  WishlistReservation,
} from '../../api/wishlistApi';
import { getCurrentUser } from '../../state/authStore';
import { ActionPillButton } from '../buttons/ActionPillButton';

type WishlistDraft = {
  title: string;
  description: string;
  price: string;
  link: string;
  imageUrl: string;
  isPriority: boolean;
};

const initialDraft: WishlistDraft = {
  title: '',
  description: '',
  price: '',
  link: '',
  imageUrl: '',
  isPriority: false,
};

function canManageWishlist(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

function priceLabel(item: WishlistItem) {
  const credits = Number(item.priceInCredits);
  const displayPrice = Number(item.price);

  if (Number.isFinite(credits) && credits > 0) {
    return `${credits.toLocaleString()} credits`;
  }

  if (Number.isFinite(displayPrice) && displayPrice > 0) {
    return `$${displayPrice.toFixed(2)}`;
  }

  return 'Price pending';
}

function compactDate(value?: string) {
  if (!value) return 'not dated';
  return new Date(value).toLocaleDateString();
}

function compactDateTime(value?: string) {
  if (!value) return 'not dated';
  return new Date(value).toLocaleString();
}

export function WishlistSupportScreen() {
  const currentUser = getCurrentUser();
  const isCreator = canManageWishlist(currentUser?.role);
  const [mistressId, setMistressId] = useState(isCreator ? currentUser?.id || '' : '');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [reservations, setReservations] = useState<WishlistReservation[]>([]);
  const [draft, setDraft] = useState<WishlistDraft>(initialDraft);
  const [messageByItem, setMessageByItem] = useState<Record<string, string>>({});
  const [reservedIds, setReservedIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function loadWishlist(targetId = mistressId) {
    const normalizedId = targetId.trim();
    if (!normalizedId) {
      setError('Enter a Mistress user id first.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const canLoadReservations = isCreator && (
        normalizedId === currentUser?.id
        || currentUser?.role === 'ADMIN'
        || currentUser?.role === 'HEADMISTRESS'
      );
      const [nextItems, nextReservations] = await Promise.all([
        listWishlistForMistress(normalizedId),
        canLoadReservations ? listWishlistReservationsForMistress(normalizedId).catch(() => []) : Promise.resolve([]),
      ]);
      const nextReservedIds = nextItems.reduce<Record<string, boolean>>((next, item) => {
        if (item.viewerReservation?.status === 'active') {
          next[item.id] = true;
        }

        return next;
      }, {});

      setItems(nextItems);
      setReservations(nextReservations);
      setReservedIds(nextReservedIds);
      setMistressId(normalizedId);
      setNotice(nextItems.length ? `Loaded ${nextItems.length} wishlist item${nextItems.length === 1 ? '' : 's'}.` : 'No active wishlist items yet.');
    } catch (err: any) {
      setError(err?.message || 'Wishlist could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isCreator && currentUser?.id) {
      loadWishlist(currentUser.id);
    }
  }, [currentUser?.id, isCreator]);

  async function handleCreateItem() {
    const price = Number(draft.price);
    if (!draft.title.trim() || !Number.isFinite(price) || price <= 0) {
      setError('Wishlist title and price are required.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      await createWishlistItem({
        title: draft.title.trim(),
        description: draft.description.trim() || undefined,
        price,
        link: draft.link.trim() || undefined,
        imageUrl: draft.imageUrl.trim() || undefined,
        isPriority: draft.isPriority,
      });
      setDraft(initialDraft);
      setNotice('Wishlist item created.');
      await loadWishlist(currentUser?.id || mistressId);
    } catch (err: any) {
      setError(err?.message || 'Wishlist item could not be created.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePurchase(item: WishlistItem) {
    setBusyItemId(item.id);
    setError('');
    setNotice('');

    try {
      await purchaseWishlistItem(item.id, messageByItem[item.id]);
      setNotice(`Wishlist item purchased: ${item.title}`);
      await loadWishlist(mistressId);
    } catch (err: any) {
      setError(err?.message || 'Wishlist item could not be purchased.');
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleDelete(item: WishlistItem) {
    setBusyItemId(item.id);
    setError('');
    setNotice('');

    try {
      await deleteWishlistItem(item.id);
      setNotice(`Wishlist item removed: ${item.title}`);
      await loadWishlist(currentUser?.id || mistressId);
    } catch (err: any) {
      setError(err?.message || 'Wishlist item could not be removed.');
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleReserveInterest(item: WishlistItem) {
    setBusyItemId(item.id);
    setError('');
    setNotice('');

    try {
      const result = await reserveWishlistItem(item.id, messageByItem[item.id]);
      setReservedIds((current) => ({ ...current, [item.id]: true }));
      setNotice(`${result.alreadyReserved ? 'Updated' : 'Reserved'} interest for ${item.title} until ${compactDateTime(result.reservation.expiresAt)}.`);
      await loadWishlist(mistressId);
    } catch (err: any) {
      setError(err?.message || 'Wishlist interest could not be reserved.');
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Wishlist Support</Text>
      <Text style={{ color: '#aaa', marginTop: 6, marginBottom: 14 }}>
        Browse a Mistress wishlist, buy an item with wallet credits, or manage your own creator wishlist.
      </Text>

      <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Mistress Wishlist Lookup</Text>
        <TextInput
          placeholder="Mistress user id"
          placeholderTextColor="#777"
          value={mistressId}
          onChangeText={setMistressId}
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 }}
        />
        <ActionPillButton
          actionKey="refreshListings"
          disabled={loading}
          label={loading ? 'Loading...' : 'Load Wishlist'}
          onPress={() => loadWishlist()}
          style={{ justifyContent: 'center', marginRight: 0 }}
          textStyle={{ textAlign: 'center' }}
        />
      </View>

      {isCreator ? (
        <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Creator Wishlist Manager</Text>
          <TextInput
            placeholder="Item title"
            placeholderTextColor="#777"
            value={draft.title}
            onChangeText={(title: string) => setDraft((current) => ({ ...current, title }))}
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Description"
            placeholderTextColor="#777"
            value={draft.description}
            onChangeText={(description: string) => setDraft((current) => ({ ...current, description }))}
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <TextInput
            keyboardType="numeric"
            placeholder="Display price"
            placeholderTextColor="#777"
            value={draft.price}
            onChangeText={(price: string) => setDraft((current) => ({ ...current, price }))}
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <TextInput
            placeholder="External link"
            placeholderTextColor="#777"
            value={draft.link}
            onChangeText={(link: string) => setDraft((current) => ({ ...current, link }))}
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Image URL"
            placeholderTextColor="#777"
            value={draft.imageUrl}
            onChangeText={(imageUrl: string) => setDraft((current) => ({ ...current, imageUrl }))}
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 }}
          />
          <ActionPillButton
            actionKey={draft.isPriority ? 'pauseGoal' : 'activateGoal'}
            label={draft.isPriority ? 'Priority Item On' : 'Mark Priority'}
            onPress={() => setDraft((current) => ({ ...current, isPriority: !current.isPriority }))}
          />
          <ActionPillButton
            actionKey="createListing"
            disabled={saving}
            label={saving ? 'Creating...' : 'Create Wishlist Item'}
            onPress={handleCreateItem}
            style={{ justifyContent: 'center', marginRight: 0 }}
            textStyle={{ textAlign: 'center' }}
          />
        </View>
      ) : null}

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{notice}</Text> : null}

      {isCreator && reservations.length ? (
        <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Wishlist Reservation Inbox</Text>
          {reservations.slice(0, 6).map((reservation) => (
            <View key={reservation.id} style={{ borderTopColor: '#222', borderTopWidth: 1, paddingTop: 8, marginTop: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{reservation.itemTitle || reservation.itemId}</Text>
              <Text style={{ color: '#aaa', marginTop: 3 }}>
                {reservation.status.toUpperCase()} by {reservation.buyerUserId} until {compactDateTime(reservation.expiresAt)}
              </Text>
              {reservation.message ? <Text style={{ color: '#777', marginTop: 3 }}>{reservation.message}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {items.map((item) => {
        const isOwnItem = item.mistressUserId === currentUser?.id;
        const isBusy = busyItemId === item.id;

        return (
          <View key={item.id} style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{item.title}</Text>
                <Text style={{ color: '#d4af37', marginTop: 4, fontWeight: '800' }}>{priceLabel(item)}</Text>
              </View>
              <Text style={{ color: item.isPriority ? '#ff9abf' : '#777', fontSize: 11, fontWeight: '900' }}>
                {item.isPriority ? 'PRIORITY' : item.status.toUpperCase()}
              </Text>
            </View>

            {item.description ? <Text style={{ color: '#aaa', marginTop: 8 }}>{item.description}</Text> : null}
            {item.link ? <Text style={{ color: '#777', marginTop: 6 }}>Link saved: {item.link}</Text> : null}
            <Text style={{ color: '#666', marginTop: 6, fontSize: 11 }}>
              Added {compactDate(item.createdAt)} - Purchases {item._count?.purchases || 0} - Interest {item._count?.reservations || 0}
            </Text>
            {item.viewerReservation?.status === 'active' ? (
              <Text style={{ color: '#1D9E75', marginTop: 6, fontSize: 11, fontWeight: '800' }}>
                Your interest is reserved until {compactDateTime(item.viewerReservation.expiresAt)}.
              </Text>
            ) : null}

            {!isOwnItem ? (
              <>
                <TextInput
                  placeholder="Optional message"
                  placeholderTextColor="#777"
                  value={messageByItem[item.id] || ''}
                  onChangeText={(message: string) => setMessageByItem((current) => ({ ...current, [item.id]: message }))}
                  style={{ backgroundColor: '#050505', color: '#fff', padding: 10, borderRadius: 10, marginTop: 10, marginBottom: 8 }}
                />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <ActionPillButton
                    actionKey="wishlistBuy"
                    disabled={isBusy}
                    label={isBusy ? 'Buying...' : undefined}
                    onPress={() => handlePurchase(item)}
                  />
                  <ActionPillButton
                    actionKey="wishlistReserve"
                    disabled={Boolean(reservedIds[item.id]) || isBusy}
                    label={reservedIds[item.id] ? 'Interest Reserved' : 'Reserve Interest'}
                    onPress={() => handleReserveInterest(item)}
                  />
                </View>
              </>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                <ActionPillButton
                  actionKey="archiveGoal"
                  disabled={isBusy}
                  label={isBusy ? 'Removing...' : 'Remove'}
                  onPress={() => handleDelete(item)}
                />
              </View>
            )}
          </View>
        );
      })}

      {!items.length && !loading ? (
        <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#aaa' }}>No wishlist items loaded yet.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
