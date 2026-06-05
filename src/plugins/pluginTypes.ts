export type MistressXPluginCategory =
  | 'communication'
  | 'content-monetisation'
  | 'live-interaction'
  | 'economy'
  | 'rolodex'
  | 'collectibles'
  | 'bookings'
  | 'admin'
  | 'growth';

export type MistressXPluginRole = 'headmistress' | 'mistress' | 'sub' | 'guest';

export type MistressXPluginStatus = 'planned' | 'scaffolded' | 'active' | 'locked';

export type MistressXPluginCapability =
  | 'chat'
  | 'socket-events'
  | 'ppv-content'
  | 'file-upload'
  | 'wallet-spend'
  | 'wallet-earnings'
  | 'countdown-timers'
  | 'calendar-bookings'
  | 'live-room'
  | 'micro-gifts'
  | 'sticker-collections'
  | 'rolodex-cards'
  | 'leaderboards'
  | 'admin-approval'
  | 'notifications';

export type MistressXPluginRoute = {
  key: string;
  label: string;
  screenKey: string;
  roles: MistressXPluginRole[];
};

export type MistressXPluginDefinition = {
  key: string;
  name: string;
  description: string;
  category: MistressXPluginCategory;
  status: MistressXPluginStatus;
  roles: MistressXPluginRole[];
  capabilities: MistressXPluginCapability[];
  routes?: MistressXPluginRoute[];
  dependencies?: string[];
  notes?: string[];
};

export type MistressXPluginRegistry = Record<string, MistressXPluginDefinition>;
