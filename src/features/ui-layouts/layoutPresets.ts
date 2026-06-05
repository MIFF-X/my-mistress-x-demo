export type UiLayoutAudience = 'HEADMISTRESS' | 'MISTRESS' | 'SUB' | 'ADMIN' | 'ALL';

export type UiLayoutSurface =
  | 'web'
  | 'tablet'
  | 'mobile'
  | 'app'
  | 'live';

export type UiLayoutPresetId =
  | 'empire-command'
  | 'mistress-creator'
  | 'sub-dashboard'
  | 'little-black-book'
  | 'style-marketplace'
  | 'vertical-live-room';

export type UiLayoutPreset = {
  id: UiLayoutPresetId;
  title: string;
  subtitle: string;
  audience: UiLayoutAudience[];
  surfaces: UiLayoutSurface[];
  accent: string;
  icon: string;
  webPattern: string;
  appPattern: string;
  primaryModules: string[];
  notes: string[];
};

export const UI_LAYOUT_PRESETS: UiLayoutPreset[] = [
  {
    id: 'empire-command',
    title: 'Empire Command',
    subtitle: 'Headmistress and admin oversight dashboard for money, safety, compliance and system health.',
    audience: ['HEADMISTRESS', 'ADMIN'],
    surfaces: ['web', 'tablet', 'app'],
    accent: '#D4AF37',
    icon: '👑',
    webPattern: 'Persistent left sidebar, top command bar, four KPI cards, analytics canvas and right-side risk/insight rail.',
    appPattern: 'Bottom tabs, stacked KPI cards, swipeable insight cards and compact action queue.',
    primaryModules: ['Revenue', 'Compliance', 'Admin Queue', 'AI Insights', 'System Status'],
    notes: ['Best for Headmistress HQ mode.', 'Keeps command controls visible without overwhelming the app view.'],
  },
  {
    id: 'mistress-creator',
    title: 'Mistress Creator',
    subtitle: 'Creator dashboard for earnings, content sales, live rooms, goals, subs and monetisation controls.',
    audience: ['MISTRESS', 'HEADMISTRESS', 'ADMIN'],
    surfaces: ['web', 'tablet', 'mobile', 'app'],
    accent: '#B026FF',
    icon: '😈',
    webPattern: 'Sidebar plus wide creator stats, sales chart, recent activity, top content and quick-action footer.',
    appPattern: 'Creator profile card first, then swipe rows for earnings, live, chat, goals and content drops.',
    primaryModules: ['Earnings', 'Live Shows', 'PPV', 'Goals', 'Subs', 'Messages'],
    notes: ['Designed for daily creator use.', 'Keeps money actions one tap away on app.'],
  },
  {
    id: 'sub-dashboard',
    title: 'Sub Dashboard',
    subtitle: 'Supporter view for wallet, favourites, tasks, badges, sticker album, ranks and live access.',
    audience: ['SUB'],
    surfaces: ['web', 'tablet', 'mobile', 'app'],
    accent: '#8B5CF6',
    icon: '🐾',
    webPattern: 'Compact left rail, favourite Mistress strip, wallet panel, active tasks and leaderboard progress.',
    appPattern: 'Bottom tabs with wallet, favourites, chat, tasks and collection progress cards.',
    primaryModules: ['Wallet', 'Favourites', 'Chat', 'Tasks', 'Stickers', 'Leaderboard'],
    notes: ['Makes spend, status and collection progress visible.', 'Supports daily login and streak widgets later.'],
  },
  {
    id: 'little-black-book',
    title: 'Little Black Book',
    subtitle: 'Rolodex/contact-card layout for VIPs, notes, categories, icon tags and quick filters.',
    audience: ['MISTRESS', 'HEADMISTRESS', 'ADMIN'],
    surfaces: ['web', 'tablet', 'app'],
    accent: '#A855F7',
    icon: '📖',
    webPattern: 'Searchable contact table with stat cards, filters, network overview and recent interactions rail.',
    appPattern: 'Search first, segmented filters, Pokemon-style contact cards and private-note drawer.',
    primaryModules: ['Contacts', 'VIPs', 'Notes', 'Tags', 'Ratings', 'Recent Interactions'],
    notes: ['Built for the digital Rolodex workflow.', 'Colour coding and grey/highlight icons fit this layout.'],
  },
  {
    id: 'style-marketplace',
    title: 'Style Marketplace',
    subtitle: 'Theme, plugin, widget and custom UI pack store for free, paid and bespoke dashboard styles.',
    audience: ['ALL'],
    surfaces: ['web', 'tablet', 'mobile', 'app'],
    accent: '#FBBF24',
    icon: '🛍️',
    webPattern: 'Hero marketplace header, free/paid/custom columns, featured carousel, plugin grid and installed list.',
    appPattern: 'Tabbed marketplace with horizontal featured packs, installed cards and one-tap preview/apply actions.',
    primaryModules: ['Free Packs', 'Paid Packs', 'Custom Builder', 'Installed Plugins', 'Quick Actions'],
    notes: ['This becomes the foundation for UI style packs.', 'Can connect to Tech Slave/custom build requests later.'],
  },
  {
    id: 'vertical-live-room',
    title: 'Vertical Live Room',
    subtitle: 'TikTok-style live and video layout with chat, viewer eye count, gifts, requests and recommended rooms.',
    audience: ['ALL'],
    surfaces: ['mobile', 'app', 'live', 'web'],
    accent: '#FF2F6D',
    icon: '📺',
    webPattern: 'Centered vertical video, right-side chat/recommendations, floating actions and viewer counter.',
    appPattern: 'Full-screen vertical live, bottom chat composer, gift animation layer and swipeable room discovery.',
    primaryModules: ['Live Video', 'Chat Sidebar', 'Gifts', 'Requests', 'Viewer Count', 'Recommended Rooms'],
    notes: ['Use this for Watch With Mistress and live rooms.', 'Viewer eye icon and gift animation hook belong here.'],
  },
];

export function getUiLayoutPreset(id: UiLayoutPresetId) {
  return UI_LAYOUT_PRESETS.find((preset) => preset.id === id);
}

export function getUiLayoutPresetsForAudience(audience: UiLayoutAudience) {
  return UI_LAYOUT_PRESETS.filter(
    (preset) => preset.audience.includes('ALL') || preset.audience.includes(audience),
  );
}
