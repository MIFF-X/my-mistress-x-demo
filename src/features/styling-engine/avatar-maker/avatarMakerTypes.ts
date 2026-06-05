export type MxAvatarMemberRole = 'owner' | 'creator' | 'supporter' | 'admin';

export type MxAvatarPackType =
  | 'personal-avatar'
  | 'mood-pack'
  | 'reaction-pack'
  | 'creator-brand-pack'
  | 'identity-pack'
  | 'event-pack'
  | 'duo-pack'
  | 'monthly-drop-pack';

export type MxAvatarStyleCategory =
  | 'base'
  | 'skin-tone'
  | 'hair'
  | 'outfit'
  | 'expression'
  | 'accessory'
  | 'pose'
  | 'background'
  | 'style';

export type MxAvatarStyleOption = {
  id: string;
  label: string;
  category: MxAvatarStyleCategory;
  free: boolean;
};

export type MxAvatarPack = {
  id: string;
  name: string;
  type: MxAvatarPackType;
  ownerRole: MxAvatarMemberRole;
  stickerCount: number;
  animatedCount: number;
  compatibleSurfaces: string[];
  styleOptions: string[];
};
