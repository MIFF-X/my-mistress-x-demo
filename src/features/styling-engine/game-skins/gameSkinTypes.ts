export type MxGameVisualType = 'slot' | 'scratch-card' | 'wheel' | 'mystery-box' | 'raffle' | 'general-icons';

export type MxGameSkinRequiredSlot = {
  id: string;
  label: string;
  meaning: 'common' | 'rare' | 'jackpot' | 'bonus' | 'blank' | 'retry' | 'reward' | 'locked' | 'special';
  required: boolean;
};

export type MxGameSkinPack = {
  id: string;
  name: string;
  gameType: MxGameVisualType;
  themeId: string;
  description: string;
  requiredSlots: MxGameSkinRequiredSlot[];
  previewImage?: string;
  previewAnimation?: string;
  tags: string[];
};

export type MxGameIconPack = {
  id: string;
  name: string;
  description: string;
  compatibleGameTypes: MxGameVisualType[];
  iconCount: number;
  tags: string[];
  exportFormats: string[];
};

export type MxGameVisualBundle = {
  id: string;
  name: string;
  gameType: MxGameVisualType;
  skinPackId: string;
  iconPackId: string;
  themeId: string;
  compatiblePlugins: string[];
  exportFormats: string[];
  iconMap: Record<string, string>;
  previewImage?: string;
  previewAnimation?: string;
};
