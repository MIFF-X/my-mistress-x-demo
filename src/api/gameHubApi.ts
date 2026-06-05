import { apiRequest } from './apiClient';
import type {
  GameHubHostedQuizRecord,
  GameHubGameEntryEntitlementRecord,
  GameHubQuizImportRecord,
  GameHubReactionParticipantRecord,
  GameHubReactionRoomRecord,
  GameHubReactionRoundRecord,
  GameHubReactionRoundSnapshot,
  GameHubReactionScoreRecord,
  GameHubSummary,
  GameHubOverlayDeliveryDiagnostics,
  GameHubOverlaySocketReceiptRecord,
  HostedQuizOverlaySnapshot,
  HostedQuizQuestion,
  HostedQuizScore,
} from '../features/games/gameHubModel';

export type CreateQuizImportInput = {
  provider: string;
  input: string;
  title?: string;
};

export type GameHubHistoryResponse = {
  generatedAt: string;
  events: GameHubSummary['historyEvents'];
};

export type GameHubFavouritesResponse = {
  generatedAt: string;
  items: GameHubSummary['plans'];
};

export type GameHubQuizImportLogsResponse = {
  importId: string;
  provider: string;
  status: string;
  logs: Array<{
    id: string;
    message: string;
    level: string;
    createdAt: string;
  }>;
  safety: string[];
  updatedAt: string;
};

export type GameHubQuizImportsResponse = {
  generatedAt: string;
  filters: {
    status: string | null;
    provider: string | null;
    limit: number;
  };
  count: number;
  items: GameHubQuizImportRecord[];
};

export type GameHubArchiveQuizImportResponse = {
  archived: boolean;
  import: GameHubQuizImportRecord;
};

export type CreateHostedQuizInput = {
  title?: string;
  sourceImportId?: string;
  questions?: HostedQuizQuestion[];
  entryFeeCredits?: number;
  entryFee?: number;
};

export type CreateReactionRoomInput = {
  modeId?: string;
  title?: string;
  targetReaction?: string;
  prompt?: string;
  roundDurationSeconds?: number;
  entryFeeCredits?: number;
};

export type JoinReactionRoomInput = {
  displayName?: string;
};

export type ScoreReactionRoundInput = {
  reaction: string;
  reactionTimeMs?: number;
};

export type ReactionRoomCreateResponse = {
  room: GameHubReactionRoomRecord;
  round: GameHubReactionRoundRecord;
  snapshot: GameHubReactionRoundSnapshot;
};

export type ReactionRoomJoinResponse = {
  room: GameHubReactionRoomRecord;
  participant: GameHubReactionParticipantRecord;
  entryEntitlement?: GameHubGameEntryEntitlementRecord;
  snapshot?: GameHubReactionRoundSnapshot;
};

export type ReactionRoundScoreResponse = {
  score: GameHubReactionScoreRecord;
  correct: boolean;
  pointsAwarded: number;
  snapshot: GameHubReactionRoundSnapshot;
  socketEvent: {
    eventName: string;
    roomId: string;
    room: string;
    snapshot: GameHubReactionRoundSnapshot;
    emittedAt: string;
    liveRoomEvent?: {
      eventName: string;
      roomId: string;
      room: string;
      emittedAt: string;
    };
  } | null;
  receipt: GameHubOverlaySocketReceiptRecord;
};

export type HostedQuizListResponse = {
  generatedAt: string;
  filters: {
    status: string | null;
    limit: number;
  };
  count: number;
  items: GameHubHostedQuizRecord[];
};

export type HostedQuizAnswerResponse = {
  answer: {
    id: string;
    quizId: string;
    playerId: string;
    questionId: string;
    selectedOptionIndex: number;
    correct: boolean;
    pointsAwarded: number;
    answeredAt: string;
  };
  correct: boolean;
  pointsAwarded: number;
  score: HostedQuizScore;
  entry: {
    required: boolean;
    charged: boolean;
    entitlementId?: string;
    entryFeePaid: number;
    currency: string;
  };
  nextQuestionId: string | null;
  overlaySnapshot: HostedQuizOverlaySnapshot;
  entryEntitlement?: GameHubGameEntryEntitlementRecord;
};

