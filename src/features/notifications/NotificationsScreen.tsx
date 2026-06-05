import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  AppNotification,
  clearNotifications,
  disableNotificationPushSubscription,
  getNotificationDeliveryReadiness,
  getNotificationProviderHealth,
  listNotifications,
  listNotificationPushSubscriptions,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationDeliveryReadiness,
  NotificationProviderHealth,
  NotificationProviderHealthStatus,
  NotificationPushSubscription,
  NotificationType,
  registerNotificationPushSubscription,
} from '../../api/notificationsApi';

type NotificationFilter = 'ALL' | NotificationType | 'UNREAD';
type NotificationRouteDestination =
  | 'bookings'
  | 'chat'
  | 'giftsGoals'
  | 'live'
  | 'liveAccessStack'
  | 'marketplaceOrders'
  | 'notifications'
  | 'ppv'
  | 'stickers'
  | 'subscriptions'
  | 'wallet';

type NotificationsScreenProps = {
  onOpenDestination?: (destination: NotificationRouteDestination, notification: AppNotification) => void;
};

const TYPE_META: Record<NotificationType, { icon: string; color: string }> = {
  WALLET: { icon: '💰', color: '#1D9E75' },
  CHAT: { icon: '💬', color: '#60a5fa' },
  PPV: { icon: '🔐', color: '#ff9abf' },
  SUBSCRIPTION: { icon: '💎', color: '#d4af37' },
  LIVE_SHOW: { icon: '🎥', color: '#a855f7' },
  GIFT: { icon: '🎁', color: '#f97316' },
  MARKETPLACE: { icon: '🧺', color: '#22c55e' },
  STICKER: { icon: '🏷️', color: '#f5c542' },
  ROLODEX: { icon: '🃏', color: '#ec4899' },
  DRAW_REMINDER: { icon: '✍️', color: '#38bdf8' },
  SYSTEM: { icon: '⚙️', color: '#aaa' },
};

const FILTERS: NotificationFilter[] = [
  'ALL',
  'UNREAD',
  'WALLET',
  'CHAT',
  'PPV',
  'SUBSCRIPTION',
  'LIVE_SHOW',
  'GIFT',
  'MARKETPLACE',
  'STICKER',
  'ROLODEX',
  'SYSTEM',
];

type NotificationDeliveryMetadata = {
  channels?: string[];
  pushStatus?: string;
  provider?: string;
  providerDispatchMode?: string;
  providerMessageId?: string;
  providerMessageIds?: string[];
  providerDispatchedAt?: string;
  sentAt?: string;
  providerUpdatedAt?: string;
  pushTargetCount?: number;
  deliveredAt?: string;
  failedAt?: string;
  errorCode?: string;
  errorMessage?: string;
};

type NotificationRouteAction = {
  destination: NotificationRouteDestination;
  label: string;
  source: 'metadata' | 'type' | 'text';
};

const EXPLICIT_ROUTE_MAP: Record<string, NotificationRouteDestination> = {
  booking: 'bookings',
  bookings: 'bookings',
  callScheduling: 'bookings',
  chat: 'chat',
  gifts: 'giftsGoals',
  giftsGoals: 'giftsGoals',
  live: 'live',
  liveAccessStack: 'liveAccessStack',
  liveRoom: 'live',
  liveShow: 'live',
  marketplace: 'marketplaceOrders',
  marketplaceOrders: 'marketplaceOrders',
  notifications: 'notifications',
  ppv: 'ppv',
  stickers: 'stickers',
  subscriptions: 'subscriptions',
  wallet: 'wallet',
};

const TYPE_ROUTE_MAP: Partial<Record<NotificationType, NotificationRouteDestination>> = {
  WALLET: 'wallet',
  CHAT: 'chat',
  PPV: 'ppv',
  SUBSCRIPTION: 'subscriptions',
  LIVE_SHOW: 'live',
  GIFT: 'giftsGoals',
  MARKETPLACE: 'marketplaceOrders',
  STICKER: 'stickers',
  SYSTEM: 'notifications',
};

