import { apiRequest } from './apiClient';

export type AdminOverviewCounts = {
  totalUsers: number;
  activeUsers: number;
  mistressCount: number;
  subCount: number;
  walletTransactions: number;
  ppvItems: number;
  liveShows: number;
  paidCallBookings: number;
  gifts: number;
  stickers: number;
  stickerPacks: number;
  completedStickerPacks: number;
  marketplaceProducts: number;
  approvalLockedProducts: number;
  pendingMarketplaceApprovals: number;
  moderationOpen: number;
};

export type AdminTransaction = {
  id: string;
  type: string;
  direction: 'IN' | 'OUT';
  amount: number | string;
  platformAmount?: number | string;
  mistressAmount?: number | string;
  reason?: string | null;
  senderUserId?: string | null;
  receiverUserId?: string | null;
  createdAt: string;
};

export type AdminPanelUser = {
  id: string;
  username: string;
  displayName?: string | null;
  role: string;
};

export type AdminLedgerTransaction = AdminTransaction & {
  metadata?: Record<string, unknown> | null;
  sender?: AdminPanelUser | null;
  receiver?: AdminPanelUser | null;
};

export type AdminNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  read: boolean;
  createdAt: string;
};

export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';

export type AdminUser = {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  role: string;
  status: AdminUserStatus | string;
  isAdult: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  wallet?: {
    balance: number | string;
    currency: string;
  } | null;
};

export type AdminModerationItem = {
  id: string;
  type: string;
  area: string;
  priority: number;
  status: string;
  title: string;
  description?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetUserId?: string | null;
  reporterUserId?: string | null;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: AdminPanelUser | null;
  assigned?: AdminPanelUser | null;
};

export type AdminOverview = {
  counts: AdminOverviewCounts;
  recentTransactions: AdminTransaction[];
  recentNotifications: AdminNotification[];
};

export function getAdminOverview() {
  return apiRequest<AdminOverview>('/admin/overview');
}

export function listAdminUsers() {
  return apiRequest<AdminUser[]>('/admin/users');
}

export function updateAdminUserStatus(userId: string, status: AdminUserStatus) {
  return apiRequest<AdminUser>(`/admin/user-actions/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function listAdminLedger() {
  return apiRequest<AdminLedgerTransaction[]>('/admin/ledger');
}

export function listAdminModeration() {
  return apiRequest<AdminModerationItem[]>('/admin/moderation');
}
