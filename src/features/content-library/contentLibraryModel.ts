export type ContentLibraryTab = 'library' | 'playlists' | 'drops' | 'packs';

export type ContentLibraryKind =
  | 'songs'
  | 'videos'
  | 'books'
  | 'movies'
  | 'links'
  | 'pdfs'
  | 'albums'
  | 'ppv';

export type ContentLibraryItem = {
  id: string;
  title: string;
  kind: ContentLibraryKind;
  badge: string;
  status: string;
  access: string;
  owner: string;
  metric: string;
  tone: string;
  summary: string;
  checklist: string[];
};

export type PlaylistPlan = {
  id: string;
  title: string;
  owner: 'Mistress' | 'Sub' | 'System';
  status: string;
  suggestionFlow: string;
  approvalRule: string;
  analytics: string;
  tone: string;
};

export type DropCalendarPlan = {
  id: string;
  title: string;
  dateLabel: string;
  category: 'Sticker' | 'PPV' | 'Live' | 'Replay' | 'Cards' | 'Goal';
  status: string;
  destination: string;
  reminder: string;
  tone: string;
};

export type ContentPackPlan = {
  id: string;
  title: string;
  preview: string;
  unlockRule: string;
  watchlist: string;
  metric: string;
  stickerReward: string;
  tone: string;
};

export type ArchiveRulePlan = {
  id: string;
  title: string;
  visibility: 'Public Replay' | 'Subscription Replay' | 'Paid Replay' | 'Private Archive';
  trigger: string;
  accessRule: string;
  retention: string;
  tone: string;
};

export type ContentLibraryMetric = {
  label: string;
  value: string;
  detail: string;
  tone: string;
};

export const CONTENT_LIBRARY_TABS: Array<{ id: ContentLibraryTab; label: string }> = [
  { id: 'library', label: 'Library' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'drops', label: 'Drop Calendar' },
  { id: 'packs', label: 'Packs & Archive' },
];

export const CONTENT_LIBRARY_METRICS: ContentLibraryMetric[] = [
  {
    label: 'Library Types',
    value: '8',
    detail: 'Songs, videos, books, links, PDFs and PPV',
    tone: '#38bdf8',
  },
  {
    label: 'Playlist States',
    value: '5',
    detail: 'Suggest, approve, add, play and report',
    tone: '#c084fc',
  },
  {
    label: 'Drop Categories',
    value: '6',
    detail: 'Stickers, series, shows, replays, cards and goals',
    tone: '#d4af37',
  },
  {
    label: 'Archive Modes',
    value: '4',
    detail: 'Public, subscription, paid and private',
    tone: '#1D9E75',
  },
];

