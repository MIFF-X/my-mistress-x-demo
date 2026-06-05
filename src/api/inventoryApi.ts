import { apiRequest } from './apiClient';

export type InventoryGift = {
  id: string;
  giftId: string;
  quantity: number;
  gift?: {
    id: string;
    name: string;
    emoji?: string | null;
    price?: number | string;
  };
};

export type InventorySticker = {
  id: string;
  stickerId: string;
  quantity: number;
  sticker?: {
    id: string;
    title: string;
    imageUrl: string;
    price?: number | string | null;
  };
};

export function listGiftInventory() {
  return apiRequest<InventoryGift[]>('/gifts/mine');
}

export function listStickerInventory() {
  return apiRequest<InventorySticker[]>('/stickers/mine');
}
