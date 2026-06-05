import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  listMarketplaceWorldAnalytics,
  listSellerMarketplaceOrders,
  listSellerMarketplaceProductsByWorld,
  MarketplaceFulfilmentStatus,
  MarketplaceProduct,
  MarketplaceSellerOrder,
  MarketplaceWorld,
  MarketplaceWorldAnalytics,
  updateMarketplaceOrderStatus,
} from '../../api/marketplaceApi';
import { MarketplaceInventoryProductCard } from './MarketplaceInventoryProductCard';
import { MarketplaceProductCreateForm } from './MarketplaceProductCreateForm';
import { ActionPillButton } from '../buttons/ActionPillButton';
import { MarketplaceWorldSelector } from './MarketplaceWorldSelector';

const defaultWorld: MarketplaceWorld = 'VENDING_MACHINE';

function buyerLabel(order: MarketplaceSellerOrder) {
  return order.buyer?.displayName || order.buyer?.username || order.buyerId;
}

function orderStatusLabel(status: string) {
  if (status === 'COMPLETED') return 'Paid';
  if (status === 'FULFILMENT_PENDING') return 'In fulfilment';
  if (status === 'FULFILLED') return 'Fulfilled';
  if (status === 'APPROVED_PENDING_PAYMENT') return 'Approved, payment needed';
  if (status === 'PENDING_APPROVAL') return 'Pending approval';
  if (status === 'DECLINED') return 'Declined';
  return status.replace(/_/g, ' ');
}

function orderStatusColor(status: string) {
  if (status === 'FULFILLED') return '#1D9E75';
  if (status === 'FULFILMENT_PENDING') return '#d4af37';
  if (status === 'COMPLETED') return '#ff9abf';
  if (status === 'DECLINED') return '#ff6b6b';
  return '#aaa';
}

function canMarkFulfilment(status: string) {
  return status === 'COMPLETED' || status === 'FULFILMENT_PENDING';
}

function formatCredits(value: number) {
  return `${value.toFixed(2)} credits`;
}