export const CONTENT_LIBRARY_ITEMS: ContentLibraryItem[] = [
  {
    id: 'songs',
    title: 'Songs and Audio',
    kind: 'songs',
    badge: 'SONG',
    status: 'catalogued',
    access: 'Playlist, room queue or private collection',
    owner: 'Mistress',
    metric: 'Play count and suggestion count',
    tone: '#38bdf8',
    summary: 'Song links, audio notes, spoken-word clips and room request material share one library lane.',
    checklist: ['Title and artist', 'Source URL', 'Room-ready flag', 'Suggestion gate', 'Play-count metric'],
  },
  {
    id: 'videos',
    title: 'Video Library',
    kind: 'videos',
    badge: 'VIDEO',
    status: 'preview shell',
    access: 'Free preview, PPV unlock or subscription replay',
    owner: 'Mistress',
    metric: 'Preview views and unlock rate',
    tone: '#f472b6',
    summary: 'Videos can sit in public previews, private packs, PPV collections and archived live replays.',
    checklist: ['Preview clip', 'Unlock price', 'Entitlement window', 'Watchlist', 'Share state'],
  },
  {
    id: 'books',
    title: 'Books and Guides',
    kind: 'books',
    badge: 'BOOKS',
    status: 'mapped',
    access: 'Library shelf or paid pack',
    owner: 'Mistress',
    metric: 'Reads, saves and completion notes',
    tone: '#d4af37',
    summary: 'Books, guide chapters, workbook PDFs and handbook-style assets are grouped for learning and paid packs.',
    checklist: ['Chapter list', 'PDF link', 'Save to shelf', 'Completion note', 'Related rewards'],
  },
  {
    id: 'movies',
    title: 'Movies and Watch Lists',
    kind: 'movies',
    badge: 'WATCH',
    status: 'planned',
    access: 'Watch room, playlist or recommendation',
    owner: 'Sub',
    metric: 'Suggestions, approvals and plays',
    tone: '#60a5fa',
    summary: 'Movie and watch-list entries support Sub suggestions, Mistress approval and later watch-room handoff.',
    checklist: ['Suggestion form', 'Approval state', 'Add to playlist', 'Watch-room route', 'Play count'],
  },
  {
    id: 'links',
    title: 'Links and References',
    kind: 'links',
    badge: 'LINK',
    status: 'draft',
    access: 'Public-safe or private',
    owner: 'System',
    metric: 'Clicks and shares',
    tone: '#2dd4bf',
    summary: 'External links, blog references, articles and source notes get visibility rules before they appear in profile or packs.',
    checklist: ['URL validation', 'Visibility rule', 'Share copy', 'Click metric', 'Moderation flag'],
  },
  {
    id: 'pdfs',
    title: 'PDF Shelf',
    kind: 'pdfs',
    badge: 'PDF',
    status: 'scaffolded',
    access: 'Free, subscriber, PPV or private',
    owner: 'Mistress',
    metric: 'Downloads and saves',
    tone: '#a3e635',
    summary: 'PDFs, worksheets, menus and premium documents can be packed with videos, stickers and drop events.',
    checklist: ['File metadata', 'Preview page', 'Download rule', 'Pack assignment', 'Receipt note'],
  },
  {
    id: 'albums',
    title: 'Albums and Collections',
    kind: 'albums',
    badge: 'ALBUM',
    status: 'collection shell',
    access: 'Owned album, gifted album or paid pack',
    owner: 'Sub',
    metric: 'Album saves and completions',
    tone: '#c084fc',
    summary: 'Photo, video, audio and collectible albums can be surfaced as owned collections and profile display material.',
    checklist: ['Album cover', 'Item count', 'Owned state', 'Profile display', 'Completion reward'],
  },
  {
    id: 'ppv',
    title: 'PPV Collections',
    kind: 'ppv',
    badge: 'PPV',
    status: 'monetisation link',
    access: 'Wallet unlock, membership or private comp',
    owner: 'Mistress',
    metric: 'Unlocks, revenue and conversion',
    tone: '#f97316',
    summary: 'PPV collections connect content packs, previews, receipts, replay access and related sticker rewards.',
    checklist: ['Preview', 'Price', 'Entitlement', 'Receipt', 'Sticker reward'],
  },
];

export const PLAYLIST_PLANS: PlaylistPlan[] = [
  {
    id: 'mistress-curated',
    title: 'Mistress Curated Playlist',
    owner: 'Mistress',
    status: 'owner controlled',
    suggestionFlow: 'Subs can suggest items, but the creator decides what appears.',
    approvalRule: 'Approve, reject or park suggestions with a note.',
    analytics: 'Track play count, saves, skips and conversion to PPV packs.',
    tone: '#c084fc',
  },
  {
    id: 'sub-suggestions',
    title: 'Sub Suggestion Queue',
    owner: 'Sub',
    status: 'approval flow',
    suggestionFlow: 'Subs submit songs, movies, links or content ideas into a visible queue.',
    approvalRule: 'Creator approval controls whether the suggestion joins a playlist.',
    analytics: 'Track request volume, accepted suggestions and repeat requester activity.',
    tone: '#38bdf8',
  },
  {
    id: 'own-playlist',
    title: 'Add to Own Playlist',
    owner: 'System',
    status: 'buyer collection',
    suggestionFlow: 'Unlocked or public-safe content can be saved into a personal list.',
    approvalRule: 'Private items require entitlement before save and playback.',
    analytics: 'Track saves, replays, and conversion from saved previews.',
    tone: '#1D9E75',
  },
  {
    id: 'room-playlist',
    title: 'Live Room Playlist',
    owner: 'Mistress',
    status: 'room-ready',
    suggestionFlow: 'Approved songs, videos and links can be staged for a live room.',
    approvalRule: 'Host can lock the playlist before the room starts.',
    analytics: 'Track room plays, paid requests and post-room saves.',
    tone: '#d4af37',
  },
];

