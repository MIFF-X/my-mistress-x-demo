import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { io } from 'socket.io-client';
import { getCurrentUser } from '../../state/authStore';
import {
  normalizeHostedQuizOverlayRoomId,
  subscribeHostedQuizOverlay,
  type HostedQuizOverlaySocketEvent,
  type HostedQuizOverlaySocketStatus,
} from '../../api/gameHubSocket';
import { createLiveShow, endLiveShow, LiveShow, sendLiveTip, startLiveShow } from '../../api/liveApi';
import {
  acceptLiveShowRequest,
  cancelLiveShowRequest,
  createLiveShowRequest,
  declineLiveShowRequest,
  fulfilLiveShowRequest,
  listLiveShowRequests,
  LiveShowRequest,
} from '../../api/liveShowRequestsApi';
import type { HostedQuizOverlaySnapshot } from '../games/gameHubModel';
import { GiftEffect, GiftEffectOverlay } from '../gifts/GiftEffectOverlay';
import { LiveShowSelector } from './LiveShowSelector';

const SOCKET_URL = 'http://localhost:3000';
const QUICK_GIFTS = [5, 10, 25, 50, 100];
const REQUEST_PRESETS = ['Wave to me', 'Say my name', 'Private request', 'Extend show', 'Pin my message'];

type LiveRoomScreenProps = {
  roomId?: string;
  showId?: string;
  targetUserId?: string;
};

type LiveFeedEvent = {
  type: 'TIP' | 'REQUEST' | 'CHAT' | 'SYSTEM';
  userId?: string;
  amount?: number;
  message?: string;
  status?: string;
  requestId?: string;
  createdAt: string;
};

