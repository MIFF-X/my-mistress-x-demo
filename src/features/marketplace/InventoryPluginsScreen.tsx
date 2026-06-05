import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  createMarketplaceProduct,
  listMarketplaceProductsByWorld,
  listMyMarketplaceApprovalOrders,
  listMyMarketplaceOrders,
  MarketplaceApprovalOrder,
  MarketplaceBuyerOrder,
  MarketplaceProduct,
  MarketplaceProductMetadata,
  MarketplaceWorld,
  ProductRevealMode,
  ProductVisibility,
  purchaseApprovedMarketplaceOrder,
  purchaseMarketplaceProduct,
  requestMarketplaceProductApproval,
} from '../../api/marketplaceApi';
import { getCurrentUser } from '../../state/authStore';
import { ActionPillButton } from '../buttons/ActionPillButton';
import { buildMetadataWithMedia, productMedia } from './marketplaceProductMedia';

type PluginTab = 'vending' | 'hamper' | 'mystery' | 'vault' | 'create';
type ApprovalStatusFilter = 'ALL' | 'PENDING_APPROVAL' | 'APPROVED_PENDING_PAYMENT' | 'DECLINED';
type ActiveApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED_PENDING_PAYMENT';
type BuyerOrderStatusFilter = 'ALL' | 'COMPLETED' | 'FULFILMENT_PENDING' | 'FULFILLED';

const APPROVAL_STATUS_FILTERS: ApprovalStatusFilter[] = ['ALL', 'PENDING_APPROVAL', 'APPROVED_PENDING_PAYMENT', 'DECLINED'];
const ACTIVE_APPROVAL_STATUSES: ActiveApprovalStatus[] = ['PENDING_APPROVAL', 'APPROVED_PENDING_PAYMENT'];
const BUYER_ORDER_STATUS_FILTERS: BuyerOrderStatusFilter[] = ['ALL', 'COMPLETED', 'FULFILMENT_PENDING', 'FULFILLED'];

const PLUGIN_META: Record<PluginTab, {
  title: string;
  icon: string;
  description: string;
  world: MarketplaceWorld;
  visibility: ProductVisibility;
  revealMode: ProductRevealMode;
  requiresApproval: boolean;
}> = {
  vending: {
    title: 'Vending Machine',
    icon: 'VM',
    description: 'Curated catalogue items, weekly restocks, limited drops, and clean product slots.',
    world: 'VENDING_MACHINE',
    visibility: 'PUBLIC',
    revealMode: 'IMMEDIATE',
    requiresApproval: false,
  },
  hamper: {
    title: 'Laundry Hamper',
    icon: 'HAM',
    description: 'Immersive hamper-style listings for personal, limited, and one-of-one inventory drops.',
    world: 'LAUNDRY_HAMPER',
    visibility: 'PUBLIC',
    revealMode: 'IMMEDIATE',
    requiresApproval: false,
  },
  mystery: {
    title: 'Mystery Box',
    icon: 'BOX',
    description: 'Surprise purchase flow with reveal mechanics and future weighted rarity odds.',
    world: 'MYSTERY_BOX',
    visibility: 'PUBLIC',
    revealMode: 'AFTER_PURCHASE',
    requiresApproval: false,
  },
  vault: {
    title: 'Restricted Listings',
    icon: 'VAULT',
    description: 'Seller-managed private or unlisted products that require manual approval.',
    world: 'PRIVATE_VAULT',
    visibility: 'PRIVATE',
    revealMode: 'MANUAL_APPROVAL',
    requiresApproval: true,
  },
  create: {
    title: 'Create Listing',
    icon: 'NEW',
    description: 'Mistress listing control for plugin inventory worlds.',
    world: 'STANDARD',
    visibility: 'PUBLIC',
    revealMode: 'IMMEDIATE',
    requiresApproval: false,
  },
};

const SHOP_TABS: Exclude<PluginTab, 'create'>[] = ['vending', 'hamper', 'mystery', 'vault'];

type InventoryWorldMetadata = MarketplaceProductMetadata & {
  limitedDropEndsAt?: string;
  randomDispense?: boolean;
  restockPlaceholder?: boolean;
  tier?: string;
  hamperEnvironment?: string;
  wornToday?: boolean;
  recentlyAdded?: boolean;
  oneOfOne?: boolean;
  rarity?: string;
  oddsDisclosure?: string;
  randomDrawPlaceholder?: boolean;
  vipAccess?: boolean;
  inviteOnly?: boolean;
  lockedState?: string;
};

const WORLD_FEATURES: Record<Exclude<PluginTab, 'create'>, string[]> = {
  vending: ['Product slots', 'Limited drop timer', 'Random dispense', 'Tiered slots', 'Restock placeholder'],
  hamper: ['Messy layout', 'Worn-today tag', 'Recently-added glow', 'One-of-one state', 'Sold items hidden'],
  mystery: ['Random draw placeholder', 'Rarity levels', 'Box pricing', 'Result reveal', 'Odds disclosure'],
  vault: ['VIP access', 'Invite-only gating', 'Locked state', 'Access requests', 'Approval controls'],
};

const TIER_OPTIONS = ['Standard', 'Premium', 'Ultra'];
const RARITY_OPTIONS = ['Common', 'Rare', 'Legendary'];

const DETAIL_PILL_COLORS = {
  muted: { backgroundColor: '#171717', borderColor: '#333', color: '#ddd' },
  gold: { backgroundColor: '#2b2208', borderColor: '#d4af37', color: '#d4af37' },
  green: { backgroundColor: '#0d251e', borderColor: '#1D9E75', color: '#1D9E75' },
  pink: { backgroundColor: '#260513', borderColor: '#ff0055', color: '#ff9abf' },
  red: { backgroundColor: '#2a0c13', borderColor: '#ff6b6b', color: '#ff6b6b' },
};