export const DROP_CALENDAR_PLANS: DropCalendarPlan[] = [
  {
    id: 'sticker-drop',
    title: 'Monthly Sticker Release',
    dateLabel: 'First Friday',
    category: 'Sticker',
    status: 'scheduled',
    destination: 'Sticker Studio and inventory albums',
    reminder: 'Notify collectors, subscribers and recent buyers.',
    tone: '#c084fc',
  },
  {
    id: 'ppv-series',
    title: 'PPV Series Episode',
    dateLabel: 'Weekly',
    category: 'PPV',
    status: 'draft',
    destination: 'PPV Vault and content pack detail page',
    reminder: 'Remind watchers who saved the preview.',
    tone: '#f97316',
  },
  {
    id: 'live-show',
    title: 'Live Show Premiere',
    dateLabel: 'Saturday night',
    category: 'Live',
    status: 'room linked',
    destination: 'Live Access Stack and watch room',
    reminder: 'Send ticket, replay and countdown reminders.',
    tone: '#ef4444',
  },
  {
    id: 'replay-drop',
    title: 'Replay Drop',
    dateLabel: 'Post-show',
    category: 'Replay',
    status: 'archive rule',
    destination: 'Replay vault and subscription feed',
    reminder: 'Notify eligible members after archive processing.',
    tone: '#60a5fa',
  },
  {
    id: 'card-pack',
    title: 'Card Pack Release',
    dateLabel: 'Limited window',
    category: 'Cards',
    status: 'collector ready',
    destination: 'Inventory and profile showcase',
    reminder: 'Notify collectors close to set completion.',
    tone: '#a3e635',
  },
  {
    id: 'goal-finale',
    title: 'Goal Finale',
    dateLabel: 'At goal close',
    category: 'Goal',
    status: 'pledge linked',
    destination: 'Gifts and Goals plus content reward',
    reminder: 'Notify contributors and unlock reward receipts.',
    tone: '#d4af37',
  },
];

export const CONTENT_PACK_PLANS: ContentPackPlan[] = [
  {
    id: 'series-pack',
    title: 'Series Pack Detail',
    preview: 'Trailer, cover, item count and release cadence.',
    unlockRule: 'Wallet unlock, membership tier or private grant.',
    watchlist: 'Preview watchers can save the pack for release reminders.',
    metric: 'Conversion from preview to unlock.',
    stickerReward: 'Episode-completion sticker or pack badge.',
    tone: '#f97316',
  },
  {
    id: 'playlist-pack',
    title: 'Playlist Pack Detail',
    preview: 'Curated audio, video, link and PDF list preview.',
    unlockRule: 'Public sample with paid full-pack entitlement.',
    watchlist: 'Subs can add public-safe entries to their own playlist.',
    metric: 'Play counts, saves and suggestion source.',
    stickerReward: 'Playlist collector badge.',
    tone: '#38bdf8',
  },
  {
    id: 'education-pack',
    title: 'Guide and PDF Pack',
    preview: 'Chapter list, worksheet previews and related videos.',
    unlockRule: 'Subscription tier, PPV purchase or creator comp.',
    watchlist: 'Saves feed into reminder and completion nudges.',
    metric: 'Completion, download and repeat access counts.',
    stickerReward: 'Study streak sticker.',
    tone: '#d4af37',
  },
];

export const ARCHIVE_RULE_PLANS: ArchiveRulePlan[] = [
  {
    id: 'public-replay',
    title: 'Public Replay',
    visibility: 'Public Replay',
    trigger: 'Host marks a safe teaser replay after a live stream.',
    accessRule: 'Public-safe clip only, no private room material.',
    retention: 'Limited teaser window with manual expiry.',
    tone: '#2dd4bf',
  },
  {
    id: 'subscription-replay',
    title: 'Subscription Replay',
    visibility: 'Subscription Replay',
    trigger: 'Room archive is attached to an eligible membership tier.',
    accessRule: 'Active subscription and room access checks.',
    retention: 'Available while tier entitlement remains active.',
    tone: '#7dd3fc',
  },
  {
    id: 'paid-replay',
    title: 'Paid Replay',
    visibility: 'Paid Replay',
    trigger: 'Host creates a paid replay drop from a recorded room.',
    accessRule: 'Wallet unlock with receipt and expiry.',
    retention: 'Configurable access window.',
    tone: '#f97316',
  },
  {
    id: 'private-archive',
    title: 'Private Archive',
    visibility: 'Private Archive',
    trigger: 'Host saves stream internally for review or reuse.',
    accessRule: 'Creator/Admin only, no buyer-facing route.',
    retention: 'Internal retention rule and deletion review.',
    tone: '#ef4444',
  },
];
