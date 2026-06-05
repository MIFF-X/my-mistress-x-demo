import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { DashboardModuleScaffoldPayload } from './DashboardModuleScaffoldScreen';
import { getDashboardModuleServiceContract } from './dashboardModuleServiceContracts';

type ModuleStatus = 'planned' | 'scaffolded' | 'wired' | 'live';
type ModuleRouteKind = 'direct' | 'nearby' | 'missing';

type RegisterModule = {
  title: string;
  category: string;
  status: ModuleStatus;
  summary: string;
  routeKind?: ModuleRouteKind;
  targetView?: string;
  targetLabel?: string;
  relatedView?: string;
  relatedLabel?: string;
};

type RegisterGroup = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  accentColor: string;
  modules: RegisterModule[];
};

type DashboardModuleRegisterScreenProps = {
  currentRole?: string;
  onOpenModule?: (view: string, scaffold?: DashboardModuleScaffoldPayload) => void;
};

const STATUS_COLORS: Record<ModuleStatus, string> = {
  planned: '#8b9bb4',
  scaffolded: '#f5c542',
  wired: '#38bdf8',
  live: '#1D9E75',
};

const STATUS_ORDER: ModuleStatus[] = ['planned', 'scaffolded', 'wired', 'live'];

const scaffoldModule = (
  title: string,
  category: string,
  summary: string,
  relatedView?: string,
  relatedLabel?: string,
): RegisterModule => ({
  title,
  category,
  status: 'scaffolded',
  routeKind: 'direct',
  targetView: 'moduleScaffold',
  targetLabel: 'Open scaffold',
  relatedView,
  relatedLabel,
  summary,
});

