import { apiRequest } from './apiClient';

export type WishlistItem = {
  id: string;
  mistressUserId: string;
  title: string;
  description?: string | null;
  price: number | string;
  priceInCredits: number | string;
  link?: string | null;
  imageUrl?: string | null;
  isPriority?: boolean;
  status: 'active' | 'fulfilled' | 'archived' | string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    purchases?: number;
    reservations?: number;
  };
  viewerReservation?: WishlistReservation;
};

export type WishlistPurchase = {
  id: string;
  itemId: string;
  buyerUserId: string;
  mistressUserId: string;
  amount: number | string;
  message?: string | null;
  createdAt: string;
};

export type WishlistPurchaseResponse = {
  purchase: WishlistPurchase;
  item: WishlistItem;
};

export type WishlistReservation = {
  id: string;
  itemId: string;
  buyerUserId: string;
  mistressUserId: string;
  message?: string | null;
  status: 'active' | 'expired' | 'purchased' | 'cancelled' | string;
  expiresAt: string;
  auditNote?: string;
  createdAt: string;
  updatedAt: string;
  itemTitle?: string;
  itemStatus?: string;
};

export type WishlistReservationResponse = {
  alreadyReserved: boolean;
  reservation: WishlistReservation;
  item: WishlistItem;
};

export type CreateWishlistItemInput = {
  title: string;
  description?: string;
  price: number;
  priceInCredits?: number;
  link?: string;
  imageUrl?: string;
  isPriority?: boolean;
};

export function listWishlistForMistress(mistressId: string) {
  return apiRequest<WishlistItem[]>(`/wishlist/items/mistress/${encodeURIComponent(mistressId)}`);
}

export function createWishlistItem(input: CreateWishlistItemInput) {
  return apiRequest<WishlistItem>('/wishlist/items', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteWishlistItem(itemId: string) {
  return apiRequest<WishlistItem>(`/wishlist/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
}

export function reserveWishlistItem(itemId: string, message?: string) {
  return apiRequest<WishlistReservationResponse>(`/wishlist/items/${encodeURIComponent(itemId)}/reserve`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export function listWishlistReservationsForMistress(mistressId: string) {
  return apiRequest<WishlistReservation[]>(`/wishlist/reservations/mistress/${encodeURIComponent(mistressId)}`);
}

export function purchaseWishlistItem(itemId: string, message?: string) {
  return apiRequest<WishlistPurchaseResponse>(`/wishlist/items/${encodeURIComponent(itemId)}/purchase`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
