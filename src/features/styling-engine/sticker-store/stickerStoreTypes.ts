export type MxStickerStoreTab = 'featured' | 'all' | 'your-stickers';

export type MxStickerPackInstallState = 'not-installed' | 'installed' | 'owned' | 'locked' | 'premium';

export type MxStickerPack = {
  id: string;
  name: string;
  creatorName: string;
  description: string;
  installState: MxStickerPackInstallState;
  coverIcon: string;
  stickerCount: number;
  tags: string[];
  order: number;
};

export type MxStickerStoreAction = 'install' | 'remove' | 'reorder' | 'save-order' | 'edit' | 'done';
