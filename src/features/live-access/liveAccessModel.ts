export type LiveAccessRoomMode = 'public' | 'ticketed' | 'subscription' | 'invite' | 'private';

export type LiveAccessReadiness = 'scaffolded' | 'provider-needed' | 'policy-review';

export type LiveAccessRoomPlan = {
  id: LiveAccessRoomMode;
  title: string;
  badge: string;
  description: string;
  audience: string;
  accessRule: string;
  capacity: string;
  priceRule: string;
  readiness: LiveAccessReadiness;
  tone: string;
  checklist: string[];
};

export type LiveAccessModule = {
  id: string;
  title: string;
  label: string;
  description: string;
  state: string;
  tone: string;
  checklist: string[];
};

export type WatchSessionPlan = {
  id: string;
  title: string;
  access: string;
  schedule: string;
  replay: string;
  tone: string;
  features: string[];
};

export type Guardrail = {
  id: string;
  title: string;
  description: string;
  status: string;
  tone: string;
};

export type GameOverlayPlan = {
  id: string;
  title: string;
  source: string;
  liveUse: string;
  tone: string;
};

export const LIVE_ACCESS_METRICS = [
  { label: 'Room Modes', value: '5', detail: 'Public to private access gates', tone: '#ef4444' },
  { label: 'Paid Access Points', value: '9', detail: 'Calls, chat, gifts, tickets, replays', tone: '#22c55e' },
  { label: 'Watch Sessions', value: '3', detail: 'Synced viewing and commentary', tone: '#60a5fa' },
  { label: 'Safety Gates', value: '6', detail: 'Consent, policy and audit checks', tone: '#f5c542' },
];

export const LIVE_ROOM_PLANS: LiveAccessRoomPlan[] = [
  {
    id: 'public',
    title: 'Public Room',
    badge: 'OPEN',
    description: 'Discovery-friendly room for free audience entry, public chat, visible goals and replay previews.',
    audience: 'All signed-in members',
    accessRule: 'Open join with moderation queue',
    capacity: 'Up to provider limit',
    priceRule: 'Free entry, paid chat and gifts enabled',
    readiness: 'scaffolded',
    tone: '#ef4444',
    checklist: ['Join lobby', 'Paid chat rail', 'Goal bar', 'Moderator tools', 'Replay preview'],
  },
  {
    id: 'ticketed',
    title: 'Ticketed Room',
    badge: 'TICKET',
    description: 'Event room for paid live shows, one-time unlocks, presale countdowns and post-show replay rules.',
    audience: 'Ticket buyers and approved comps',
    accessRule: 'Wallet ticket unlock before join',
    capacity: 'Limited seats or unlimited stream',
    priceRule: 'One-time ticket with optional replay upsell',
    readiness: 'provider-needed',
    tone: '#f97316',
    checklist: ['Ticket purchase', 'Presale window', 'Access receipt', 'Replay upsell', 'Refund policy'],
  },
  {
    id: 'subscription',
    title: 'Subscription Room',
    badge: 'TIER',
    description: 'Membership room for tier perks, recurring access, loyalty prompts and tier-only chat features.',
    audience: 'Active members by tier',
    accessRule: 'Membership tier gate',
    capacity: 'Tier policy controlled',
    priceRule: 'Included in active plan',
    readiness: 'scaffolded',
    tone: '#7dd3fc',
    checklist: ['Tier check', 'Member badge', 'Renewal prompt', 'Exclusive replay', 'Upgrade callout'],
  },
  {
    id: 'invite',
    title: 'Invite / Access Code',
    badge: 'CODE',
    description: 'Private event entry using one-time invite links, access codes, guest lists and host approval.',
    audience: 'Invited members only',
    accessRule: 'Valid code plus optional approval',
    capacity: 'Host selected guest list',
    priceRule: 'Free, paid or comped per invite',
    readiness: 'policy-review',
    tone: '#c084fc',
    checklist: ['Access code', 'Guest list', 'Expiry window', 'Revocation', 'Audit event'],
  },
  {
    id: 'private',
    title: 'Private Room',
    badge: '1:1',
    description: 'High-control room for private paid sessions, limited chat, stronger consent prompts and clear end states.',
    audience: 'Host and approved participant',
    accessRule: 'Booking or direct host approval',
    capacity: 'One-to-one or small group',
    priceRule: 'Booking pre-authorization and extensions',
    readiness: 'provider-needed',
    tone: '#f472b6',
    checklist: ['Booking link', 'Wallet hold', 'Timer', 'Extension prompt', 'Session receipt'],
  },
];

