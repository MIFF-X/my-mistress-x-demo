import { LittleBlackBookCardStyle, RolodexCard } from '../../api/rolodexApi';

export const LITTLE_BLACK_BOOK_CATEGORIES = ['Business', 'Personal', 'Creative', 'Suppliers'];
export const LITTLE_BLACK_BOOK_STATUSES = ['Active', 'VIP', 'Inactive', 'Archived'];
export const LITTLE_BLACK_BOOK_TABS = [
  { id: 'all', label: 'All Contacts' },
  { id: 'vip', label: 'VIP Only' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'business', label: 'Business' },
  { id: 'personal', label: 'Personal' },
  { id: 'archived', label: 'Archived' },
] as const;

export type LittleBlackBookTabId = typeof LITTLE_BLACK_BOOK_TABS[number]['id'];

export type LittleBlackBookContact = {
  card: RolodexCard;
  name: string;
  category: string;
  status: string;
  rating: number;
  ratingLabel: string;
  lastContactAt?: string;
  lastContactLabel: string;
  lastInteractionSummary: string;
  relationshipStatus: string;
  subscriptionStatus: string;
  contractStatus: string;
  tributeSummary: string;
  sharedVaultCount: number;
  tags: string[];
  theme: string;
  accentColor: string;
  searchText: string;
};

export type LittleBlackBookFilters = {
  tab: LittleBlackBookTabId;
  searchText: string;
  category: string;
  status: string;
  rating: string;
};

export type LittleBlackBookStats = {
  total: number;
  active: number;
  vip: number;
  archived: number;
  lastContactLabel: string;
};

export type LittleBlackBookNetworkSegment = {
  category: string;
  count: number;
  percent: number;
  color: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  Business: '#8b5cf6',
  Personal: '#f97316',
  Creative: '#ec4899',
  Suppliers: '#94a3b8',
};

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
}

export function getLittleBlackBookStyle(card: RolodexCard): LittleBlackBookCardStyle {
  if (!card.style || typeof card.style !== 'object' || Array.isArray(card.style)) return {};
  return card.style as LittleBlackBookCardStyle;
}

