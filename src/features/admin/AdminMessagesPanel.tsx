import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  createAdminMessageApi,
  createAdminMessageThreadApi,
  listAdminMessages as listAdminMessagesApi,
  listAdminMessageThreads as listAdminMessageThreadsApi,
  markAdminMessageThreadReadApi,
} from '../../api/adminMemberDelegationApi';
import type { AdminMemberScope, AdminMessage, AdminMessageThread, AdminMessageUrgency } from './adminMemberDelegationModels';
import {
  ADMIN_MESSAGE_URGENCY_LABELS,
  ADMIN_MESSAGE_URGENCY_TONES,
  adminMessageThreadSubtitle,
  buildAdminMessageSeed,
  bumpThreadAfterMessage,
  createAdminMessage,
  createAdminMessageThread,
  filterAdminMessageThreads,
  type AdminMessageThreadFilter,
} from './adminMessagesModels';
import {
  listAdminMessages,
  listAdminMessageThreads,
  markAdminThreadRead,
  saveAdminMessage,
  saveAdminMessageThread,
  seedAdminMemberDelegationStore,
} from './adminMemberDelegationStore';

type AdminMessagesPanelProps = {
  scope?: AdminMemberScope;
  ownerProfileId?: string;
};

function panelStyle() {
  return { backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 10 } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function pillStyle(color: string, active = false) {
  return {
    borderWidth: 1,
    borderColor: color,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: active ? '#1a1408' : '#080808',
  } as const;
}

function ThreadCard({
  thread,
  active,
  onPress,
  onMarkRead,
}: {
  thread: AdminMessageThread;
  active: boolean;
  onPress: (thread: AdminMessageThread) => void;
  onMarkRead: (threadId: string) => void;
}) {
  const tone = ADMIN_MESSAGE_URGENCY_TONES[thread.urgency];

  return (
    <Pressable
      onPress={() => onPress(thread)}
      style={{ ...panelStyle(), borderWidth: 1, borderColor: active ? tone : '#333', backgroundColor: active ? '#17120a' : '#0c0c0c' }}
    >
      <Text style={{ color: tone, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        {ADMIN_MESSAGE_URGENCY_LABELS[thread.urgency]} · {thread.unreadCount} unread
      </Text>
      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900', marginTop: 5 }}>{thread.title}</Text>
      <Text style={smallText()}>{adminMessageThreadSubtitle(thread)}</Text>
      <Text style={smallText('#d4af37')}>Last message: {thread.lastMessageAt}</Text>
      {thread.unreadCount > 0 ? (
        <Pressable onPress={() => onMarkRead(thread.id)} style={{ ...pillStyle('#1D9E75'), alignSelf: 'flex-start', marginTop: 8 }}>
          <Text style={{ color: '#1D9E75', fontSize: 11, fontWeight: '900' }}>Mark read</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

function MessageBubble({ message }: { message: AdminMessage }) {
  const tone = ADMIN_MESSAGE_URGENCY_TONES[message.urgency];

  return (
    <View style={{ ...panelStyle(), borderWidth: 1, borderColor: `${tone}66`, backgroundColor: '#0b0b0b' }}>
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
        {message.senderId} · {ADMIN_MESSAGE_URGENCY_LABELS[message.urgency]}
      </Text>
      <Text style={{ color: '#fff', marginTop: 6, lineHeight: 18 }}>{message.body}</Text>
      {message.linkedItemLabel ? <Text style={smallText('#d4af37')}>Linked: {message.linkedItemLabel}</Text> : null}
      <Text style={smallText()}>{message.createdAt}</Text>
    </View>
  );
}

export function AdminMessagesPanel({ scope = 'PLATFORM', ownerProfileId }: AdminMessagesPanelProps) {
  const seeded = useMemo(() => buildAdminMessageSeed(scope), [scope]);
  const [threads, setThreads] = useState<AdminMessageThread[]>(seeded.threads);
  const [messages, setMessages] = useState<AdminMessage[]>(seeded.messages);
  const [activeThreadId, setActiveThreadId] = useState(seeded.threads[0]?.id || '');
  const [filter, setFilter] = useState<AdminMessageThreadFilter>('ALL');
  const [draftUrgency, setDraftUrgency] = useState<AdminMessageUrgency>('NORMAL');
  const [apiMode, setApiMode] = useState<'backend' | 'local'>('local');

  const filteredThreads = filterAdminMessageThreads(threads, filter);
  const activeThread = threads.find((thread) => thread.id === activeThreadId) || filteredThreads[0];
  const activeMessages = activeThread ? messages.filter((message) => message.threadId === activeThread.id) : [];
  const isPlatform = scope === 'PLATFORM';

  function hydrateLocalStore() {
    let localThreads = listAdminMessageThreads(scope, ownerProfileId);
    let localMessages = listAdminMessages(scope, ownerProfileId);

    if (localThreads.length === 0) {
      const fallback = buildAdminMessageSeed(scope);
      seedAdminMemberDelegationStore({
        scope,
        threads: fallback.threads,
        messages: fallback.messages,
        ownerProfileId,
      });
      localThreads = fallback.threads;
      localMessages = fallback.messages;
    }

    setThreads(localThreads);
    setMessages(localMessages);
    setActiveThreadId(localThreads[0]?.id || '');
    setApiMode('local');
  }

  useEffect(() => {
    hydrateLocalStore();

    let cancelled = false;
    listAdminMessageThreadsApi(scope, ownerProfileId)
      .then(async (remoteThreads) => {
        if (cancelled || remoteThreads.length === 0) return;
        const firstThread = remoteThreads[0];
        const remoteMessages = await listAdminMessagesApi(firstThread.id);
        if (!cancelled) {
          setThreads(remoteThreads);
          setMessages(remoteMessages);
          setActiveThreadId(firstThread.id);
          setApiMode('backend');
        }
      })
      .catch(() => {
        if (!cancelled) hydrateLocalStore();
      });

    return () => {
      cancelled = true;
    };
  }, [ownerProfileId, scope]);

  useEffect(() => {
    if (!activeThread || apiMode !== 'backend') return;
    let cancelled = false;
    listAdminMessagesApi(activeThread.id)
      .then((remoteMessages) => {
        if (!cancelled) setMessages((current) => [...remoteMessages, ...current.filter((message) => message.threadId !== activeThread.id)]);
      })
      .catch(() => {
        if (!cancelled) hydrateLocalStore();
      });

    return () => {
      cancelled = true;
    };
  }, [activeThread?.id, apiMode]);

  function createThread() {
    const threadPayload = {
      scope,
      title: isPlatform ? 'New admin handoff thread' : 'New trusted helper thread',
      participantIds: isPlatform ? ['headmistress', 'admin_member_pending'] : ['mistress', 'trusted_member_pending'],
      linkedZone: isPlatform ? 'Administration Zone' : 'Mistress Admin Panel',
      urgency: draftUrgency,
      ownerProfileId,
    };

    createAdminMessageThreadApi(threadPayload)
      .then((nextThread) => {
        setThreads((current) => [nextThread, ...current.filter((thread) => thread.id !== nextThread.id)]);
        setActiveThreadId(nextThread.id);
        setApiMode('backend');
      })
      .catch(() => {
        const nextThread = createAdminMessageThread(threadPayload);
        saveAdminMessageThread(nextThread, ownerProfileId);
        hydrateLocalStore();
        setActiveThreadId(nextThread.id);
      });
  }

  function sendSeedMessage() {
    if (!activeThread) return;
    const payload = {
      body: isPlatform
        ? 'Please check this admin queue and report back inside this thread.'
        : 'Please check this profile task and leave your update inside this thread.',
      urgency: draftUrgency,
      linkedItemLabel: activeThread.linkedZone,
    };

    createAdminMessageApi(activeThread.id, payload)
      .then((nextMessage) => {
        setMessages((current) => [nextMessage, ...current]);
        setThreads((current) => current.map((thread) => (thread.id === activeThread.id ? bumpThreadAfterMessage(thread, nextMessage) : thread)));
        setApiMode('backend');
      })
      .catch(() => {
        const nextMessage = createAdminMessage({
          threadId: activeThread.id,
          senderId: isPlatform ? 'headmistress' : 'mistress',
          ...payload,
        });
        saveAdminMessage(scope, nextMessage, ownerProfileId);
        hydrateLocalStore();
      });
  }

  function markThreadRead(threadId: string) {
    markAdminMessageThreadReadApi(threadId)
      .then((updatedThread) => {
        setThreads((current) => current.map((thread) => (thread.id === threadId ? updatedThread : thread)));
        setApiMode('backend');
      })
      .catch(() => {
        markAdminThreadRead(scope, threadId, ownerProfileId);
        hydrateLocalStore();
      });
  }

  return (
    <View style={{ ...panelStyle(), borderWidth: 1, borderColor: '#d4af37' }}>
      <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        {isPlatform ? 'Administration Zone' : 'Mistress Admin Panel'} · {apiMode === 'backend' ? 'Backend' : 'Local demo'}
      </Text>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 6 }}>Admin Messages</Text>
      <Text style={{ color: '#aaa', lineHeight: 18, marginTop: 6 }}>
        {isPlatform
          ? 'Mini message system for Headmistress and Admin Members to coordinate jobs, queues and handoffs.'
          : 'Mini message system for a Mistress and her trusted profile helpers.'}
      </Text>

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Filters</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {(['ALL', 'UNREAD', 'NORMAL', 'WATCH', 'URGENT'] as AdminMessageThreadFilter[]).map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={pillStyle(item === 'URGENT' ? '#ff4d6d' : '#d4af37', filter === item)}>
              <Text style={{ color: filter === item ? '#d4af37' : '#ccc', fontSize: 11, fontWeight: '900' }}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Message urgency</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {(['NORMAL', 'WATCH', 'URGENT'] as AdminMessageUrgency[]).map((urgency) => (
            <Pressable key={urgency} onPress={() => setDraftUrgency(urgency)} style={pillStyle(ADMIN_MESSAGE_URGENCY_TONES[urgency], draftUrgency === urgency)}>
              <Text style={{ color: ADMIN_MESSAGE_URGENCY_TONES[urgency], fontSize: 11, fontWeight: '900' }}>{ADMIN_MESSAGE_URGENCY_LABELS[urgency]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        <Pressable onPress={createThread} style={pillStyle('#d4af37')}>
          <Text style={{ color: '#d4af37', fontWeight: '900' }}>New thread</Text>
        </Pressable>
        <Pressable onPress={sendSeedMessage} style={pillStyle('#1D9E75')}>
          <Text style={{ color: '#1D9E75', fontWeight: '900' }}>Send update</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Threads</Text>
        {filteredThreads.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            active={activeThread?.id === thread.id}
            onPress={(selected) => setActiveThreadId(selected.id)}
            onMarkRead={markThreadRead}
          />
        ))}
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Current thread</Text>
        {activeMessages.length === 0 ? (
          <View style={{ ...panelStyle(), backgroundColor: '#0b0b0b' }}>
            <Text style={{ color: '#aaa' }}>No messages in this thread yet.</Text>
          </View>
        ) : null}
        {activeMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </View>
    </View>
  );
}
