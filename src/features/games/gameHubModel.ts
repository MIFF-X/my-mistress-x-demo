export type GameHubTab = 'available' | 'favorites' | 'history' | 'overlays';

export type GameHubPlanKind = 'quiz-import' | 'hosted-quiz' | 'emoji-reaction' | 'overlay' | 'history';

export type GameHubPlan = {
  id: string;
  title: string;
  badge: string;
  kind: GameHubPlanKind;
  status: string;
  audience: string;
  timing: string;
  source: string;
  summary: string;
  tone: string;
  favorite: boolean;
  launchChecklist: string[];
  productionHooks: string[];
};

export type GameHubMetric = {
  label: string;
  value: string;
  detail: string;
  tone: string;
};

export type GameImportAdapter = {
  id: string;
  title: string;
  provider: string;
  inputRule: string;
  status: string;
  tone: string;
  debugTrail: string[];
  safety: string[];
};

export type HostedQuizStage = {
  id: string;
  label: string;
  owner: 'Admin' | 'Creator' | 'Player' | 'System';
  detail: string;
  tone: string;
};

export type EmojiReactionMode = {
  id: string;
  title: string;
  roomRule: string;
  scoring: string;
  timing: string;
  accessibility: string;
  tone: string;
};

export type LiveGameOverlayPlan = {
  id: string;
  title: string;
  route: string;
  trigger: string;
  payoutOrResult: string;
  state: string;
  tone: string;
};

export type GameHubBrowserSmokeTarget = {
  id: string;
  title: string;
  route: string;
  status: string;
  checkpoint: string;
  evidence: string[];
  tone: string;
};

export type GameHistoryEvent = {
  id: string;
  title: string;
  actor: string;
  result: string;
  detail: string;
  status: string;
  tone: string;
};

export type GameHubQuizImportRecord = {
  id: string;
  providerId: string;
  provider: string;
  title: string;
  status: 'preview_ready' | 'provider_lookup_required' | 'draft_ready' | string;
  input: string;
  internalQuizId: string;
  questionCount: number;
  safety: string[];
  debugTrail: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type HostedQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex?: number;
  points: number;
  explanation?: string;
};

export type HostedQuizScore = {
  playerId: string;
  answered: number;
  correct: number;
  score: number;
  lastAnsweredAt: string;
};

export type GameHubHostedQuizRecord = {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'closed' | string;
  sourceImportId?: string;
  playCode: string;
  questions: HostedQuizQuestion[];
  entryFee: number;
  questionCount: number;
  answerCount: number;
  entryFeeCredits: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scores?: HostedQuizScore[];
};

export type HostedQuizOverlaySnapshot = {
  id: string;
  overlayId: string;
  quizId: string;
  quizTitle: string;
  playCode: string;
  status: 'draft' | 'published' | 'closed' | string;
  questionCount: number;
  answerCount: number;
  playerCount: number;
  leader?: HostedQuizScore;
  scoreboard: HostedQuizScore[];
  currentQuestion?: {
    id: string;
    prompt: string;
    optionCount: number;
    answeredCount: number;
  };
  liveRoomEvent: {
    type: 'hosted_quiz_score_snapshot' | string;
    topic: string;
    payloadVersion: number;
  };
  generatedAt: string;
};

export type GameHubOverlaySocketReceiptRecord = {
  id: string;
  quizId?: string;
  overlayId: string;
  roomId: string;
  roomKind?: string;
  eventName: string;
  status: string;
  source: string;
  transport: string;
  recipientUserId?: string;
  socketRoom?: string;
  payloadVersion?: number;
  diagnostic: Record<string, unknown>;
  createdAt: string;
};

export type GameHubOverlayDeliveryDiagnostics = {
  totalReceipts: number;
  emittedCount: number;
  joinedCount: number;
  failedCount: number;
  latestStatus?: string;
  latestAt?: string;
  rooms: Array<{
    roomId: string;
    count: number;
    latestAt: string;
  }>;
};