const dashboardRegisterGroups: RegisterGroup[] = [
  {
    id: 'sub-dashboard',
    eyebrow: 'Sub Dashboard',
    title: 'Personal progress and access hub',
    summary: 'Little Black Book, vault, wallet, TV guide, collections, games, contracts, profile points and recurring tasks.',
    accentColor: '#38bdf8',
    modules: [
      { title: 'Little Black Book', category: 'Relationships', status: 'scaffolded', routeKind: 'direct', targetView: 'littleBlackBook', targetLabel: 'Open', summary: 'Mistress directory, favourites, cards and relationship history.' },
      { title: 'Locked Vault', category: 'Safety', status: 'scaffolded', routeKind: 'direct', targetView: 'subVault', targetLabel: 'Open', summary: 'Sensitive verification references, consent sharing and revocation.' },
      { title: 'Wallet', category: 'Money', status: 'scaffolded', routeKind: 'direct', targetView: 'wallet', targetLabel: 'Open', summary: 'Balance, top-ups, purchases, points and spend visibility.' },
      scaffoldModule('TV Guide', 'Live', 'Live shows, saved reminders, weekly schedules, replay windows and room access.', 'liveAccessStack', 'Open live access stack'),
      scaffoldModule('Achievements / Leaderboards', 'Gamify', 'Leaderboards, badges, trophies, awards, XP and watch points.', 'positions', 'Open positions'),
      scaffoldModule('Collections Book', 'Collect', 'Stickers, pictures, videos, ebooks and per-Mistress collections.', 'inventory', 'Open inventory'),
      { title: 'Favourite Games', category: 'Games', status: 'scaffolded', routeKind: 'direct', targetView: 'gameHub', targetLabel: 'Open', summary: 'Favourite games, played history, quizzes and live game overlays.' },
      scaffoldModule('User Record Log', 'History', 'Interaction records, chat context, gifts, bookings, requests and Mistress activity history.', 'records', 'Open records'),
      scaffoldModule('Contracts / Agreements', 'Consent', 'Agreements, promises, pledges, keeper terms, expiry rules and consent visibility.', 'keeperAllowance', 'Open keeper wallet'),
      scaffoldModule('To-Do Schedule', 'Tasks', 'Daily and weekly tasks, challenges, countdowns, reminders and recurring promises.', 'notifications', 'Open notifications'),
      scaffoldModule('Redemption', 'Rewards', 'Rewards, points, unlocks, milestone exchanges and daily streak redemption.', 'giftsGoals', 'Open gifts and goals'),
      { title: 'Profile Page', category: 'Identity', status: 'scaffolded', routeKind: 'direct', targetView: 'profile', targetLabel: 'Open', summary: 'Public Sub identity, chosen badges, selected modules, XP and watch points.' },
    ],
  },
  {
    id: 'mistress-dashboard',
    eyebrow: 'Mistress Dashboard',
    title: 'Money-making control panel',
    summary: 'Quick checks, calls, live shows, content, store worlds, chat, fulfilment, Rolodex and gamified overlays.',
    accentColor: '#ff0055',
    modules: [
      { title: 'Quick Check Zone', category: 'Inbox', status: 'scaffolded', routeKind: 'direct', targetView: 'quickCheckZone', targetLabel: 'Open', summary: 'Confessions, affirmations, secrets, contracts, bookings and requests in one queue.' },
      { title: 'Rolodex', category: 'Relationships', status: 'scaffolded', routeKind: 'direct', targetView: 'rolodex', targetLabel: 'Open', summary: 'Sub cards, notes, groups, quick tags and relationship management.' },
      { title: 'Bookings / Requests', category: 'Calls', status: 'scaffolded', routeKind: 'direct', targetView: 'bookings', targetLabel: 'Open', summary: 'Paid requests, scheduling, after-live sessions, timers and extensions.' },
      scaffoldModule('Phone / Voice', 'Calls', 'Paid masked calls, timed voice sessions, rates, booking state and availability controls.', 'bookings', 'Open bookings'),
      scaffoldModule('Video Calls', 'Calls', 'Paid timed video sessions, countdowns, extensions and booking calendar flow.', 'bookings', 'Open bookings'),
      { title: 'Live Shows', category: 'Live', status: 'scaffolded', routeKind: 'direct', targetView: 'live', targetLabel: 'Open', summary: 'Ticketed rooms, sidebar chat, viewer count, gifts and requests.' },
      { title: 'Content Library', category: 'Media', status: 'scaffolded', routeKind: 'direct', targetView: 'contentLibrary', targetLabel: 'Open', summary: 'Photo albums, videos, ebooks, music, sticker sets and content zones.' },
      { title: 'PPV Content', category: 'Sales', status: 'scaffolded', routeKind: 'direct', targetView: 'ppv', targetLabel: 'Open', summary: 'Price, unlock, duration, buy-to-keep and subscription bundle paths.' },
      { title: 'E-Store / Vending / Hamper', category: 'Commerce', status: 'scaffolded', routeKind: 'direct', targetView: 'storeSupport', targetLabel: 'Open', summary: 'Store, vending machine, hamper, limited stock and fulfilment flows.' },
      { title: 'Sales Fulfilment', category: 'Orders', status: 'scaffolded', routeKind: 'direct', targetView: 'marketplaceOrders', targetLabel: 'Open', summary: 'Pending, packed, shipped, completed and disputed seller orders.' },
      { title: 'Digital Gifts', category: 'Money', status: 'scaffolded', routeKind: 'direct', targetView: 'giftsGoals', targetLabel: 'Open', summary: 'Micro gifts, animated overlays, contribution moments, wallet flow and receipts.' },
      { title: 'Goals / Wishlist', category: 'Goals', status: 'scaffolded', routeKind: 'direct', targetView: 'wishlist', targetLabel: 'Open', summary: 'Fund goals, wishlist, contribution buttons and visible progress bars.' },
      scaffoldModule('Confessional Booth', 'Inbox', 'Paid/confessional intake, review queue, red-flag path and Mistress-configurable prompts.', 'quickCheckZone', 'Open quick check'),
      scaffoldModule('Worship Altar', 'Ritual', 'Ritual visits, paid support moments, watch points, small tasks and contribution prompts.', 'giftsGoals', 'Open gifts and goals'),
      scaffoldModule('Secret Box / Vault Items', 'Access', 'Locked paid or private access items with permissions, audit history and revocation controls.', 'subVault', 'Open vault'),
      { title: 'Chat / Messages', category: 'Communication', status: 'scaffolded', routeKind: 'direct', targetView: 'chat', targetLabel: 'Open', summary: 'Paid and standard text interaction with buyer context.' },
      { title: 'Gamify Panel', category: 'Games', status: 'scaffolded', routeKind: 'direct', targetView: 'gameHub', targetLabel: 'Open', summary: 'Leaderboards, badges, trophies, streaks, overlays and game tools.' },
      scaffoldModule('Control Overlay', 'Tools', 'Screen share, split-screen, takeover controls, game tools, viewing points and XP overlays.', 'gameHub', 'Open game hub'),
    ],
  },
  {
    id: 'headmistress-dashboard',
    eyebrow: 'Headmistress Control Centre',
    title: 'Platform command layer',
    summary: 'Bank, oversight, books, analytics, content zones, plugin marketplace, moderation, compliance and global controls.',
    accentColor: '#d4af37',
    modules: [
      scaffoldModule('Bank', 'Money', 'Platform revenue, reserves, payouts, money made and financial visibility.', 'headmistressDashboard', 'Open headmistress dashboard'),
      { title: 'Oversight', category: 'Safety', status: 'scaffolded', routeKind: 'direct', targetView: 'admin', targetLabel: 'Open', summary: 'Reports, moderation, audit queues, user control and escalation.' },
      scaffoldModule('The Books', 'Accounting', 'Platform ledger, income categories, money-in, money-out and records exports.', 'records', 'Open records'),
      scaffoldModule('Cash-In / Cash-Out', 'Payments', 'Top-ups, payout batches, cashout review, settlement checks and approval state.', 'adminEconomy', 'Open economy engine'),
      scaffoldModule('Master Rolodex', 'Relationships', 'Admin relationship intelligence, safety checks, global search and Sub/Mistress context.', 'adminUsers', 'Open user command'),
      { title: 'Site Activity Analytics', category: 'Analytics', status: 'scaffolded', routeKind: 'direct', targetView: 'adminAnalytics', targetLabel: 'Open', summary: 'Heatmaps, user activity, feature health and conversion signals.' },
      { title: 'Plugin Marketplace', category: 'Plugins', status: 'scaffolded', routeKind: 'direct', targetView: 'adminPlugins', targetLabel: 'Open', summary: 'Enable, disable, configure, price and document dashboard modules.' },
      scaffoldModule('Load Content', 'Content', 'Admin loader for platform content, templates, seed packs and global assets.', 'contentLibrary', 'Open content library'),
      scaffoldModule('Month-Gated Content', 'Access', 'Month-gated and zone-gated content, shows, libraries and access rules.', 'liveAccessStack', 'Open live access stack'),
      scaffoldModule('Content Zones', 'Access', 'Zone creation and access control for albums, video, ebooks, music, stickers and live rooms.', 'contentLibrary', 'Open content library'),
      scaffoldModule('Leaderboard Master', 'Gamify', 'Global rankings, seasons, awards, trophies and per-Mistress boards.', 'positions', 'Open positions'),
      scaffoldModule('Photo Album', 'Content', 'Platform photo-library oversight, feature placement and zone loading.', 'contentLibrary', 'Open content library'),
      scaffoldModule('Video Library', 'Content', 'Platform video-library oversight, uploads, access and replay placement.', 'contentLibrary', 'Open content library'),
      scaffoldModule('Sticker Sets', 'Content', 'Sticker set loading, marketplace drops, collections and release controls.', 'stickers', 'Open sticker studio'),
      scaffoldModule('Ebook Library', 'Content', 'Ebook library loading, zones, purchase access and bundle visibility.', 'contentLibrary', 'Open content library'),
      scaffoldModule('Music Playlist', 'Content', 'Playlist loading, live-room use, content zones and creator packs.', 'contentLibrary', 'Open content library'),
      scaffoldModule('Wishlist', 'Money', 'Wishlist oversight, reservation review, goal contributions and buyer support paths.', 'wishlist', 'Open wishlist'),
      scaffoldModule('Message / Voice / Video Calls', 'Communication', 'Platform-level chat, voice-call and video-call controls with safety review.', 'adminQueue', 'Open admin queue'),
      scaffoldModule('Live Show', 'Live', 'Live-show setup, settings, performance tracking, access code rooms and saved view counts.', 'live', 'Open live room'),
      { title: 'Games Hub', category: 'Games', status: 'scaffolded', routeKind: 'direct', targetView: 'gameHub', targetLabel: 'Open', summary: 'Quizzes, game shows, mini-games, overlays, awards and game tooling.' },
      scaffoldModule('Locked Secret Box', 'Safety', 'Locked secret-box permissions, high-risk review, consent and audit history.', 'subVault', 'Open vault'),
      scaffoldModule('Confession Booth', 'Safety', 'Confession intake templates, moderation rules, red-flag review and export.', 'quickCheckZone', 'Open quick check'),
      scaffoldModule('Key Keeper', 'Consent', 'Contracts, permissions, pledges, promises, keeper agreements and revocation controls.', 'keeperAllowance', 'Open keeper wallet'),
      scaffoldModule('Goal Contributions', 'Money', 'Public goals, contributions, progress, receipts and creator payout visibility.', 'giftsGoals', 'Open gifts and goals'),
      scaffoldModule('Digital Gifts', 'Money', 'Gift catalogue, pricing, overlays, receipts, live-room effects and revenue tracking.', 'giftsGoals', 'Open gifts and goals'),
      scaffoldModule('Site Challenges / Tasks', 'Tasks', 'Writing, reading, coding, designing, scavenger hunts and platform challenge configuration.', 'notifications', 'Open notifications'),
      scaffoldModule('Ad Revenue Share', 'Money', 'Platform and creator ad revenue reporting for blog, funnel and traffic systems.', 'adminAnalytics', 'Open admin analytics'),
      scaffoldModule('Auction', 'Commerce', 'Auction setup, timed bidding, item review, winner handling and fulfilment oversight.', 'marketplaceInventory', 'Open marketplace inventory'),
      scaffoldModule('E-Store', 'Commerce', 'Store worlds, item review, pricing, stock, bundles and order pathways.', 'marketplaceInventory', 'Open marketplace inventory'),
      scaffoldModule('Wall / Group Wall', 'Community', 'Moderated wall displays, group wall rules, privacy review and owner control.', 'adminQueue', 'Open admin queue'),
      scaffoldModule('Compliance & Security', 'Compliance', 'Identity, consent, moderation, logs, disputes and high-risk review paths.', 'adminQueue', 'Open admin queue'),
    ],
  },
];