function WorldAnalyticsPanel({
  analytics,
  selectedWorld,
  loading,
}: {
  analytics: MarketplaceWorldAnalytics[];
  selectedWorld: MarketplaceWorld;
  loading: boolean;
}) {
  const selectedSummary = analytics.find((summary) => summary.world === selectedWorld);

  if (loading && analytics.length === 0) {
    return (
      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222' }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>World Analytics</Text>
        <Text style={{ color: '#999', marginTop: 6 }}>Loading marketplace analytics...</Text>
      </View>
    );
  }

  if (!selectedSummary) return null;

  const metricRows = [
    ['Products', String(selectedSummary.productCount)],
    ['Stock', String(selectedSummary.totalStock)],
    ['Reserved', String(selectedSummary.reservedStockCount)],
    ['Available', String(selectedSummary.availableStockCount)],
    ['Sold out', String(selectedSummary.soldOutCount)],
    ['Orders', String(selectedSummary.orderCount)],
    ['Paid', String(selectedSummary.paidOrderCount)],
    ['Fulfilment queue', String(selectedSummary.fulfilmentQueueCount)],
    ['Fulfilled', String(selectedSummary.fulfilledOrderCount)],
    ['Gross', formatCredits(selectedSummary.grossCredits)],
  ];

  return (
    <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 12 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>World Analytics</Text>
        <Text style={{ color: '#888', fontSize: 12 }}>{selectedSummary.label}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {metricRows.map(([label, value]) => (
          <View key={label} style={{ backgroundColor: '#171717', borderRadius: 12, padding: 10, minWidth: 120, flexGrow: 1, borderWidth: 1, borderColor: '#282828' }}>
            <Text style={{ color: '#777', fontSize: 11, fontWeight: '800' }}>{label}</Text>
            <Text style={{ color: label === 'Gross' ? '#d4af37' : '#fff', fontSize: 16, fontWeight: '900', marginTop: 3 }}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 6 }}>
        {analytics.map((summary) => (
          <View key={summary.world} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ color: summary.world === selectedWorld ? '#fff' : '#777', fontSize: 12, flex: 1 }}>{summary.label}</Text>
            <Text style={{ color: '#aaa', fontSize: 12 }}>
              {summary.productCount} products | {formatCredits(summary.grossCredits)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SellerOrderCard({
  order,
  onStatusChange,
  busy,
}: {
  order: MarketplaceSellerOrder;
  onStatusChange: (orderId: string, status: MarketplaceFulfilmentStatus) => void;
  busy: boolean;
}) {
  const color = orderStatusColor(order.status);
  const canMove = canMarkFulfilment(order.status);

  return (
    <View style={{ backgroundColor: '#171717', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#282828', gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>{order.product?.title || order.productId}</Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Buyer: {buyerLabel(order)}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
            World: {order.product?.world || 'Unknown'} | Ordered: {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>
        <Text style={{ color, fontWeight: '900' }}>{orderStatusLabel(order.status)}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {order.status === 'COMPLETED' ? (
          <Pressable
            onPress={() => onStatusChange(order.id, 'FULFILMENT_PENDING')}
            disabled={busy}
            style={{ backgroundColor: busy ? '#333' : '#2b2208', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
          >
            <Text style={{ color: busy ? '#777' : '#d4af37', fontWeight: '900' }}>Start Fulfilment</Text>
          </Pressable>
        ) : null}
        {canMove ? (
          <Pressable
            onPress={() => onStatusChange(order.id, 'FULFILLED')}
            disabled={busy}
            style={{ backgroundColor: busy ? '#333' : '#1D9E75', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
          >
            <Text style={{ color: '#fff', fontWeight: '900' }}>Mark Fulfilled</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function MarketplaceInventoryScreen() {
  const [selectedWorld, setSelectedWorld] = useState<MarketplaceWorld>(defaultWorld);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [sellerOrders, setSellerOrders] = useState<MarketplaceSellerOrder[]>([]);
  const [worldAnalytics, setWorldAnalytics] = useState<MarketplaceWorldAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const visibleSellerOrders = sellerOrders.filter((order) => order.product?.world === selectedWorld);

  async function loadProducts(world: MarketplaceWorld = selectedWorld) {
    try {
      setLoading(true);
      setError(null);
      const nextProducts = await listSellerMarketplaceProductsByWorld(world);
      setProducts(nextProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marketplace products failed to load.');
    } finally {
      setLoading(false);
    }
  }

  function handleProductUpdated(product: MarketplaceProduct) {
    setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
    setNotice(`Updated ${product.title}.`);
    void loadWorldAnalytics();
  }

  async function loadSellerOrders() {
    try {
      setOrdersLoading(true);
      setError(null);
      const nextOrders = await listSellerMarketplaceOrders();
      setSellerOrders(nextOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marketplace orders failed to load.');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadWorldAnalytics() {
    try {
      setAnalyticsLoading(true);
      setError(null);
      const nextAnalytics = await listMarketplaceWorldAnalytics();
      setWorldAnalytics(nextAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marketplace analytics failed to load.');
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function handleOrderStatusChange(orderId: string, status: MarketplaceFulfilmentStatus) {
    try {
      setOrderUpdatingId(orderId);
      setError(null);
      const updated = await updateMarketplaceOrderStatus(orderId, status);
      setSellerOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
      setNotice(`Order ${orderStatusLabel(updated.status).toLowerCase()}.`);
      void loadWorldAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marketplace order update failed.');
    } finally {
      setOrderUpdatingId(null);
    }
  }

  useEffect(() => {
    void loadProducts(selectedWorld);
  }, [selectedWorld]);

  useEffect(() => {
    void loadSellerOrders();
    void loadWorldAnalytics();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Marketplace Inventory Worlds</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Manage creator inventory for vending drops, laundry hamper stock, mystery bundles, standard products, and seller-only restricted listings.
        </Text>
      </View>

      <MarketplaceProductCreateForm
        includeLegacyRestrictedListing
        onCreated={(product) => {
          setSelectedWorld(product.world);
          setNotice(`Created ${product.title}.`);
          void loadProducts(product.world);
          void loadWorldAnalytics();
        }}
      />

      <WorldAnalyticsPanel
        analytics={worldAnalytics}
        selectedWorld={selectedWorld}
        loading={analyticsLoading}
      />

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 10 }}>
        <MarketplaceWorldSelector
          selectedWorld={selectedWorld}
          onSelect={(policy) => {
            setSelectedWorld(policy.world);
            setNotice(null);
          }}
          includeLegacyRestrictedListing
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Current Inventory</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{selectedWorld.replace(/_/g, ' ')}</Text>
          </View>
          <ActionPillButton
            actionKey="refreshListings"
            disabled={loading}
            label={loading ? 'Loading...' : undefined}
            onPress={() => loadProducts()}
          />
        </View>

        {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
        {notice ? <Text style={{ color: '#1D9E75' }}>{notice}</Text> : null}
        {!loading && products.length === 0 ? <Text style={{ color: '#777' }}>No inventory items in this world yet.</Text> : null}

        <View style={{ gap: 8 }}>
          {products.map((product) => (
            <MarketplaceInventoryProductCard
              key={product.id}
              product={product}
              onUpdated={handleProductUpdated}
            />
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 10 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Recent Orders</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>{selectedWorld.replace(/_/g, ' ')}</Text>
        </View>

        {ordersLoading ? <Text style={{ color: '#999' }}>Loading marketplace orders...</Text> : null}
        {!ordersLoading && visibleSellerOrders.length === 0 ? <Text style={{ color: '#777' }}>No orders in this world yet.</Text> : null}

        <View style={{ gap: 8 }}>
          {visibleSellerOrders.map((order) => (
            <SellerOrderCard
              key={order.id}
              order={order}
              busy={orderUpdatingId === order.id}
              onStatusChange={handleOrderStatusChange}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
