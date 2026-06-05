import type {
  AdminMemberAssignment,
  AdminMemberScope,
  AdminMemberStatus,
} from './adminMemberDelegationModels';
import type { AdminMessage, AdminMessageThread } from './adminMemberDelegationModels';
import {
  bumpThreadAfterMessage,
  markAdminMessageThreadRead,
} from './adminMessagesModels';

type DelegationStoreBucket = {
  assignments: AdminMemberAssignment[];
  threads: AdminMessageThread[];
  messages: AdminMessage[];
};

const memoryStore: Record<string, DelegationStoreBucket> = {};

function storeKey(scope: AdminMemberScope, ownerProfileId = 'platform') {
  return `admin-member-delegation.${scope}.${ownerProfileId}`;
}

function ensureBucket(scope: AdminMemberScope, ownerProfileId?: string): DelegationStoreBucket {
  const key = storeKey(scope, ownerProfileId);
  if (!memoryStore[key]) {
    memoryStore[key] = {
      assignments: [],
      threads: [],
      messages: [],
    };
  }
  return memoryStore[key];
}

export function listAdminMemberAssignments(scope: AdminMemberScope, ownerProfileId?: string) {
  return [...ensureBucket(scope, ownerProfileId).assignments];
}

export function saveAdminMemberAssignment(assignment: AdminMemberAssignment) {
  const bucket = ensureBucket(assignment.scope, assignment.ownerProfileId);
  const existingIndex = bucket.assignments.findIndex((item) => item.id === assignment.id);
  if (existingIndex >= 0) {
    bucket.assignments[existingIndex] = assignment;
  } else {
    bucket.assignments.unshift(assignment);
  }
  return assignment;
}

export function updateAdminMemberAssignmentStatus(
  scope: AdminMemberScope,
  assignmentId: string,
  status: AdminMemberStatus,
  ownerProfileId?: string,
) {
  const bucket = ensureBucket(scope, ownerProfileId);
  bucket.assignments = bucket.assignments.map((assignment) =>
    assignment.id === assignmentId
      ? {
          ...assignment,
          status,
          lastReviewedAt: new Date().toISOString(),
        }
      : assignment,
  );
  return bucket.assignments.find((assignment) => assignment.id === assignmentId) || null;
}

export function listAdminMessageThreads(scope: AdminMemberScope, ownerProfileId?: string) {
  return [...ensureBucket(scope, ownerProfileId).threads];
}

export function listAdminMessages(scope: AdminMemberScope, ownerProfileId?: string) {
  return [...ensureBucket(scope, ownerProfileId).messages];
}

export function saveAdminMessageThread(thread: AdminMessageThread, ownerProfileId?: string) {
  const bucket = ensureBucket(thread.scope, ownerProfileId);
  const existingIndex = bucket.threads.findIndex((item) => item.id === thread.id);
  if (existingIndex >= 0) {
    bucket.threads[existingIndex] = thread;
  } else {
    bucket.threads.unshift(thread);
  }
  return thread;
}

export function saveAdminMessage(scope: AdminMemberScope, message: AdminMessage, ownerProfileId?: string) {
  const bucket = ensureBucket(scope, ownerProfileId);
  bucket.messages.unshift(message);
  bucket.threads = bucket.threads.map((thread) =>
    thread.id === message.threadId ? bumpThreadAfterMessage(thread, message) : thread,
  );
  return message;
}

export function markAdminThreadRead(scope: AdminMemberScope, threadId: string, ownerProfileId?: string) {
  const bucket = ensureBucket(scope, ownerProfileId);
  bucket.threads = bucket.threads.map((thread) =>
    thread.id === threadId ? markAdminMessageThreadRead(thread) : thread,
  );
  return bucket.threads.find((thread) => thread.id === threadId) || null;
}

export function seedAdminMemberDelegationStore(input: {
  scope: AdminMemberScope;
  assignments?: AdminMemberAssignment[];
  threads?: AdminMessageThread[];
  messages?: AdminMessage[];
  ownerProfileId?: string;
}) {
  const bucket = ensureBucket(input.scope, input.ownerProfileId);
  bucket.assignments = [...(input.assignments || []), ...bucket.assignments];
  bucket.threads = [...(input.threads || []), ...bucket.threads];
  bucket.messages = [...(input.messages || []), ...bucket.messages];
  return bucket;
}

export function clearAdminMemberDelegationStore(scope: AdminMemberScope, ownerProfileId?: string) {
  const key = storeKey(scope, ownerProfileId);
  delete memoryStore[key];
}
