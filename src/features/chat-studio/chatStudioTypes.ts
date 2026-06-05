export type MxChatStudioDrawerId =
  | 'communication'
  | 'expression-assets'
  | 'sticker-store'
  | 'avatar-maker'
  | 'gifts'
  | 'wrappers-effects'
  | 'live-rooms'
  | 'calls-bookings'
  | 'asset-packs'
  | 'layout-reorder';

export type MxChatStudioSection = {
  id: MxChatStudioDrawerId;
  title: string;
  subtitle: string;
  items: string[];
  relatedSystems: string[];
};

export type MxChatStudioSurface =
  | 'headmistress-dashboard'
  | 'mistress-dashboard'
  | 'chat-settings'
  | 'asset-generator'
  | 'app-market'
  | 'live-stage-setup'
  | 'stream-deck';
