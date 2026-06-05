import { apiRequest } from './apiClient';

export type Position = {
  id: string;
  mistressId: string;
  name: string;
  holderId?: string | null;
  value: number | string;
  createdAt: string;
  updatedAt: string;
};

export type LeaderboardRow = {
  rank: number;
  subUserId?: string | null;
  totalSpent: number | string;
  leaderboardType?: 'overall' | 'gifts';
  sourceTypes?: string[];
};

export type LeaderboardMovement = {
  subUserId?: string | null;
  previousRank: number | null;
  currentRank: number;
  direction: 'new' | 'up' | 'down';
};

export type LeaderboardMovementRecord = LeaderboardMovement & {
  id: string;
  mistressId: string;
  leaderboardType: 'gifts';
  createdAt: string;
  trigger?: {
    source?: string;
    actorUserId?: string;
    amount?: number;
    walletTransactionId?: string | null;
  };
};

export type GiftLeaderboardEvent = {
  leaderboardType: 'gifts';
  leaderboard?: LeaderboardRow[];
  movements?: LeaderboardMovement[];
  movementHistory?: LeaderboardMovementRecord[];
  trigger?: {
    source?: string;
    actorUserId?: string;
    amount?: number;
    walletTransactionId?: string | null;
  };
};

export function listPositions(mistressId: string) {
  return apiRequest<Position[]>(`/positions/${encodeURIComponent(mistressId)}`);
}

export function listLeaderboard(mistressId: string) {
  return apiRequest<LeaderboardRow[]>(`/positions/leaderboard/${encodeURIComponent(mistressId)}`);
}

export function listGiftLeaderboard(mistressId: string) {
  return apiRequest<LeaderboardRow[]>(`/positions/leaderboard/${encodeURIComponent(mistressId)}/gifts`);
}

export function listGiftLeaderboardMovements(mistressId: string, limit = 25) {
  return apiRequest<LeaderboardMovementRecord[]>(
    `/positions/leaderboard/${encodeURIComponent(mistressId)}/gifts/movements?limit=${encodeURIComponent(String(limit))}`,
  );
}

export function recalculatePositions(mistressId: string) {
  return apiRequest<Position[]>(`/positions/recalculate/${encodeURIComponent(mistressId)}`, {
    method: 'POST',
  });
}
