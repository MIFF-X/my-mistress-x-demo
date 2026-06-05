import { apiRequest } from './apiClient';
import { DirectoryProfileTaxonomySummary } from './usersApi';

export type RolodexLinkedUser = {
  id: string;
  username: string;
  displayName?: string | null;
  role: 'HEADMISTRESS' | 'MISTRESS' | 'SUB' | 'ADMIN';
  avatarUrl?: string | null;
  profileTaxonomySummary?: DirectoryProfileTaxonomySummary;
};

export type RolodexCardStyle = Record<string, unknown> & {
  theme?: string;
  linkedUserId?: string;
  category?: string;
  accentColor?: string;
  customColor?: string;
  shareStatus?: string;
  consentScope?: string;
  consentExpiresAt?: string;
};

export type LittleBlackBookCardStyle = RolodexCardStyle & {
  targetType?: string;
  mistressUserId?: string;
  category?: string;
  status?: string;
  rating?: number;
  lastContactAt?: string;
  lastInteractionSummary?: string;
  relationshipStatus?: string;
  subscriptionStatus?: string;
  contractStatus?: string;
  tributeSummary?: string;
  sharedVaultItemIds?: string[];
};

export type RolodexCard = {
  id: string;
  ownerUserId: string;
  createdById: string;
  title: string;
  displayName?: string | null;
  notes?: string | null;
  tags?: unknown;
  style?: RolodexCardStyle | unknown;
  isPrivate: boolean;
  linkedUserId?: string | null;
  linkedUser?: RolodexLinkedUser;
  createdAt: string;
  updatedAt: string;
};

export type RolodexVisibilityFilter = 'all' | 'private' | 'shareable';

export type ListRolodexCardsInput = {
  q?: string;
  tag?: string;
  visibility?: RolodexVisibilityFilter;
  taxonomyTag?: string;
  professionId?: string;
  serviceOfferId?: string;
};

export type CreateRolodexCardInput = {
  title: string;
  displayName?: string;
  notes?: string;
  tags?: string[];
  style?: RolodexCardStyle;
  linkedUserId?: string | null;
  isPrivate?: boolean;
  ownerUserId?: string;
};

export type UpdateRolodexCardInput = {
  title?: string;
  displayName?: string;
  notes?: string;
  tags?: string[];
  style?: RolodexCardStyle;
  linkedUserId?: string | null;
  isPrivate?: boolean;
};

export type CreateLittleBlackBookCardInput = {
  title: string;
  mistressUserId?: string;
  mistressDisplayName?: string;
  relationshipStatus?: string;
  subscriptionStatus?: string;
  contractStatus?: string;
  tributeSummary?: string;
  category?: string;
  status?: string;
  rating?: number;
  lastContactAt?: string;
  lastInteractionSummary?: string;
  privateNotes?: string;
  favoriteTags?: string[];
  sharedVaultItemIds?: string[];
  theme?: string;
};

export function listRolodexCards(input: ListRolodexCardsInput = {}) {
  const params = [
    input.q?.trim() ? `q=${encodeURIComponent(input.q.trim())}` : '',
    input.tag?.trim() ? `tag=${encodeURIComponent(input.tag.trim())}` : '',
    input.visibility && input.visibility !== 'all' ? `visibility=${encodeURIComponent(input.visibility)}` : '',
    input.taxonomyTag?.trim() ? `taxonomyTag=${encodeURIComponent(input.taxonomyTag.trim())}` : '',
    input.professionId?.trim() ? `professionId=${encodeURIComponent(input.professionId.trim())}` : '',
    input.serviceOfferId?.trim() ? `serviceOfferId=${encodeURIComponent(input.serviceOfferId.trim())}` : '',
  ].filter(Boolean);
  const query = params.length ? `?${params.join('&')}` : '';
  return apiRequest<RolodexCard[]>(`/rolodex${query}`);
}

export function listLittleBlackBookCards() {
  return apiRequest<RolodexCard[]>('/rolodex/little-black-book');
}

export function createLittleBlackBookCard(input: CreateLittleBlackBookCardInput) {
  return apiRequest<RolodexCard>('/rolodex/little-black-book', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createRolodexCard(input: CreateRolodexCardInput) {
  return apiRequest<RolodexCard>('/rolodex', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateRolodexCard(cardId: string, input: UpdateRolodexCardInput) {
  return apiRequest<RolodexCard>(`/rolodex/${cardId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteRolodexCard(cardId: string) {
  return apiRequest<{ count: number }>(`/rolodex/${cardId}`, {
    method: 'DELETE',
  });
}

export function saveRolodexCard(cardId: string) {
  return apiRequest<RolodexCard>(`/rolodex/${cardId}/save`, {
    method: 'PATCH',
  });
}
