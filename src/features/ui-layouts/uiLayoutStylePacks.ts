import type { UiLayoutPresetId } from './layoutPresets';

export type UiLayoutStylePackTier = 'free' | 'paid' | 'custom';
export type UiLayoutStylePackStatus = 'available' | 'locked' | 'installed' | 'request-only';

export type UiLayoutStylePack = {
  id: string;
  title: string;
  subtitle: string;
  tier: UiLayoutStylePackTier;
  status: UiLayoutStylePackStatus;
  priceLabel: string;
  accent: string;
  defaultPreset: UiLayoutPresetId;
  compatiblePresets: UiLayoutPresetId[];
  tags: string[];
  previewNotes: string[];
};

export const UI_LAYOUT_STYLE_PACKS: UiLayoutStylePack[] = [
  {
    id: 'default-dark',
    title: 'Default Dark',
    subtitle: 'Core Mistress-X black glass interface with clean cards, pink accent and simple app/web flow.',
    tier: 'free',
    status: 'installed',
    priceLabel: 'Free',
    accent: '#ff0055',
    defaultPreset: 'mistress-creator',
    compatiblePresets: ['empire-command', 'mistress-creator', 'sub-dashboard', 'little-black-book', 'style-marketplace'],
    tags: ['starter', 'dark', 'clean'],
    previewNotes: ['Safe default for every role.', 'Works on mobile and desktop without extra assets.'],
  },
  {
    id: 'midnight-luxe',
    title: 'Midnight Luxe',
    subtitle: 'Black, purple and glass-panel dashboard styling for premium creator and sub experiences.',
    tier: 'free',
    status: 'available',
    priceLabel: 'Free',
    accent: '#8B5CF6',
    defaultPreset: 'mistress-creator',
    compatiblePresets: ['mistress-creator', 'sub-dashboard', 'style-marketplace', 'vertical-live-room'],
    tags: ['purple', 'glass', 'premium'],
    previewNotes: ['Best for creator dashboards and style browsing.', 'Pairs well with stickers, goals and PPV surfaces.'],
  },
  {
    id: 'obsidian-control',
    title: 'Obsidian Control',
    subtitle: 'Sharper command styling for Headmistress, admin and high-control dashboard workflows.',
    tier: 'free',
    status: 'available',
    priceLabel: 'Free',
    accent: '#D4AF37',
    defaultPreset: 'empire-command',
    compatiblePresets: ['empire-command', 'little-black-book', 'style-marketplace'],
    tags: ['admin', 'command', 'gold'],
    previewNotes: ['Best for command centre layouts.', 'Keeps queues, money and compliance visually dominant.'],
  },
  {
    id: 'royal-obsession',
    title: 'Royal Obsession',
    subtitle: 'Gold, crown and velvet-inspired UI pack for premium Mistress branding.',
    tier: 'paid',
    status: 'locked',
    priceLabel: 'Premium pack',
    accent: '#D4AF37',
    defaultPreset: 'mistress-creator',
    compatiblePresets: ['mistress-creator', 'little-black-book', 'style-marketplace'],
    tags: ['gold', 'creator', 'premium'],
    previewNotes: ['Designed for paid creator branding.', 'Can later unlock custom card frames and crown badges.'],
  },
  {
    id: 'neon-temptress',
    title: 'Neon Temptress',
    subtitle: 'High-contrast pink/purple neon styling for live rooms, chat and vertical video moments.',
    tier: 'paid',
    status: 'locked',
    priceLabel: 'Premium pack',
    accent: '#FF2F6D',
    defaultPreset: 'vertical-live-room',
    compatiblePresets: ['vertical-live-room', 'mistress-creator', 'sub-dashboard'],
    tags: ['live', 'neon', 'video'],
    previewNotes: ['Best for live shows and Watch With Mistress.', 'Supports future viewer eye and gift animation layers.'],
  },
  {
    id: 'cyber-vixen',
    title: 'Cyber Vixen',
    subtitle: 'Cyber dashboard styling for tech-slave, AI and command-centre workflows.',
    tier: 'paid',
    status: 'locked',
    priceLabel: 'Premium pack',
    accent: '#38BDF8',
    defaultPreset: 'empire-command',
    compatiblePresets: ['empire-command', 'style-marketplace', 'mistress-creator'],
    tags: ['cyber', 'ai', 'tech'],
    previewNotes: ['Pairs with Abacus AI and provider dashboards.', 'Good candidate for Tech Slave custom build prompts.'],
  },
  {
    id: 'custom-tech-slave-build',
    title: 'Custom Tech Slave Build',
    subtitle: 'Request a bespoke layout pack built around a Mistress brand, workflow, colours and plugin stack.',
    tier: 'custom',
    status: 'request-only',
    priceLabel: 'Quote required',
    accent: '#FBBF24',
    defaultPreset: 'style-marketplace',
    compatiblePresets: ['empire-command', 'mistress-creator', 'sub-dashboard', 'little-black-book', 'style-marketplace', 'vertical-live-room'],
    tags: ['custom', 'request', 'tech-slave'],
    previewNotes: ['Future flow: submit brief, inspiration screenshots and required modules.', 'Can connect to GitHub contributor/expression-of-interest workflow later.'],
  },
];

export function getUiLayoutStylePacksByTier(tier: UiLayoutStylePackTier) {
  return UI_LAYOUT_STYLE_PACKS.filter((pack) => pack.tier === tier);
}

export function getUiLayoutStylePacksForPreset(presetId: UiLayoutPresetId) {
  return UI_LAYOUT_STYLE_PACKS.filter((pack) => pack.compatiblePresets.includes(presetId));
}

export function getInstalledUiLayoutStylePacks() {
  return UI_LAYOUT_STYLE_PACKS.filter((pack) => pack.status === 'installed');
}
