import { apiRequest } from './apiClient';

export type DirectoryProfileTaxonomySummary = {
  mistressCategoryIds: string[];
  subIdentityLabels: string[];
  professionIds: string[];
  serviceOfferIds: string[];
  customLabels: string[];
  customServices: string[];
  employmentStatus?: string | null;
  jobTitle?: string | null;
  industry?: string | null;
  visibility: 'connections' | 'public';
};

export type DirectoryUser = {
  id: string;
  username: string;
  displayName?: string | null;
  role: 'HEADMISTRESS' | 'MISTRESS' | 'SUB' | 'ADMIN';
  avatarUrl?: string | null;
  profileTaxonomySummary?: DirectoryProfileTaxonomySummary;
};

export type UserDirectoryFilters = {
  role?: DirectoryUser['role'];
  q?: string;
  taxonomyTag?: string;
  professionId?: string;
  serviceOfferId?: string;
};

function buildDirectoryQuery(filters: UserDirectoryFilters) {
  const query = Object.entries(filters)
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join('&');

  return query ? `?${query}` : '';
}

export function listUserDirectory(roleOrFilters?: DirectoryUser['role'] | UserDirectoryFilters) {
  const filters = typeof roleOrFilters === 'string' ? { role: roleOrFilters } : roleOrFilters || {};
  const query = buildDirectoryQuery(filters);
  return apiRequest<DirectoryUser[]>(`/users/directory${query}`);
}
