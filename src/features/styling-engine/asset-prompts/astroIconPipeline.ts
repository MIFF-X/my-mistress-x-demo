export type MxIconPipelineFormat =
  | 'svg'
  | 'svg-sprite'
  | 'icon-font'
  | 'png'
  | 'favicon'
  | 'tsx'
  | 'jsx'
  | 'vue'
  | 'web-component'
  | 'flutter'
  | 'json';

export type MxIconSourceKind = 'local-svg' | 'iconify-json' | 'generated-mx' | 'licensed-reference';

export type MxIconPipelineStep = {
  id: string;
  title: string;
  description: string;
  headmistressAction: string;
};

export type MxIconCollectionPreset = {
  id: string;
  name: string;
  description: string;
  sourceKinds: MxIconSourceKind[];
  defaultFormats: MxIconPipelineFormat[];
  tags: string[];
  publishTargets: string[];
};

export const mxIconForgeSteps: MxIconPipelineStep[] = [
  {
    id: 'add-icons',
    title: 'Add icons',
    description: 'Upload custom SVG icons, import configured icon sets, or create original MX icon concepts.',
    headmistressAction: 'Add icons to a new or existing collection.',
  },
  {
    id: 'organize',
    title: 'Organize',
    description: 'Group icons by role, plugin, theme, collection, status, pack tier, and app market category.',
    headmistressAction: 'Tag, rename, sort, and bundle icons into reusable packs.',
  },
  {
    id: 'edit',
    title: 'Edit',
    description: 'Preview icons across swatches, set active and inactive colors, and assign accessibility labels.',
    headmistressAction: 'Adjust icon metadata and visual states before publishing.',
  },
  {
    id: 'download',
    title: 'Download icon font or SVG',
    description: 'Export SVG, SVG sprite, icon font, PNG, favicon, React, Vue, web component, Flutter, and JSON manifests.',
    headmistressAction: 'Choose export formats for web, app, plugin, and market use.',
  },
  {
    id: 'share-save',
    title: 'Share and save',
    description: 'Save collections to the Headmistress library, share with approved builders, or publish to the app market.',
    headmistressAction: 'Save the finished icon collection and decide where it can be installed.',
  },
];

export const mxIconCollectionPresets: MxIconCollectionPreset[] = [
  {
    id: 'headmistress-tool-icons',
    name: 'Headmistress Tool Icons',
    description: 'Collection-manager icons for add, organize, edit, export, share, publish, review, and install actions.',
    sourceKinds: ['local-svg', 'generated-mx'],
    defaultFormats: ['svg', 'svg-sprite', 'tsx', 'json'],
    tags: ['headmistress', 'tooling', 'app-market', 'plugin-controls'],
    publishTargets: ['asset-generator', 'app-market', 'admin-dashboard'],
  },
  {
    id: 'profile-status-icons',
    name: 'Profile Status Icons',
    description: 'Neutral role and status icons for profile cards, discovery filters, contact cards, and chat headers.',
    sourceKinds: ['generated-mx'],
    defaultFormats: ['svg', 'svg-sprite', 'png', 'json'],
    tags: ['profiles', 'status', 'contacts', 'discovery'],
    publishTargets: ['profile-cards', 'discovery', 'chat'],
  },
  {
    id: 'live-stage-icons',
    name: 'Live Stage Icons',
    description: 'Icons for rooms, gifts, viewer actions, overlays, countdowns, and stage commerce controls.',
    sourceKinds: ['generated-mx', 'iconify-json'],
    defaultFormats: ['svg', 'svg-sprite', 'tsx', 'png', 'json'],
    tags: ['live', 'overlay', 'events', 'stage'],
    publishTargets: ['live-shows', 'watch-with-mistress', 'stream-deck'],
  },
  {
    id: 'collector-icons',
    name: 'Collector Icons',
    description: 'Sticker album, badge wall, collection progress, rarity, and pack-release icons.',
    sourceKinds: ['generated-mx', 'local-svg'],
    defaultFormats: ['svg', 'png', 'web-component', 'json'],
    tags: ['collector', 'stickers', 'badges', 'rewards'],
    publishTargets: ['sticker-album', 'badge-wall', 'chat-expression-suite'],
  },
];

export const mxIconForgeRequirements = {
  localIcons: 'Automatically embed and optimize custom SVG icons from local collections.',
  iconSets: 'Support configured @iconify-json/* packages through an allow-list and metadata registry.',
  intelligentSprites: 'Render repeated icons through deduplicated symbol/use sprites where supported.',
  fullyDynamic: 'Allow icons to be referenced by dynamic string keys without manual imports in feature screens.',
  multiDevice: 'Preview and export packs for web, mobile, tablet, and app-market surfaces.',
  marketReady: 'Every published pack needs name, tags, preview image, formats, license note, install target, and review status.',
} as const;
