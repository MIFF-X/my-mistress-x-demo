import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  ChatMessageResponse,
  ChatRoomSummaryResponse,
  PaidMessageChargeMode,
  PaidMessageHistoryItem,
  PaidMessageReviewStatus,
  PaidMessageSettings,
} from '../../api/chatApi';
import { GiftItem } from '../../api/giftsApi';
import { DirectoryUser, listUserDirectory } from '../../api/usersApi';
import { getWalletBalance } from '../../api/walletApi';
import { submitAbacusFeedback } from '../../api/abacusApi';
import { getCurrentUser } from '../../state/authStore';
import { createGiftEffectFromGift } from '../gifts/GiftEffectPresets';
import { GiftEffect, GiftEffectOverlay } from '../gifts/GiftEffectOverlay';
import { GiftPicker } from '../gifts/GiftPicker';
import { ContactSelector } from '../users/ContactSelector';
import { LockedMessageCard } from './LockedMessageCard';
import { MessageTypeCard, MessageType } from './MessageTypeCard';
import {
  ensureChatRoom,
  loadPaidMessageHistory,
  loadPaidMessageSettings,
  loadChatRooms,
  loadChatMessages,
  markChatRoomRead,
  requestPaidMessageReceiptReview,
  savePaidMessageSettings,
  submitPriorityMessage,
  submitStandardMessage,
} from './chatActions';

type LocalMessage = {
  id: string;
  type: MessageType;
  message: string;
  aiRequestId?: string | null;
  aiFeedbackSignal?: 'positive' | 'negative';
  aiFeedbackStatus?: 'idle' | 'submitting' | 'submitted' | 'error';
  aiFeedbackError?: string;
  aiFeedbackTags?: string[];
  aiFeedbackNote?: string;
  amount?: number;
  cost?: number;
  createdAt?: string;
};

type PaidMessageReceipt = {
  id: string;
  messageId?: string;
  title: string;
  amount: number;
  direction: 'IN' | 'OUT' | 'PENDING';
  status: string;
  detail?: string;
  reviewStatus?: PaidMessageReviewStatus | null;
  reviewReason?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
};

type ChatScreenProps = {
  targetUserId?: string;
  initialRoomId?: string;
};

const DEFAULT_PAID_MESSAGE_SETTINGS: PaidMessageSettings = {
  enabled: false,
  chargeMode: 'PER_INITIATED_MESSAGE',
  initiatedMessageRate: 5,
  responseRate: 10,
  openMessageRate: 8,
  currency: 'credits',
};

const AI_FEEDBACK_REASON_OPTIONS = ['helpful', 'on-brand', 'tone', 'safety', 'missed-context', 'too-long', 'wrong-facts', 'needs-review'];

function normalizeRole(role?: string) {
  return String(role || '').toUpperCase();
}

function isCreatorRole(role?: string) {
  return ['MISTRESS', 'HEADMISTRESS', 'HEAD_MISTRESS', 'ADMIN'].includes(normalizeRole(role));
}

function isSubRole(role?: string) {
  return normalizeRole(role) === 'SUB';
}

function getActivePaidMessageRate(settings: PaidMessageSettings) {
  if (settings.chargeMode === 'PER_RESPONSE') return settings.responseRate;
  if (settings.chargeMode === 'ON_MISTRESS_OPEN') return settings.openMessageRate;
  return settings.initiatedMessageRate;
}

function paidMessageButtonLabel(settings: PaidMessageSettings, amount: number) {
  if (!settings.enabled) return 'Send Paid';
  if (settings.chargeMode === 'PER_RESPONSE') return `Send Paid Response (${amount})`;
  if (settings.chargeMode === 'ON_MISTRESS_OPEN') return `Send Pay-on-Open (${amount})`;
  return `Send Paid (${amount})`;
}

