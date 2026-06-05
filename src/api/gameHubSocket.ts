import { io, type Socket } from 'socket.io-client';
import type { GameHubReactionRoundSnapshot, HostedQuizOverlaySnapshot } from '../features/games/gameHubModel';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';

export type HostedQuizOverlaySocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

type GameHubOverlaySocketEvent<TSnapshot> = {
  eventName: string;
  roomId: string;
  room: string;
  snapshot: TSnapshot;
  emittedAt: string;
};

export type HostedQuizOverlaySocketEvent = GameHubOverlaySocketEvent<HostedQuizOverlaySnapshot>;
export type ReactionRoomOverlaySocketEvent = GameHubOverlaySocketEvent<GameHubReactionRoundSnapshot>;

type RuntimeGlobal = typeof globalThis & {
  process?: {
    env?: {
      EXPO_PUBLIC_API_URL?: string;
    };
  };
};

type BaseOverlaySubscriptionOptions<TEvent> = {
  roomId: string;
  socketUrl?: string;
  onSnapshot: (event: TEvent) => void;
  onStatus?: (status: HostedQuizOverlaySocketStatus, detail?: string) => void;
};

export type HostedQuizOverlaySubscriptionOptions = BaseOverlaySubscriptionOptions<HostedQuizOverlaySocketEvent>;
export type ReactionRoomOverlaySubscriptionOptions = BaseOverlaySubscriptionOptions<ReactionRoomOverlaySocketEvent>;

export type HostedQuizOverlaySubscription = {
  roomId: string;
  socket: Socket;
  close: () => void;
};

export type ReactionRoomOverlaySubscription = HostedQuizOverlaySubscription;

type InternalOverlaySubscriptionOptions<TSnapshot> = {
  roomId: string;
  socketUrl?: string;
  eventName: string;
  resolveRoomId: (event: GameHubOverlaySocketEvent<TSnapshot>) => string | undefined;
  onSnapshot: (event: GameHubOverlaySocketEvent<TSnapshot>) => void;
  onStatus?: (status: HostedQuizOverlaySocketStatus, detail?: string) => void;
};

export function normalizeGameHubOverlayRoomId(roomId: string | undefined) {
  const normalized = String(roomId || 'global').trim().replace(/\s+/g, '-').slice(0, 120);
  return normalized || 'global';
}

export function normalizeHostedQuizOverlayRoomId(roomId: string | undefined) {
  return normalizeGameHubOverlayRoomId(roomId);
}

export function normalizeReactionRoomOverlayRoomId(roomId: string | undefined) {
  return normalizeGameHubOverlayRoomId(roomId);
}

export function resolveGameHubSocketUrl(apiBaseUrl = resolveApiBaseUrl()) {
  try {
    const url = new URL(apiBaseUrl);
    url.pathname = url.pathname.replace(/\/api\/?$/, '');
    return url.toString().replace(/\/$/, '');
  } catch {
    return apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '') || 'http://localhost:3000';
  }
}

function subscribeGameHubOverlay<TSnapshot>(options: InternalOverlaySubscriptionOptions<TSnapshot>): HostedQuizOverlaySubscription {
  const roomId = normalizeGameHubOverlayRoomId(options.roomId);
  const socket = io(options.socketUrl || resolveGameHubSocketUrl(), {
    autoConnect: true,
    transports: ['websocket'],
  });

  const handleConnect = () => {
    options.onStatus?.('connected', socket.id || roomId);
    socket.emit('gameHub.overlay.join', { roomId });
  };
  const handleDisconnect = (reason: string) => options.onStatus?.('disconnected', reason);
  const handleConnectError = (error: Error) => options.onStatus?.('error', error.message);
  const handleSnapshot = (event: GameHubOverlaySocketEvent<TSnapshot>) => {
    if (!event?.snapshot) return;
    const incomingRoomId = normalizeGameHubOverlayRoomId(options.resolveRoomId(event));
    if (incomingRoomId !== roomId) return;
    options.onSnapshot({
      ...event,
      roomId: incomingRoomId,
    });
  };

  options.onStatus?.('connecting', roomId);
  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
  socket.on('connect_error', handleConnectError);
  socket.on(options.eventName, handleSnapshot);

  return {
    roomId,
    socket,
    close: () => {
      socket.emit('gameHub.overlay.leave', { roomId });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off(options.eventName, handleSnapshot);
      socket.disconnect();
    },
  };
}

export function subscribeHostedQuizOverlay(options: HostedQuizOverlaySubscriptionOptions): HostedQuizOverlaySubscription {
  return subscribeGameHubOverlay({
    ...options,
    eventName: 'gameHub.hostedQuizOverlaySnapshot',
    resolveRoomId: (event) => event.roomId || event.snapshot.overlayId,
  });
}

export function subscribeReactionRoomOverlay(options: ReactionRoomOverlaySubscriptionOptions): ReactionRoomOverlaySubscription {
  return subscribeGameHubOverlay({
    ...options,
    eventName: 'gameHub.reactionRoomOverlaySnapshot',
    resolveRoomId: (event) => event.roomId || event.snapshot.overlayId || event.snapshot.roomId,
  });
}

function resolveApiBaseUrl() {
  const runtime = globalThis as RuntimeGlobal;
  return runtime.process?.env?.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
}
