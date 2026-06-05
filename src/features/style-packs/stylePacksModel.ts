export type StylePackKind = 'free' | 'paid' | 'custom';
export type InstalledStyleStatus = 'ACTIVE' | 'INSTALLED' | 'SAVED';

export type StylePack = {
  id: string;
  title: string;
  creator: string;
  kind: StylePackKind;
  priceCredits: number;
  status: 'included' | 'locked' | 'active';
  tone: string;
  accent: string;
  secondary: string;
  description: string;
  features: string[];
};

export type StylePluginPack = {
  id: string;
  title: string;
  count: number;
  tone: string;
  glyph: string;
};

export type InstalledStylePack = {
  id: string;
  name: string;
  type: string;
  status: InstalledStyleStatus;
  tone: string;
};

export const STYLE_PACKS: StylePack[] = [
  {
    id: 'dark-royalty',
    title: 'Dark Royalty',
    creator: 'Mistress-X',
    kind: 'free',
    priceCredits: 0,
    status: 'active',
    tone: '#8b5cf6',
    accent: '#111827',
    secondary: '#f5c542',
    description: 'Clean command surfaces with restrained violet and gold accents.',
    features: ['Included', 'Dashboard ready', 'Mobile responsive'],
  },
  {
    id: 'midnight-luxe',
    title: 'Midnight Luxe',
    creator: 'Mistress-X',
    kind: 'free',
    priceCredits: 0,
    status: 'included',
    tone: '#38bdf8',
    accent: '#07111f',
    secondary: '#6366f1',
    description: 'Cool-toned panels, compact charts, and low-glare navigation.',
    features: ['Included', 'One-click apply', 'Creator-safe'],
  },
  {
    id: 'pure-elegance',
    title: 'Pure Elegance',
    creator: 'Mistress-X',
    kind: 'free',
    priceCredits: 0,
    status: 'included',
    tone: '#e5e7eb',
    accent: '#f8fafc',
    secondary: '#0f172a',
    description: 'Bright, minimal, and ready for clean creator portfolio views.',
    features: ['Included', 'Light mode base', 'Readable reports'],
  },
  {
    id: 'styling-engine-royal-noir',
    title: 'Mistress-X Styling Engine',
    creator: 'Headmistress Studio',
    kind: 'custom',
    priceCredits: 0,
    status: 'included',
    tone: '#d4af37',
    accent: '#050505',
    secondary: '#6f0f2a',
    description: 'Generator-ready royal-noir system for SVG/SVGO icon packs, digital gifts, theme packs, premium flyer cards and marketplace manifests.',
    features: ['SVG/SVGO generator', 'Menu card packs', 'Digital gifts'],
  },
  {
    id: 'royal-obsession',
    title: 'Royal Obsession',
    creator: 'Mistress-X',
    kind: 'paid',
    priceCredits: 1999,
    status: 'locked',
    tone: '#a855f7',
    accent: '#220a35',
    secondary: '#d4af37',
    description: 'Premium violet brand language with richer marketplace cards.',
    features: ['Premium', 'Advanced animations', 'Priority support'],
  },
  {
    id: 'crimson-desire',
    title: 'Crimson Desire',
    creator: 'Mistress-X',
    kind: 'paid',
    priceCredits: 2499,
    status: 'locked',
    tone: '#ef4444',
    accent: '#21070a',
    secondary: '#fb7185',
    description: 'High-contrast campaign surfaces for product drops and launches.',
    features: ['Premium', 'Drop calendar ready', 'Sales surfaces'],
  },
  {
    id: 'luxury-gold',
    title: 'Luxury Gold',
    creator: 'Mistress-X',
    kind: 'paid',
    priceCredits: 2499,
    status: 'locked',
    tone: '#d4af37',
    accent: '#1f1603',
    secondary: '#f59e0b',
    description: 'Gold-accented style pack for high-touch creator brands.',
    features: ['Premium', 'Receipt polish', 'Marketplace cards'],
  },
  {
    id: 'bespoke-builder',
    title: 'Bespoke Builder',
    creator: 'AI Style Designer',
    kind: 'custom',
    priceCredits: 0,
    status: 'included',
    tone: '#2dd4bf',
    accent: '#05201d',
    secondary: '#8b5cf6',
    description: 'Describe a visual direction and generate a reusable theme brief.',
    features: ['Custom colors', 'Reusable brief', 'Review required'],
  },
];

export const STYLE_PLUGIN_PACKS: StylePluginPack[] = [
  { id: 'styling-engine', title: 'Mistress-X Styling Engine', count: 100, tone: '#d4af37', glyph: 'MX' },
  { id: 'layout', title: 'Layout Plugins', count: 25, tone: '#8b5cf6', glyph: 'LAY' },
  { id: 'header', title: 'Header Plugins', count: 18, tone: '#d4af37', glyph: 'HDR' },
  { id: 'footer', title: 'Footer Plugins', count: 12, tone: '#38bdf8', glyph: 'FTR' },
  { id: 'effects', title: 'Effects & Animations', count: 30, tone: '#f59e0b', glyph: 'FX' },
  { id: 'widgets', title: 'Extras & Widgets', count: 40, tone: '#fb7185', glyph: 'WID' },
  { id: 'code', title: 'Custom Code Blocks', count: 15, tone: '#2dd4bf', glyph: 'COD' },
];

export const INITIAL_INSTALLED_STYLE_PACKS: InstalledStylePack[] = [
  { id: 'dark-royalty', name: 'Dark Royalty', type: 'Free Style', status: 'ACTIVE', tone: '#8b5cf6' },
  { id: 'styling-engine-royal-noir', name: 'Mistress-X Styling Engine', type: 'Generator Plugin', status: 'INSTALLED', tone: '#d4af37' },
  { id: 'premium-header', name: 'Premium Header Pack', type: 'Plugin Pack', status: 'INSTALLED', tone: '#d4af37' },
  { id: 'neon-effects', name: 'Neon Glow Effects', type: 'Effect Plugin', status: 'INSTALLED', tone: '#38bdf8' },
  { id: 'custom-typography', name: 'Custom Typography Set', type: 'Custom Style', status: 'SAVED', tone: '#2dd4bf' },
];

export function formatStylePackPrice(pack: StylePack) {
  if (pack.priceCredits <= 0) return 'Free';
  return `$${(pack.priceCredits / 100).toFixed(2)}`;
}

export function filterStylePacks(packs: StylePack[], tab: StylePackKind | 'all') {
  if (tab === 'all') return packs;
  return packs.filter((pack) => pack.kind === tab);
}
