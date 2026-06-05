import { apiRequest } from './apiClient';
import type {
  AdminMemberAssignment,
  AdminMemberPermissionKey,
  AdminMemberRoleKey,
  AdminMemberScope,
  AdminMemberStatus,
  AdminMessage,
  AdminMessageThread,
  AdminMessageUrgency,
} from '../features/admin/adminMemberDelegationModels';

export type AdminMemberAssignmentPayload = {
  accountId: string;
  displayName: string;
  roleKey: AdminMemberRoleKey;
  assignedJob?: string;
  assignedZone?: string;
  permissions?: AdminMemberPermissionKey[];
  notes?: string;
  ownerProfileId?: string;
};

export type AdminMemberAssignmentPatch = {
  roleKey?: AdminMemberRoleKey;
  assignedJob?: string;
  assignedZone?: string;
  permissions?: AdminMemberPermissionKey[];
  notes?: string;
};

export type AdminMessageThreadPayload = {
  scope: AdminMemberScope;
  title: string;
  participantIds: string[];
  linkedZone?: string;
  ownerProfileId?: string;
  urgency?: AdminMessageUrgency;
};

export type AdminMessagePayload = {
  body: string;
  urgency?: AdminMessageUrgency;
  linkedItemLabel?: string;
};

function query(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

export function listPlatformAdminMembers(assignedZone?: string) {
  return apiRequest<AdminMemberAssignment[]>(`/admin-members${query({ assignedZone })}`);
}

export function createPlatformAdminMember(payload: AdminMemberAssignmentPayload) {
  return apiRequest<AdminMemberAssignment>('/admin-members', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePlatformAdminMemberStatus(id: string, status: AdminMemberStatus) {
  return apiRequest<AdminMemberAssignment>(`/admin-members/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updatePlatformAdminMemberAssignment(id: string, payload: AdminMemberAssignmentPatch) {
  return apiRequest<AdminMemberAssignment>(`/admin-members/${encodeURIComponent(id)}/assignment`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function removePlatformAdminMember(id: string) {
  return apiRequest<AdminMemberAssignment>(`/admin-members/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function listMistressTrustedMembers(ownerProfileId?: string) {
  return apiRequest<AdminMemberAssignment[]>(`/mistress/trusted-members${query({ ownerProfileId })}`);
}

export function createMistressTrustedMember(payload: AdminMemberAssignmentPayload) {
  return apiRequest<AdminMemberAssignment>('/mistress/trusted-members', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateMistressTrustedMemberStatus(id: string, status: AdminMemberStatus) {
  return apiRequest<AdminMemberAssignment>(`/mistress/trusted-members/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updateMistressTrustedMemberAssignment(id: string, payload: AdminMemberAssignmentPatch) {
  return apiRequest<AdminMemberAssignment>(`/mistress/trusted-members/${encodeURIComponent(id)}/assignment`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function removeMistressTrustedMember(id: string) {
  return apiRequest<AdminMemberAssignment>(`/mistress/trusted-members/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function listAdminMessageThreads(scope: AdminMemberScope, ownerProfileId?: string) {
  return apiRequest<AdminMessageThread[]>(`/admin-messages/threads${query({ scope, ownerProfileId })}`);
}

export function createAdminMessageThreadApi(payload: AdminMessageThreadPayload) {
  return apiRequest<AdminMessageThread>('/admin-messages/threads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listAdminMessages(threadId: string) {
  return apiRequest<AdminMessage[]>(`/admin-messages/threads/${encodeURIComponent(threadId)}/messages`);
}

export function createAdminMessageApi(threadId: string, payload: AdminMessagePayload) {
  return apiRequest<AdminMessage>(`/admin-messages/threads/${encodeURIComponent(threadId)}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function markAdminMessageThreadReadApi(threadId: string) {
  return apiRequest<AdminMessageThread>(`/admin-messages/threads/${encodeURIComponent(threadId)}/read`, {
    method: 'PATCH',
  });
}
