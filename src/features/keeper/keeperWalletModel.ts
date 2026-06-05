export type KeeperAgreementStatus = 'draft' | 'active' | 'renewal-review' | 'paused';

export type KeeperAgreement = {
  id: string;
  title: string;
  supporterName: string;
  creatorName: string;
  amountCredits: number;
  renewal: string;
  visibility: 'private' | 'profile-badge' | 'admin-only';
  status: KeeperAgreementStatus;
  spendingLimitCredits: number;
  remainingCredits: number;
  allowedCategories: string[];
  perks: string[];
  consentStamp: string;
  cancelPolicy: string;
  tone: string;
};

export type AllowanceLedgerRow = {
  id: string;
  label: string;
  category: string;
  capCredits: number;
  usedCredits: number;
  expiresAt: string;
  status: 'available' | 'watch' | 'locked';
  note: string;
  tone: string;
};

export type KeeperGoalRole = {
  id: string;
  title: string;
  category: 'car' | 'house' | 'personal-care' | 'creator-growth' | 'live-show' | 'custom';
  targetCredits: number;
  currentCredits: number;
  keeperRole: string;
  taxNote: string;
  tone: string;
};

export type KeeperRecurringSupport = {
  id: string;
  label: string;
  amountCredits: number;
  cadence: string;
  nextReminder: string;
  receiptStatus: 'ready' | 'scheduled' | 'review';
};

export type KeeperAuditEvent = {
  id: string;
  label: string;
  actor: string;
  area: string;
  createdAt: string;
  status: 'recorded' | 'needs-review' | 'draft';
};

export const KEEPER_AGREEMENTS: KeeperAgreement[] = [
  {
    id: 'monthly-care',
    title: 'Monthly Care Agreement',
    supporterName: 'Charles D.',
    creatorName: 'Mistress X',
    amountCredits: 3200,
    renewal: 'Monthly on the 1st',
    visibility: 'private',
    status: 'active',
    spendingLimitCredits: 3200,
    remainingCredits: 1450,
    allowedCategories: ['Personal care', 'Creator tools', 'Live room'],
    perks: ['Priority messages', 'Monthly progress note', 'Private thank-you receipt'],
    consentStamp: 'Accepted May 13, 2026 at 9:18 PM',
    cancelPolicy: 'Either side can cancel before next renewal.',
    tone: '#8b5cf6',
  },
  {
    id: 'creator-growth',
    title: 'Creator Growth Sponsor',
    supporterName: 'Isabella R.',
    creatorName: 'Mistress X',
    amountCredits: 1850,
    renewal: 'Every 2 weeks',
    visibility: 'profile-badge',
    status: 'renewal-review',
    spendingLimitCredits: 1850,
    remainingCredits: 820,
    allowedCategories: ['Creator growth', 'Content production', 'Style packs'],
    perks: ['Supporter badge', 'Early drop notice', 'Campaign recap'],
    consentStamp: 'Renewal review due May 27, 2026',
    cancelPolicy: 'Renewal pauses if either side requests review.',
    tone: '#38bdf8',
  },
  {
    id: 'pin-money',
    title: 'Pin Money Support',
    supporterName: 'Marcus V.',
    creatorName: 'Mistress X',
    amountCredits: 350,
    renewal: 'Weekly on Friday',
    visibility: 'admin-only',
    status: 'draft',
    spendingLimitCredits: 350,
    remainingCredits: 350,
    allowedCategories: ['Small support', 'Personal care'],
    perks: ['Receipt', 'Reminder', 'Support note'],
    consentStamp: 'Draft awaiting supporter acceptance',
    cancelPolicy: 'No charge until explicit acceptance.',
    tone: '#d4af37',
  },
];