function canHostLive(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

function hostLabel(show: LiveShow | null) {
  if (!show) return 'No host selected';
  return show.mistress?.displayName || show.mistress?.username || show.mistressUserId;
}

function requestAmountLabel(request: LiveShowRequest) {
  if (!request.requestedAmount) return 'Free queue';
  return `${request.requestedAmount} credits - ${request.chargeMode.replace(/_/g, ' ')}`;
}

function upsertRequest(list: LiveShowRequest[], updated: LiveShowRequest) {
  const exists = list.some((request) => request.id === updated.id);
  if (!exists) return [updated, ...list];
  return list.map((request) => (request.id === updated.id ? updated : request));
}

function numericValue(value: number | string | undefined | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatElapsed(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const short = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${short}` : short;
}

function formatScheduledAt(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? trimmed : date.toISOString();
}

function overlayLeaderLabel(snapshot: HostedQuizOverlaySnapshot) {
  if (!snapshot.leader) return 'No leader yet';
  return `${snapshot.leader.playerId} - ${snapshot.leader.score} pts`;
}

function overlayProgressLabel(snapshot: HostedQuizOverlaySnapshot) {
  if (!snapshot.currentQuestion) return `${snapshot.answerCount} answers`;
  return `Q ${snapshot.currentQuestion.answeredCount}/${snapshot.playerCount || 0} answered`;
}

export function LiveRoomScreen({
  roomId: initialRoomId = 'live-room-1',
  showId: initialShowId,
  targetUserId: initialTargetUserId,
}: LiveRoomScreenProps) {
  const currentUser = getCurrentUser();
  const [socket, setSocket] = useState<any>(null);
  const [roomId, setRoomId] = useState(initialRoomId);
  const [showId, setShowId] = useState<string | undefined>(initialShowId);
  const [targetUserId, setTargetUserId] = useState<string | undefined>(initialTargetUserId);
  const [selectedShow, setSelectedShow] = useState<LiveShow | null>(null);
  const [feedEvents, setFeedEvents] = useState<LiveFeedEvent[]>([]);
  const [liveRequests, setLiveRequests] = useState<LiveShowRequest[]>([]);
  const [hostedQuizOverlayEvents, setHostedQuizOverlayEvents] = useState<HostedQuizOverlaySocketEvent[]>([]);
  const [overlaySocketStatus, setOverlaySocketStatus] = useState<HostedQuizOverlaySocketStatus>('idle');
  const [overlaySocketDetail, setOverlaySocketDetail] = useState('waiting');
  const [giftEffect, setGiftEffect] = useState<GiftEffect | null>(null);
  const [amount, setAmount] = useState('10');
  const [chatText, setChatText] = useState('');
  const [requestText, setRequestText] = useState('');
  const [requestAmount, setRequestAmount] = useState('0');
  const [viewerCamEnabled, setViewerCamEnabled] = useState(false);
  const [theatreMode, setTheatreMode] = useState(false);
  const [chatPaused, setChatPaused] = useState(false);
  const [roomFlagged, setRoomFlagged] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [showTitle, setShowTitle] = useState('');
  const [showDescription, setShowDescription] = useState('');
  const [ticketPrice, setTicketPrice] = useState('25');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [giftsEnabled, setGiftsEnabled] = useState(true);
  const [creatingShow, setCreatingShow] = useState(false);
  const [showActionLoading, setShowActionLoading] = useState<'start' | 'end' | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [managingRequestId, setManagingRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hostCanControl = canHostLive(currentUser?.role);
  const overlayRoomId = useMemo(() => normalizeHostedQuizOverlayRoomId(roomId), [roomId]);
  const latestHostedQuizOverlay = hostedQuizOverlayEvents[0]?.snapshot;

  useEffect(() => {
    if (!giftEffect) return undefined;

    const timeout = setTimeout(() => setGiftEffect(null), 3200);
    return () => clearTimeout(timeout);
  }, [giftEffect]);

  const showLiveGiftEffect = useCallback((userId: string | undefined, value: number) => {
    setGiftEffect({
      id: Date.now(),
      badge: 'LIVE GIFT',
      title: `${value} credits`,
      detail: `${userId || 'viewer'} sent a live-room gift.`,
      accentColor: '#ff0055',
    });
  }, []);

  useEffect(() => {
    const s = io(SOCKET_URL);

    s.emit('live.join', { roomId });

    s.on('live.tipEvent', (data: any) => {
      const incomingUserId = data.userId || 'viewer';
      const incomingAmount = Number(data.amount || 0);

      setFeedEvents((prev) => [
        ...prev,
        {
          type: 'TIP',
          userId: incomingUserId,
          amount: incomingAmount,
          createdAt: new Date().toISOString(),
        },
      ]);

      if (incomingUserId !== currentUser?.id) {
        showLiveGiftEffect(incomingUserId, incomingAmount);
      }
    });

    s.on('live.requestEvent', (data: any) => {
      setFeedEvents((prev) => [
        ...prev,
        {
          type: 'REQUEST',
          userId: data.userId,
          amount: Number(data.amount || 0),
          message: data.message,
          status: data.status || 'QUEUED',
          requestId: data.requestId,
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    s.on('live.requestStatusEvent', (data: any) => {
      setFeedEvents((prev) => [
        ...prev,
        {
          type: 'SYSTEM',
          message: data.message || `Request ${data.requestId} moved to ${data.status}`,
          status: data.status,
          requestId: data.requestId,
          createdAt: new Date().toISOString(),
        },
      ]);
      setLiveRequests((current) => current.map((request) => (
        request.id === data.requestId ? { ...request, status: data.status, updatedAt: new Date().toISOString() } : request
      )));
    });

    s.on('live.chatEvent', (data: any) => {
      setFeedEvents((prev) => [
        ...prev,
        {
          type: 'CHAT',
          userId: data.userId,
          message: data.message,
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [currentUser?.id, roomId, showLiveGiftEffect]);

  useEffect(() => {
    const subscription = subscribeHostedQuizOverlay({
      roomId,
      onStatus: (status, detail) => {
        setOverlaySocketStatus(status);
        setOverlaySocketDetail(detail || status);
      },
      onSnapshot: (event) => {
        setHostedQuizOverlayEvents((prev) => [event, ...prev].slice(0, 5));
        setFeedEvents((prev) => [
          ...prev,
          {
            type: 'SYSTEM',
            status: 'QUIZ_OVERLAY',
            message: `${event.snapshot.quizTitle} overlay updated - ${overlayLeaderLabel(event.snapshot)}`,
            createdAt: event.emittedAt || new Date().toISOString(),
          },
        ]);
      },
    });

    return () => subscription.close();
  }, [roomId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveStats = useMemo(() => {
    const supporterTotals = new Map<string, number>();
    let tipTotal = 0;
    let requestTotal = 0;

    feedEvents.forEach((event) => {
      const amount = numericValue(event.amount);
      if (event.type === 'TIP') {
        tipTotal += amount;
        if (event.userId) supporterTotals.set(event.userId, (supporterTotals.get(event.userId) || 0) + amount);
      }

    });

    liveRequests.forEach((request) => {
      if (request.status === 'ACCEPTED' || request.status === 'FULFILLED') {
        const amount = numericValue(request.requestedAmount);
        requestTotal += amount;
        if (request.requesterUserId) {
          supporterTotals.set(request.requesterUserId, (supporterTotals.get(request.requesterUserId) || 0) + amount);
        }
      }
    });

    const topSupporter = Array.from(supporterTotals.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return {
      earnings: tipTotal + requestTotal,
      tips: tipTotal,
      requestValue: requestTotal,
      topSupporterId: topSupporter?.[0] || null,
      topSupporterCredits: topSupporter?.[1] || 0,
    };
  }, [feedEvents, liveRequests]);

  const elapsedLabel = useMemo(() => {
    if (selectedShow?.status !== 'LIVE') return '00:00';
    const startTime = selectedShow.startedAt ? new Date(selectedShow.startedAt).getTime() : now;
    return formatElapsed(now - startTime);
  }, [now, selectedShow?.startedAt, selectedShow?.status]);

  const giftsAvailable = Boolean(targetUserId && (!selectedShow || selectedShow.giftsEnabled));
  const chatAvailable = Boolean(targetUserId && !chatPaused && (!selectedShow || selectedShow.chatEnabled));
  const requestsAvailable = Boolean(targetUserId && !chatPaused);

  async function loadLiveRequests(nextShowId: string) {
    try {
      const scope = hostCanControl ? 'all' : 'mine';
      const requests = await listLiveShowRequests(nextShowId, scope);
      setLiveRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request queue failed to load');
    }
  }

  function handleSelectShow(show: LiveShow) {
    setSelectedShow(show);
    setShowId(show.id);
    setTargetUserId(show.mistressUserId);
    setRoomId(`live-show-${show.id}`);
    setChatPaused(!show.chatEnabled);
    setFeedEvents([{ type: 'SYSTEM', message: `Joined ${show.title}`, createdAt: new Date().toISOString() }]);
    setLiveRequests([]);
    setHostedQuizOverlayEvents([]);
    setGiftEffect(null);
    setError(null);
    void loadLiveRequests(show.id);
  }

  async function handleCreateShow() {
    const title = showTitle.trim();
    const price = Number(ticketPrice || 0);
    const duration = Number(durationMinutes || 0);

    if (!title) {
      setError('Live show title is required.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Ticket price must be zero or greater.');
      return;
    }

    if (durationMinutes.trim() && (!Number.isFinite(duration) || duration <= 0)) {
      setError('Duration must be a positive whole number.');
      return;
    }

    try {
      setCreatingShow(true);
      setError(null);
      const show = await createLiveShow({
        title,
        description: showDescription.trim() || undefined,
        ticketPrice: price,
        scheduledAt: formatScheduledAt(scheduledAt),
        durationMinutes: durationMinutes.trim() ? Math.round(duration) : undefined,
        chatEnabled,
        giftsEnabled,
        metadata: {
          source: 'live-room-host-panel',
          moderation: {
            chatPaused: !chatEnabled,
            flagged: false,
          },
        },
      });

      handleSelectShow(show);
      setShowTitle('');
      setShowDescription('');
      setTicketPrice('25');
      setScheduledAt('');
      setDurationMinutes('60');
      setChatEnabled(true);
      setGiftsEnabled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Live show creation failed');
    } finally {
      setCreatingShow(false);
    }
  }

  async function handleShowStatus(action: 'start' | 'end') {
    if (!showId) {
      setError('Select a live show before changing status.');
      return;
    }

    try {
      setShowActionLoading(action);
      setError(null);
      const updated = action === 'start' ? await startLiveShow(showId) : await endLiveShow(showId);
      setSelectedShow(updated);
      setFeedEvents((prev) => [
        ...prev,
        {
          type: 'SYSTEM',
          message: action === 'start' ? `${updated.title} is now live.` : `${updated.title} has ended.`,
          status: updated.status,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Live show ${action} failed`);
    } finally {
      setShowActionLoading(null);
    }
  }

  function sendChatMessage() {
    const message = chatText.trim();

    if (!message) {
      setError('Chat message is required.');
      return;
    }

    if (!targetUserId) {
      setError('Select a live show before sending chat messages.');
      return;
    }

    if (chatPaused || (selectedShow && !selectedShow.chatEnabled)) {
      setError('Live chat is paused by the host.');
      return;
    }

    const event = {
      type: 'CHAT' as const,
      userId: currentUser?.id || 'viewer',
      message,
      createdAt: new Date().toISOString(),
    };

    if (socket) {
      socket.emit('live.chat', {
        roomId,
        userId: event.userId,
        message,
        showId,
      });
    }

    setFeedEvents((prev) => [...prev, event]);
    setChatText('');
    setError(null);
  }

  async function sendTip(valueOverride?: number) {
    const value = Number(valueOverride ?? amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Tip amount must be greater than zero.');
      return;
    }

    if (!currentUser?.id) {
      setError('You must be logged in to send a tip.');
      return;
    }

    if (!targetUserId) {
      setError('Select a live show host before sending a tip.');
      return;
    }

    if (selectedShow && !selectedShow.giftsEnabled) {
      setError('Gifts are disabled for this live show.');
      return;
    }

    try {
      setError(null);
      await sendLiveTip(targetUserId, value, showId);

      if (socket) {
        socket.emit('live.tip', {
          roomId,
          userId: currentUser.id,
          targetUserId,
          showId,
          amount: value,
        });
      }

      setFeedEvents((prev) => [
        ...prev,
        { type: 'TIP', userId: currentUser.id, amount: value, createdAt: new Date().toISOString() },
      ]);
      showLiveGiftEffect(currentUser.id, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tip failed to send');
    }
  }

  async function queueRequest(textOverride?: string) {
    const message = (textOverride || requestText).trim();
    const value = Number(requestAmount || 0);

    if (!message) {
      setError('Request text is required.');
      return;
    }

    if (chatPaused) {
      setError('Request queue is paused by the host.');
      return;
    }

    if (!showId || !targetUserId) {
      setError('Select a live show before sending requests.');
      return;
    }

    if (!Number.isFinite(value) || value < 0) {
      setError('Request amount must be zero or greater.');
      return;
    }

    try {
      setSubmittingRequest(true);
      setError(null);
      const request = await createLiveShowRequest({
        showId,
        hostUserId: targetUserId,
        message,
        requestedAmount: value,
        chargeMode: value > 0 ? 'PAID_ON_ACCEPTANCE' : 'FREE_QUEUE',
        metadata: { roomId, source: 'live-room-sidebar' },
      });

      setLiveRequests((current) => upsertRequest(current, request));
      if (socket) {
        socket.emit('live.request', {
          roomId,
          requestId: request.id,
          userId: request.requesterUserId || currentUser?.id || 'viewer',
          message: request.message,
          status: request.status,
          amount: request.requestedAmount,
        });
      }
      setFeedEvents((prev) => [
        ...prev,
        {
          type: 'REQUEST',
          userId: request.requesterUserId || currentUser?.id || 'viewer',
          message: request.message,
          status: request.status,
          amount: request.requestedAmount,
          requestId: request.id,
          createdAt: request.createdAt || new Date().toISOString(),
        },
      ]);
      setRequestText('');
      setRequestAmount('0');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed to queue');
    } finally {
      setSubmittingRequest(false);
    }
  }

  async function manageRequest(requestId: string, action: 'accept' | 'decline' | 'fulfil' | 'cancel') {
    try {
      setManagingRequestId(requestId);
      setError(null);
      const updated =
        action === 'accept'
          ? await acceptLiveShowRequest(requestId)
          : action === 'decline'
            ? await declineLiveShowRequest(requestId)
            : action === 'fulfil'
              ? await fulfilLiveShowRequest(requestId)
              : await cancelLiveShowRequest(requestId);

      setLiveRequests((current) => upsertRequest(current, updated));
      if (socket) {
        socket.emit('live.requestStatus', {
          roomId,
          requestId: updated.id,
          status: updated.status,
          message: `Request ${updated.id} moved to ${updated.status}`,
        });
      }
      setFeedEvents((prev) => [
        ...prev,
        {
          type: 'SYSTEM',
          message: `Request ${updated.id} moved to ${updated.status}`,
          status: updated.status,
          requestId: updated.id,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request update failed');
    } finally {
      setManagingRequestId(null);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#000', position: 'relative' }}>
      {giftEffect ? <GiftEffectOverlay key={giftEffect.id} effect={giftEffect} top={16} /> : null}

      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Live Show Room</Text>
        <Text style={{ color: '#aaa', marginTop: 4 }}>
          Mistress stage, side chat, micro-gifts, request queue, and viewer controls.
        </Text>
      </View>

      {hostCanControl ? (
        <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Host show setup</Text>
            <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>HOST</Text>
          </View>

          <TextInput
            value={showTitle}
            onChangeText={setShowTitle}
            placeholder="Show title"
            placeholderTextColor="#666"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />
          <TextInput
            value={showDescription}
            onChangeText={setShowDescription}
            placeholder="Description"
            placeholderTextColor="#666"
            multiline
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, minHeight: 58 }}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TextInput
              value={ticketPrice}
              onChangeText={setTicketPrice}
              placeholder="Ticket credits"
              placeholderTextColor="#666"
              keyboardType="numeric"
              style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, flex: 1, minWidth: 140 }}
            />
            <TextInput
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="Duration minutes"
              placeholderTextColor="#666"
              keyboardType="numeric"
              style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, flex: 1, minWidth: 140 }}
            />
            <TextInput
              value={scheduledAt}
              onChangeText={setScheduledAt}
              placeholder="Scheduled time"
              placeholderTextColor="#666"
              style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, flex: 2, minWidth: 190 }}
            />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <Pressable
              onPress={() => setChatEnabled((value) => !value)}
              style={{ backgroundColor: chatEnabled ? '#1D9E75' : '#333', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
            >
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Chat {chatEnabled ? 'On' : 'Off'}</Text>
            </Pressable>
            <Pressable
              onPress={() => setGiftsEnabled((value) => !value)}
              style={{ backgroundColor: giftsEnabled ? '#1D9E75' : '#333', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
            >
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Gifts {giftsEnabled ? 'On' : 'Off'}</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleCreateShow}
            disabled={creatingShow}
            style={{ backgroundColor: '#ff0055', padding: 12, borderRadius: 10 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>
              {creatingShow ? 'Creating...' : 'Create Live Show'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <LiveShowSelector selectedShowId={showId} onSelect={handleSelectShow} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <View style={{ flex: 2, minWidth: 260, backgroundColor: '#090909', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#222' }}>
          <View style={{ backgroundColor: '#151515', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: '#fff', fontWeight: '900' }}>{selectedShow?.title || 'Select a live show'}</Text>
              <Text style={{ color: '#ff9abf', fontSize: 11 }}>Host: {hostLabel(selectedShow)}</Text>
              {selectedShow ? (
                <Text style={{ color: '#aaa', fontSize: 11 }}>
                  Ticket: {selectedShow.ticketPrice} credits{selectedShow.durationMinutes ? ` - ${selectedShow.durationMinutes} mins` : ''}
                </Text>
              ) : null}
            </View>
            <View style={{ backgroundColor: selectedShow ? '#1D9E75' : '#333', paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999 }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{selectedShow?.status || 'WAITING'}</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#0f0f0f', padding: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              ['Timer', elapsedLabel],
              ['Earnings', `${liveStats.earnings} cr`],
              ['Tips', `${liveStats.tips} cr`],
              ['Requests', `${liveStats.requestValue} cr`],
            ].map(([label, value]) => (
              <View key={label} style={{ backgroundColor: '#1b1b1b', padding: 9, borderRadius: 10, minWidth: 92 }}>
                <Text style={{ color: '#999', fontSize: 10, fontWeight: '900' }}>{label}</Text>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 2 }}>{value}</Text>
              </View>
            ))}
            <View style={{ backgroundColor: '#1b1b1b', padding: 9, borderRadius: 10, minWidth: 150 }}>
              <Text style={{ color: '#999', fontSize: 10, fontWeight: '900' }}>Top supporter</Text>
              <Text style={{ color: '#d4af37', fontSize: 14, fontWeight: '900', marginTop: 2 }}>
                {liveStats.topSupporterId ? `${liveStats.topSupporterId} - ${liveStats.topSupporterCredits} cr` : 'None yet'}
              </Text>
            </View>
          </View>

          <View style={{ minHeight: theatreMode ? 360 : 250, alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <Text style={{ fontSize: 42, marginBottom: 8 }}>🎥</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center' }}>
              Mistress Live Feed
            </Text>
            <Text style={{ color: '#888', textAlign: 'center', marginTop: 6 }}>
              Video stream placeholder. Connect camera/stream provider here while keeping chat, tips, and requests active.
            </Text>
            {latestHostedQuizOverlay ? (
              <View style={{ marginTop: 14, width: '100%', maxWidth: 560, backgroundColor: '#081727', borderColor: '#60a5fa', borderWidth: 1, borderRadius: 14, padding: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <Text style={{ color: '#60a5fa', fontSize: 11, fontWeight: '900' }}>HOSTED QUIZ OVERLAY</Text>
                  <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>Room {overlayRoomId} - {overlaySocketStatus}</Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{latestHostedQuizOverlay.quizTitle}</Text>
                <Text style={{ color: '#d7d7de', fontSize: 12 }}>
                  Code {latestHostedQuizOverlay.playCode} - {latestHostedQuizOverlay.playerCount} players - {latestHostedQuizOverlay.answerCount} answers
                </Text>
                {latestHostedQuizOverlay.currentQuestion ? (
                  <Text style={{ color: '#fff', fontSize: 13, lineHeight: 19 }}>
                    {latestHostedQuizOverlay.currentQuestion.prompt}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <View style={{ backgroundColor: '#0f263f', padding: 8, borderRadius: 10, minWidth: 120 }}>
                    <Text style={{ color: '#8abfff', fontSize: 10, fontWeight: '900' }}>Leader</Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>{overlayLeaderLabel(latestHostedQuizOverlay)}</Text>
                  </View>
                  <View style={{ backgroundColor: '#0f263f', padding: 8, borderRadius: 10, minWidth: 120 }}>
                    <Text style={{ color: '#8abfff', fontSize: 10, fontWeight: '900' }}>Progress</Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>{overlayProgressLabel(latestHostedQuizOverlay)}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={{ color: '#666', fontSize: 11, marginTop: 10 }}>
                Listening for hosted quiz overlays in room {overlayRoomId} - socket {overlaySocketStatus}.
              </Text>
            )}
          </View>

          <View style={{ backgroundColor: '#111', padding: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Pressable
              onPress={() => setTheatreMode((value) => !value)}
              style={{ backgroundColor: theatreMode ? '#d4af37' : '#1b1b1b', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
            >
              <Text style={{ color: theatreMode ? '#000' : '#fff', fontWeight: '800', fontSize: 12 }}>
                {theatreMode ? 'Exit Theatre' : 'Theatre Mode'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewerCamEnabled((value) => !value)}
              style={{ backgroundColor: viewerCamEnabled ? '#1D9E75' : '#1b1b1b', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>
                Viewer Cam {viewerCamEnabled ? 'On' : 'Off'}
              </Text>
            </Pressable>
            {hostCanControl ? (
              <>
                <Pressable
                  onPress={() => handleShowStatus('start')}
                  disabled={!showId || selectedShow?.status === 'LIVE' || showActionLoading !== null}
                  style={{ backgroundColor: showId && selectedShow?.status !== 'LIVE' ? '#1D9E75' : '#333', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>
                    {showActionLoading === 'start' ? 'Starting...' : 'Start Show'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleShowStatus('end')}
                  disabled={!showId || selectedShow?.status === 'ENDED' || showActionLoading !== null}
                  style={{ backgroundColor: showId && selectedShow?.status !== 'ENDED' ? '#3a1b1b' : '#333', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
                >
                  <Text style={{ color: '#ff9abf', fontWeight: '900', fontSize: 12 }}>
                    {showActionLoading === 'end' ? 'Ending...' : 'End Show'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setChatPaused((value) => !value)}
                  style={{ backgroundColor: chatPaused ? '#3a1b1b' : '#1b1b1b', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
                >
                  <Text style={{ color: chatPaused ? '#ff9abf' : '#fff', fontWeight: '900', fontSize: 12 }}>
                    {chatPaused ? 'Resume Requests' : 'Pause Requests'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setRoomFlagged((value) => !value)}
                  style={{ backgroundColor: roomFlagged ? '#d4af37' : '#1b1b1b', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
                >
                  <Text style={{ color: roomFlagged ? '#000' : '#fff', fontWeight: '900', fontSize: 12 }}>
                    {roomFlagged ? 'Flagged' : 'Flag Room'}
                  </Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>

        <View style={{ flex: 1, minWidth: 240, backgroundColor: '#111', borderRadius: 16, padding: 12 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', marginBottom: 4 }}>Chat Sidebar</Text>
          <Text style={{ color: '#999', fontSize: 11, marginBottom: 10 }}>
            Tips, requests, and live room events appear here.
          </Text>

          {!targetUserId ? (
            <View style={{ backgroundColor: '#1b1b1b', padding: 10, borderRadius: 10, marginBottom: 10 }}>
              <Text style={{ color: '#ff9abf' }}>
                No live show host selected yet. Select a show before sending gifts or requests.
              </Text>
            </View>
          ) : null}

          {chatPaused || roomFlagged ? (
            <View style={{ backgroundColor: roomFlagged ? '#2b2208' : '#3a1b1b', padding: 10, borderRadius: 10, marginBottom: 10 }}>
              <Text style={{ color: roomFlagged ? '#d4af37' : '#ff9abf', fontWeight: '900' }}>
                {roomFlagged ? 'Room flagged for review' : 'Request queue paused'}
              </Text>
              <Text style={{ color: '#aaa', fontSize: 11, marginTop: 3 }}>
                Host moderation controls are active for this room.
              </Text>
            </View>
          ) : null}

          <ScrollView style={{ maxHeight: 210, marginBottom: 10 }}>
            {feedEvents.length === 0 ? (
              <Text style={{ color: '#777' }}>No live events yet.</Text>
            ) : null}
            {feedEvents.map((event, index) => (
              <View key={`${event.createdAt}-${index}`} style={{ marginBottom: 8, backgroundColor: '#1b1b1b', padding: 8, borderRadius: 10 }}>
                <Text style={{ color: event.type === 'TIP' ? '#1D9E75' : event.type === 'REQUEST' ? '#d4af37' : '#ff9abf', fontWeight: '900', fontSize: 11 }}>
                  {event.type}{event.status ? ` - ${event.status}` : ''}
                </Text>
                <Text style={{ color: '#fff', marginTop: 2 }}>
                  {event.type === 'TIP'
                    ? `${event.userId || 'viewer'} tipped ${event.amount} credits`
                    : event.message}
                </Text>
                {event.type === 'REQUEST' && event.amount ? (
                  <Text style={{ color: '#d4af37', fontSize: 11, marginTop: 2 }}>
                    Value on acceptance: {event.amount} credits
                  </Text>
                ) : null}
              </View>
            ))}
          </ScrollView>

          {error ? <Text style={{ color: '#ff6b6b', marginBottom: 8 }}>{error}</Text> : null}

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Live chat</Text>
          <TextInput
            value={chatText}
            onChangeText={setChatText}
            placeholder="Message the room"
            placeholderTextColor="#666"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />
          <Pressable
            onPress={sendChatMessage}
            disabled={!chatAvailable}
            style={{ backgroundColor: chatAvailable ? '#1D9E75' : '#333', padding: 11, borderRadius: 10, marginBottom: 10 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Send Chat</Text>
          </Pressable>

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Micro-gifts</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {QUICK_GIFTS.map((value) => (
              <Pressable
                key={value}
                onPress={() => sendTip(value)}
                disabled={!giftsAvailable}
                style={{ backgroundColor: giftsAvailable ? '#ff0055' : '#333', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999 }}
              >
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{value}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Custom tip amount"
            placeholderTextColor="#666"
            keyboardType="numeric"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />

          <Pressable
            onPress={() => sendTip()}
            disabled={!giftsAvailable}
            style={{ backgroundColor: giftsAvailable ? '#ff0055' : '#333', padding: 11, borderRadius: 10, marginBottom: 10 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>
              Send Custom Tip
            </Text>
          </Pressable>

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Request queue</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {REQUEST_PRESETS.map((preset) => (
              <Pressable
                key={preset}
                onPress={() => queueRequest(preset)}
                disabled={!requestsAvailable || submittingRequest}
                style={{ backgroundColor: requestsAvailable ? '#2b2208' : '#333', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 999 }}
              >
                <Text style={{ color: requestsAvailable ? '#d4af37' : '#777', fontWeight: '800', fontSize: 11 }}>{preset}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={requestText}
            onChangeText={setRequestText}
            placeholder="Type a request for the host"
            placeholderTextColor="#666"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />

          <TextInput
            value={requestAmount}
            onChangeText={setRequestAmount}
            placeholder="Optional value on acceptance"
            placeholderTextColor="#666"
            keyboardType="numeric"
            style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
          />

          <Pressable
            onPress={() => queueRequest()}
            disabled={!requestsAvailable || submittingRequest}
            style={{ backgroundColor: requestsAvailable ? '#d4af37' : '#333', padding: 11, borderRadius: 10 }}
          >
            <Text style={{ color: requestsAvailable ? '#000' : '#777', textAlign: 'center', fontWeight: '900' }}>
              {submittingRequest ? 'Queueing...' : 'Queue Request'}
            </Text>
          </Pressable>

          <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 6 }}>Hosted Quiz Overlay Feed</Text>
            <Text style={{ color: '#60a5fa', fontSize: 11, fontWeight: '900', marginBottom: 6 }}>
              Socket {overlaySocketStatus} - {overlaySocketDetail}
            </Text>
            {hostedQuizOverlayEvents.length === 0 ? (
              <Text style={{ color: '#777', marginBottom: 8 }}>No quiz overlay snapshots received yet.</Text>
            ) : null}
            {hostedQuizOverlayEvents.map((event) => (
              <View key={`${event.snapshot.id}-${event.emittedAt}`} style={{ backgroundColor: '#081727', borderColor: '#1d4f80', borderWidth: 1, padding: 8, borderRadius: 10, marginBottom: 8 }}>
                <Text style={{ color: '#60a5fa', fontSize: 11, fontWeight: '900' }}>{event.snapshot.status.toUpperCase()} - {overlayProgressLabel(event.snapshot)}</Text>
                <Text style={{ color: '#fff', marginTop: 2 }}>{event.snapshot.quizTitle}</Text>
                <Text style={{ color: '#d4af37', fontSize: 11, marginTop: 2 }}>{overlayLeaderLabel(event.snapshot)}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 6 }}>Backend Request Queue</Text>
            {showId ? (
              <Pressable
                onPress={() => loadLiveRequests(showId)}
                style={{ backgroundColor: '#1b1b1b', padding: 8, borderRadius: 8, marginBottom: 8 }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Refresh Requests</Text>
              </Pressable>
            ) : null}
            {liveRequests.length === 0 ? <Text style={{ color: '#777' }}>No queued backend requests yet.</Text> : null}
            {liveRequests.slice(0, 5).map((request) => (
              <View key={request.id} style={{ backgroundColor: '#1b1b1b', padding: 8, borderRadius: 10, marginBottom: 8 }}>
                <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{request.status}</Text>
                <Text style={{ color: '#fff', marginTop: 2 }}>{request.message}</Text>
                <Text style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>{requestAmountLabel(request)}</Text>
                {hostCanControl && request.status === 'QUEUED' ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    <Pressable
                      onPress={() => manageRequest(request.id, 'accept')}
                      disabled={managingRequestId === request.id}
                      style={{ backgroundColor: '#1D9E75', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 999 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>Accept</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => manageRequest(request.id, 'decline')}
                      disabled={managingRequestId === request.id}
                      style={{ backgroundColor: '#3a1b1b', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 999 }}
                    >
                      <Text style={{ color: '#ff9abf', fontWeight: '900', fontSize: 11 }}>Decline</Text>
                    </Pressable>
                  </View>
                ) : null}
                {hostCanControl && request.status === 'ACCEPTED' ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    <Pressable
                      onPress={() => manageRequest(request.id, 'fulfil')}
                      disabled={managingRequestId === request.id}
                      style={{ backgroundColor: '#d4af37', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 999 }}
                    >
                      <Text style={{ color: '#000', fontWeight: '900', fontSize: 11 }}>Fulfil</Text>
                    </Pressable>
                  </View>
                ) : null}
                {(request.status === 'QUEUED' || request.status === 'ACCEPTED') ? (
                  <Pressable
                    onPress={() => manageRequest(request.id, 'cancel')}
                    disabled={managingRequestId === request.id}
                    style={{ backgroundColor: '#222', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 999, marginTop: 8, alignSelf: 'flex-start' }}
                  >
                    <Text style={{ color: '#aaa', fontWeight: '900', fontSize: 11 }}>Cancel</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