function statusLabel(status: ModuleStatus) {
  if (status === 'scaffolded') return 'Scaffolded';
  if (status === 'wired') return 'Wired';
  if (status === 'live') return 'Live';
  return 'Planned';
}

function defaultGroupIdForRole(role?: string) {
  if (role === 'SUB') return 'sub-dashboard';
  if (role === 'MISTRESS') return 'mistress-dashboard';
  if (role === 'HEADMISTRESS' || role === 'ADMIN') return 'headmistress-dashboard';
  return 'all';
}

function routeKindForModule(module: RegisterModule): ModuleRouteKind {
  if (module.routeKind) return module.routeKind;
  if (module.targetView) return module.targetLabel === 'Open' ? 'direct' : 'nearby';
  return 'missing';
}

function getStatusCounts(modules: RegisterModule[]) {
  return modules.reduce<Record<ModuleStatus, number>>(
    (counts, module) => ({
      ...counts,
      [module.status]: counts[module.status] + 1,
    }),
    { planned: 0, scaffolded: 0, wired: 0, live: 0 },
  );
}

function moduleScaffoldPayload(group: RegisterGroup, module: RegisterModule): DashboardModuleScaffoldPayload {
  return {
    title: module.title,
    roleSurface: group.eyebrow,
    category: module.category,
    summary: module.summary,
    relatedView: module.relatedView,
    relatedLabel: module.relatedLabel,
    serviceContract: getDashboardModuleServiceContract(group.eyebrow, module.title),
  };
}