export const ALLOWANCE_LEDGER_ROWS: AllowanceLedgerRow[] = [
  {
    id: 'personal-care',
    label: 'Personal Care Allowance',
    category: 'Personal care',
    capCredits: 1400,
    usedCredits: 620,
    expiresAt: 'May 31, 2026',
    status: 'available',
    note: 'Allowed for approved personal-care goals only.',
    tone: '#f472b6',
  },
  {
    id: 'creator-tools',
    label: 'Creator Tools Allowance',
    category: 'Creator growth',
    capCredits: 900,
    usedCredits: 760,
    expiresAt: 'June 7, 2026',
    status: 'watch',
    note: 'Close to cap; next spend should ask for confirmation.',
    tone: '#f5c542',
  },
  {
    id: 'live-room',
    label: 'Live Room Allowance',
    category: 'Live show',
    capCredits: 600,
    usedCredits: 0,
    expiresAt: 'June 1, 2026',
    status: 'available',
    note: 'Reserved for ticketed live-room access and replay drops.',
    tone: '#2dd4bf',
  },
  {
    id: 'expense-adopt',
    label: 'Adopted Expense Draft',
    category: 'Safe category review',
    capCredits: 1200,
    usedCredits: 0,
    expiresAt: 'Needs approval',
    status: 'locked',
    note: 'Requires creator tax/accounting note and admin-safe category review.',
    tone: '#60a5fa',
  },
];

export const KEEPER_GOAL_ROLES: KeeperGoalRole[] = [
  {
    id: 'car',
    title: 'Car Fund Keeper',
    category: 'car',
    targetCredits: 18000,
    currentCredits: 7200,
    keeperRole: 'Transport Supporter',
    taxNote: 'Expense support needs creator records before payout.',
    tone: '#8b5cf6',
  },
  {
    id: 'house',
    title: 'House Fund Keeper',
    category: 'house',
    targetCredits: 30000,
    currentCredits: 9100,
    keeperRole: 'Home Goal Supporter',
    taxNote: 'Large goals require review before public display.',
    tone: '#d4af37',
  },
  {
    id: 'growth',
    title: 'Creator Growth Keeper',
    category: 'creator-growth',
    targetCredits: 8500,
    currentCredits: 6200,
    keeperRole: 'Studio Sponsor',
    taxNote: 'Track tools and services separately for statements.',
    tone: '#38bdf8',
  },
  {
    id: 'custom',
    title: 'Custom Goal Keeper',
    category: 'custom',
    targetCredits: 5000,
    currentCredits: 1250,
    keeperRole: 'Custom Supporter',
    taxNote: 'Custom labels must stay platform-safe and reviewed.',
    tone: '#2dd4bf',
  },
];

export const KEEPER_RECURRING_SUPPORT: KeeperRecurringSupport[] = [
  { id: 'pin-small', label: 'Small Weekly Support', amountCredits: 150, cadence: 'Weekly', nextReminder: 'Friday', receiptStatus: 'scheduled' },
  { id: 'care-monthly', label: 'Care Reminder', amountCredits: 500, cadence: 'Monthly', nextReminder: 'June 1', receiptStatus: 'ready' },
  { id: 'growth-quarterly', label: 'Growth Boost', amountCredits: 1200, cadence: 'Quarterly', nextReminder: 'July 15', receiptStatus: 'review' },
];

export const KEEPER_AUDIT_EVENTS: KeeperAuditEvent[] = [
  { id: 'consent', label: 'Agreement consent recorded', actor: 'Charles D.', area: 'Monthly Care Agreement', createdAt: '2h ago', status: 'recorded' },
  { id: 'cap', label: 'Allowance cap changed', actor: 'Mistress X', area: 'Creator Tools Allowance', createdAt: '5h ago', status: 'needs-review' },
  { id: 'receipt', label: 'Receipt generated', actor: 'System', area: 'Pin Money Support', createdAt: '1d ago', status: 'recorded' },
  { id: 'draft', label: 'Adopted expense drafted', actor: 'Mistress X', area: 'Safe category review', createdAt: '2d ago', status: 'draft' },
];

export function formatKeeperCredits(value: number) {
  return `${value.toLocaleString()} credits`;
}

export function getKeeperAgreementStatusLabel(status: KeeperAgreementStatus) {
  if (status === 'renewal-review') return 'Renewal Review';
  return status.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getAllowanceRemaining(row: AllowanceLedgerRow) {
  return Math.max(0, row.capCredits - row.usedCredits);
}
