import { apiRequest } from './apiClient';

export type StickerDefinition = {
  id: string;
  creatorId: string;
  title: string;
  imageUrl: string;
  price?: number | string | null;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
};

export type UserSticker = {
  id: string;
  userId: string;
  stickerId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  sticker?: StickerDefinition;
};

export type StickerPackItem = {
  id: string;
  packId: string;
  stickerId: string;
  sortOrder: number;
  rarity: string;
  createdAt: string;
  sticker?: StickerDefinition;
};

export type StickerPack = {
  id: string;
  creatorId: string;
  title: string;
  description?: string | null;
  theme?: string | null;
  price?: number | string | null;
  metadata?: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: StickerPackItem[];
};

export type StickerPackProgress = {
  pack: StickerPack;
  progress: {
    id: string;
    userId: string;
    packId: string;
    collectedCount: number;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  ownedStickerIds: string[];
  totalCount: number;
  collectedCount: number;
  completed: boolean;
};

export type StickerMetadata = {
  source?: string;
  releaseType?: string;
  cropPreview?: string;
  cutoutBorder?: boolean;
  dropMonth?: string;
  matchingCollectibleId?: string;
};

export type CreateStickerInput = {
  title: string;
  imageUrl?: string;
  price?: number;
  metadata?: StickerMetadata;
};

export type CreateStickerPackInput = {
  title: string;
  description?: string;
  theme?: string;
  price?: number;
  metadata?: unknown;
  isActive?: boolean;
};

export type AddStickerPackItemsInput = {
  items: Array<{
    stickerId: string;
    sortOrder?: number;
    rarity?: string;
  }>;
};

export type SendStickerToChatInput = {
  stickerId: string;
  roomId: string;
  receiverUserId?: string;
};

export function listStickers() {
  return apiRequest<StickerDefinition[]>('/stickers');
}

export function listMyStickers() {
  return apiRequest<UserSticker[]>('/stickers/mine');
}

export function createSticker(input: CreateStickerInput) {
  return apiRequest<StickerDefinition>('/stickers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function collectSticker(stickerId: string) {
  return apiRequest<UserSticker>(`/stickers/${stickerId}/collect`, {
    method: 'POST',
  });
}

export function createStickerPack(input: CreateStickerPackInput) {
  return apiRequest<StickerPack>('/stickers/packs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listStickerPacks() {
  return apiRequest<StickerPack[]>('/stickers/packs');
}

export function getStickerPackProgress(packId: string) {
  return apiRequest<StickerPackProgress>(`/stickers/packs/${packId}/progress`);
}

export function addStickerPackItems(packId: string, input: AddStickerPackItemsInput) {
  return apiRequest<StickerPack>(`/stickers/packs/${packId}/items`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function sendStickerToChat(input: SendStickerToChatInput) {
  return apiRequest<{ id: string; type?: string; body?: string }>('/stickers/send', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
