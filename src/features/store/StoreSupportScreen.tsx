import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import {
  createMarketplaceProduct,
  listMarketplaceSellerOrders,
  listMyMarketplaceApprovalOrders,
  listMarketplaceProductsByWorld,
  purchaseApprovedMarketplaceOrder,
  purchaseMarketplaceProduct,
  requestMarketplaceProductApproval,
} from '../../api/marketplaceApi';
import type {
  MarketplaceApprovalOrder,
  MarketplaceProduct,
  MarketplaceSellerOrder,
  MarketplaceWorld,
  ProductRevealMode,
  ProductVisibility,
} from '../../api/marketplaceApi';
import { getCurrentUser } from '../../state/authStore';
import { ActionPillButton } from '../buttons/ActionPillButton';

type StoreWorldOption = {
  world: MarketplaceWorld;
  label: string;
  description: string;
  visibility: ProductVisibility;
  revealMode: ProductRevealMode;
  requiresApproval: boolean;
};

type StoreDraft = {
  title: string;
  description: string;
  price: string;
  stock: string;
};

const STORE_WORLDS: StoreWorldOption[] = [
  {
    world: 'STANDARD',
    label: 'Store',
    description: 'General signed items, digital goods, cards, photos, and creator merch.',
    visibility: 'PUBLIC',
    revealMode: 'IMMEDIATE',
    requiresApproval: false,
  },
  {
    world: 'LAUNDRY_HAMPER',
    label: 'Laundry Hamper',
    description: 'Limited personal inventory drops with fulfilment tracking and stock control.',
    visibility: 'PUBLIC',
    revealMode: 'AFTER_PURCHASE',
    requiresApproval: false,
  },
  {
    world: 'MYSTERY_BOX',
    label: 'Mystery Box',
    description: 'Surprise bundles where the exact reveal happens after purchase.',
    visibility: 'PUBLIC',
    revealMode: 'AFTER_PURCHASE',
    requiresApproval: false,
  },
  {
    world: 'PRIVATE_VAULT',
    label: 'Private Vault',
    description: 'Private catalogue items that require creator approval before payment.',
    visibility: 'PRIVATE',
    revealMode: 'MANUAL_APPROVAL',
    requiresApproval: true,
  },
];

const initialDraft: StoreDraft = {
  title: '',
  description: '',
  price: '',
  stock: '1',
};