function styleString(style: LittleBlackBookCardStyle, key: keyof LittleBlackBookCardStyle) {
  const value = style[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeCategory(value?: string) {
  const exact = LITTLE_BLACK_BOOK_CATEGORIES.find((category) => category.toLowerCase() === value?.toLowerCase());
  return exact || value || 'Personal';
}

function normalizeStatus(value?: string) {
  const exact = LITTLE_BLACK_BOOK_STATUSES.find((status) => status.toLowerCase() === value?.toLowerCase());
  return exact || value || 'Active';
}

function inferCategory(tags: string[], title: string, style: LittleBlackBookCardStyle) {
  const styled = styleString(style, 'category');
  if (styled) return normalizeCategory(styled);

  const text = `${title} ${tags.join(' ')}`.toLowerCase();
  if (text.includes('supplier') || text.includes('vendor')) return 'Suppliers';
  if (text.includes('creative') || text.includes('photo') || text.includes('design')) return 'Creative';
  if (text.includes('personal')) return 'Personal';
  return 'Business';
}

function inferStatus(tags: string[], style: LittleBlackBookCardStyle) {
  const styled = styleString(style, 'status') || styleString(style, 'relationshipStatus');
  if (styled) return normalizeStatus(styled);
  if (tags.some((tag) => tag.toLowerCase() === 'vip')) return 'VIP';
  if (tags.some((tag) => tag.toLowerCase() === 'archived')) return 'Archived';
  if (tags.some((tag) => tag.toLowerCase() === 'inactive')) return 'Inactive';
  return 'Active';
}

function normalizeRating(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 3;
  return Math.min(5, Math.max(1, Math.round(numeric)));
}

function themeColor(theme?: string) {
  if (theme === 'Gold') return '#d4af37';
  if (theme === 'Pink') return '#ff5c9a';
  if (theme === 'Red') return '#ef4444';
  if (theme === 'Silver') return '#c0c0c0';
  if (theme === 'Purple') return '#8b5cf6';
  return '#7c3aed';
}

function latestDateValue(value?: string) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatAge(value?: string) {
  const timestamp = latestDateValue(value);
  if (!timestamp) return 'No contact';

  const elapsed = Math.max(0, Date.now() - timestamp);
  const days = Math.floor(elapsed / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months <= 1) return '1mo ago';
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return years <= 1 ? '1y ago' : `${years}y ago`;
}

function ratingLabel(rating: number) {
  return `${'*'.repeat(rating)}${'-'.repeat(5 - rating)}`;
}

export function buildLittleBlackBookContacts(cards: RolodexCard[]): LittleBlackBookContact[] {
  return cards.map((card) => {
    const style = getLittleBlackBookStyle(card);
    const tags = parseTags(card.tags);
    const name = card.displayName || card.title;
    const category = inferCategory(tags, card.title, style);
    const status = inferStatus(tags, style);
    const rating = normalizeRating(style.rating);
    const lastContactAt = styleString(style, 'lastContactAt') || card.updatedAt || card.createdAt;
    const lastInteractionSummary = styleString(style, 'lastInteractionSummary') || styleString(style, 'tributeSummary') || 'No recent interaction note';
    const relationshipStatus = styleString(style, 'relationshipStatus') || status;
    const subscriptionStatus = styleString(style, 'subscriptionStatus') || 'Not set';
    const contractStatus = styleString(style, 'contractStatus') || 'Not set';
    const tributeSummary = styleString(style, 'tributeSummary') || 'No support summary yet';
    const sharedVaultItemIds = Array.isArray(style.sharedVaultItemIds) ? style.sharedVaultItemIds : [];
    const theme = styleString(style, 'theme') || 'Black';
    const searchText = [
      name,
      card.title,
      card.notes,
      category,
      status,
      relationshipStatus,
      subscriptionStatus,
      contractStatus,
      tributeSummary,
      lastInteractionSummary,
      ...tags,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return {
      card,
      name,
      category,
      status,
      rating,
      ratingLabel: ratingLabel(rating),
      lastContactAt,
      lastContactLabel: formatAge(lastContactAt),
      lastInteractionSummary,
      relationshipStatus,
      subscriptionStatus,
      contractStatus,
      tributeSummary,
      sharedVaultCount: sharedVaultItemIds.length,
      tags,
      theme,
      accentColor: themeColor(theme),
      searchText,
    };
  });
}

export function summarizeLittleBlackBookContacts(contacts: LittleBlackBookContact[]): LittleBlackBookStats {
  const newest = contacts.reduce((latest, contact) => {
    const value = latestDateValue(contact.lastContactAt);
    return value > latest ? value : latest;
  }, 0);

  return {
    total: contacts.length,
    active: contacts.filter((contact) => contact.status === 'Active' || contact.status === 'VIP').length,
    vip: contacts.filter((contact) => contact.status === 'VIP' || contact.tags.some((tag) => tag.toLowerCase() === 'vip')).length,
    archived: contacts.filter((contact) => contact.status === 'Archived').length,
    lastContactLabel: newest ? formatAge(new Date(newest).toISOString()) : 'No contact',
  };
}

export function filterLittleBlackBookContacts(contacts: LittleBlackBookContact[], filters: LittleBlackBookFilters) {
  const search = filters.searchText.trim().toLowerCase();
  const minimumRating = filters.rating === 'Any' ? 0 : Number(filters.rating.replace('+', ''));

  return contacts.filter((contact) => {
    if (filters.tab === 'vip' && contact.status !== 'VIP') return false;
    if (filters.tab === 'suppliers' && contact.category !== 'Suppliers') return false;
    if (filters.tab === 'business' && contact.category !== 'Business') return false;
    if (filters.tab === 'personal' && contact.category !== 'Personal') return false;
    if (filters.tab === 'archived' && contact.status !== 'Archived') return false;
    if (filters.category !== 'All' && contact.category !== filters.category) return false;
    if (filters.status !== 'All' && contact.status !== filters.status) return false;
    if (minimumRating && contact.rating < minimumRating) return false;
    if (search && !contact.searchText.includes(search)) return false;
    return true;
  });
}

export function buildLittleBlackBookNetwork(contacts: LittleBlackBookContact[]): LittleBlackBookNetworkSegment[] {
  const total = Math.max(contacts.length, 1);
  return LITTLE_BLACK_BOOK_CATEGORIES.map((category) => {
    const count = contacts.filter((contact) => contact.category === category).length;
    return {
      category,
      count,
      percent: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[category] || '#777',
    };
  }).filter((segment) => segment.count > 0);
}

export function recentLittleBlackBookInteractions(contacts: LittleBlackBookContact[]) {
  return [...contacts]
    .sort((a, b) => latestDateValue(b.lastContactAt) - latestDateValue(a.lastContactAt))
    .slice(0, 5);
}