export type HostedQuizScoresResponse = {
  quizId: string;
  title: string;
  status: string;
  playCode: string;
  count: number;
  scores: HostedQuizScore[];
  generatedAt: string;
};

export type HostedQuizOverlayDispatchResponse = {
  dispatched: boolean;
  transport: string;
  eventName: string;
  roomId: string;
  socketEvent: {
    eventName: string;
    roomId: string;
    room: string;
    snapshot: HostedQuizOverlaySnapshot;
    emittedAt: string;
  } | null;
  receipt: GameHubOverlaySocketReceiptRecord;
  snapshot: HostedQuizOverlaySnapshot;
};

export type HostedQuizOverlayReceiptsResponse = {
  quizId: string;
  generatedAt: string;
  count: number;
  diagnostics: GameHubOverlayDeliveryDiagnostics;
  items: GameHubOverlaySocketReceiptRecord[];
};

export type HostedQuizEntryDiagnostic = {
  id: string;
  quizId: string;
  playerId: string;
  entryFeePaid: number;
  currency: string;
  createdAt: string;
};

export type HostedQuizOverlayReceiptDiagnostic = {
  id: string;
  quizId: string;
  overlayId: string;
  roomId?: string;
  roomKind?: string;
  socketRoom: string;
  eventName: string;
  channel: string;
  recipientScope: string;
  status: string;
  emittedAt: string;
  createdAt: string;
};

export type HostedQuizAdminDiagnosticsResponse = {
  quizId: string;
  title: string;
  status: GameHubHostedQuizRecord['status'];
  entryFee: number;
  generatedAt: string;
  filters: HostedQuizDiagnosticsFilterState;
  entries: {
    count: number;
    totalEntryFees: number;
    items: HostedQuizEntryDiagnostic[];
  };
  receipts: {
    count: number;
    lastEmittedAt?: string;
    byEvent: Record<string, number>;
    byChannel: Record<string, number>;
    items: HostedQuizOverlayReceiptDiagnostic[];
  };
};

export type HostedQuizDiagnosticsFilterInput = {
  entryLimit?: number;
  receiptLimit?: number;
  channel?: string;
  eventName?: string;
  roomId?: string;
};

export type HostedQuizDiagnosticsFilterState = {
  entryLimit: number;
  receiptLimit: number;
  channel: string | null;
  eventName: string | null;
  roomId: string | null;
};

export function loadGameHubSummary() {
  return apiRequest<GameHubSummary>('/games/hub/summary');
}

export function loadGameHubHistory(limit = 8) {
  return apiRequest<GameHubHistoryResponse>(`/games/hub/history?limit=${encodeURIComponent(String(limit))}`);
}

export function loadGameHubFavourites() {
  return apiRequest<GameHubFavouritesResponse>('/games/hub/favourites');
}