function canCreateStoreItems(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

function priceLabel(price: number | string) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return 'Price pending';
  return `${amount.toLocaleString()} credits`;
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function userLabel(user?: { username?: string; displayName?: string | null } | null) {
  if (!user) return 'Unknown';
  return user.displayName || user.username || 'Unknown';
}

function dateLabel(value?: string) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function numericDraft(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function StoreSupportScreen() {
  const currentUser = getCurrentUser();
  const creatorMode = canCreateStoreItems(currentUser?.role);
  const [selectedWorld, setSelectedWorld] = useState<StoreWorldOption>(STORE_WORLDS[0]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [approvalOrders, setApprovalOrders] = useState<MarketplaceApprovalOrder[]>([]);
  const [sellerOrders, setSellerOrders] = useState<MarketplaceSellerOrder[]>([]);
  const [draft, setDraft] = useState<StoreDraft>(initialDraft);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const availableProducts = useMemo(
    () => products.filter((product) => product.visibility !== 'UNLISTED'),
    [products],
  );
  const worldApprovalOrders = useMemo(
    () => approvalOrders.filter((order) => order.product?.world === selectedWorld.world),
    [approvalOrders, selectedWorld.world],
  );
  const worldSellerOrders = useMemo(
    () => sellerOrders.filter((order) => order.product?.world === selectedWorld.world),
    [sellerOrders, selectedWorld.world],
  );
  const pendingApprovalCount = worldApprovalOrders.filter((order) => order.status === 'PENDING_APPROVAL').length;
  const readyToPayCount = worldApprovalOrders.filter((order) => order.status === 'APPROVED_PENDING_PAYMENT').length;
  const openFulfilmentCount = worldSellerOrders.filter((order) => !['COMPLETED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)).length;

  const loadProducts = useCallback(async (world = selectedWorld.world) => {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const [nextProducts, nextApprovalOrders, nextSellerOrders] = await Promise.all([
        listMarketplaceProductsByWorld(world),
        listMyMarketplaceApprovalOrders(),
        creatorMode ? listMarketplaceSellerOrders() : Promise.resolve([]),
      ]);
      setProducts(nextProducts);
      setApprovalOrders(nextApprovalOrders);
      setSellerOrders(nextSellerOrders);
      setNotice(nextProducts.length ? `Loaded ${nextProducts.length} store item${nextProducts.length === 1 ? '' : 's'}.` : 'No active store items in this world yet.');
    } catch (err: any) {
      setError(err?.message || 'Store support data could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [creatorMode, selectedWorld.world]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleCreateProduct() {
    const title = draft.title.trim();
    const description = draft.description.trim();
    const price = numericDraft(draft.price);
    const stock = Math.max(0, Math.floor(numericDraft(draft.stock)));

    if (!title || price <= 0) {
      setError('Store item title and price are required.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      await createMarketplaceProduct({
        title,
        description: description || undefined,
        price,
        stock,
        type: 'STORE_ITEM',
        world: selectedWorld.world,
        visibility: selectedWorld.visibility,
        revealMode: selectedWorld.revealMode,
        requiresApproval: selectedWorld.requiresApproval,
        metadata: {
          source: 'store-support-screen',
          storeWorld: selectedWorld.label,
        },
      });
      setDraft(initialDraft);
      setNotice('Store item created.');
      await loadProducts(selectedWorld.world);
    } catch (err: any) {
      setError(err?.message || 'Store item could not be created.');
    } finally {
      setSaving(false);
    }
  }

  async function handleProductAction(product: MarketplaceProduct) {
    setBusyProductId(product.id);
    setError('');
    setNotice('');

    try {
      if (product.requiresApproval) {
        await requestMarketplaceProductApproval(product.id);
        setNotice(`Approval request sent for ${product.title}.`);
      } else {
        await purchaseMarketplaceProduct(product.id);
        setNotice(`Purchased ${product.title}.`);
      }
      await loadProducts(selectedWorld.world);
    } catch (err: any) {
      setError(err?.message || 'Store action failed.');
    } finally {
      setBusyProductId(null);
    }
  }

  async function handleCompleteApprovedOrder(order: MarketplaceApprovalOrder) {
    setBusyOrderId(order.id);
    setError('');
    setNotice('');

    try {
      await purchaseApprovedMarketplaceOrder(order.id);
      setNotice(`Approved order payment completed for ${order.product?.title || order.productId}.`);
      await loadProducts(selectedWorld.world);
    } catch (err: any) {
      setError(err?.message || 'Approved order payment failed.');
    } finally {
      setBusyOrderId(null);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Store Support</Text>
      <Text style={{ color: '#aaa', marginTop: 6, marginBottom: 14 }}>
        Store worlds, private-vault requests, creator listings, and buyer purchases.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
        {STORE_WORLDS.map((world) => {
          const active = world.world === selectedWorld.world;
          return (
            <View
              key={world.world}
              style={{
                width: 235,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: active ? '#d4af37' : '#252525',
                backgroundColor: active ? '#231b07' : '#111',
                padding: 12,
              }}
            >
              <Text style={{ color: active ? '#d4af37' : '#fff', fontSize: 16, fontWeight: '900' }}>{world.label}</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 6 }}>{world.description}</Text>
              <Text style={{ color: '#777', fontSize: 10, marginTop: 8 }}>
                {world.visibility} - {world.revealMode}{world.requiresApproval ? ' - approval' : ''}
              </Text>
              <ActionPillButton
                actionKey={active ? 'saveAction' : 'loadCompetition'}
                label={active ? 'Selected' : 'Select'}
                onPress={() => setSelectedWorld(world)}
                style={{ justifyContent: 'center', marginRight: 0, marginTop: 10 }}
                textStyle={{ textAlign: 'center' }}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ff9abf', fontWeight: '900' }}>{selectedWorld.label}</Text>
            <Text style={{ color: '#777', fontSize: 12, marginTop: 3 }}>{selectedWorld.description}</Text>
          </View>
          <ActionPillButton
            actionKey="refreshListings"
            disabled={loading}
            label={loading ? 'Loading...' : 'Refresh'}
            onPress={() => loadProducts()}
          />
        </View>
      </View>

      {creatorMode ? (
        <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Creator Store Item</Text>
          <TextInput
            placeholder="Store item title"
            placeholderTextColor="#777"
            value={draft.title}
            onChangeText={(title: string) => setDraft((current) => ({ ...current, title }))}
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Description / fulfilment notes"
            placeholderTextColor="#777"
            value={draft.description}
            onChangeText={(description: string) => setDraft((current) => ({ ...current, description }))}
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TextInput
              keyboardType="numeric"
              placeholder="Price credits"
              placeholderTextColor="#777"
              value={draft.price}
              onChangeText={(price: string) => setDraft((current) => ({ ...current, price }))}
              style={{ flex: 1, minWidth: 130, backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
            />
            <TextInput
              keyboardType="numeric"
              placeholder="Stock"
              placeholderTextColor="#777"
              value={draft.stock}
              onChangeText={(stock: string) => setDraft((current) => ({ ...current, stock }))}
              style={{ flex: 1, minWidth: 130, backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
            />
          </View>
          <ActionPillButton
            actionKey="createListing"
            disabled={saving}
            label={saving ? 'Creating...' : 'Create Store Item'}
            onPress={handleCreateProduct}
            style={{ justifyContent: 'center', marginRight: 0 }}
            textStyle={{ textAlign: 'center' }}
          />
        </View>
      ) : null}

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{notice}</Text> : null}

      <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Store Activity Snapshot</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <View style={{ flex: 1, minWidth: 120, backgroundColor: '#050505', borderRadius: 10, padding: 10 }}>
            <Text style={{ color: '#777', fontSize: 11 }}>Listings</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{availableProducts.length}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 120, backgroundColor: '#050505', borderRadius: 10, padding: 10 }}>
            <Text style={{ color: '#777', fontSize: 11 }}>Approval Requests</Text>
            <Text style={{ color: '#d4af37', fontSize: 20, fontWeight: '900' }}>{pendingApprovalCount}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 120, backgroundColor: '#050505', borderRadius: 10, padding: 10 }}>
            <Text style={{ color: '#777', fontSize: 11 }}>Ready To Pay</Text>
            <Text style={{ color: '#1D9E75', fontSize: 20, fontWeight: '900' }}>{readyToPayCount}</Text>
          </View>
          {creatorMode ? (
            <View style={{ flex: 1, minWidth: 120, backgroundColor: '#050505', borderRadius: 10, padding: 10 }}>
              <Text style={{ color: '#777', fontSize: 11 }}>Open Orders</Text>
              <Text style={{ color: '#ff9abf', fontSize: 20, fontWeight: '900' }}>{openFulfilmentCount}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {worldApprovalOrders.length ? (
        <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>My Approval Orders</Text>
          {worldApprovalOrders.map((order) => {
            const canPay = order.status === 'APPROVED_PENDING_PAYMENT';
            const busy = busyOrderId === order.id;

            return (
              <View key={order.id} style={{ backgroundColor: '#050505', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: canPay ? '#1D9E75' : '#252525' }}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>{order.product?.title || order.productId}</Text>
                <Text style={{ color: canPay ? '#1D9E75' : '#d4af37', marginTop: 4, fontWeight: '900' }}>{statusLabel(order.status)}</Text>
                <Text style={{ color: '#aaa', marginTop: 4 }}>{priceLabel(order.product?.price ?? 0)}</Text>
                <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
                  Seller: {userLabel(order.product?.mistress)} - Requested: {dateLabel(order.createdAt)}
                </Text>
                {canPay ? (
                  <ActionPillButton
                    actionKey="completePayment"
                    disabled={busy}
                    label={busy ? 'Completing...' : 'Complete Payment'}
                    onPress={() => handleCompleteApprovedOrder(order)}
                    style={{ justifyContent: 'center', marginRight: 0, marginTop: 10 }}
                    textStyle={{ textAlign: 'center' }}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {creatorMode ? (
        <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Creator Order Snapshot</Text>
          {worldSellerOrders.length ? (
            worldSellerOrders.slice(0, 6).map((order) => (
              <View key={order.id} style={{ backgroundColor: '#050505', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '900' }}>{order.product?.title || order.productId}</Text>
                    <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>Buyer: {userLabel(order.buyer)}</Text>
                  </View>
                  <Text style={{ color: '#d4af37', fontWeight: '900' }}>{statusLabel(order.status)}</Text>
                </View>
                <Text style={{ color: '#aaa', marginTop: 6 }}>{priceLabel(order.product?.price ?? 0)}</Text>
                <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>Updated: {dateLabel(order.updatedAt)}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#777' }}>No creator orders for this store world yet.</Text>
          )}
        </View>
      ) : null}

      {availableProducts.map((product) => {
        const soldOut = product.stock <= 0;
        const busy = busyProductId === product.id;

        return (
          <View key={product.id} style={{ backgroundColor: '#111', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: product.requiresApproval ? '#d4af37' : '#252525' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{product.title}</Text>
                <Text style={{ color: '#d4af37', fontWeight: '800', marginTop: 4 }}>{priceLabel(product.price)}</Text>
              </View>
              <Text style={{ color: soldOut ? '#ff6b6b' : product.requiresApproval ? '#d4af37' : '#1D9E75', fontSize: 11, fontWeight: '900' }}>
                {soldOut ? 'SOLD OUT' : product.requiresApproval ? 'APPROVAL' : `${product.stock} LEFT`}
              </Text>
            </View>

            {product.description ? <Text style={{ color: '#aaa', marginTop: 8 }}>{product.description}</Text> : null}
            <Text style={{ color: '#777', fontSize: 11, marginTop: 8 }}>
              Seller: {product.mistressId} - Reveal: {product.revealMode} - Visibility: {product.visibility}
            </Text>

            <ActionPillButton
              actionKey={product.requiresApproval ? 'requestApproval' : 'buyNow'}
              disabled={soldOut || busy}
              label={soldOut ? 'Unavailable' : busy ? 'Working...' : product.requiresApproval ? 'Request Approval' : 'Buy Store Item'}
              onPress={() => handleProductAction(product)}
              style={{ justifyContent: 'center', marginRight: 0, marginTop: 10 }}
              textStyle={{ textAlign: 'center' }}
            />
          </View>
        );
      })}

      {!availableProducts.length && !loading ? (
        <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#aaa' }}>No store items loaded for this world yet.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
