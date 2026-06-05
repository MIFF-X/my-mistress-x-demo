import { apiRequest } from './apiClient';

export type NotificationType =
  | 'WALLET'
  | 'CHAT'
  | 'PPV'
  | 'SUBSCRIPTION'
  | 'LIVE_SHOW'
  | 'GIFT'
  | 'MARKETPLACE'
  | 'STICKER'
  | 'ROLODEX'
  | 'DRAW_REMINDER'
  | 'SYSTEM';

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  metadata?: unknown;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationDeliveryReadiness = {
  deliveryMode: 'in_app_only' | 'provider';
  provider: string;
  providerConfigStatus: 'configured' | 'missing_credentials' | 'in_app_only';
  inAppDelivery: boolean;
  pushDelivery: boolean;
  webhookCallbacks: boolean;
  providerDispatchMode: 'dry_run' | 'live';
  requiredEnv: string[];
};

export type NotificationProviderHealthStatus = 'healthy' | 'degraded' | 'disabled';

export type NotificationProviderHealthCheck = {
  id: string;
  label: string;
  status: NotificationProviderHealthStatus;
  detail: string;
};

export type NotificationProviderHealth = NotificationDeliveryReadiness & {
  status: NotificationProviderHealthStatus;
  activePushTargetCount: number;
  checks: NotificationProviderHealthCheck[];
  runbook: {
    requiredEnv: string[];
    optionalEnv: string[];
    dispatchModes: string[];
  };
};

export type NotificationPushSubscription = {
  id: string;
  userId: string;
  provider: string;
  token: string;
  platform?: string | null;
  deviceId?: string | null;
  deviceLabel?: string | null;
  appVersion?: string | null;
  enabled: boolean;
  lastRegisteredAt: string;
  lastSeenAt?: string | null;
  disabledAt?: string | null;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
};

export type CreateNotificationInput = {
  type?: NotificationType;
  title: string;
  message?: string;
  metadata?: unknown;
};

export type RegisterNotificationPushSubscriptionInput = {
  provider?: string;
  token: string;
  platform?: string;
  deviceId?: string;
  deviceLabel?: string;
  appVersion?: string;
  metadata?: unknown;
};

export function listNotifications() {
  return apiRequest<AppNotification[]>('/notifications');
}

export function getNotificationDeliveryReadiness() {
  return apiRequest<NotificationDeliveryReadiness>('/notifications/delivery-readiness');
}

export function getNotificationProviderHealth() {
  return apiRequest<NotificationProviderHealth>('/notifications/provider-health');
}

export function createNotification(input: CreateNotificationInput) {
  return apiRequest<AppNotification>('/notifications', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listNotificationPushSubscriptions() {
  return apiRequest<NotificationPushSubscription[]>('/notifications/push-subscriptions');
}

export function registerNotificationPushSubscription(input: RegisterNotificationPushSubscriptionInput) {
  return apiRequest<NotificationPushSubscription>('/notifications/push-subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function disableNotificationPushSubscription(subscriptionId: string) {
  return apiRequest<{ count: number }>(`/notifications/push-subscriptions/${subscriptionId}`, {
    method: 'DELETE',
  });
}

export function markNotificationRead(notificationId: string) {
  return apiRequest<{ count: number }>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiRequest<{ count: number }>('/notifications/read-all', {
    method: 'PATCH',
  });
}

export function clearNotifications() {
  return apiRequest<{ count: number }>('/notifications', {
    method: 'DELETE',
  });
}