export const PAID_CALL_READY_ITEMS: LiveAccessModule[] = [
  {
    id: 'booking-request',
    title: 'Booking Request',
    label: 'INTAKE',
    description: 'Request phone or video time, choose schedule, add notes and lock the initial rate.',
    state: 'Existing bookings screen',
    tone: '#22c55e',
    checklist: ['Host selector', 'Date and time chips', 'Notes', 'Duration', 'Price preview'],
  },
  {
    id: 'wallet-preauth',
    title: 'Wallet Pre-authorization',
    label: 'HOLD',
    description: 'Reserve funds before a private room or paid call starts, then settle against actual duration.',
    state: 'Backend provider needed',
    tone: '#f5c542',
    checklist: ['Balance check', 'Hold amount', 'Extension cap', 'Release on cancel', 'Receipt trail'],
  },
  {
    id: 'timer-extension',
    title: 'Timer and Extensions',
    label: 'LIVE',
    description: 'Show live elapsed time, remaining window, auto-end state and controlled extension offers.',
    state: 'Scaffolded in bookings',
    tone: '#60a5fa',
    checklist: ['Start timer', 'Remaining time', 'Extend by minutes', 'Auto-end copy', 'Complete action'],
  },
  {
    id: 'calendar-reminders',
    title: 'Calendar and Reminders',
    label: 'REMIND',
    description: 'Prepare push reminders, calendar handoff, missed-session handling and reschedule prompts.',
    state: 'Integration backlog',
    tone: '#c084fc',
    checklist: ['Reminder queue', 'Calendar export', 'No-show state', 'Reschedule flow', 'Time-zone label'],
  },
];

export const LIVE_SHOW_SIDEBAR_MODULES: LiveAccessModule[] = [
  {
    id: 'paid-chat',
    title: 'Paid Chat',
    label: 'CHAT',
    description: 'Message rail with paid highlights, pinned host notes, slow mode and paid-only callouts.',
    state: 'Connect to chat pricing',
    tone: '#ff0055',
    checklist: ['Highlight price', 'Pinned host note', 'Slow mode', 'Paid-only filter'],
  },
  {
    id: 'micro-gifts',
    title: 'Micro-gifts',
    label: 'GIFT',
    description: 'Fast tribute buttons with animation hooks, wallet receipts and supporter attribution.',
    state: 'Live tips available',
    tone: '#f472b6',
    checklist: ['Quick gift rail', 'Gift animation', 'Receipt', 'Top supporter feed'],
  },
  {
    id: 'requests',
    title: 'Request Queue',
    label: 'ASK',
    description: 'Paid requests with accept, decline, fulfil and cancel states for host-controlled live pacing.',
    state: 'Existing live request flow',
    tone: '#f97316',
    checklist: ['Request amount', 'Host action', 'Fulfil state', 'Refund path'],
  },
  {
    id: 'goal-bars',
    title: 'Goal Bars',
    label: 'GOAL',
    description: 'Public fund progress, timed goals, celebration moments and replay annotations.',
    state: 'Gifts and goals handoff',
    tone: '#d4af37',
    checklist: ['Progress bar', 'Timed target', 'Contributor list', 'Goal complete event'],
  },
  {
    id: 'moderation',
    title: 'Moderation',
    label: 'SAFE',
    description: 'Flag room, pause chat, remove viewer and hand off incidents to admin review.',
    state: 'Scaffolded controls',
    tone: '#60a5fa',
    checklist: ['Pause chat', 'Flag room', 'Viewer action', 'Admin queue handoff'],
  },
  {
    id: 'replay-unlocks',
    title: 'Replay Unlocks',
    label: 'REPLAY',
    description: 'Set archive mode after the show: private archive, member replay, paid replay or teaser.',
    state: 'Backend archive needed',
    tone: '#a3e635',
    checklist: ['Archive choice', 'Replay price', 'Access expiry', 'Teaser preview'],
  },
];