function canCreateProducts(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

function productMatchesTab(product: MarketplaceProduct, tab: PluginTab) {
  if (tab === 'create') return false;
  const world = product.world || (product.type as MarketplaceWorld);
  return world === PLUGIN_META[tab].world;
}

function sellerLabel(order: MarketplaceApprovalOrder | MarketplaceBuyerOrder) {
  const seller = order.product?.mistress;
  if (!seller) return 'Unknown seller';
  return seller.displayName || seller.username || seller.id;
}

function approvalStatusColor(status: string) {
  if (status === 'APPROVED_PENDING_PAYMENT') return '#1D9E75';
  if (status === 'DECLINED') return '#ff6b6b';
  if (status === 'PENDING_APPROVAL') return '#d4af37';
  return '#ff9abf';
}

function approvalStatusLabel(status: string) {
  if (status === 'APPROVED_PENDING_PAYMENT') return 'Approved - payment needed';
  if (status === 'PENDING_APPROVAL') return 'Waiting for Mistress approval';
  if (status === 'DECLINED') return 'Declined';
  return status.replace(/_/g, ' ');
}

function approvalStatusDescription(status: string) {
  if (status === 'APPROVED_PENDING_PAYMENT') return 'Access has been approved. Complete payment to finish the order.';
  if (status === 'PENDING_APPROVAL') return 'Your request has been sent. The seller still needs to approve or decline it.';
  if (status === 'DECLINED') return 'This access request was declined. You can request a different item instead.';
  return 'Approval order status is being tracked.';
}

function approvalFilterLabel(filter: ApprovalStatusFilter) {
  if (filter === 'ALL') return 'All';
  if (filter === 'APPROVED_PENDING_PAYMENT') return 'Approved';
  if (filter === 'PENDING_APPROVAL') return 'Pending';
  return 'Declined';
}

function buyerOrderStatusColor(status: string) {
  if (status === 'FULFILLED') return '#1D9E75';
  if (status === 'FULFILMENT_PENDING') return '#d4af37';
  if (status === 'COMPLETED') return '#ff9abf';
  return '#aaa';
}

function buyerOrderStatusLabel(status: string) {
  if (status === 'COMPLETED') return 'Paid';
  if (status === 'FULFILMENT_PENDING') return 'In fulfilment';
  if (status === 'FULFILLED') return 'Fulfilled';
  return status.replace(/_/g, ' ');
}

function buyerOrderStatusDescription(status: string) {
  if (status === 'COMPLETED') return 'Payment is complete. The seller can move this into fulfilment.';
  if (status === 'FULFILMENT_PENDING') return 'The seller is preparing fulfilment details.';
  if (status === 'FULFILLED') return 'This marketplace order has been fulfilled.';
  return 'Marketplace order status is being tracked.';
}

function buyerOrderFilterLabel(filter: BuyerOrderStatusFilter) {
  if (filter === 'ALL') return 'All';
  if (filter === 'COMPLETED') return 'Paid';
  if (filter === 'FULFILMENT_PENDING') return 'In fulfilment';
  return 'Fulfilled';
}

function isActiveApprovalStatus(status: string): status is ActiveApprovalStatus {
  return ACTIVE_APPROVAL_STATUSES.includes(status as ActiveApprovalStatus);
}

function inventoryMetadata(product: MarketplaceProduct): InventoryWorldMetadata {
  return (product.metadata || {}) as InventoryWorldMetadata;
}

function metadataString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function formatDropDate(value?: string) {
  if (!value?.trim()) return 'No timer set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.trim();
  return date.toLocaleString();
}

function isDropLive(value?: string) {
  if (!value?.trim()) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}

function isRecentlyAdded(product: MarketplaceProduct, metadata: InventoryWorldMetadata) {
  if (metadata.recentlyAdded) return true;
  const createdAt = new Date(product.createdAt).getTime();
  if (Number.isNaN(createdAt)) return false;
  return Date.now() - createdAt < 1000 * 60 * 60 * 24 * 3;
}

function DetailPill({
  label,
  tone = 'muted',
}: {
  label: string;
  tone?: keyof typeof DETAIL_PILL_COLORS;
}) {
  const colors = DETAIL_PILL_COLORS[tone];

  return (
    <View style={{ backgroundColor: colors.backgroundColor, borderColor: colors.borderColor, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 }}>
      <Text style={{ color: colors.color, fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}

function OptionChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? '#ff0055' : '#222',
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 10,
        marginRight: 7,
        marginBottom: 7,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  detail,
  value,
  onValueChange,
}: {
  label: string;
  detail?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={{
        backgroundColor: '#050505',
        borderColor: value ? '#ff0055' : '#222',
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>{label}</Text>
          {detail ? <Text style={{ color: '#777', fontSize: 11, marginTop: 3 }}>{detail}</Text> : null}
        </View>
        <Text style={{ color: value ? '#1D9E75' : '#777', fontWeight: '900' }}>{value ? 'ON' : 'OFF'}</Text>
      </View>
    </Pressable>
  );
}

function HamperPilePreview({
  product,
  metadata,
}: {
  product: MarketplaceProduct;
  metadata: InventoryWorldMetadata;
}) {
  const recent = isRecentlyAdded(product, metadata);
  const environment = metadataString(metadata.hamperEnvironment, 'Bedroom hamper');

  return (
    <View style={{ backgroundColor: '#050505', borderColor: recent ? '#ff9abf' : '#222', borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 10 }}>
      <Text style={{ color: recent ? '#ff9abf' : '#aaa', fontSize: 11, fontWeight: '900' }}>{environment}</Text>
      <View style={{ height: 76, marginTop: 8, position: 'relative' }}>
        <View style={{ position: 'absolute', left: 8, top: 16, width: 118, height: 42, borderRadius: 12, backgroundColor: '#2b101a', transform: [{ rotate: '-8deg' }], borderColor: '#552033', borderWidth: 1 }} />
        <View style={{ position: 'absolute', left: 72, top: 8, width: 130, height: 48, borderRadius: 12, backgroundColor: '#1b1627', transform: [{ rotate: '7deg' }], borderColor: '#3b3155', borderWidth: 1 }} />
        <View style={{ position: 'absolute', left: 36, top: 28, width: 146, height: 42, borderRadius: 12, backgroundColor: '#201406', transform: [{ rotate: '-2deg' }], borderColor: '#5a3f12', borderWidth: 1 }} />
        <Text style={{ position: 'absolute', left: 18, top: 30, color: '#fff', fontSize: 12, fontWeight: '900' }} numberOfLines={1}>{product.title}</Text>
      </View>
    </View>
  );
}

function InventoryWorldDetailPanel({ product }: { product: MarketplaceProduct }) {
  const metadata = inventoryMetadata(product);

  if (product.world === 'VENDING_MACHINE') {
    const liveDrop = isDropLive(metadata.limitedDropEndsAt);
    return (
      <View style={{ backgroundColor: '#080808', borderRadius: 12, padding: 10, marginTop: 10, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Slot Controls</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <DetailPill label={`Tier: ${metadataString(metadata.tier, 'Standard')}`} tone="gold" />
          <DetailPill label={liveDrop ? `Drop live until ${formatDropDate(metadata.limitedDropEndsAt)}` : `Drop timer: ${formatDropDate(metadata.limitedDropEndsAt)}`} tone={liveDrop ? 'green' : 'muted'} />
          <DetailPill label={metadata.randomDispense ? 'Random dispense on' : 'Fixed slot'} tone={metadata.randomDispense ? 'pink' : 'muted'} />
          <DetailPill label={metadata.restockPlaceholder ? 'Restock placeholder ready' : 'Restock placeholder off'} />
        </View>
      </View>
    );
  }

  if (product.world === 'LAUNDRY_HAMPER') {
    const recent = isRecentlyAdded(product, metadata);
    return (
      <View style={{ backgroundColor: recent ? '#150711' : '#080808', borderRadius: 12, padding: 10, marginTop: 10, borderColor: recent ? '#ff9abf' : '#222', borderWidth: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Hamper State</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <DetailPill label={metadata.wornToday ? 'Worn today' : 'Not tagged worn today'} tone={metadata.wornToday ? 'pink' : 'muted'} />
          <DetailPill label={recent ? 'Recently added glow' : 'Standard listing'} tone={recent ? 'pink' : 'muted'} />
          <DetailPill label={metadata.oneOfOne ? 'One of one' : 'Multi-stock'} tone={metadata.oneOfOne ? 'gold' : 'muted'} />
          <DetailPill label="Sold stock disappears" />
        </View>
        <HamperPilePreview product={product} metadata={metadata} />
      </View>
    );
  }

  if (product.world === 'MYSTERY_BOX') {
    return (
      <View style={{ backgroundColor: '#080808', borderRadius: 12, padding: 10, marginTop: 10, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Mystery Draw</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <DetailPill label={metadata.randomDrawPlaceholder ? 'Random draw placeholder ready' : 'Manual draw note'} tone="pink" />
          <DetailPill label={`Rarity: ${metadataString(metadata.rarity, 'Common')}`} tone="gold" />
          <DetailPill label={`Box price: ${product.price} credits`} tone="green" />
        </View>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Odds: {metadataString(metadata.oddsDisclosure, 'Common 70% / Rare 25% / Legendary 5%')}</Text>
      </View>
    );
  }

  if (product.world === 'PRIVATE_VAULT') {
    return (
      <View style={{ backgroundColor: '#080808', borderRadius: 12, padding: 10, marginTop: 10, borderColor: '#d4af37', borderWidth: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Vault Access</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <DetailPill label={metadata.vipAccess ? 'VIP access' : 'Approval-gated'} tone="gold" />
          <DetailPill label={metadata.inviteOnly ? 'Invite-only' : 'Requestable'} tone={metadata.inviteOnly ? 'gold' : 'muted'} />
          <DetailPill label={metadataString(metadata.lockedState, 'Locked until approved')} tone="red" />
          <DetailPill label="Admin approve/deny controls active" tone="green" />
        </View>
      </View>
    );
  }

  return null;
}

function ProductCard({
  product,
  approvalOrder,
  onPurchase,
  onApprovalRequest,
  onApprovalOrderPress,
  onCompleteApprovedPayment,
}: {
  product: MarketplaceProduct;
  approvalOrder?: MarketplaceApprovalOrder;
  onPurchase: () => void;
  onApprovalRequest: () => void;
  onApprovalOrderPress: () => void;
  onCompleteApprovedPayment: () => void;
}) {
  const soldOut = product.stock <= 0;
  const approvalLocked = Boolean(product.requiresApproval);
  const activeApprovalOrder = approvalOrder && isActiveApprovalStatus(approvalOrder.status) ? approvalOrder : undefined;
  const approvalPending = activeApprovalOrder?.status === 'PENDING_APPROVAL';
  const approvalReadyToPay = activeApprovalOrder?.status === 'APPROVED_PENDING_PAYMENT';
  const unavailable = soldOut && !activeApprovalOrder;
  const media = productMedia(product);
  const isMysteryBox = product.world === 'MYSTERY_BOX';
  const statusColor = unavailable ? '#ff6b6b' : approvalReadyToPay ? '#1D9E75' : approvalPending || approvalLocked ? '#d4af37' : '#1D9E75';
  const statusLabel = unavailable ? 'SOLD OUT' : approvalReadyToPay ? 'PAYMENT' : approvalPending ? 'PENDING' : approvalLocked ? 'APPROVAL' : `${product.stock} left`;
  const primaryLabel = unavailable
    ? 'Unavailable'
    : approvalReadyToPay
      ? 'Complete Payment'
      : approvalPending
        ? 'View Pending Request'
        : approvalLocked
          ? 'Request Approval'
          : isMysteryBox
            ? 'Purchase & Reveal'
            : 'Purchase';
  const primaryBackground = unavailable ? '#333' : approvalReadyToPay ? '#1D9E75' : approvalLocked ? '#d4af37' : '#ff0055';
  const primaryTextColor = approvalLocked && !approvalReadyToPay ? '#000' : '#fff';

  function handlePrimaryAction() {
    if (unavailable) return;
    if (!approvalLocked) {
      onPurchase();
      return;
    }
    if (approvalReadyToPay) {
      onCompleteApprovedPayment();
      return;
    }
    if (approvalPending) {
      onApprovalOrderPress();
      return;
    }
    onApprovalRequest();
  }

  return (
    <View style={{ backgroundColor: '#111', padding: 13, borderRadius: 16, marginBottom: 10, borderColor: unavailable ? '#441122' : approvalLocked ? '#d4af37' : '#333', borderWidth: 1 }}>
      {media.coverImageUrl ? (
        <Image
          source={{ uri: media.coverImageUrl }}
          accessibilityLabel={media.altText || product.title}
          resizeMode="cover"
          style={{ width: '100%', height: 170, borderRadius: 12, backgroundColor: '#050505', marginBottom: 10 }}
        />
      ) : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>{product.title}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>{product.price} credits</Text>
        </View>
        <Text style={{ color: statusColor, fontWeight: '900' }}>{statusLabel}</Text>
      </View>

      {product.description ? <Text style={{ color: '#ddd', marginTop: 8 }}>{product.description}</Text> : null}
      <Text style={{ color: '#777', fontSize: 10, marginTop: 8 }}>
        World: {product.world || product.type} | Visibility: {product.visibility} | Reveal: {product.revealMode}
      </Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Seller: {product.mistressId}</Text>
      {activeApprovalOrder ? (
        <Text style={{ color: approvalReadyToPay ? '#1D9E75' : '#d4af37', fontSize: 12, marginTop: 8, fontWeight: '800' }}>
          {approvalReadyToPay
            ? 'Approval granted. Complete payment to finish this order.'
            : 'You already have a pending approval request for this listing.'}
        </Text>
      ) : null}

      <ActionPillButton
        actionKey={approvalLocked ? 'requestApproval' : 'buyNow'}
        disabled={unavailable}
        label={soldOut ? 'Unavailable' : approvalLocked ? undefined : 'Purchase'}
        onPress={approvalLocked ? onApprovalRequest : onPurchase}
        style={{ justifyContent: 'center', marginRight: 0, marginTop: 10 }}
        textStyle={{ textAlign: 'center' }}
      />
    </View>
  );
}

function MysteryRevealPanel({
  product,
  revealProgress,
  onDismiss,
}: {
  product: MarketplaceProduct;
  revealProgress: Animated.Value;
  onDismiss: () => void;
}) {
  const media = productMedia(product);
  const revealImageUrl = media.previewUrl || media.galleryImageUrls?.[0] || media.coverImageUrl;
  const scale = revealProgress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.94, 1.04, 1],
  });

  return (
    <Animated.View
      style={{
        opacity: revealProgress,
        transform: [{ scale }],
        backgroundColor: '#160914',
        borderColor: '#d4af37',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 14,
      }}
    >
      <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>MYSTERY REVEALED</Text>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>{product.title}</Text>
      {revealImageUrl ? (
        <Image
          source={{ uri: revealImageUrl }}
          accessibilityLabel={media.altText || `${product.title} reveal`}
          resizeMode="cover"
          style={{ width: '100%', height: 210, borderRadius: 14, backgroundColor: '#050505', marginTop: 12 }}
        />
      ) : (
        <View style={{ backgroundColor: '#050505', borderRadius: 14, padding: 18, marginTop: 12 }}>
          <Text style={{ color: '#aaa', textAlign: 'center', fontWeight: '800' }}>Reveal media will appear here when the seller adds a preview URL.</Text>
        </View>
      )}
      {product.description ? <Text style={{ color: '#ddd', marginTop: 10 }}>{product.description}</Text> : null}
      <Text style={{ color: '#aaa', fontSize: 12, marginTop: 10 }}>
        Your order is complete. The creator can still fulfil any physical or follow-up details from seller order management.
      </Text>
      <Pressable onPress={onDismiss} style={{ backgroundColor: '#d4af37', padding: 10, borderRadius: 10, marginTop: 12 }}>
        <Text style={{ color: '#000', fontWeight: '900', textAlign: 'center' }}>Close Reveal</Text>
      </Pressable>
    </Animated.View>
  );
}

function ApprovalOrderCard({ order, onCompletePayment }: { order: MarketplaceApprovalOrder; onCompletePayment: () => void }) {
  const canPay = order.status === 'APPROVED_PENDING_PAYMENT';
  const color = approvalStatusColor(order.status);

  return (
    <View style={{ backgroundColor: '#111', padding: 13, borderRadius: 16, marginBottom: 10, borderColor: color, borderWidth: 1 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{order.product?.title || order.productId}</Text>
      <Text style={{ color, marginTop: 4, fontWeight: '900' }}>{approvalStatusLabel(order.status)}</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>{approvalStatusDescription(order.status)}</Text>
      <Text style={{ color: '#ff9abf', marginTop: 6 }}>{order.product?.price ?? 0} credits</Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 6 }}>
        World: {order.product?.world || 'Unknown'} | Reveal: {order.product?.revealMode || 'Unknown'} | Stock: {order.product?.stock ?? 0}
      </Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Seller: {sellerLabel(order)}</Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Requested: {new Date(order.createdAt).toLocaleString()}</Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Updated: {new Date(order.updatedAt).toLocaleString()}</Text>

      {canPay ? (
        <ActionPillButton
          actionKey="completePayment"
          onPress={onCompletePayment}
          style={{ justifyContent: 'center', marginRight: 0, marginTop: 10 }}
          textStyle={{ textAlign: 'center' }}
        />
      ) : null}
    </View>
  );
}

function BuyerOrderCard({ order }: { order: MarketplaceBuyerOrder }) {
  const color = buyerOrderStatusColor(order.status);

  return (
    <View style={{ backgroundColor: '#111', padding: 13, borderRadius: 16, marginBottom: 10, borderColor: color, borderWidth: 1 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{order.product?.title || order.productId}</Text>
      <Text style={{ color, marginTop: 4, fontWeight: '900' }}>{buyerOrderStatusLabel(order.status)}</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>{buyerOrderStatusDescription(order.status)}</Text>
      <Text style={{ color: '#ff9abf', marginTop: 6 }}>{order.product?.price ?? 0} credits</Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 6 }}>
        World: {order.product?.world || 'Unknown'} | Reveal: {order.product?.revealMode || 'Unknown'}
      </Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Seller: {sellerLabel(order)}</Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Purchased: {new Date(order.createdAt).toLocaleString()}</Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Updated: {new Date(order.updatedAt).toLocaleString()}</Text>
    </View>
  );
}

export function InventoryPluginsScreen() {
  const currentUser = getCurrentUser();
  const creatorMode = canCreateProducts(currentUser?.role);
  const [activeTab, setActiveTab] = useState<PluginTab>('vending');
  const [approvalFilter, setApprovalFilter] = useState<ApprovalStatusFilter>('ALL');
  const [buyerOrderFilter, setBuyerOrderFilter] = useState<BuyerOrderStatusFilter>('ALL');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [approvalOrders, setApprovalOrders] = useState<MarketplaceApprovalOrder[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<MarketplaceBuyerOrder[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [galleryImageUrlsText, setGalleryImageUrlsText] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [listingType, setListingType] = useState<PluginTab>('vending');
  const [limitedDropEndsAt, setLimitedDropEndsAt] = useState('');
  const [randomDispense, setRandomDispense] = useState(false);
  const [tier, setTier] = useState('Standard');
  const [hamperEnvironment, setHamperEnvironment] = useState('Bedroom hamper');
  const [wornToday, setWornToday] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(true);
  const [oneOfOne, setOneOfOne] = useState(false);
  const [rarity, setRarity] = useState('Common');
  const [oddsDisclosure, setOddsDisclosure] = useState('Common 70% / Rare 25% / Legendary 5%');
  const [vipAccess, setVipAccess] = useState(false);
  const [inviteOnly, setInviteOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [revealedMysteryProduct, setRevealedMysteryProduct] = useState<MarketplaceProduct | null>(null);
  const revealProgress = useRef(new Animated.Value(0)).current;

  const activeProducts = useMemo(() => products.filter((product) => productMatchesTab(product, activeTab)), [products, activeTab]);
  const activeApprovalOrders = useMemo(
    () => approvalOrders.filter((order) => order.product?.world === PLUGIN_META[activeTab]?.world),
    [approvalOrders, activeTab],
  );
  const filteredApprovalOrders = useMemo(
    () => approvalFilter === 'ALL' ? activeApprovalOrders : activeApprovalOrders.filter((order) => order.status === approvalFilter),
    [approvalFilter, activeApprovalOrders],
  );
  const activeBuyerOrders = useMemo(
    () => buyerOrders.filter((order) => order.product?.world === PLUGIN_META[activeTab]?.world),
    [buyerOrders, activeTab],
  );
  const filteredBuyerOrders = useMemo(
    () => buyerOrderFilter === 'ALL' ? activeBuyerOrders : activeBuyerOrders.filter((order) => order.status === buyerOrderFilter),
    [buyerOrderFilter, activeBuyerOrders],
  );
  const approvalCounts = useMemo(() => {
    const counts = APPROVAL_STATUS_FILTERS.reduce((acc, filter) => ({ ...acc, [filter]: 0 }), {} as Record<ApprovalStatusFilter, number>);
    counts.ALL = activeApprovalOrders.length;
    activeApprovalOrders.forEach((order) => {
      if (APPROVAL_STATUS_FILTERS.includes(order.status as ApprovalStatusFilter)) {
        counts[order.status as ApprovalStatusFilter] += 1;
      }
    });
    return counts;
  }, [activeApprovalOrders]);
  const buyerOrderCounts = useMemo(() => {
    const counts = BUYER_ORDER_STATUS_FILTERS.reduce((acc, filter) => ({ ...acc, [filter]: 0 }), {} as Record<BuyerOrderStatusFilter, number>);
    counts.ALL = activeBuyerOrders.length;
    activeBuyerOrders.forEach((order) => {
      if (BUYER_ORDER_STATUS_FILTERS.includes(order.status as BuyerOrderStatusFilter)) {
        counts[order.status as BuyerOrderStatusFilter] += 1;
      }
    });
    return counts;
  }, [activeBuyerOrders]);
  const activeApprovalOrdersByProductId = useMemo(() => {
    const ordersByProductId: Record<string, MarketplaceApprovalOrder> = {};
    approvalOrders.forEach((order) => {
      if (!isActiveApprovalStatus(order.status)) return;
      const current = ordersByProductId[order.productId];
      if (!current || new Date(order.updatedAt).getTime() >= new Date(current.updatedAt).getTime()) {
        ordersByProductId[order.productId] = order;
      }
    });
    return ordersByProductId;
  }, [approvalOrders]);

  useEffect(() => {
    loadInventoryWorlds();
  }, []);

  useEffect(() => {
    if (!revealedMysteryProduct) return;
    revealProgress.setValue(0);
    Animated.sequence([
      Animated.timing(revealProgress, {
        toValue: 0.7,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(revealProgress, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [revealedMysteryProduct, revealProgress]);

  async function loadInventoryWorlds() {
    try {
      setLoading(true);
      setError(null);
      const [productBatches, nextApprovalOrders, nextBuyerOrders] = await Promise.all([
        Promise.all(SHOP_TABS.map((tab) => listMarketplaceProductsByWorld(PLUGIN_META[tab].world))),
        listMyMarketplaceApprovalOrders(),
        listMyMarketplaceOrders(),
      ]);
      setProducts(productBatches.flat());
      setApprovalOrders(nextApprovalOrders);
      setBuyerOrders(nextBuyerOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inventory plugins failed to load');
    } finally {
      setLoading(false);
    }
  }

  function resetListingMetadataControls() {
    setLimitedDropEndsAt('');
    setRandomDispense(false);
    setTier('Standard');
    setHamperEnvironment('Bedroom hamper');
    setWornToday(false);
    setRecentlyAdded(true);
    setOneOfOne(false);
    setRarity('Common');
    setOddsDisclosure('Common 70% / Rare 25% / Legendary 5%');
    setVipAccess(false);
    setInviteOnly(true);
    setCoverImageUrl('');
    setGalleryImageUrlsText('');
    setPreviewUrl('');
    setAltText('');
  }

  function buildListingMetadata(meta: (typeof PLUGIN_META)[PluginTab]): InventoryWorldMetadata {
    const base: InventoryWorldMetadata = {
      pluginWorld: meta.world,
      pluginTitle: meta.title,
      source: 'inventory-plugins-screen',
    };

    if (listingType === 'vending') {
      return {
        ...base,
        limitedDropEndsAt: limitedDropEndsAt.trim() || undefined,
        randomDispense,
        restockPlaceholder: true,
        tier,
      };
    }

    if (listingType === 'hamper') {
      return {
        ...base,
        hamperEnvironment: hamperEnvironment.trim() || 'Bedroom hamper',
        wornToday,
        recentlyAdded,
        oneOfOne,
      };
    }

    if (listingType === 'mystery') {
      return {
        ...base,
        rarity,
        oddsDisclosure: oddsDisclosure.trim() || 'Common 70% / Rare 25% / Legendary 5%',
        randomDrawPlaceholder: true,
      };
    }

    if (listingType === 'vault') {
      return {
        ...base,
        vipAccess,
        inviteOnly,
        lockedState: 'Locked until approved',
      };
    }

    return base;
  }

  async function handleCreateProduct() {
    if (!title.trim()) {
      setError('Listing title is required.');
      return;
    }
    if (!price.trim() || Number(price) <= 0) {
      setError('A positive price is required.');
      return;
    }
    const stockValue = stock.trim() ? Number(stock) : 1;
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      setError('Stock quantity must be zero or higher.');
      return;
    }

    const meta = PLUGIN_META[listingType];
    const metadata = buildMetadataWithMedia(buildListingMetadata(meta), {
      coverImageUrl,
      galleryImageUrlsText,
      previewUrl,
      altText,
    });

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await createMarketplaceProduct({
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        stock: stockValue,
        type: meta.world,
        world: meta.world,
        visibility: meta.visibility,
        revealMode: meta.revealMode,
        requiresApproval: meta.requiresApproval,
        metadata,
      });
      setTitle('');
      setDescription('');
      setPrice('');
      setStock('1');
      resetListingMetadataControls();
      setSuccess('Listing created.');
      setActiveTab(listingType);
      await loadInventoryWorlds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Listing failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handlePurchase(product: MarketplaceProduct) {
    try {
      setError(null);
      setSuccess(null);
      setRevealedMysteryProduct(null);
      await purchaseMarketplaceProduct(product.id);
      if (product.world === 'MYSTERY_BOX') {
        setRevealedMysteryProduct(product);
        setSuccess('Mystery Box purchased.');
      } else {
        setSuccess('Purchase complete.');
      }
      await loadInventoryWorlds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    }
  }

  function handleExistingApprovalOrder(order: MarketplaceApprovalOrder) {
    setError(null);
    setSuccess(order.status === 'APPROVED_PENDING_PAYMENT'
      ? 'Approval already granted. Complete payment from your approval order.'
      : 'You already have a pending approval request for this listing.');
    setApprovalFilter(order.status as ApprovalStatusFilter);
    setRevealedMysteryProduct(null);
  }

  async function handleApprovalRequest(product: MarketplaceProduct) {
    const existingApprovalOrder = activeApprovalOrdersByProductId[product.id];
    if (existingApprovalOrder) {
      handleExistingApprovalOrder(existingApprovalOrder);
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const order = await requestMarketplaceProductApproval(product.id);
      setSuccess('Approval request sent.');
      setApprovalFilter('PENDING_APPROVAL');
      if (isActiveApprovalStatus(order.status)) {
        setApprovalFilter(order.status);
      }
      await loadInventoryWorlds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval request failed');
    }
  }

  async function handleCompleteApprovedPayment(orderId: string) {
    try {
      setError(null);
      setSuccess(null);
      await purchaseApprovedMarketplaceOrder(orderId);
      setSuccess('Approved order payment complete.');
      setApprovalFilter('ALL');
      await loadInventoryWorlds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approved order payment failed');
    }
  }

  function renderTab(tab: PluginTab) {
    const active = activeTab === tab;
    const meta = PLUGIN_META[tab];

    return (
      <Pressable
        key={tab}
        onPress={() => setActiveTab(tab)}
        style={{
          backgroundColor: active ? '#ff0055' : '#111',
          paddingVertical: 9,
          paddingHorizontal: 12,
          borderRadius: 999,
          marginRight: 8,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>{meta.icon} {meta.title}</Text>
      </Pressable>
    );
  }

  function renderApprovalFilter(filter: ApprovalStatusFilter) {
    const active = approvalFilter === filter;
    const color = filter === 'ALL' ? '#ff0055' : approvalStatusColor(filter);

    return (
      <Pressable
        key={filter}
        onPress={() => setApprovalFilter(filter)}
        style={{
          backgroundColor: active ? color : '#222',
          paddingVertical: 7,
          paddingHorizontal: 10,
          borderRadius: 999,
          marginRight: 7,
          marginBottom: 7,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>{approvalFilterLabel(filter)} | {approvalCounts[filter] || 0}</Text>
      </Pressable>
    );
  }

  function renderBuyerOrderFilter(filter: BuyerOrderStatusFilter) {
    const active = buyerOrderFilter === filter;
    const color = filter === 'ALL' ? '#ff0055' : buyerOrderStatusColor(filter);

    return (
      <Pressable
        key={filter}
        onPress={() => setBuyerOrderFilter(filter)}
        style={{
          backgroundColor: active ? color : '#222',
          paddingVertical: 7,
          paddingHorizontal: 10,
          borderRadius: 999,
          marginRight: 7,
          marginBottom: 7,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>{buyerOrderFilterLabel(filter)} | {buyerOrderCounts[filter] || 0}</Text>
      </Pressable>
    );
  }

  function renderApprovalOrders() {
    if (activeTab === 'create' || activeApprovalOrders.length === 0) return null;

    return (
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>My Approval Orders</Text>
        <Text style={{ color: '#aaa', marginBottom: 8 }}>
          Track private-access requests from pending approval through approved payment or decline.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {APPROVAL_STATUS_FILTERS.map(renderApprovalFilter)}
        </View>
        {filteredApprovalOrders.length === 0 ? <Text style={{ color: '#777', marginBottom: 8 }}>No approval orders in this status.</Text> : null}
        {filteredApprovalOrders.map((order) => (
          <ApprovalOrderCard
            key={order.id}
            order={order}
            onCompletePayment={() => handleCompleteApprovedPayment(order.id)}
          />
        ))}
      </View>
    );
  }

  function renderBuyerOrders() {
    if (activeTab === 'create' || activeBuyerOrders.length === 0) return null;

    return (
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>My Purchase History</Text>
        <Text style={{ color: '#aaa', marginBottom: 8 }}>
          Track completed marketplace purchases through paid, fulfilment pending, and fulfilled states.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {BUYER_ORDER_STATUS_FILTERS.map(renderBuyerOrderFilter)}
        </View>
        {filteredBuyerOrders.length === 0 ? <Text style={{ color: '#777', marginBottom: 8 }}>No purchases in this status.</Text> : null}
        {filteredBuyerOrders.map((order) => (
          <BuyerOrderCard key={order.id} order={order} />
        ))}
      </View>
    );
  }

  function renderPluginWorld(tab: Exclude<PluginTab, 'create'>) {
    const meta = PLUGIN_META[tab];
    const visibleProducts = tab === 'hamper' ? activeProducts.filter((product) => product.stock > 0) : activeProducts;
    const hiddenSoldCount = activeProducts.length - visibleProducts.length;

    return (
      <>
        <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16, marginBottom: 12, borderColor: '#333', borderWidth: 1 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>{meta.icon} {meta.title}</Text>
          <Text style={{ color: '#aaa', marginTop: 6 }}>{meta.description}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 8 }}>World: {meta.world} | Visibility: {meta.visibility} | Reveal: {meta.revealMode}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            {WORLD_FEATURES[tab].map((feature) => (
              <DetailPill key={feature} label={feature} tone={tab === 'vault' ? 'gold' : 'muted'} />
            ))}
          </View>
        </View>

        <ActionPillButton
          actionKey="refreshListings"
          label="Refresh Listings"
          onPress={loadInventoryWorlds}
          style={{ justifyContent: 'center', marginBottom: 12, marginRight: 0 }}
          textStyle={{ textAlign: 'center' }}
        />

        {renderApprovalOrders()}
        {renderBuyerOrders()}

        {tab === 'mystery' && revealedMysteryProduct ? (
          <MysteryRevealPanel
            product={revealedMysteryProduct}
            revealProgress={revealProgress}
            onDismiss={() => setRevealedMysteryProduct(null)}
          />
        ) : null}

        {hiddenSoldCount > 0 ? (
          <Text style={{ color: '#777', marginBottom: 8 }}>{hiddenSoldCount} sold hamper item{hiddenSoldCount === 1 ? '' : 's'} hidden from the active pile.</Text>
        ) : null}
        {visibleProducts.length === 0 ? <Text style={{ color: '#777' }}>No listings in this plugin world yet.</Text> : null}
        {visibleProducts.map((product) => {
          const approvalOrder = activeApprovalOrdersByProductId[product.id];
          return (
            <ProductCard
              key={product.id}
              product={product}
              approvalOrder={approvalOrder}
              onPurchase={() => handlePurchase(product)}
              onApprovalRequest={() => handleApprovalRequest(product)}
              onApprovalOrderPress={() => approvalOrder ? handleExistingApprovalOrder(approvalOrder) : undefined}
              onCompleteApprovedPayment={() => approvalOrder ? handleCompleteApprovedPayment(approvalOrder.id) : undefined}
            />
          );
        })}
      </>
    );
  }

  function renderListingMetadataFields() {
    if (listingType === 'vending') {
      return (
        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Vending slot controls</Text>
          <TextInput
            value={limitedDropEndsAt}
            onChangeText={setLimitedDropEndsAt}
            placeholder="Limited drop ends at (example: 2026-05-31T18:00:00)"
            placeholderTextColor="#777"
            style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <Text style={{ color: '#777', fontSize: 11, marginBottom: 6 }}>Tiered slot</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
            {TIER_OPTIONS.map((option) => (
              <OptionChip key={option} label={option} active={tier === option} onPress={() => setTier(option)} />
            ))}
          </View>
          <ToggleRow
            label="Random dispense option"
            detail="Marks this slot as a random-dispense candidate for a future draw worker."
            value={randomDispense}
            onValueChange={setRandomDispense}
          />
          <Text style={{ color: '#777', fontSize: 11 }}>Restock placeholder will be attached automatically.</Text>
        </View>
      );
    }

    if (listingType === 'hamper') {
      return (
        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Hamper environment</Text>
          <TextInput
            value={hamperEnvironment}
            onChangeText={setHamperEnvironment}
            placeholder="Custom environment name"
            placeholderTextColor="#777"
            style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <ToggleRow label="Worn-today tag" value={wornToday} onValueChange={setWornToday} />
          <ToggleRow label="Recently-added glow" value={recentlyAdded} onValueChange={setRecentlyAdded} />
          <ToggleRow label="One-of-one item state" value={oneOfOne} onValueChange={setOneOfOne} />
          <Text style={{ color: '#777', fontSize: 11 }}>Sold-out hamper items are hidden from the active pile.</Text>
        </View>
      );
    }

    if (listingType === 'mystery') {
      return (
        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Mystery box reveal</Text>
          <Text style={{ color: '#777', fontSize: 11, marginBottom: 6 }}>Rarity level</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
            {RARITY_OPTIONS.map((option) => (
              <OptionChip key={option} label={option} active={rarity === option} onPress={() => setRarity(option)} />
            ))}
          </View>
          <TextInput
            value={oddsDisclosure}
            onChangeText={setOddsDisclosure}
            placeholder="Odds / rarity disclosure"
            placeholderTextColor="#777"
            multiline
            style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, minHeight: 72, marginBottom: 8 }}
          />
          <Text style={{ color: '#777', fontSize: 11 }}>Random item draw placeholder and post-purchase result reveal will be enabled.</Text>
        </View>
      );
    }

    if (listingType === 'vault') {
      return (
        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8, borderColor: '#d4af37', borderWidth: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Private vault access</Text>
          <ToggleRow
            label="VIP access"
            detail="Shows the listing as VIP-gated before approval."
            value={vipAccess}
            onValueChange={setVipAccess}
          />
          <ToggleRow
            label="Invite-only access"
            detail="Keeps the item visually locked until an access request is approved."
            value={inviteOnly}
            onValueChange={setInviteOnly}
          />
          <Text style={{ color: '#777', fontSize: 11 }}>Unlock requests route into the existing approve/deny controls.</Text>
        </View>
      );
    }

    return null;
  }

  function renderListingMediaFields() {
    return (
      <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8, borderColor: '#222', borderWidth: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Listing media</Text>
        {coverImageUrl.trim() ? (
          <Image
            source={{ uri: coverImageUrl.trim() }}
            accessibilityLabel={altText.trim() || title.trim() || 'Inventory plugin listing media'}
            resizeMode="cover"
            style={{ width: '100%', height: 150, borderRadius: 10, backgroundColor: '#111', marginBottom: 8 }}
          />
        ) : null}
        <TextInput
          value={coverImageUrl}
          onChangeText={setCoverImageUrl}
          placeholder="Cover image URL"
          placeholderTextColor="#777"
          autoCapitalize="none"
          style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={galleryImageUrlsText}
          onChangeText={setGalleryImageUrlsText}
          placeholder="Gallery image URLs, one per line"
          placeholderTextColor="#777"
          autoCapitalize="none"
          multiline
          style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, minHeight: 68, marginBottom: 8 }}
        />
        <TextInput
          value={previewUrl}
          onChangeText={setPreviewUrl}
          placeholder="Preview media URL for Mystery Box reveal"
          placeholderTextColor="#777"
          autoCapitalize="none"
          style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={altText}
          onChangeText={setAltText}
          placeholder="Media alt text"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10 }}
        />
      </View>
    );
  }

  function renderCreateListing() {
    if (!creatorMode) {
      return (
        <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
          <Text style={{ color: '#ff6b6b', fontWeight: '900' }}>Creator access required.</Text>
          <Text style={{ color: '#aaa', marginTop: 6 }}>Only Mistress, Headmistress, and Admin roles can create plugin listings.</Text>
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 10 }}>Create Plugin Listing</Text>

        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Choose plugin world</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {SHOP_TABS.map((tab) => {
            const active = listingType === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setListingType(tab)}
                style={{
                  backgroundColor: active ? '#ff0055' : '#222',
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>{PLUGIN_META[tab].icon} {PLUGIN_META[tab].title}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900' }}>{PLUGIN_META[listingType].world}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
            {PLUGIN_META[listingType].visibility} | {PLUGIN_META[listingType].revealMode} | Approval {PLUGIN_META[listingType].requiresApproval ? 'on' : 'off'}
          </Text>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Listing title"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#777"
          multiline
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, minHeight: 86, marginBottom: 8 }}
        />
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Price in credits"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          placeholder="Stock quantity"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />

        <ActionPillButton
          actionKey="createListing"
          disabled={saving}
          label={saving ? 'Creating...' : undefined}
          onPress={handleCreateProduct}
          style={{ justifyContent: 'center', marginRight: 0 }}
          textStyle={{ textAlign: 'center' }}
        />
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'create') return renderCreateListing();
    return renderPluginWorld(activeTab);
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Inventory Plugins</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Vending Machine, Laundry Hamper, Mystery Box, and Restricted Listings.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {success ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{success}</Text> : null}
      {loading ? <Text style={{ color: '#999', marginBottom: 10 }}>Loading inventory worlds...</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {renderTab('vending')}
        {renderTab('hamper')}
        {renderTab('mystery')}
        {renderTab('vault')}
        {renderTab('create')}
      </View>

      {renderActiveTab()}
    </ScrollView>
  );
}