function normalizeRateInput(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function parseCredits(value: number | string | undefined) {
  const credits = Number(value ?? 0);
  return Number.isFinite(credits) ? credits : null;
}

function parseOptionalCredits(value: number | string | undefined) {
  const credits = Number(value);
  return Number.isFinite(credits) ? credits : undefined;
}

function formatCredits(value: number | null) {
  if (value === null) return 'Checking...';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits`;
}

function toMessageType(type: ChatMessageResponse['type']): MessageType {
  if (type === 'PAID_MESSAGE') return 'PAID_MESSAGE';
  if (type === 'CHAT_UNLOCK') return 'CHAT_UNLOCK';
  if (type === 'GIFT') return 'GIFT';
  if (type === 'STICKER') return 'STICKER';
  if (type === 'SYSTEM') return 'SYSTEM';
  return 'FREE';
}

function mapPersistedMessage(message: ChatMessageResponse): LocalMessage {
  return {
    id: message.id || `${message.roomId || 'room'}-${message.createdAt || Date.now()}`,
    type: toMessageType(message.type),
    message: message.body || message.text || '',
    aiRequestId: message.aiRequestId ?? null,
    aiFeedbackStatus: message.aiRequestId ? 'idle' : undefined,
    amount: parseOptionalCredits(message.amount),
    cost: parseOptionalCredits(message.cost),
    createdAt: message.createdAt,
  };
}

function mapPaidReceipt(item: PaidMessageHistoryItem): PaidMessageReceipt {
  const otherUserLabel = item.otherUser?.displayName || item.otherUser?.username || item.otherUser?.id || 'Paid message';

  return {
    id: item.id,
    messageId: item.messageId,
    title: otherUserLabel,
    amount: Number(item.amount || 0),
    direction: item.direction,
    status: item.status,
    detail: `${item.chargeMode} ${item.messageType}`.replace(/_/g, ' ').toLowerCase(),
    reviewStatus: item.reviewStatus,
    reviewReason: item.reviewReason,
    reviewedAt: item.reviewedAt || item.paidAt || undefined,
    createdAt: item.createdAt,
  };
}

function formatProfileLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function directoryUserLabel(user?: DirectoryUser) {
  return user?.displayName || user?.username || undefined;
}

function roomPeerUsers(room: ChatRoomSummaryResponse, directoryUsers: DirectoryUser[]) {
  return (room.peerUserIds || [])
    .map((peerUserId) => directoryUsers.find((user) => user.id === peerUserId))
    .filter(Boolean) as DirectoryUser[];
}

function roomPeerLabel(room: ChatRoomSummaryResponse, directoryUsers: DirectoryUser[]) {
  const peerLabels = roomPeerUsers(room, directoryUsers)
    .map(directoryUserLabel)
    .filter(Boolean);

  if (peerLabels.length) return peerLabels.join(', ');
  return room.peerUserIds?.length ? room.peerUserIds.join(', ') : room.title || 'Conversation';
}

function roomPreviewText(room: ChatRoomSummaryResponse) {
  if (room.latestMessage?.locked) return 'Unlock required to preview latest message.';
  return room.latestMessage?.body || room.latestMessage?.text || 'No messages yet';
}

function roomLastMessageTimestamp(room: ChatRoomSummaryResponse) {
  const value = room.latestMessageAt || room.latestMessage?.createdAt || room.updatedAt;
  if (!value) return '';

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return '';

  const now = new Date();
  const isToday = timestamp.toDateString() === now.toDateString();

  return isToday
    ? timestamp.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function roomUnreadLabel(room: ChatRoomSummaryResponse) {
  const unreadCount = Number(room.unreadCount ?? 0);
  if (!Number.isFinite(unreadCount) || unreadCount <= 0) return '';
  return unreadCount > 99 ? '99+' : String(Math.floor(unreadCount));
}

function roomPeerHighlights(room: ChatRoomSummaryResponse, directoryUsers: DirectoryUser[]) {
  const peerUsers = roomPeerUsers(room, directoryUsers);
  return peerUsers
    .flatMap((user) => {
      const summary = user.profileTaxonomySummary;
      if (!summary) return [user.role];

      return [
        user.role,
        summary.jobTitle,
        summary.industry,
        ...summary.mistressCategoryIds.map(formatProfileLabel),
        ...summary.subIdentityLabels.map(formatProfileLabel),
        ...summary.professionIds.map(formatProfileLabel),
        ...summary.serviceOfferIds.map(formatProfileLabel),
        ...summary.customLabels,
        ...summary.customServices,
      ];
    })
    .filter(Boolean)
    .slice(0, 3) as string[];
}

function contactLabel(contact: DirectoryUser | null, fallback?: string) {
  return contact?.displayName || contact?.username || fallback || 'recipient';
}

function giftAmount(gift: GiftItem) {
  const price = Number(gift.price);
  return Number.isFinite(price) ? price : undefined;
}

export function ChatScreen({ targetUserId: initialTargetUserId, initialRoomId }: ChatScreenProps) {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;
  const canSetPaidMessageRates = isCreatorRole(currentUser?.role);
  const [targetUserId, setTargetUserId] = useState<string | undefined>(initialTargetUserId);
  const [selectedContact, setSelectedContact] = useState<DirectoryUser | null>(null);
  const [roomId, setRoomId] = useState<string | undefined>(initialRoomId);
  const [text, setText] = useState('');
  const [ownPaidSettings, setOwnPaidSettings] = useState<PaidMessageSettings>(DEFAULT_PAID_MESSAGE_SETTINGS);
  const [targetPaidSettings, setTargetPaidSettings] = useState<PaidMessageSettings>(DEFAULT_PAID_MESSAGE_SETTINGS);
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);
  const [localPaidReceipts, setLocalPaidReceipts] = useState<PaidMessageReceipt[]>([]);
  const [walletPaidReceipts, setWalletPaidReceipts] = useState<PaidMessageReceipt[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [receiptActionStatus, setReceiptActionStatus] = useState<Record<string, string | undefined>>({});
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: 'welcome-message',
      type: 'FREE',
      message: 'Welcome to chat. Select a conversation/contact to send paid messages, gifts, or unlocks.',
    },
  ]);
  const [giftEffect, setGiftEffect] = useState<GiftEffect | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [priorityStatus, setPriorityStatus] = useState<string | null>(null);
  const [conversationRooms, setConversationRooms] = useState<ChatRoomSummaryResponse[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>([]);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const activePaidSettings = canSetPaidMessageRates ? ownPaidSettings : targetPaidSettings;
  const priorityAmount = getActivePaidMessageRate(activePaidSettings);
  const mergedPaidReceipts = useMemo(
    () => walletPaidReceipts.filter((receipt) => !localPaidReceipts.some((local) => local.id === receipt.id)),
    [localPaidReceipts, walletPaidReceipts],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadOwnSettings() {
      if (!currentUserId || !canSetPaidMessageRates) return;

      try {
        const res = await loadPaidMessageSettings();
        if (!cancelled) setOwnPaidSettings({ ...DEFAULT_PAID_MESSAGE_SETTINGS, ...res.settings });
      } catch (err) {
        if (!cancelled) setSettingsStatus(err instanceof Error ? err.message : 'Paid message rates unavailable');
      }
    }

    loadOwnSettings();

    return () => {
      cancelled = true;
    };
  }, [canSetPaidMessageRates, currentUserId]);

  useEffect(() => {
    let cancelled = false;

    async function loadTargetSettings() {
      if (!targetUserId) {
        setTargetPaidSettings(DEFAULT_PAID_MESSAGE_SETTINGS);
        return;
      }

      try {
        const res = await loadPaidMessageSettings(targetUserId);
        if (!cancelled) setTargetPaidSettings({ ...DEFAULT_PAID_MESSAGE_SETTINGS, ...res.settings });
      } catch {
        if (!cancelled) setTargetPaidSettings(DEFAULT_PAID_MESSAGE_SETTINGS);
      }
    }

    loadTargetSettings();

    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  const refreshWalletBalance = useCallback(async () => {
    if (!currentUserId) {
      setWalletBalance(null);
      setWalletError(null);
      return;
    }

    setWalletLoading(true);
    setWalletError(null);

    try {
      const wallet = await getWalletBalance();
      setWalletBalance(parseCredits(wallet.balance));
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Wallet balance unavailable');
    } finally {
      setWalletLoading(false);
    }
  }, [currentUserId]);

  const refreshConversationRooms = useCallback(async () => {
    if (!currentUserId) {
      setConversationRooms([]);
      setRoomsError(null);
      return;
    }

    setRoomsLoading(true);
    setRoomsError(null);

    try {
      setConversationRooms(await loadChatRooms());
    } catch (err) {
      setRoomsError(err instanceof Error ? err.message : 'Conversation list unavailable');
    } finally {
      setRoomsLoading(false);
    }
  }, [currentUserId]);

  const refreshDirectoryUsers = useCallback(async () => {
    if (!currentUserId) {
      setDirectoryUsers([]);
      setDirectoryError(null);
      return;
    }

    try {
      setDirectoryError(null);
      setDirectoryUsers(await listUserDirectory());
    } catch (err) {
      setDirectoryError(err instanceof Error ? err.message : 'Conversation labels unavailable');
    }
  }, [currentUserId]);

  const refreshPaidReceipts = useCallback(async () => {
    if (!currentUserId) {
      setWalletPaidReceipts([]);
      return;
    }

    setReceiptsLoading(true);

    try {
      const history = await loadPaidMessageHistory();
      setWalletPaidReceipts(history.items.map(mapPaidReceipt));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Paid message receipts unavailable');
    } finally {
      setReceiptsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void refreshWalletBalance();
  }, [refreshWalletBalance]);

  useEffect(() => {
    void refreshConversationRooms();
  }, [refreshConversationRooms]);

  useEffect(() => {
    void refreshDirectoryUsers();
  }, [refreshDirectoryUsers]);

  useEffect(() => {
    void refreshPaidReceipts();
  }, [refreshPaidReceipts]);

  const hasEnoughPriorityCredits = useMemo(() => {
    return walletBalance === null || walletBalance >= priorityAmount;
  }, [priorityAmount, walletBalance]);

  const refreshChatHistory = useCallback(async (activeRoomId: string, peerUserId?: string) => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const persistedMessages = await loadChatMessages(activeRoomId, peerUserId);
      const mappedMessages = persistedMessages.map(mapPersistedMessage);
      const latestMessageId = persistedMessages[persistedMessages.length - 1]?.id;

      setMessages(mappedMessages.length > 0
        ? mappedMessages
        : [
            {
              id: `empty-${activeRoomId}`,
              type: 'SYSTEM',
              message: 'Conversation ready. Messages sent here will be saved to this room.',
            },
          ]);

      await markChatRoomRead(activeRoomId, latestMessageId);
      setConversationRooms((rooms) =>
        rooms.map((room) =>
          room.id === activeRoomId
            ? { ...room, unreadCount: 0, hasUnread: false }
            : room,
        ),
      );
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Chat history unavailable');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!giftEffect) return undefined;

    const timeout = setTimeout(() => setGiftEffect(null), 3200);
    return () => clearTimeout(timeout);
  }, [giftEffect]);

  useEffect(() => {
    if (!roomId || !currentUserId) return;
    void refreshChatHistory(roomId, targetUserId);
  }, [currentUserId, refreshChatHistory, roomId, targetUserId]);

  async function getActiveRoomId() {
    const activeRoomId = await ensureChatRoom(roomId);
    if (!roomId) setRoomId(activeRoomId);
    return activeRoomId;
  }

  function handleSelectContact(user: DirectoryUser) {
    setSelectedContact(user);
    setTargetUserId(user.id);
    setRoomId(undefined);
    setLocalPaidReceipts([]);
    setMessages([
      {
        id: `contact-${user.id}`,
        type: 'SYSTEM',
        message: `Conversation selected: ${user.displayName || user.username}`,
      },
    ]);
    setGiftEffect(null);
    setError(null);
    setPriorityStatus(null);
    setHistoryError(null);
  }

  function handleSelectRoom(room: ChatRoomSummaryResponse) {
    const peerUserId = room.peerUserIds?.[0];

    setSelectedContact(null);
    setTargetUserId(peerUserId);
    setRoomId(room.id);
    setMessages([
      {
        id: `room-${room.id}`,
        type: 'SYSTEM',
        message: `Conversation opened: ${roomPeerLabel(room, directoryUsers)}`,
      },
    ]);
    setGiftEffect(null);
    setError(null);
    setPriorityStatus(null);
    setHistoryError(null);
  }

  function requireTarget() {
    if (!targetUserId) {
      setError('Select a Mistress/Sub conversation before using paid chat, gifts, or unlocks.');
      return false;
    }

    return true;
  }

  function handleGiftSent(gift: GiftItem) {
    const recipient = contactLabel(selectedContact, targetUserId);
    const amount = giftAmount(gift);

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-gift`,
        type: 'GIFT',
        message: `${gift.name} sent to ${recipient}.`,
        amount,
      },
    ]);
    setGiftEffect({
      id: Date.now(),
      ...createGiftEffectFromGift(gift, {
        recipientLabel: recipient,
        detail: `${recipient} received a chat gift.`,
      }),
    });
  }

  async function handleSendStandard() {
    if (!text.trim()) return;
    if (!currentUserId) {
      setError('You must be logged in to send messages.');
      return;
    }
    if (!requireTarget()) return;

    setLoading(true);
    setError(null);
    setPriorityStatus(null);

    try {
      const activeRoomId = await getActiveRoomId();
      const sentMessage = await submitStandardMessage(activeRoomId, text.trim(), targetUserId);
      setMessages((current) => [
        ...current,
        {
          id: sentMessage.id || `${Date.now()}-standard`,
          type: 'FREE',
          message: text.trim(),
        },
      ]);
      setText('');
      await refreshChatHistory(activeRoomId, targetUserId);
      await refreshConversationRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPriority() {
    if (!text.trim()) return;
    if (!currentUserId) {
      setError('You must be logged in to send priority messages.');
      return;
    }
    if (!requireTarget()) return;
    if (!hasEnoughPriorityCredits) {
      setError(`Priority messages cost ${priorityAmount} credits. Top up before sending this one.`);
      setPriorityStatus('Priority message not sent.');
      return;
    }

    setLoading(true);
    setError(null);
    setPriorityStatus(`Charging ${priorityAmount} credits for priority delivery...`);

    try {
      const activeRoomId = await getActiveRoomId();
      const sentMessage = await submitPriorityMessage(activeRoomId, targetUserId!, priorityAmount, text.trim());
      setMessages((current) => [
        ...current,
        {
          id: sentMessage.id || `${Date.now()}-priority`,
          type: 'PAID_MESSAGE',
          message: text.trim(),
          amount: priorityAmount,
        },
      ]);
      setText('');
      setPriorityStatus(`Priority sent. ${priorityAmount} credits charged.`);
      await refreshChatHistory(activeRoomId, targetUserId);
      await refreshConversationRooms();
      await refreshWalletBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Priority message failed');
      setPriorityStatus('Priority message was not sent or charged.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestPaidReview(receipt: PaidMessageReceipt, reviewStatus: PaidMessageReviewStatus) {
    if (!receipt.messageId) return;

    setReceiptActionStatus((current) => ({ ...current, [receipt.id]: 'Submitting review...' }));
    setError(null);

    try {
      const review = await requestPaidMessageReceiptReview(
        receipt.messageId,
        reviewStatus,
        'Requested from chat receipt panel',
      );
      const applyReview = (current: PaidMessageReceipt[]) => current.map((item) => (
        item.messageId === receipt.messageId
          ? {
              ...item,
              status: review.reviewStatus === 'DISPUTED' ? 'Dispute review' : 'Refund review',
              reviewStatus: review.reviewStatus,
              reviewReason: review.reviewReason,
              reviewedAt: review.createdAt,
            }
          : item
      ));

      setLocalPaidReceipts(applyReview);
      setWalletPaidReceipts(applyReview);
      setReceiptActionStatus((current) => ({ ...current, [receipt.id]: 'Review queued' }));
      await refreshPaidReceipts();
    } catch (err) {
      setReceiptActionStatus((current) => ({ ...current, [receipt.id]: 'Review failed' }));
      setError(err instanceof Error ? err.message : 'Review request failed');
    }
  }

  async function handleSavePaidSettings() {
    if (!canSetPaidMessageRates) return;

    setLoading(true);
    setSettingsStatus(null);

    try {
      const res = await savePaidMessageSettings(ownPaidSettings);
      setOwnPaidSettings({ ...DEFAULT_PAID_MESSAGE_SETTINGS, ...res.settings });
      setSettingsStatus('Saved');
    } catch (err) {
      setSettingsStatus(err instanceof Error ? err.message : 'Rate save failed');
    } finally {
      setLoading(false);
    }
  }

  function setPaidMode(chargeMode: PaidMessageChargeMode) {
    setOwnPaidSettings((current) => ({ ...current, chargeMode }));
  }

  function setPaidRate(key: 'initiatedMessageRate' | 'responseRate' | 'openMessageRate', value: string) {
    setOwnPaidSettings((current) => ({ ...current, [key]: normalizeRateInput(value) }));
  }

  function updateMessage(messageId: string, update: Partial<LocalMessage>) {
    setMessages((current) => current.map((message) => (
      message.id === messageId ? { ...message, ...update } : message
    )));
  }

  function toggleAiFeedbackTag(message: LocalMessage, tag: string) {
    const currentTags = message.aiFeedbackTags ?? [];
    updateMessage(message.id, {
      aiFeedbackTags: currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    });
  }

  async function submitChatAiFeedback(message: LocalMessage, signal: 'positive' | 'negative') {
    if (!message.aiRequestId) return;

    const reasonTags = message.aiFeedbackTags?.length
      ? [...new Set(message.aiFeedbackTags)].slice(0, 8)
      : [signal === 'positive' ? 'helpful' : 'needs-review'];
    const note = message.aiFeedbackNote?.trim() || `Submitted from live chat message ${message.id}`;

    updateMessage(message.id, { aiFeedbackStatus: 'submitting', aiFeedbackError: undefined });

    try {
      await submitAbacusFeedback(message.aiRequestId, { signal, reasonTags, note });
      updateMessage(message.id, {
        aiFeedbackSignal: signal,
        aiFeedbackStatus: 'submitted',
        aiFeedbackTags: reasonTags,
        aiFeedbackNote: note,
      });
    } catch (err) {
      updateMessage(message.id, {
        aiFeedbackStatus: 'error',
        aiFeedbackError: err instanceof Error ? err.message : 'AI feedback failed',
      });
    }
  }

  function renderAiFeedbackControls(message: LocalMessage) {
    if (!message.aiRequestId) return null;

    return (
      <View style={{ backgroundColor: '#111', borderColor: '#2d2248', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: -8, marginBottom: 10, gap: 8 }}>
        <Text style={{ color: '#c084fc', fontSize: 11, fontWeight: '900' }}>
          AI request feedback / {message.aiFeedbackSignal ? message.aiFeedbackSignal : 'unrated'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {AI_FEEDBACK_REASON_OPTIONS.map((tag) => {
            const selected = message.aiFeedbackTags?.includes(tag);
            return (
              <Pressable
                key={`${message.id}-${tag}`}
                onPress={() => toggleAiFeedbackTag(message, tag)}
                disabled={message.aiFeedbackStatus === 'submitting'}
                style={{
                  borderColor: selected ? '#c084fc' : '#333',
                  backgroundColor: selected ? '#261634' : '#181818',
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  opacity: message.aiFeedbackStatus === 'submitting' ? 0.65 : 1,
                }}
              >
                <Text style={{ color: selected ? '#fff' : '#aaa', fontSize: 10, fontWeight: '800' }}>{tag}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={message.aiFeedbackNote ?? ''}
          onChangeText={(value) => updateMessage(message.id, { aiFeedbackNote: value })}
          placeholder="Optional review note"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#080808', color: '#fff', borderColor: '#333', borderWidth: 1, borderRadius: 8, padding: 8 }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable
            onPress={() => submitChatAiFeedback(message, 'positive')}
            disabled={message.aiFeedbackStatus === 'submitting'}
            style={{ backgroundColor: '#083c2b', borderColor: '#10b981', borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10 }}
          >
            <Text style={{ color: '#b7f7dd', fontSize: 11, fontWeight: '900' }}>
              {message.aiFeedbackStatus === 'submitting' ? 'Sending' : 'Helpful'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => submitChatAiFeedback(message, 'negative')}
            disabled={message.aiFeedbackStatus === 'submitting'}
            style={{ backgroundColor: '#3c1b08', borderColor: '#f97316', borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10 }}
          >
            <Text style={{ color: '#fed7aa', fontSize: 11, fontWeight: '900' }}>
              {message.aiFeedbackStatus === 'submitting' ? 'Sending' : 'Needs review'}
            </Text>
          </Pressable>
        </View>
        {message.aiFeedbackError ? <Text style={{ color: '#ff6b6b', fontSize: 11 }}>{message.aiFeedbackError}</Text> : null}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 16, position: 'relative' }}>
      {giftEffect ? <GiftEffectOverlay key={giftEffect.id} effect={giftEffect} /> : null}

      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 10 }}>
        Chat
      </Text>

      <ContactSelector
        selectedUserId={targetUserId}
        roleFilter={isSubRole(currentUser?.role) ? 'MISTRESS' : undefined}
        onSelect={handleSelectContact}
      />

      <View style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Recent conversations</Text>
          <Text style={{ color: roomsLoading ? '#ff9abf' : '#777', fontSize: 11 }}>
            {roomsLoading ? 'Loading...' : `${conversationRooms.length} rooms`}
          </Text>
        </View>

        {roomsError ? (
          <Text style={{ color: '#ff6b6b', marginBottom: 6 }}>
            {roomsError}
          </Text>
        ) : null}
        {directoryError ? (
          <Text style={{ color: '#ff9abf', marginBottom: 6 }}>
            {directoryError}
          </Text>
        ) : null}

        {conversationRooms.slice(0, 4).map((room) => {
          const isActiveRoom = room.id === roomId;
          const highlights = roomPeerHighlights(room, directoryUsers);
          const latestTimestamp = roomLastMessageTimestamp(room);
          const unreadLabel = isActiveRoom ? '' : roomUnreadLabel(room);
          return (
            <Pressable
              key={room.id}
              onPress={() => handleSelectRoom(room)}
              style={{
                backgroundColor: isActiveRoom ? '#24111a' : '#111',
                borderColor: isActiveRoom ? '#ff0055' : '#333',
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
                marginBottom: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', flex: 1, marginRight: 8 }} numberOfLines={1}>
                  {roomPeerLabel(room, directoryUsers)}
                </Text>
                {latestTimestamp ? (
                  <Text style={{ color: isActiveRoom ? '#ffd1e0' : '#777', fontSize: 11, fontWeight: '700' }}>
                    {latestTimestamp}
                  </Text>
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                <Text
                  style={{
                    color: room.latestMessage?.locked ? '#ff9abf' : '#aaa',
                    flex: 1,
                    marginRight: unreadLabel ? 8 : 0,
                  }}
                  numberOfLines={1}
                >
                  {roomPreviewText(room)}
                </Text>
                {unreadLabel ? (
                  <View
                    style={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: '#ff0055',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>
                      {unreadLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
              {highlights.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 7 }}>
                  {highlights.map((highlight) => (
                    <Text
                      key={`${room.id}-${highlight}`}
                      numberOfLines={1}
                      style={{
                        color: isActiveRoom ? '#fff' : '#ff9abf',
                        borderColor: isActiveRoom ? '#ffd1e0' : '#442233',
                        borderWidth: 1,
                        borderRadius: 999,
                        paddingVertical: 3,
                        paddingHorizontal: 7,
                        fontSize: 10,
                        fontWeight: '800',
                        marginRight: 5,
                        marginTop: 5,
                        maxWidth: 140,
                      }}
                    >
                      {highlight}
                    </Text>
                  ))}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {selectedContact ? (
        <View style={{ backgroundColor: '#111', padding: 10, borderRadius: 10, marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            Chatting with {selectedContact.displayName || selectedContact.username}
          </Text>
          <Text style={{ color: '#aaa', fontSize: 11 }}>{selectedContact.role}</Text>
        </View>
      ) : null}

      {!targetUserId ? (
        <View style={{ backgroundColor: '#1b1b1b', padding: 10, borderRadius: 10, marginBottom: 10 }}>
          <Text style={{ color: '#ff9abf' }}>
            No conversation selected yet. Select a contact before sending chat messages, gifts, or unlocks.
          </Text>
        </View>
      ) : null}

      {roomId ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#777', fontSize: 11 }}>
            Active room
          </Text>
          <Text style={{ color: historyLoading ? '#ff9abf' : '#777', fontSize: 11 }}>
            {historyLoading ? 'Syncing history...' : 'History synced'}
          </Text>
        </View>
      ) : null}

      {historyError ? (
        <Text style={{ color: '#ff6b6b', marginBottom: 8 }}>
          {historyError}
        </Text>
      ) : null}

      <ScrollView style={{ flex: 1, marginBottom: 12 }}>
        {messages.map((item) => (
          <View key={item.id}>
            <MessageTypeCard
              type={item.type}
              message={item.message}
              amount={item.amount}
              cost={item.cost}
            />
            {renderAiFeedbackControls(item)}
          </View>
        ))}

        {currentUserId && targetUserId ? (
          <LockedMessageCard
            targetUserId={targetUserId}
            roomId={roomId}
            onRoomReady={setRoomId}
            cost={25}
            previewText="Locked preview"
            unlockedMessage="Unlocked message content"
          />
        ) : null}
      </ScrollView>

      {targetUserId ? <GiftPicker targetUserId={targetUserId} onGiftSent={handleGiftSent} /> : null}

      {error ? <Text style={{ color: '#ff6b6b', marginTop: 8 }}>{error}</Text> : null}

      <View
        style={{
          backgroundColor: '#111',
          borderColor: hasEnoughPriorityCredits ? '#333' : '#ff6b6b',
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          Priority message cost: {priorityAmount} credits
        </Text>
        <Text style={{ color: hasEnoughPriorityCredits ? '#aaa' : '#ff9abf', marginTop: 4 }}>
          Wallet balance: {walletLoading ? 'Checking...' : formatCredits(walletBalance)}
        </Text>
        {priorityStatus ? (
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>
            {priorityStatus}
          </Text>
        ) : null}
        {walletError ? (
          <Text style={{ color: '#ff6b6b', marginTop: 4 }}>
            {walletError}
          </Text>
        ) : null}
      </View>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#777"
        style={{ backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 10, marginTop: 12 }}
      />

      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <Pressable
          onPress={handleSendStandard}
          disabled={loading || !targetUserId}
          style={{ backgroundColor: targetUserId ? '#333' : '#1f1f1f', padding: 12, borderRadius: 8, marginRight: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Send Standard</Text>
        </Pressable>

        <Pressable
          onPress={handleSendPriority}
          disabled={loading || !targetUserId || !hasEnoughPriorityCredits}
          style={{
            backgroundColor: targetUserId && hasEnoughPriorityCredits ? '#ff0055' : '#333',
            padding: 12,
            borderRadius: 8,
            opacity: loading || !targetUserId || !hasEnoughPriorityCredits ? 0.7 : 1,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {loading ? 'Sending...' : `Send Priority (${priorityAmount})`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
