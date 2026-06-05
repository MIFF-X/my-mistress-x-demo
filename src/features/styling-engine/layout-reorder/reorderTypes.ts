export type MxReorderSurface =
  | 'dashboard-widgets'
  | 'profile-sections'
  | 'app-market-modules'
  | 'sticker-packs'
  | 'chat-expression-tabs'
  | 'live-stage-panels'
  | 'tool-tray-buttons'
  | 'rolodex-card-sections'
  | 'game-skin-packs';

export type MxReorderItem = {
  id: string;
  label: string;
  description?: string;
  surface: MxReorderSurface;
  order: number;
  locked?: boolean;
  visible?: boolean;
};

export type MxReorderInteractionState = {
  isEditing: boolean;
  activeItemId?: string;
  hasUnsavedChanges: boolean;
};

export type MxReorderMotionPreset = {
  id: string;
  name: string;
  liftScale: number;
  liftShadow: string;
  snapDurationMs: number;
  hapticHint: boolean;
};