function StatusPill({ status }: { status: ModuleStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: `${color}16` }}>
      <Text style={{ color, fontSize: 10, fontWeight: '900' }}>{statusLabel(status).toUpperCase()}</Text>
    </View>
  );
}

function RoutePill({ module, routeKind }: { module: RegisterModule; routeKind: ModuleRouteKind }) {
  const isScaffoldHome = module.targetView === 'moduleScaffold';
  const label = isScaffoldHome ? 'Scaffold home' : routeKind === 'direct' ? 'Dedicated screen' : routeKind === 'nearby' ? 'Nearby route' : 'Needs route';
  const color = routeKind === 'direct' ? mxTheme.colors.success : routeKind === 'nearby' ? mxTheme.colors.warning : mxTheme.colors.muted;

  return (
    <View style={{ borderColor: `${color}88`, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: `${color}14`, alignSelf: 'flex-start' }}>
      <Text style={{ color, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function RegisterModuleTile({
  group,
  module,
  accentColor,
  onOpenModule,
}: {
  group: RegisterGroup;
  module: RegisterModule;
  accentColor: string;
  onOpenModule?: (view: string, scaffold?: DashboardModuleScaffoldPayload) => void;
}) {
  const routeKind = routeKindForModule(module);
  const targetView = module.targetView || 'moduleScaffold';
  const scaffold = targetView === 'moduleScaffold' ? moduleScaffoldPayload(group, module) : undefined;
  const canOpen = Boolean(targetView && onOpenModule);

  return (
    <Pressable
      disabled={!canOpen}
      onPress={canOpen ? () => onOpenModule?.(targetView, scaffold) : undefined}
      style={{
        backgroundColor: '#101016',
        borderColor: canOpen ? `${accentColor}88` : mxTheme.colors.border,
        borderWidth: 1,
        borderRadius: mxTheme.radius.sm,
        padding: mxTheme.spacing.md,
        flexBasis: 250,
        flexGrow: 1,
        gap: 8,
        opacity: canOpen ? 1 : 0.78,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: accentColor, fontSize: 10, fontWeight: '900' }}>{module.category.toUpperCase()}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>{module.title}</Text>
        </View>
        <StatusPill status={module.status} />
      </View>
      <Text style={{ color: '#d6d6dc', fontSize: 12, lineHeight: 17 }}>{module.summary}</Text>
      <RoutePill module={module} routeKind={routeKind} />
      <Text style={{ color: canOpen ? accentColor : mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>
        {canOpen ? module.targetLabel || 'Open' : 'Needs route'}
      </Text>
    </Pressable>
  );
}

function RegisterGroupPanel({
  group,
  onOpenModule,
}: {
  group: RegisterGroup;
  onOpenModule?: (view: string, scaffold?: DashboardModuleScaffoldPayload) => void;
}) {
  const statusCounts = getStatusCounts(group.modules);
  const directCount = group.modules.filter((module) => routeKindForModule(module) === 'direct').length;

  return (
    <View style={{ gap: mxTheme.spacing.md }}>
      <View style={{ borderTopColor: `${group.accentColor}88`, borderTopWidth: 2, paddingTop: mxTheme.spacing.md, gap: 5 }}>
        <Text style={{ color: group.accentColor, fontSize: 11, fontWeight: '900' }}>{group.eyebrow.toUpperCase()}</Text>
        <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{group.title}</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 13, lineHeight: 19 }}>{group.summary}</Text>
        <Text style={{ color: group.accentColor, fontSize: 11, fontWeight: '900' }}>
          {directCount} route homes, {statusCounts.planned} planned gaps
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
        {group.modules.map((module) => (
          <RegisterModuleTile key={`${group.id}-${module.title}`} group={group} module={module} accentColor={group.accentColor} onOpenModule={onOpenModule} />
        ))}
      </View>
    </View>
  );
}

export function DashboardModuleRegisterScreen({ currentRole, onOpenModule }: DashboardModuleRegisterScreenProps) {
  const defaultGroupId = defaultGroupIdForRole(currentRole);
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId);

  useEffect(() => {
    setSelectedGroupId(defaultGroupId);
  }, [defaultGroupId]);

  const visibleGroups = useMemo(
    () => selectedGroupId === 'all' ? dashboardRegisterGroups : dashboardRegisterGroups.filter((group) => group.id === selectedGroupId),
    [selectedGroupId],
  );
  const visibleModuleEntries = visibleGroups.flatMap((group) => group.modules.map((module) => ({ group, module })));
  const visibleModules = visibleModuleEntries.map((entry) => entry.module);
  const totalModules = visibleModules.length;
  const routedModules = visibleModules.filter((module) => module.targetView).length;
  const routeHomeModules = visibleModules.filter((module) => routeKindForModule(module) === 'direct').length;
  const scaffoldHomeModules = visibleModules.filter((module) => module.targetView === 'moduleScaffold').length;
  const serviceContractPacks = visibleModuleEntries.filter(({ group, module }) => getDashboardModuleServiceContract(group.eyebrow, module.title).stage !== 'scaffold').length;
  const plannedGaps = visibleModules.filter((module) => module.status === 'planned' || routeKindForModule(module) !== 'direct').length;
  const statusCounts = getStatusCounts(visibleModules);

  const filterOptions = [
    { id: 'all', label: 'All Maps', accentColor: mxTheme.colors.accent, count: dashboardRegisterGroups.reduce((count, group) => count + group.modules.length, 0) },
    ...dashboardRegisterGroups.map((group) => ({ id: group.id, label: group.eyebrow, accentColor: group.accentColor, count: group.modules.length })),
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.xl }}>
      <View style={{ gap: mxTheme.spacing.md }}>
        <Text style={{ color: mxTheme.colors.warning, fontSize: 12, fontWeight: '900' }}>DASHBOARD ARCHITECTURE</Text>
        <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Dashboard Module Register</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>
          Role-based tile map from the uploaded Sub, Mistress and Headmistress dashboard sketches. Every major module now has a clickable route home or scaffold home.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.sm }}>
        {filterOptions.map((option) => {
          const active = selectedGroupId === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setSelectedGroupId(option.id)}
              style={{
                backgroundColor: active ? `${option.accentColor}20` : '#101016',
                borderColor: active ? option.accentColor : mxTheme.colors.border,
                borderWidth: 1,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 9,
                minWidth: 110,
              }}
            >
              <Text style={{ color: active ? option.accentColor : mxTheme.colors.text, fontSize: 12, fontWeight: '900' }}>{option.label}</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '800', marginTop: 2 }}>{option.count} tiles</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 170 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>ROLE SURFACES</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{visibleGroups.length}</Text>
        </View>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 170 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>TILES MAPPED</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{totalModules}</Text>
        </View>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 170 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>CLICKABLE NOW</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{routedModules}</Text>
        </View>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 170 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>ROUTE HOMES</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{routeHomeModules}</Text>
        </View>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 170 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>SCAFFOLD HOMES</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{scaffoldHomeModules}</Text>
        </View>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 170 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>CONTRACT PACKS</Text>
          <Text style={{ color: mxTheme.colors.success, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{serviceContractPacks}</Text>
        </View>
        <View style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 170 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>PLANNED GAPS</Text>
          <Text style={{ color: plannedGaps === 0 ? mxTheme.colors.success : mxTheme.colors.warning, fontSize: 28, fontWeight: '900', marginTop: 4 }}>{plannedGaps}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: mxTheme.spacing.md }}>
        {STATUS_ORDER.map((status) => (
          <View key={status} style={{ backgroundColor: '#101016', borderColor: `${STATUS_COLORS[status]}88`, borderWidth: 1, borderRadius: mxTheme.radius.sm, padding: mxTheme.spacing.md, flexGrow: 1, flexBasis: 140 }}>
            <Text style={{ color: STATUS_COLORS[status], fontSize: 11, fontWeight: '900' }}>{statusLabel(status).toUpperCase()}</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>{statusCounts[status]}</Text>
          </View>
        ))}
      </View>

      {visibleGroups.map((group) => (
        <RegisterGroupPanel key={group.id} group={group} onOpenModule={onOpenModule} />
      ))}
    </ScrollView>
  );
}
