export type AdminMemberScope = 'PLATFORM' | 'MISTRESS_PROFILE';
export type AdminMemberStatus = 'INVITED' | 'ACTIVE' | 'PAUSED' | 'REMOVED';
export type AdminMessageUrgency = 'NORMAL' | 'WATCH' | 'URGENT';

export type AdminMemberRoleKey =
  | 'MODERATION_ADMIN'
  | 'FINANCE_ADMIN'
  | 'LIVE_ROOM_ADMIN'
  | 'CONTENT_REVIEW_ADMIN'
  | 'SUPPORT_ADMIN'
  | 'MARKETPLACE_ADMIN'
  | 'GROWTH_ADMIN'
  | 'PROFILE_MANAGER'
  | 'MESSAGE_ASSISTANT'
  | 'STORE_ASSISTANT'
  | 'CONTENT_ASSISTANT'
  | 'LIVE_ASSISTANT'
  | 'GROWTH_ASSISTANT';

export type AdminMemberPermissionKey =
  | 'VIEW_QUEUE'
  | 'ASSIGN_QUEUE'
  | 'UPDATE_STATUS'
  | 'SEND_ADMIN_MESSAGE'
  | 'MANAGE_PROFILE_DRAFTS'
  | 'MANAGE_STORE_DRAFTS'
  | 'MANAGE_CONTENT_DRAFTS'
  | 'VIEW_ANALYTICS'
  | 'ESCALATE_TO_HEADMISTRESS';

export type AdminMemberRoleTemplate = {
  key: AdminMemberRoleKey;
  scope: AdminMemberScope;
  title: string;
  description: string;
  defaultJob: string;
  defaultZone: string;
  permissions: AdminMemberPermissionKey[];
};

export type AdminMemberAssignment = {
  id: string;
  scope: AdminMemberScope;
  displayName: string;
  accountId: string;
  assignedBy: 'HEADMISTRESS' | 'MISTRESS';
  ownerProfileId?: string;
  roleKey: AdminMemberRoleKey;
  roleTitle: string;
  assignedJob: string;
  assignedZone: string;
  permissions: AdminMemberPermissionKey[];
  status: AdminMemberStatus;
  notes: string;
  createdAt: string;
  lastReviewedAt?: string;
};

export type AdminMessageThread = {
  id: string;
  scope: AdminMemberScope;
  title: string;
  participantIds: string[];
  linkedZone?: string;
  urgency: AdminMessageUrgency;
  unreadCount: number;
  lastMessageAt: string;
};

export type AdminMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  urgency: AdminMessageUrgency;
  linkedItemLabel?: string;
  createdAt: string;
};

export const PLATFORM_ADMIN_ROLE_TEMPLATES: AdminMemberRoleTemplate[] = [
  {
    key: 'MODERATION_ADMIN',
    scope: 'PLATFORM',
    title: 'Moderation Admin',
    description: 'Reviews reports, escalations and safety queues for the Headmistress.',
    defaultJob: 'Review reports and escalations',
    defaultZone: 'Administration Zone / Moderation',
    permissions: ['VIEW_QUEUE', 'ASSIGN_QUEUE', 'UPDATE_STATUS', 'SEND_ADMIN_MESSAGE', 'ESCALATE_TO_HEADMISTRESS'],
  },
  {
    key: 'FINANCE_ADMIN',
    scope: 'PLATFORM',
    title: 'Finance Admin',
    description: 'Monitors top-ups, payouts, disputes and money movement queues.',
    defaultJob: 'Monitor top-ups, payouts and disputes',
    defaultZone: 'Administration Zone / Economy',
    permissions: ['VIEW_QUEUE', 'UPDATE_STATUS', 'SEND_ADMIN_MESSAGE', 'VIEW_ANALYTICS', 'ESCALATE_TO_HEADMISTRESS'],
  },
  {
    key: 'LIVE_ROOM_ADMIN',
    scope: 'PLATFORM',
    title: 'Live Room Admin',
    description: 'Monitors live rooms, access issues and room safety events.',
    defaultJob: 'Monitor live sessions and room access',
    defaultZone: 'Administration Zone / Live Rooms',
    permissions: ['VIEW_QUEUE', 'UPDATE_STATUS', 'SEND_ADMIN_MESSAGE', 'ESCALATE_TO_HEADMISTRESS'],
  },
  {
    key: 'CONTENT_REVIEW_ADMIN',
    scope: 'PLATFORM',
    title: 'Content Review Admin',
    description: 'Reviews uploaded, flagged or reported content queues.',
    defaultJob: 'Review uploaded and flagged content',
    defaultZone: 'Administration Zone / Content Review',
    permissions: ['VIEW_QUEUE', 'ASSIGN_QUEUE', 'UPDATE_STATUS', 'SEND_ADMIN_MESSAGE', 'ESCALATE_TO_HEADMISTRESS'],
  },
  {
    key: 'SUPPORT_ADMIN',
    scope: 'PLATFORM',
    title: 'Support Admin',
    description: 'Handles user questions, ticket queues and help requests.',
    defaultJob: 'Handle tickets and support questions',
    defaultZone: 'Administration Zone / Support',
    permissions: ['VIEW_QUEUE', 'UPDATE_STATUS', 'SEND_ADMIN_MESSAGE', 'ESCALATE_TO_HEADMISTRESS'],
  },
  {
    key: 'MARKETPLACE_ADMIN',
    scope: 'PLATFORM',
    title: 'Marketplace Admin',
    description: 'Monitors orders, seller issues, inventory and marketplace disputes.',
    defaultJob: 'Monitor orders, inventory and seller issues',
    defaultZone: 'Administration Zone / Marketplace',
    permissions: ['VIEW_QUEUE', 'ASSIGN_QUEUE', 'UPDATE_STATUS', 'SEND_ADMIN_MESSAGE', 'VIEW_ANALYTICS'],
  },
  {
    key: 'GROWTH_ADMIN',
    scope: 'PLATFORM',
    title: 'Growth Admin',
    description: 'Monitors creator growth analytics, campaigns and conversion funnels.',
    defaultJob: 'Monitor creator growth analytics and campaigns',
    defaultZone: 'Administration Zone / Growth',
    permissions: ['VIEW_QUEUE', 'VIEW_ANALYTICS', 'SEND_ADMIN_MESSAGE'],
  },
];