const ROUTE_LABELS: Record<NotificationRouteDestination, string> = {
  bookings: 'Open bookings',
  chat: 'Open messages',
  giftsGoals: 'Open gifts',
  live: 'Open live room',
  liveAccessStack: 'Open watch access',
  marketplaceOrders: 'Open orders',
  notifications: 'Open notifications',
  ppv: 'Open PPV',
  stickers: 'Open stickers',
  subscriptions: 'Open subscriptions',
  wallet: 'Open wallet',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function metadataString(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return null;
}

function destinationFromRouteValue(value?: string | null): NotificationRouteDestination | null {
  if (!value) return null;
  const normalized = value.replace(/^\/+/, '').split(/[/?#]/)[0];
  return EXPLICIT_ROUTE_MAP[value] || EXPLICIT_ROUTE_MAP[normalized] || null;
}

function notificationText(notification: AppNotification) {
  return `${notification.title} ${notification.message || ''}`.toLowerCase();
}

function destinationFromMetadata(notification: AppNotification): NotificationRouteDestination | null {
  if (!isRecord(notification.metadata)) return null;
  const metadata = notification.metadata;
  const explicitRoute = metadataString(metadata, [
    'dashboardView',
    'destination',
    'deepLink',
    'href',
    'pushRoute',
    'route',
    'routeDestination',
  ]);
  const explicitDestination = destinationFromRouteValue(explicitRoute);
  if (explicitDestination) return explicitDestination;

  if (
    metadataString(metadata, ['bookingId', 'callBookingId', 'watchBookingId']) ||
    isRecord(metadata.booking) ||
    isRecord(metadata.watchBooking)
  ) {
    return 'bookings';
  }

  if (metadataString(metadata, ['giftId', 'giftTransactionId']) || isRecord(metadata.gift)) return 'giftsGoals';
  if (metadataString(metadata, ['ppvId', 'ppvItemId', 'contentId']) || isRecord(metadata.ppv)) return 'ppv';
  if (metadataString(metadata, ['liveRoomId', 'liveShowId', 'roomId', 'sessionId']) || isRecord(metadata.liveRoom)) return 'live';

  return null;
}

function resolveNotificationRouteAction(notification: AppNotification): NotificationRouteAction | null {
  const metadataDestination = destinationFromMetadata(notification);
  if (metadataDestination) {
    return {
      destination: metadataDestination,
      label: ROUTE_LABELS[metadataDestination],
      source: 'metadata',
    };
  }

  const typeDestination = TYPE_ROUTE_MAP[notification.type];
  if (typeDestination) {
    return {
      destination: typeDestination,
      label: ROUTE_LABELS[typeDestination],
      source: 'type',
    };
  }

  const text = notificationText(notification);
  if (text.includes('booking') || text.includes('booked') || text.includes('call')) {
    return { destination: 'bookings', label: ROUTE_LABELS.bookings, source: 'text' };
  }
  if (text.includes('gift') || text.includes('goal')) {
    return { destination: 'giftsGoals', label: ROUTE_LABELS.giftsGoals, source: 'text' };
  }
  if (text.includes('ppv') || text.includes('content')) {
    return { destination: 'ppv', label: ROUTE_LABELS.ppv, source: 'text' };
  }
  if (text.includes('live') || text.includes('watch')) {
    return { destination: 'live', label: ROUTE_LABELS.live, source: 'text' };
  }

  return null;
}

function filterLabel(filter: NotificationFilter) {
  if (filter === 'ALL') return 'All';
  if (filter === 'UNREAD') return 'Unread';
  return filter.replace('_', ' ');
}

function notificationDelivery(notification: AppNotification): NotificationDeliveryMetadata | null {
  if (!isRecord(notification.metadata) || !isRecord(notification.metadata.delivery)) return null;
  const delivery = notification.metadata.delivery;
  return {
    channels: Array.isArray(delivery.channels)
      ? delivery.channels.filter((item): item is string => typeof item === 'string')
      : undefined,
    pushStatus: typeof delivery.pushStatus === 'string' ? delivery.pushStatus : undefined,
    provider: typeof delivery.provider === 'string' ? delivery.provider : undefined,
    providerDispatchMode: typeof delivery.providerDispatchMode === 'string' ? delivery.providerDispatchMode : undefined,
    providerMessageId: typeof delivery.providerMessageId === 'string' ? delivery.providerMessageId : undefined,
    providerMessageIds: Array.isArray(delivery.providerMessageIds)
      ? delivery.providerMessageIds.filter((item): item is string => typeof item === 'string')
      : undefined,
    providerDispatchedAt: typeof delivery.providerDispatchedAt === 'string' ? delivery.providerDispatchedAt : undefined,
    sentAt: typeof delivery.sentAt === 'string' ? delivery.sentAt : undefined,
    providerUpdatedAt: typeof delivery.providerUpdatedAt === 'string' ? delivery.providerUpdatedAt : undefined,
    pushTargetCount: typeof delivery.pushTargetCount === 'number' ? delivery.pushTargetCount : undefined,
    deliveredAt: typeof delivery.deliveredAt === 'string' ? delivery.deliveredAt : undefined,
    failedAt: typeof delivery.failedAt === 'string' ? delivery.failedAt : undefined,
    errorCode: typeof delivery.errorCode === 'string' ? delivery.errorCode : undefined,
    errorMessage: typeof delivery.errorMessage === 'string' ? delivery.errorMessage : undefined,
  };
}

function deliveryLabel(delivery: NotificationDeliveryMetadata) {
  const channels = delivery.channels?.length ? delivery.channels.join(' + ') : 'in_app';
  const provider = delivery.provider || 'in_app';
  const status = delivery.pushStatus || 'stored';
  const mode = delivery.providerDispatchMode ? ` - ${delivery.providerDispatchMode}` : '';
  return `${channels} - ${provider} - ${status}${mode}`;
}

function healthColor(status?: NotificationProviderHealthStatus) {
  if (status === 'healthy') return '#1D9E75';
  if (status === 'degraded') return '#f5c542';
  return '#ff9abf';
}

function maskPushToken(token: string) {
  if (token.length <= 12) return token;
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

function NotificationCard({
  notification,
  onMarkRead,
  onOpenRoute,
}: {
  notification: AppNotification;
  onMarkRead: () => void;
  onOpenRoute?: (destination: NotificationRouteDestination) => void;
}) {
  const meta = TYPE_META[notification.type] || TYPE_META.SYSTEM;
  const delivery = notificationDelivery(notification);
  const routeAction = resolveNotificationRouteAction(notification);

  return (
    <View
      style={{
        backgroundColor: notification.read ? '#0d0d0d' : '#111',
        borderColor: notification.read ? '#222' : meta.color,
        borderWidth: 1,
        borderRadius: 16,
        padding: 13,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: meta.color, fontSize: 12, fontWeight: '900' }}>
            {meta.icon} {notification.type.replace('_', ' ')}
          </Text>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 4 }}>
            {notification.title}
          </Text>
        </View>
        <Text style={{ color: notification.read ? '#777' : '#1D9E75', fontSize: 11, fontWeight: '900' }}>
          {notification.read ? 'READ' : 'NEW'}
        </Text>
      </View>

      {notification.message ? <Text style={{ color: '#ddd', marginTop: 8 }}>{notification.message}</Text> : null}
      <Text style={{ color: '#777', fontSize: 10, marginTop: 8 }}>
        {new Date(notification.createdAt).toLocaleString()}
      </Text>
      {delivery ? (
        <View style={{ marginTop: 6 }}>
          <Text style={{ color: '#777', fontSize: 10 }} numberOfLines={1}>
            Delivery: {deliveryLabel(delivery)}
          </Text>
          {delivery.providerMessageId ? (
            <Text style={{ color: '#555', fontSize: 10, marginTop: 2 }} numberOfLines={1}>
              Provider id: {delivery.providerMessageId}
            </Text>
          ) : null}
          {delivery.providerMessageIds?.length ? (
            <Text style={{ color: '#555', fontSize: 10, marginTop: 2 }} numberOfLines={1}>
              Provider ids: {delivery.providerMessageIds.join(', ')}
            </Text>
          ) : null}
          {typeof delivery.pushTargetCount === 'number' ? (
            <Text style={{ color: '#555', fontSize: 10, marginTop: 2 }}>
              Push targets: {delivery.pushTargetCount}
            </Text>
          ) : null}
          {delivery.errorMessage || delivery.errorCode ? (
            <Text style={{ color: '#ff9abf', fontSize: 10, marginTop: 2 }} numberOfLines={2}>
              Provider error: {delivery.errorMessage || delivery.errorCode}
            </Text>
          ) : null}
        </View>
      ) : null}

      {routeAction || !notification.read ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {routeAction ? (
            <Pressable
              onPress={() => onOpenRoute?.(routeAction.destination)}
              style={{
                backgroundColor: meta.color,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 9,
                flexGrow: 1,
              }}
            >
              <Text style={{ color: '#050505', textAlign: 'center', fontWeight: '900' }}>{routeAction.label}</Text>
              <Text style={{ color: '#1b1b1b', textAlign: 'center', fontSize: 10, fontWeight: '800', marginTop: 2 }}>
                Routed by {routeAction.source}
              </Text>
            </Pressable>
          ) : null}
          {!notification.read ? (
            <Pressable onPress={onMarkRead} style={{ backgroundColor: '#222', padding: 9, borderRadius: 10, flexGrow: 1 }}>
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Mark as read</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function NotificationsScreen({ onOpenDestination }: NotificationsScreenProps = {}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushSubscriptions, setPushSubscriptions] = useState<NotificationPushSubscription[]>([]);
  const [deliveryReadiness, setDeliveryReadiness] = useState<NotificationDeliveryReadiness | null>(null);
  const [providerHealth, setProviderHealth] = useState<NotificationProviderHealth | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>('ALL');
  const [pushProvider, setPushProvider] = useState('expo');
  const [pushPlatform, setPushPlatform] = useState('ios');
  const [pushDeviceLabel, setPushDeviceLabel] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const filteredNotifications = useMemo(() => {
    if (filter === 'ALL') return notifications;
    if (filter === 'UNREAD') return notifications.filter((item) => !item.read);
    return notifications.filter((item) => item.type === filter);
  }, [filter, notifications]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError(null);
      const [items, readiness, health, subscriptions] = await Promise.all([
        listNotifications(),
        getNotificationDeliveryReadiness(),
        getNotificationProviderHealth(),
        listNotificationPushSubscriptions(),
      ]);
      setNotifications(items);
      setDeliveryReadiness(readiness);
      setProviderHealth(health);
      setPushSubscriptions(subscriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Notifications failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      setBusy(true);
      setError(null);
      await markNotificationRead(notificationId);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Notification failed to update');
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenNotificationRoute(notification: AppNotification, destination: NotificationRouteDestination) {
    try {
      if (!notification.read) {
        await markNotificationRead(notification.id);
      }
    } catch {
      // Navigation should still happen if read-state persistence fails.
    }

    onOpenDestination?.(destination, notification);
    await loadNotifications();
  }

  async function handleRegisterPushTarget() {
    const token = pushToken.trim();
    if (!token) {
      setError('Push token is required');
      return;
    }

    try {
      setBusy(true);
      setError(null);
      await registerNotificationPushSubscription({
        provider: pushProvider.trim() || 'expo',
        platform: pushPlatform.trim() || undefined,
        deviceLabel: pushDeviceLabel.trim() || undefined,
        token,
      });
      setPushToken('');
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Push target failed to save');
    } finally {
      setBusy(false);
    }
  }

  async function handleDisablePushTarget(subscriptionId: string) {
    try {
      setBusy(true);
      setError(null);
      await disableNotificationPushSubscription(subscriptionId);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Push target failed to disable');
    } finally {
      setBusy(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      setBusy(true);
      setError(null);
      await markAllNotificationsRead();
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Notifications failed to update');
    } finally {
      setBusy(false);
    }
  }

  async function handleClearAll() {
    try {
      setBusy(true);
      setError(null);
      await clearNotifications();
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Notifications failed to clear');
    } finally {
      setBusy(false);
    }
  }

  function renderFilterButton(item: NotificationFilter) {
    const active = item === filter;
    return (
      <Pressable
        key={item}
        onPress={() => setFilter(item)}
        style={{
          backgroundColor: active ? '#ff0055' : '#111',
          paddingVertical: 8,
          paddingHorizontal: 11,
          borderRadius: 999,
          marginRight: 7,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{filterLabel(item)}</Text>
      </Pressable>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Notifications</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Platform alerts, purchases, subscriptions, gifts, stickers, PPV, live shows, and system notices.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {loading ? <Text style={{ color: '#999', marginBottom: 10 }}>Loading notifications...</Text> : null}
      {busy ? <Text style={{ color: '#999', marginBottom: 10 }}>Updating...</Text> : null}

      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16, marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Inbox Summary</Text>
        <Text style={{ color: '#aaa', marginTop: 5 }}>
          Delivery: {deliveryReadiness?.pushDelivery ? 'Provider push ready' : 'In-app only'} - {deliveryReadiness?.providerConfigStatus || 'checking'}
        </Text>
        <Text style={{ color: '#aaa', marginTop: 5 }}>
          Webhooks: {deliveryReadiness?.webhookCallbacks ? 'Secured callback ready' : 'Provider callback secret missing'}
        </Text>
        <Text style={{ color: '#aaa', marginTop: 5 }}>
          Dispatch: {deliveryReadiness?.providerDispatchMode === 'live' ? 'Live provider send' : 'Dry-run provider send'}
        </Text>
        {deliveryReadiness?.requiredEnv?.length ? (
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
            Required env: {deliveryReadiness.requiredEnv.join(', ')}
          </Text>
        ) : null}
        <Text style={{ color: '#ff9abf', marginTop: 5 }}>
          {unreadCount} unread · {notifications.length} total · {pushSubscriptions.length} push targets
        </Text>
      </View>

      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Provider Health</Text>
          <Text style={{ color: healthColor(providerHealth?.status), fontSize: 11, fontWeight: '900' }}>
            {(providerHealth?.status || 'checking').toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>
          {providerHealth?.provider || 'provider'} · {providerHealth?.providerDispatchMode || 'dry_run'} · {providerHealth?.activePushTargetCount ?? 0} targets
        </Text>
        {providerHealth?.checks.slice(0, 5).map((check) => (
          <View key={check.id} style={{ borderColor: '#222', borderWidth: 1, borderRadius: 10, padding: 9, marginTop: 7 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', flex: 1 }}>{check.label}</Text>
              <Text style={{ color: healthColor(check.status), fontSize: 10, fontWeight: '900' }}>
                {check.status.toUpperCase()}
              </Text>
            </View>
            <Text style={{ color: '#777', fontSize: 10, marginTop: 3 }}>{check.detail}</Text>
          </View>
        ))}
        {providerHealth?.runbook.requiredEnv.length ? (
          <Text style={{ color: '#777', fontSize: 10, marginTop: 9 }} numberOfLines={2}>
            Required env: {providerHealth.runbook.requiredEnv.join(', ')}
          </Text>
        ) : null}
      </View>

      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Push Targets</Text>
          <Text style={{ color: deliveryReadiness?.pushDelivery && pushSubscriptions.length ? '#1D9E75' : '#ff9abf', fontSize: 11, fontWeight: '900' }}>
            {deliveryReadiness?.pushDelivery && pushSubscriptions.length ? 'READY' : 'PENDING'}
          </Text>
        </View>
        <TextInput
          value={pushToken}
          onChangeText={setPushToken}
          placeholder="Provider push token"
          placeholderTextColor="#666"
          autoCapitalize="none"
          style={{ backgroundColor: '#080808', color: '#fff', borderColor: '#333', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          <TextInput
            value={pushProvider}
            onChangeText={setPushProvider}
            placeholder="Provider"
            placeholderTextColor="#666"
            autoCapitalize="none"
            style={{ backgroundColor: '#080808', color: '#fff', borderColor: '#333', borderWidth: 1, borderRadius: 10, padding: 10, marginRight: 8, marginBottom: 8, minWidth: 96 }}
          />
          <TextInput
            value={pushPlatform}
            onChangeText={setPushPlatform}
            placeholder="Platform"
            placeholderTextColor="#666"
            autoCapitalize="none"
            style={{ backgroundColor: '#080808', color: '#fff', borderColor: '#333', borderWidth: 1, borderRadius: 10, padding: 10, marginRight: 8, marginBottom: 8, minWidth: 96 }}
          />
          <TextInput
            value={pushDeviceLabel}
            onChangeText={setPushDeviceLabel}
            placeholder="Device label"
            placeholderTextColor="#666"
            style={{ backgroundColor: '#080808', color: '#fff', borderColor: '#333', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8, minWidth: 130 }}
          />
        </View>
        <Pressable onPress={handleRegisterPushTarget} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 10 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Save push target</Text>
        </Pressable>
        {pushSubscriptions.slice(0, 4).map((subscription) => (
          <View
            key={subscription.id}
            style={{ borderColor: '#222', borderWidth: 1, borderRadius: 10, padding: 9, marginTop: 7 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', flex: 1 }} numberOfLines={1}>
                {subscription.deviceLabel || subscription.platform || subscription.provider}
              </Text>
              <Pressable onPress={() => handleDisablePushTarget(subscription.id)} style={{ backgroundColor: '#221018', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 8 }}>
                <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>Disable</Text>
              </Pressable>
            </View>
            <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }} numberOfLines={1}>
              {subscription.provider} · {subscription.platform || 'unknown'} · {maskPushToken(subscription.token)}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {FILTERS.map(renderFilterButton)}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        <Pressable onPress={loadNotifications} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>Refresh</Text>
        </Pressable>
        <Pressable onPress={handleMarkAllRead} style={{ backgroundColor: '#1D9E75', padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>Mark all read</Text>
        </Pressable>
        <Pressable onPress={handleClearAll} style={{ backgroundColor: '#330011', padding: 10, borderRadius: 10, marginBottom: 8 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '800' }}>Clear all</Text>
        </Pressable>
      </View>

      {filteredNotifications.length === 0 ? <Text style={{ color: '#777' }}>No notifications in this view.</Text> : null}

      {filteredNotifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkRead={() => handleMarkRead(notification.id)}
          onOpenRoute={(destination) => handleOpenNotificationRoute(notification, destination)}
        />
      ))}
    </ScrollView>
  );
}
