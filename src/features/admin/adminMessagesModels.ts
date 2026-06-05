import type { AdminMemberScope, AdminMessage, AdminMessageThread, AdminMessageUrgency } from './adminMemberDelegationModels';

export type AdminMessageThreadFilter = 'ALL' | AdminMessageUrgency | 'UNREAD';

export type AdminMessageDraft = {
  threadId: string;
  senderId: string;
  body: string;
  urgency: AdminMessageUrgency;
  linkedItemLabel?: string;
};

export const ADMIN_MESSAGE_URGENCY_LABELS: Record<AdminMessageUrgency, string> = {
  NORMAL: 'Normal',
  WATCH: 'Watch',
  URGENT: 'Urgent',
};

export const ADMIN_MESSAGE_URGENCY_TONES: Record<AdminMessageUrgency, string> = {
  NORMAL: '#d4af37',
  WATCH: '#ff9abf',
  URGENT: '#ff4d6d',
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createAdminMessageThread(input: {
  scope: AdminMemberScope;
  title: string;
  participantIds: string[];
  linkedZone?: string;
  urgency?: AdminMessageUrgency;
}): AdminMessageThread {
  const now = new Date().toISOString();

  return {
    id: createId('admin-thread'),
    scope: input.scope,
    title: input.title,
    participantIds: input.participantIds,
    linkedZone: input.linkedZone,
    urgency: input.urgency || 'NORMAL',
    unreadCount: 0,
    lastMessageAt: now,
  };
}

export function createAdminMessage(input: AdminMessageDraft): AdminMessage {
  return {
    id: createId('admin-message'),
    threadId: input.threadId,
    senderId: input.senderId,
    body: input.body,
    urgency: input.urgency,
    linkedItemLabel: input.linkedItemLabel,
    createdAt: new Date().toISOString(),
  };
}

export function filterAdminMessageThreads(
  threads: AdminMessageThread[],
  filter: AdminMessageThreadFilter,
) {
  if (filter === 'ALL') return threads;
  if (filter === 'UNREAD') return threads.filter((thread) => thread.unreadCount > 0);
  return threads.filter((thread) => thread.urgency === filter);
}

export function bumpThreadAfterMessage(thread: AdminMessageThread, message: AdminMessage): AdminMessageThread {
  return {
    ...thread,
    urgency: message.urgency === 'URGENT' ? 'URGENT' : thread.urgency === 'URGENT' ? 'URGENT' : message.urgency,
    unreadCount: thread.unreadCount + 1,
    lastMessageAt: message.createdAt,
  };
}

export function markAdminMessageThreadRead(thread: AdminMessageThread): AdminMessageThread {
  return {
    ...thread,
    unreadCount: 0,
  };
}

export function adminMessageThreadSubtitle(thread: AdminMessageThread) {
  const scopeLabel = thread.scope === 'PLATFORM' ? 'Administration Zone' : 'Mistress Admin Panel';
  const zone = thread.linkedZone ? ` · ${thread.linkedZone}` : '';
  return `${scopeLabel}${zone} · ${thread.participantIds.length} participant(s)`;
}

export function buildAdminMessageSeed(scope: AdminMemberScope) {
  const thread = createAdminMessageThread({
    scope,
    title: scope === 'PLATFORM' ? 'Admin shift check-in' : 'Profile helper notes',
    participantIds: scope === 'PLATFORM' ? ['headmistress', 'admin_member_pending'] : ['mistress', 'trusted_member_pending'],
    linkedZone: scope === 'PLATFORM' ? 'Administration Zone' : 'Mistress Admin Panel',
    urgency: 'WATCH',
  });

  const message = createAdminMessage({
    threadId: thread.id,
    senderId: scope === 'PLATFORM' ? 'headmistress' : 'mistress',
    body:
      scope === 'PLATFORM'
        ? 'Use this thread for Admin Member instructions, handoffs and queue updates.'
        : 'Use this thread for trusted helper profile tasks, draft notes and reminders.',
    urgency: 'WATCH',
    linkedItemLabel: thread.linkedZone,
  });

  return {
    threads: [bumpThreadAfterMessage(thread, message)],
    messages: [message],
  };
}
