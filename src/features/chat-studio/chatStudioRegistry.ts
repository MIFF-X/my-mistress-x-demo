import { ChatStudioScreen } from './chatStudioScreen';
import { mxChatStudioSections, mxChatStudioSurfaces } from './chatStudioConfig';

export const mxChatStudioRegistryEntry = {
  id: 'mx-chat-studio',
  title: 'MX Chat Studio',
  subtitle: 'Text, audio, video, live rooms, stickers, avatars, gifts, wrappers, effects and asset packs.',
  category: 'communication-assets',
  surfaces: mxChatStudioSurfaces,
  sections: mxChatStudioSections.map((section) => ({
    id: section.id,
    title: section.title,
    itemCount: section.items.length,
  })),
  tags: [
    'chat',
    'communication',
    'stickers',
    'avatar-maker',
    'gifts',
    'wrappers',
    'live-rooms',
    'calls',
    'asset-generator',
  ],
  component: ChatStudioScreen,
} as const;

export type MxChatStudioRegistryEntry = typeof mxChatStudioRegistryEntry;
