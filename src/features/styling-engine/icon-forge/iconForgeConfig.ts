import type { MxIconCollection, MxIconForgeAction } from './iconForgeTypes';

export const mxIconForgeActions: MxIconForgeAction[] = [
  {
    id: 'add-icons',
    title: 'Add icons',
    description: 'Upload local SVG files, import approved icon packs, or generate original MX icons.',
    icon: '＋',
  },
  {
    id: 'organize',
    title: 'Organize',
    description: 'Create collections, tags, roles, themes, categories, and app market release groups.',
    icon: '▦',
  },
  {
    id: 'edit',
    title: 'Edit',
    description: 'Rename, recolor, optimize, preview, and assign active or inactive visual states.',
    icon: '✎',
  },
  {
    id: 'download',
    title: 'Download icon font or SVG',
    description: 'Export SVG, SVG sprites, icon fonts, PNG, favicon, component files, and metadata JSON.',
    icon: '⇩',
  },
  {
    id: 'share-save',
    title: 'Share and Save',
    description: 'Save to the Headmistress library, share with approved builders, or publish to the app market.',
    icon: '⌯',
  },
  {
    id: 'publish-market',
    title: 'Publish to App Market',
    description: 'Package collections with previews, license notes, install targets, and review status.',
    icon: '◇',
  },
  {
    id: 'assign-plugin',
    title: 'Assign to Plugin',
    description: 'Attach icon packs to chats, dashboards, profile cards, stickers, live overlays, or plugin menus.',
    icon: '◎',
  },
  {
    id: 'apply-theme',
    title: 'Apply Theme',
    description: 'Preview the collection against swatches and apply it to selected platform zones.',
    icon: '✦',
  },
];

export const mxDemoIconCollections: MxIconCollection[] = [
  {
    id: 'mx-tool-icons-starter',
    name: 'MX Tool Icons Starter',
    description: 'Headmistress app market controls for add, organize, edit, export, share, publish, assign, and theme actions.',
    sourceTypes: ['local-svg', 'generated-original'],
    exportFormats: ['svg', 'svg-sprite', 'icon-font', 'react', 'json'],
    iconCount: 8,
    tags: ['tools', 'market', 'headmistress', 'generator'],
    installTargets: ['asset-generator', 'app-market', 'admin-dashboard'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'mx-profile-status-icons',
    name: 'MX Profile Status Icons',
    description: 'Neutral profile, contact, verification, collector, service, and live-ready status markers.',
    sourceTypes: ['generated-original'],
    exportFormats: ['svg', 'svg-sprite', 'png', 'json'],
    iconCount: 16,
    tags: ['profile', 'status', 'cards', 'discovery'],
    installTargets: ['profile-cards', 'chat', 'discovery'],
    updatedAt: '2026-06-01',
  },
];

export const mxIconForgePipelineNotes = {
  localIcons: 'Automatically embed custom SVG icons from local collections.',
  iconSets: 'Support approved @iconify-json/* packages through a configured allow-list.',
  intelligentSprites: 'Deduplicate repeated icons with symbol/use style sprite output.',
  fullyDynamic: 'Allow icon references by string key without direct imports in feature screens.',
  multiDevice: 'Preview collections across mobile, tablet, desktop, and responsive web surfaces.',
  gamified: 'Track views, installs, saves, downloads, and app market engagement for each collection.',
} as const;