export type GameHubGameEntryEntitlementRecord = {
  id: string;
  userId: string;
  gameType: 'hosted_quiz' | 'reaction_room' | string;
  gameId: string;
  creatorUserId: string;
  entryFeeCredits: number;
  status: 'active' | string;
  walletLedgerId?: string;
  creatorWalletLedgerId?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type GameHubReactionRoomRecord = {
  id: string;
  modeId: string;
  title: string;
  status: 'waiting' | 'active' | 'closed' | string;
  roomCode: string;
  targetReaction: string;
  prompt?: string;
  roundDurationSeconds: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participantCount: number;
  scoreCount: number;
  entryFeeCredits: number;
};

export type GameHubReactionRoundRecord = {
  id: string;
  roomId: string;
  status: 'open' | 'closed' | string;
  targetReaction: string;
  prompt?: string;
  durationSeconds: number;
  startedAt: string;
  closedAt?: string;
};

export type GameHubReactionParticipantRecord = {
  id: string;
  roomId: string;
  playerId: string;
  displayName?: string;
  joinedAt: string;
};

export type GameHubReactionScoreRecord = {
  id: string;
  roomId: string;
  roundId: string;
  playerId: string;
  reaction: string;
  reactionTimeMs?: number;
  correct: boolean;
  pointsAwarded: number;
  scoredAt: string;
};

export type GameHubReactionScoreSummary = {
  playerId: string;
  score: number;
  rounds: number;
  correct: number;
  bestReactionTimeMs?: number;
  lastScoredAt: string;
};

export type GameHubReactionRoundSnapshot = {
  id: string;
  overlayId: string;
  roomId: string;
  roomCode: string;
  roundId: string;
  status: 'open' | 'closed' | string;
  targetReaction: string;
  prompt?: string;
  participantCount: number;
  scoreCount: number;
  leader?: GameHubReactionScoreSummary;
  scoreboard: GameHubReactionScoreSummary[];
  liveRoomEvent: {
    type: 'emoji_reaction_score_snapshot' | string;
    topic: string;
    payloadVersion: number;
  };
  generatedAt: string;
};

export type GameHubSummary = {
  generatedAt: string;
  source: 'backend' | 'static' | string;
  metrics: GameHubMetric[];
  plans: GameHubPlan[];
  importAdapters: GameImportAdapter[];
  hostedQuizStages: HostedQuizStage[];
  reactionModes: EmojiReactionMode[];
  liveOverlays: LiveGameOverlayPlan[];
  historyEvents: GameHistoryEvent[];
  favourites: GameHubPlan[];
  quizImportBacklog: GameHubQuizImportRecord[];
  hostedQuizBacklog?: GameHubHostedQuizRecord[];
  overlayScoreSnapshots?: HostedQuizOverlaySnapshot[];
  overlaySocketReceipts?: GameHubOverlaySocketReceiptRecord[];
  overlayDeliveryDiagnostics?: GameHubOverlayDeliveryDiagnostics;
  reactionRoomBacklog?: GameHubReactionRoomRecord[];
  browserSmokeTargets?: GameHubBrowserSmokeTarget[];
  nextProductionSteps: string[];
};

export const GAME_HUB_TABS: Array<{ id: GameHubTab; label: string }> = [
  { id: 'available', label: 'Available' },
  { id: 'favorites', label: 'Favourites' },
  { id: 'history', label: 'History' },
  { id: 'overlays', label: 'Live Overlays' },
];

export const GAME_HUB_METRICS: GameHubMetric[] = [
  {
    label: 'Import Adapters',
    value: '3',
    detail: 'PIN, local JSON, hosted quiz',
    tone: '#60a5fa',
  },
  {
    label: 'Room Modes',
    value: '4',
    detail: 'Solo, squad, public, host-led',
    tone: '#f472b6',
  },
  {
    label: 'Live Overlays',
    value: '8',
    detail: 'Trivia, raffle, bingo, casino and cards',
    tone: '#d4af37',
  },
  {
    label: 'Audit Events',
    value: '24h',
    detail: 'Recent game launches and score logs',
    tone: '#1D9E75',
  },
];

export const GAME_HUB_PLANS: GameHubPlan[] = [
  {
    id: 'quiz-import',
    title: 'Quiz Import Adapter',
    badge: 'PIN',
    kind: 'quiz-import',
    status: 'persistent API ready',
    audience: 'Admin and Mistress',
    timing: 'Pre-show setup',
    source: 'Get-Kahoot-ID clean-room pattern',
    summary: 'Resolve external quiz PINs into internal quiz IDs with provider adapters, validation notes and debug logs.',
    tone: '#60a5fa',
    favorite: true,
    launchChecklist: ['Provider selector', 'PIN -> quiz ID lookup', 'Import preview', 'Debug trail', 'Safe retry state'],
    productionHooks: ['POST /games/quiz/import', 'GET /games/quiz/imports', 'GET /games/quiz/imports/:id/logs', 'DELETE /games/quiz/imports/:id', 'game_hub_quiz_imports row'],
  },
  {
    id: 'hosted-quiz',
    title: 'Hosted Quiz Night',
    badge: 'QUIZ',
    kind: 'hosted-quiz',
    status: 'paid-entry gated',
    audience: 'Creator and Sub',
    timing: 'Scheduled or instant',
    source: 'alertis-quiz admin/play flow',
    summary: 'Private admin builder, gated login, public play page, question editor, score tracking and result handoff.',
    tone: '#c084fc',
    favorite: true,
    launchChecklist: ['Admin setup', 'Question editor', 'Public play page', 'Scoreboard', 'Result export'],
    productionHooks: ['POST /games/quizzes', 'GET /games/quizzes', 'GET /games/quizzes/:id/diagnostics', 'POST /games/quizzes/:id/questions', 'POST /games/quizzes/:id/publish', 'POST /games/quizzes/:id/answers', 'GET /games/quizzes/:id/scores', 'GET /games/quizzes/:id/overlay-snapshot', 'POST /games/quizzes/:id/overlay-snapshot/dispatch', 'GET /games/quizzes/:id/overlay-receipts', 'gameHub.hostedQuizOverlaySnapshot subscription', 'game_hub.hosted_quiz.overlay_snapshot socket event', 'game_hub_overlay_socket_receipts row', 'game_hub_hosted_quiz_entries row', 'game_hub_game_entry_entitlements row', 'wallet_ledger game_entry_fee debit'],
  },
  {
    id: 'emoji-reaction',
    title: 'Emoji Reaction Rooms',
    badge: 'REACT',
    kind: 'emoji-reaction',
    status: 'socket receipts ready',
    audience: 'Sub, Mistress and live audience',
    timing: 'Timed rounds',
    source: 'clickmoji solo/multiplayer flow',
    summary: 'Solo and multiplayer reaction rooms with lobby, waiting room, timers, score API and keyboard-accessible controls.',
    tone: '#f472b6',
    favorite: true,
    launchChecklist: ['Lobby', 'Waiting room', 'Round timer', 'Score sync', 'Keyboard controls'],
    productionHooks: ['POST /games/reactions/rooms', 'POST /games/reactions/rooms/:id/join', 'POST /games/reactions/rounds/:id/score', 'gameHub.reactionRoomOverlaySnapshot subscription', 'game_hub_reaction_rooms row', 'game_hub_overlay_socket_receipts row', 'Socket score updates', 'room:game_overlay_snapshot reaction payload'],
  },
  {
    id: 'live-overlays',
    title: 'Live Room Overlay Pack',
    badge: 'LIVE',
    kind: 'overlay',
    status: 'socket transport',
    audience: 'Live hosts and watchers',
    timing: 'During room or watch session',
    source: 'Mistress-X live game backlog',
    summary: 'Overlay launch points for trivia, raffles, scratch cards, bingo, spin wheel, dice, cards and hangman-style games.',
    tone: '#d4af37',
    favorite: true,
    launchChecklist: ['Overlay picker', 'Room entitlement check', 'Wallet gate', 'Result reveal', 'Replay note'],
    productionHooks: ['gameHub.overlay.join socket event', 'room:game_overlay_snapshot socket event', 'Overlay receipt diagnostics', 'game_hub_game_entry_entitlements row', 'Room entitlement guard', 'Wallet game-entry debit', 'Game result notification'],
  },
  {
    id: 'game-history',
    title: 'Game Hub History',
    badge: 'LOG',
    kind: 'history',
    status: 'timeline',
    audience: 'All roles',
    timing: 'Post-game review',
    source: 'Existing game hub history lists',
    summary: 'One history lane for game launches, favourite games, completed quizzes, overlays, scores and admin review notes.',
    tone: '#1D9E75',
    favorite: false,
    launchChecklist: ['Recent launches', 'Favourite games', 'Score snapshots', 'Admin notes', 'Export marker'],
    productionHooks: ['GET /games/hub/history', 'GET /games/hub/favourites', 'POST /games/hub/favourites/:id', 'Admin game review note'],
  },
];

export const GAME_IMPORT_ADAPTERS: GameImportAdapter[] = [
  {
    id: 'kahoot-style-pin',
    title: 'PIN Lookup Adapter',
    provider: 'Kahoot-style',
    inputRule: 'Short PIN resolves to provider quiz ID before internal import.',
    status: 'adapter shell',
    tone: '#60a5fa',
    debugTrail: ['Input normalized', 'Provider endpoint selected', 'Quiz ID resolved', 'Import preview cached'],
    safety: ['Timeout retry', 'Provider-specific error copy', 'No credential storage in client'],
  },
  {
    id: 'hosted-json',
    title: 'Hosted JSON Import',
    provider: 'Local hosted quiz',
    inputRule: 'Admin uploads or pastes quiz JSON into the internal question editor.',
    status: 'editor shell',
    tone: '#c084fc',
    debugTrail: ['Schema checked', 'Questions counted', 'Answers normalized', 'Draft quiz created'],
    safety: ['Question limit', 'Answer-count validation', 'Draft-only before publish'],
  },
  {
    id: 'manual-admin',
    title: 'Manual Admin Builder',
    provider: 'Mistress-X',
    inputRule: 'Creator builds a quiz from scratch with private admin controls.',
    status: 'builder plan',
    tone: '#d4af37',
    debugTrail: ['Draft opened', 'Questions edited', 'Publish check passed', 'Public play route issued'],
    safety: ['Creator ownership', 'Role guard', 'Audit on publish'],
  },
];

export const HOSTED_QUIZ_STAGES: HostedQuizStage[] = [
  {
    id: 'admin-page',
    label: 'Admin Page',
    owner: 'Admin',
    detail: 'Private game setup, question editor and publish checks.',
    tone: '#d4af37',
  },
  {
    id: 'login',
    label: 'Login Gate',
    owner: 'System',
    detail: 'Role-aware entry for hosts, players and invited viewers.',
    tone: '#60a5fa',
  },
  {
    id: 'play-page',
    label: 'Public Play',
    owner: 'Player',
    detail: 'Live question rounds, answer capture and timer state.',
    tone: '#f472b6',
  },
  {
    id: 'scores',
    label: 'Scores',
    owner: 'System',
    detail: 'Score snapshots, winner labels and review logs.',
    tone: '#1D9E75',
  },
  {
    id: 'editor',
    label: 'Question Editor',
    owner: 'Creator',
    detail: 'Draft questions, answer keys, round notes and safe publish.',
    tone: '#c084fc',
  },
];

export const EMOJI_REACTION_MODES: EmojiReactionMode[] = [
  {
    id: 'solo-sprint',
    title: 'Solo Sprint',
    roomRule: 'One player practices timed reactions against target prompts.',
    scoring: 'Accuracy streak plus completion time.',
    timing: '30s, 60s and custom windows',
    accessibility: 'Keyboard and tap targets share the same scoring path.',
    tone: '#f472b6',
  },
  {
    id: 'multiplayer-room',
    title: 'Multiplayer Room',
    roomRule: 'Players join a room code and wait for the host to start.',
    scoring: 'First correct reaction wins round points.',
    timing: 'Lobby, countdown and round timer',
    accessibility: 'Focused controls remain visible during countdown.',
    tone: '#60a5fa',
  },
  {
    id: 'live-audience',
    title: 'Live Audience Poll',
    roomRule: 'Live viewers react in an overlay while the host keeps control.',
    scoring: 'Aggregated reaction totals and host-selected winners.',
    timing: 'Host-triggered rounds',
    accessibility: 'Keyboard shortcuts mirror visible reaction buttons.',
    tone: '#d4af37',
  },
];

export const LIVE_GAME_OVERLAYS: LiveGameOverlayPlan[] = [
  {
    id: 'trivia',
    title: 'Trivia',
    route: 'Quiz session overlay',
    trigger: 'Host starts question round',
    payoutOrResult: 'Hosted quiz score snapshot',
    state: 'socket client ready',
    tone: '#60a5fa',
  },
  {
    id: 'raffle',
    title: 'Raffle',
    route: 'Existing raffle game',
    trigger: 'Ticket close or manual draw',
    payoutOrResult: 'Winner and fulfilment state',
    state: 'backend ready',
    tone: '#d4af37',
  },
  {
    id: 'scratch-card',
    title: 'Scratch Card',
    route: 'Casino scratch play',
    trigger: 'Paid card reveal',
    payoutOrResult: 'Win/loss reveal and audit ID',
    state: 'backend ready',
    tone: '#f97316',
  },
  {
    id: 'bingo',
    title: 'Bingo',
    route: 'Bingo card state',
    trigger: 'Host calls number',
    payoutOrResult: 'Winner state and result feed',
    state: 'backend ready',
    tone: '#1D9E75',
  },
  {
    id: 'spin-wheel',
    title: 'Spin Wheel',
    route: 'Casino wheel play',
    trigger: 'Wallet-backed spin',
    payoutOrResult: 'Segment, net and audit row',
    state: 'backend ready',
    tone: '#c084fc',
  },
  {
    id: 'dice-cards',
    title: 'Dice and Cards',
    route: 'Template game session',
    trigger: 'Session result submit',
    payoutOrResult: 'Replay detail rows',
    state: 'session ready',
    tone: '#38bdf8',
  },
  {
    id: 'hangman',
    title: 'Hangman-Style Game',
    route: 'Future word game',
    trigger: 'Host clue and guesses',
    payoutOrResult: 'Completion and guess log',
    state: 'backlog',
    tone: '#f472b6',
  },
  {
    id: 'spin-bottle',
    title: 'Spin Bottle Tasks',
    route: 'Template game session',
    trigger: 'Accepted or declined prompt',
    payoutOrResult: 'Task result and replay',
    state: 'session ready',
    tone: '#a3e635',
  },
];

export const GAME_HUB_BROWSER_SMOKE_TARGETS: GameHubBrowserSmokeTarget[] = [
  {
    id: 'hosted-quiz-diagnostics',
    title: 'Hosted Quiz Diagnostics',
    route: 'History / Hosted Quiz Backlog',
    status: 'ready for staging smoke',
    checkpoint: 'Load a published quiz, open diagnostics, then apply live-room, broadcast and client receipt filters.',
    evidence: ['Entry totals and fee rows render', 'Receipt rows update for each filter', 'Filter summary names event, channel, room and limit'],
    tone: '#c084fc',
  },
  {
    id: 'hosted-quiz-overlay-refresh',
    title: 'Hosted Quiz Overlay Refresh',
    route: 'Overlays / Hosted Quiz Overlay Feed',
    status: 'ready for staging smoke',
    checkpoint: 'Dispatch a published quiz overlay snapshot and confirm the room-scoped socket status updates.',
    evidence: ['Dispatch action returns a room id', 'Socket status reaches connected', 'Last event timestamp moves forward'],
    tone: '#60a5fa',
  },
  {
    id: 'reaction-overlay-refresh',
    title: 'Reaction Overlay Refresh',
    route: 'Overlays / Reaction Room Score Feed',
    status: 'ready for staging smoke',
    checkpoint: 'Score a reaction round and confirm dashboard plus live-room overlay fanout receive the same snapshot.',
    evidence: ['Reaction score count increments', 'gameHub.reactionRoomScoreSnapshot emits', 'room:game_overlay_snapshot emits for the live room'],
    tone: '#f472b6',
  },
];

export const GAME_HISTORY_EVENTS: GameHistoryEvent[] = [
  {
    id: 'hist-1',
    title: 'Hosted Quiz Night',
    actor: 'Mistress X',
    result: '18 players, 4 winners',
    detail: 'Imported quiz draft moved into public play route with score export marked for review.',
    status: 'review',
    tone: '#c084fc',
  },
  {
    id: 'hist-2',
    title: 'Emoji Reaction Sprint',
    actor: 'Sub squad',
    result: 'Top streak 19',
    detail: 'Multiplayer room closed with timer, score snapshot and accessibility check marker.',
    status: 'complete',
    tone: '#f472b6',
  },
  {
    id: 'hist-3',
    title: 'Live Bingo Overlay',
    actor: 'Host room',
    result: '2 winners',
    detail: 'Live overlay consumed existing bingo card state and result feed.',
    status: 'synced',
    tone: '#1D9E75',
  },
  {
    id: 'hist-4',
    title: 'Scratch Card Reveal',
    actor: 'Live watcher',
    result: 'LOSS audit row',
    detail: 'Casino audit metadata is ready for overlay reveal polish.',
    status: 'audit',
    tone: '#f97316',
  },
];