export const MISTRESS_TRUSTED_ROLE_TEMPLATES: AdminMemberRoleTemplate[] = [
  {
    key: 'PROFILE_MANAGER',
    scope: 'MISTRESS_PROFILE',
    title: 'Profile Manager',
    description: 'Helps a Mistress update profile copy, links, categories and schedule drafts.',
    defaultJob: 'Update profile drafts, categories and schedule notes',
    defaultZone: 'Mistress Admin Panel / Profile',
    permissions: ['MANAGE_PROFILE_DRAFTS', 'SEND_ADMIN_MESSAGE'],
  },
  {
    key: 'MESSAGE_ASSISTANT',
    scope: 'MISTRESS_PROFILE',
    title: 'Message Assistant',
    description: 'Helps organise allowed message queues and response notes for one Mistress profile.',
    defaultJob: 'Organise allowed message queues and notes',
    defaultZone: 'Mistress Admin Panel / Messages',
    permissions: ['VIEW_QUEUE', 'SEND_ADMIN_MESSAGE'],
  },
  {
    key: 'STORE_ASSISTANT',
    scope: 'MISTRESS_PROFILE',
    title: 'Store Assistant',
    description: 'Helps manage inventory drafts, order notes and store setup for one Mistress profile.',
    defaultJob: 'Manage inventory drafts and order notes',
    defaultZone: 'Mistress Admin Panel / Store',
    permissions: ['MANAGE_STORE_DRAFTS', 'VIEW_QUEUE', 'SEND_ADMIN_MESSAGE'],
  },
  {
    key: 'CONTENT_ASSISTANT',
    scope: 'MISTRESS_PROFILE',
    title: 'Content Assistant',
    description: 'Helps organise uploads, captions, content schedules and PPV draft notes.',
    defaultJob: 'Organise uploads, captions and PPV drafts',
    defaultZone: 'Mistress Admin Panel / Content',
    permissions: ['MANAGE_CONTENT_DRAFTS', 'SEND_ADMIN_MESSAGE'],
  },
  {
    key: 'LIVE_ASSISTANT',
    scope: 'MISTRESS_PROFILE',
    title: 'Live Assistant',
    description: 'Helps prepare live show setup, room notes and session reminders.',
    defaultJob: 'Prepare live show setup and room notes',
    defaultZone: 'Mistress Admin Panel / Live',
    permissions: ['VIEW_QUEUE', 'SEND_ADMIN_MESSAGE'],
  },
  {
    key: 'GROWTH_ASSISTANT',
    scope: 'MISTRESS_PROFILE',
    title: 'Growth Assistant',
    description: 'Helps organise profile campaigns, links, QR promotions and growth notes.',
    defaultJob: 'Support campaigns, links and QR promotions',
    defaultZone: 'Mistress Admin Panel / Growth',
    permissions: ['VIEW_ANALYTICS', 'SEND_ADMIN_MESSAGE'],
  },
];

export function getAdminRoleTemplates(scope: AdminMemberScope) {
  return scope === 'PLATFORM' ? PLATFORM_ADMIN_ROLE_TEMPLATES : MISTRESS_TRUSTED_ROLE_TEMPLATES;
}

export function getAdminRoleTemplate(roleKey: AdminMemberRoleKey) {
  return [...PLATFORM_ADMIN_ROLE_TEMPLATES, ...MISTRESS_TRUSTED_ROLE_TEMPLATES].find((role) => role.key === roleKey);
}

export function createAdminMemberAssignmentDraft(input: {
  id: string;
  scope: AdminMemberScope;
  displayName: string;
  accountId: string;
  roleKey: AdminMemberRoleKey;
  assignedBy: 'HEADMISTRESS' | 'MISTRESS';
  ownerProfileId?: string;
}): AdminMemberAssignment {
  const role = getAdminRoleTemplate(input.roleKey);
  const now = new Date().toISOString();

  return {
    id: input.id,
    scope: input.scope,
    displayName: input.displayName,
    accountId: input.accountId,
    assignedBy: input.assignedBy,
    ownerProfileId: input.ownerProfileId,
    roleKey: input.roleKey,
    roleTitle: role?.title || input.roleKey.replace(/_/g, ' '),
    assignedJob: role?.defaultJob || 'Assigned support job',
    assignedZone: role?.defaultZone || 'Assigned zone',
    permissions: role?.permissions || ['SEND_ADMIN_MESSAGE'],
    status: 'INVITED',
    notes: role?.description || 'Delegated admin/support assignment.',
    createdAt: now,
    lastReviewedAt: now,
  };
}

export function isPlatformAdminAssignment(assignment: AdminMemberAssignment) {
  return assignment.scope === 'PLATFORM' && assignment.assignedBy === 'HEADMISTRESS';
}

export function isMistressTrustedAssignment(assignment: AdminMemberAssignment) {
  return assignment.scope === 'MISTRESS_PROFILE' && assignment.assignedBy === 'MISTRESS';
}