export function createReactionRoom(input: CreateReactionRoomInput) {
  return apiRequest<ReactionRoomCreateResponse>('/games/reactions/rooms', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function joinReactionRoom(roomId: string, input: JoinReactionRoomInput = {}) {
  return apiRequest<ReactionRoomJoinResponse>(`/games/reactions/rooms/${encodeURIComponent(roomId)}/join`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function scoreReactionRound(roundId: string, input: ScoreReactionRoundInput) {
  return apiRequest<ReactionRoundScoreResponse>(`/games/reactions/rounds/${encodeURIComponent(roundId)}/score`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createQuizImport(input: CreateQuizImportInput) {
  return apiRequest<GameHubQuizImportRecord>('/games/quiz/import', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function loadQuizImports(input: { status?: string; provider?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (input.status) params.set('status', input.status);
  if (input.provider) params.set('provider', input.provider);
  if (input.limit) params.set('limit', String(input.limit));
  const query = params.toString();
  return apiRequest<GameHubQuizImportsResponse>(`/games/quiz/imports${query ? `?${query}` : ''}`);
}

export function loadQuizImportLogs(importId: string) {
  return apiRequest<GameHubQuizImportLogsResponse>(`/games/quiz/imports/${encodeURIComponent(importId)}/logs`);
}

export function archiveQuizImport(importId: string) {
  return apiRequest<GameHubArchiveQuizImportResponse>(`/games/quiz/imports/${encodeURIComponent(importId)}`, {
    method: 'DELETE',
  });
}

export function createHostedQuiz(input: CreateHostedQuizInput) {
  return apiRequest<GameHubHostedQuizRecord>('/games/quizzes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function loadHostedQuizzes(input: { status?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (input.status) params.set('status', input.status);
  if (input.limit) params.set('limit', String(input.limit));
  const query = params.toString();
  return apiRequest<HostedQuizListResponse>(`/games/quizzes${query ? `?${query}` : ''}`);
}

export function loadHostedQuiz(quizId: string) {
  return apiRequest<GameHubHostedQuizRecord>(`/games/quizzes/${encodeURIComponent(quizId)}`);
}

export function loadHostedQuizAdminDiagnostics(quizId: string, filters: HostedQuizDiagnosticsFilterInput = {}) {
  const params = new URLSearchParams();
  if (filters.entryLimit) params.set('entryLimit', String(filters.entryLimit));
  if (filters.receiptLimit) params.set('receiptLimit', String(filters.receiptLimit));
  if (filters.channel) params.set('channel', filters.channel);
  if (filters.eventName) params.set('eventName', filters.eventName);
  if (filters.roomId) params.set('roomId', filters.roomId);
  const query = params.toString();
  return apiRequest<HostedQuizAdminDiagnosticsResponse>(`/games/quizzes/${encodeURIComponent(quizId)}/diagnostics${query ? `?${query}` : ''}`);
}

export function updateHostedQuizQuestions(quizId: string, questions: HostedQuizQuestion[]) {
  return apiRequest<GameHubHostedQuizRecord>(`/games/quizzes/${encodeURIComponent(quizId)}/questions`, {
    method: 'POST',
    body: JSON.stringify({ questions }),
  });
}

export function publishHostedQuiz(quizId: string) {
  return apiRequest<GameHubHostedQuizRecord>(`/games/quizzes/${encodeURIComponent(quizId)}/publish`, {
    method: 'POST',
  });
}

export function submitHostedQuizAnswer(quizId: string, input: { questionId: string; selectedOptionIndex: number; liveRoomId?: string; liveRoomKind?: string }) {
  return apiRequest<HostedQuizAnswerResponse>(`/games/quizzes/${encodeURIComponent(quizId)}/answers`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function loadHostedQuizScores(quizId: string) {
  return apiRequest<HostedQuizScoresResponse>(`/games/quizzes/${encodeURIComponent(quizId)}/scores`);
}

export function loadHostedQuizOverlaySnapshot(quizId: string) {
  return apiRequest<HostedQuizOverlaySnapshot>(`/games/quizzes/${encodeURIComponent(quizId)}/overlay-snapshot`);
}

export function dispatchHostedQuizOverlaySnapshot(quizId: string, roomId?: string) {
  return apiRequest<HostedQuizOverlayDispatchResponse>(`/games/quizzes/${encodeURIComponent(quizId)}/overlay-snapshot/dispatch`, {
    method: 'POST',
    body: JSON.stringify({ roomId }),
  });
}

export function loadHostedQuizOverlayReceipts(quizId: string, limit = 20) {
  return apiRequest<HostedQuizOverlayReceiptsResponse>(`/games/quizzes/${encodeURIComponent(quizId)}/overlay-receipts?limit=${encodeURIComponent(String(limit))}`);
}