export const WATCH_SESSION_PLANS: WatchSessionPlan[] = [
  {
    id: 'premiere-watch',
    title: 'Watch With Mistress Premiere',
    access: 'Ticketed access with paid chat',
    schedule: 'Scheduled room with lobby countdown',
    replay: 'Paid replay for ticket holders first',
    tone: '#ef4444',
    features: ['Synchronized viewing', 'Host commentary', 'Reaction rail', 'Replay timer'],
  },
  {
    id: 'member-watch',
    title: 'Member Watch Party',
    access: 'Subscription tier gate',
    schedule: 'Recurring weekly session',
    replay: 'Members-only replay window',
    tone: '#7dd3fc',
    features: ['Tier badges', 'Member-only chat', 'Polls', 'Renewal prompt'],
  },
  {
    id: 'private-watch',
    title: 'Private Watch Session',
    access: 'Booking plus wallet pre-authorization',
    schedule: 'One-to-one or small group booking',
    replay: 'Private archive or no replay',
    tone: '#f472b6',
    features: ['Private room', 'Session timer', 'Extension offer', 'Consent checkpoint'],
  },
];

export const SCREEN_SHARE_GUARDRAILS: Guardrail[] = [
  {
    id: 'explicit-consent',
    title: 'Explicit Consent',
    description: 'Every participant must opt in before a screen-share watch session starts, with revocation available.',
    status: 'Required',
    tone: '#22c55e',
  },
  {
    id: 'no-sensitive-data',
    title: 'No Credential or Payment Data',
    description: 'The session copy blocks passwords, payment data, account recovery screens and private identifiers.',
    status: 'Required',
    tone: '#f5c542',
  },
  {
    id: 'content-policy',
    title: 'Content Policy Review',
    description: 'Shared material needs provider policy checks, report controls and post-session audit records.',
    status: 'Legal review',
    tone: '#60a5fa',
  },
  {
    id: 'recording-rules',
    title: 'Recording and Replay Rules',
    description: 'Host chooses private archive, paid replay, member replay or no recording before the room opens.',
    status: 'Provider needed',
    tone: '#c084fc',
  },
];

export const GAME_OVERLAY_QUEUE: GameOverlayPlan[] = [
  {
    id: 'trivia',
    title: 'Trivia Overlay',
    source: 'Quiz importer inspiration',
    liveUse: 'Questions, answers, timers and score board inside live rooms.',
    tone: '#60a5fa',
  },
  {
    id: 'raffle',
    title: 'Raffle and Prize Draw',
    source: 'Live goals and supporter list',
    liveUse: 'Entry from gifts, tickets or chat actions with a host-controlled draw.',
    tone: '#d4af37',
  },
  {
    id: 'scratch',
    title: 'Scratch / Reveal Card',
    source: 'Card and sticker economy',
    liveUse: 'Timed reveal overlay for rewards, coupons, stickers or replay unlocks.',
    tone: '#f97316',
  },
  {
    id: 'bingo',
    title: 'Bingo / Watch Bingo',
    source: 'Watch session engagement',
    liveUse: 'Shared bingo board tied to stream moments and host prompts.',
    tone: '#a3e635',
  },
  {
    id: 'spin-wheel',
    title: 'Spin Wheel',
    source: 'Gifts and goals',
    liveUse: 'Goal finale, tip milestone or paid request reward picker.',
    tone: '#f472b6',
  },
  {
    id: 'hangman',
    title: 'Ongoing Word Game',
    source: 'Lightweight live-room game',
    liveUse: 'Chat-driven guesses with moderation, timers and leaderboard hooks.',
    tone: '#c084fc',
  },
];

export const LIVE_ROOM_PIPELINE = [
  'Plan room mode',
  'Schedule or open now',
  'Check wallet and access gate',
  'Run live room with chat, requests and gifts',
  'Set replay and receipts',
  'Send audit events to admin review',
];
