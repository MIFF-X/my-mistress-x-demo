export type WorkshopPortalTab = 'queue' | 'roles' | 'releases' | 'oauth';

export type WorkshopQueueKind =
  | 'upload'
  | 'report'
  | 'comment'
  | 'rating'
  | 'screenshot'
  | 'release'
  | 'attachment';

export type WorkshopQueueItem = {
  id: string;
  title: string;
  kind: WorkshopQueueKind;
  owner: string;
  priority: string;
  status: string;
  target: string;
  evidence: string[];
  decisionPath: string[];
  tone: string;
};

export type WorkshopRolePanel = {
  id: string;
  role: 'Admin' | 'Moderator' | 'Developer';
  title: string;
  scope: string;
  controls: string[];
  auditRule: string;
  tone: string;
};

export type WorkshopReleaseChannel = {
  id: string;
  title: string;
  version: string;
  artifact: string;
  status: string;
  installTarget: string;
  checklist: string[];
  checksum: string;
  tone: string;
};

export type WorkshopOAuthProvider = {
  id: string;
  title: string;
  provider: string;
  status: string;
  connectionState: string;
  actions: string[];
  auditTrail: string;
  tone: string;
};

export type WorkshopPortalMetric = {
  label: string;
  value: string;
  detail: string;
  tone: string;
};

export const WORKSHOP_PORTAL_TABS: Array<{ id: WorkshopPortalTab; label: string }> = [
  { id: 'queue', label: 'Moderation Queue' },
  { id: 'roles', label: 'Role Panels' },
  { id: 'releases', label: 'Releases' },
  { id: 'oauth', label: 'OAuth Links' },
];

export const WORKSHOP_PORTAL_METRICS: WorkshopPortalMetric[] = [
  {
    label: 'Queue Types',
    value: '7',
    detail: 'Uploads, reports, comments, ratings and release assets',
    tone: '#f5c542',
  },
  {
    label: 'Control Panels',
    value: '3',
    detail: 'Admin, moderator and developer lanes',
    tone: '#c084fc',
  },
  {
    label: 'Release States',
    value: '5',
    detail: 'Draft, review, signed, published and rollback',
    tone: '#38bdf8',
  },
  {
    label: 'Provider Links',
    value: '4',
    detail: 'Connect, disconnect, revoke and audit',
    tone: '#1D9E75',
  },
];

export const WORKSHOP_QUEUE_ITEMS: WorkshopQueueItem[] = [
  {
    id: 'plugin-upload',
    title: 'Plugin Upload Review',
    kind: 'upload',
    owner: 'Creator studio',
    priority: 'High',
    status: 'virus scan required',
    target: 'premium-header-pack.zip',
    evidence: ['Manifest parsed', 'File list captured', 'Screenshot preview waiting', 'License text required'],
    decisionPath: ['Run scanner', 'Verify manifest permissions', 'Request missing screenshots', 'Approve into plugin marketplace draft'],
    tone: '#f5c542',
  },
  {
    id: 'reported-comment',
    title: 'Reported Comment Thread',
    kind: 'comment',
    owner: 'Community feed',
    priority: 'Medium',
    status: 'moderator review',
    target: 'style-pack discussion #418',
    evidence: ['Reporter note attached', 'Original comment snapshot saved', 'Reply chain linked', 'Author history clean'],
    decisionPath: ['Check policy match', 'Hide or restore comment', 'Notify reporter', 'Leave moderator note'],
    tone: '#f472b6',
  },
  {
    id: 'rating-abuse',
    title: 'Rating Integrity Check',
    kind: 'rating',
    owner: 'Marketplace reviews',
    priority: 'Medium',
    status: 'pattern flagged',
    target: 'Royal Obsession ratings',
    evidence: ['Five low ratings in six minutes', 'Shared device signal', 'No purchase entitlement on two ratings'],
    decisionPath: ['Validate entitlement', 'Remove invalid ratings', 'Lock repeat abuse account', 'Recalculate public score'],
    tone: '#38bdf8',
  },
  {
    id: 'release-candidate',
    title: 'Release Candidate Gate',
    kind: 'release',
    owner: 'Developer tools',
    priority: 'High',
    status: 'checksum pending',
    target: 'Mistress-X desktop installer 0.9.4',
    evidence: ['Build artifact uploaded', 'Crash report delta attached', 'Rollback package ready', 'Release notes drafted'],
    decisionPath: ['Generate checksum', 'Sign installer', 'Publish download row', 'Pin rollback link'],
    tone: '#1D9E75',
  },
];

export const WORKSHOP_ROLE_PANELS: WorkshopRolePanel[] = [
  {
    id: 'admin-control',
    role: 'Admin',
    title: 'Admin Control Panel',
    scope: 'Users, news, uploads, releases, bans and IP lookup stay in a higher-trust lane.',
    controls: ['User ban and restore queue', 'News and announcement publish gate', 'Upload override with audit note', 'Release publish or rollback action', 'IP lookup reason capture'],
    auditRule: 'Every action requires actor, reason, target, before state and after state.',
    tone: '#d4af37',
  },
  {
    id: 'moderator-workshop',
    role: 'Moderator',
    title: 'Workshop Review Panel',
    scope: 'Workshop uploads, reports, comments, ratings and screenshots are triaged without platform-wide destructive controls.',
    controls: ['Approve or reject workshop upload', 'Hide or restore reported comments', 'Validate ratings against entitlement', 'Request safer screenshots', 'Escalate to admin'],
    auditRule: 'Moderator notes are visible to admins and attached to the queue item history.',
    tone: '#c084fc',
  },
  {
    id: 'developer-tools',
    role: 'Developer',
    title: 'Developer Report Panel',
    scope: 'Crash reports, diagnostic bundles, release notes and build metadata feed production readiness.',
    controls: ['Crash report grouping', 'Diagnostic attachment review', 'Release note checklist', 'Installer checksum status', 'Build artifact retention'],
    auditRule: 'Developer actions cannot publish releases without admin approval.',
    tone: '#38bdf8',
  },
];

export const WORKSHOP_RELEASE_CHANNELS: WorkshopReleaseChannel[] = [
  {
    id: 'official-app',
    title: 'Official App Download',
    version: '0.9.4',
    artifact: 'Mistress-X-Setup-0.9.4.exe',
    status: 'release candidate',
    installTarget: 'Windows desktop installer',
    checklist: ['Signed installer', 'SHA256 checksum', 'Release notes', 'Rollback package', 'Download telemetry'],
    checksum: 'SHA256 pending in production',
    tone: '#38bdf8',
  },
  {
    id: 'plugin-pack',
    title: 'Plugin Pack Release',
    version: '1.2.0',
    artifact: 'premium-header-pack.zip',
    status: 'workshop review',
    installTarget: 'Dashboard plugin marketplace',
    checklist: ['Manifest validation', 'Screenshot set', 'License text', 'Compatibility notes', 'Install preview'],
    checksum: 'Stored per uploaded archive',
    tone: '#f5c542',
  },
  {
    id: 'hotfix-build',
    title: 'Hotfix Channel',
    version: '0.9.4+hotfix.1',
    artifact: 'Mistress-X-hotfix.zip',
    status: 'developer draft',
    installTarget: 'Admin-only staged download',
    checklist: ['Crash delta linked', 'Patch note', 'Admin approval', 'Expiry window', 'Rollback marker'],
    checksum: 'Generated before admin publish',
    tone: '#f97316',
  },
];

export const WORKSHOP_OAUTH_PROVIDERS: WorkshopOAuthProvider[] = [
  {
    id: 'github',
    title: 'GitHub Release Source',
    provider: 'GitHub',
    status: 'connected',
    connectionState: 'Repo release metadata can sync after admin approval.',
    actions: ['Disconnect', 'Refresh token scope', 'Open audit trail', 'Rotate webhook secret'],
    auditTrail: 'Last refreshed by Admin two hours ago.',
    tone: '#c084fc',
  },
  {
    id: 'discord',
    title: 'Community Report Bridge',
    provider: 'Discord',
    status: 'needs review',
    connectionState: 'Incoming reports are paused until webhook ownership is confirmed.',
    actions: ['Reconnect', 'Verify channel', 'Map moderator role', 'Revoke stale token'],
    auditTrail: 'Webhook ownership check queued.',
    tone: '#60a5fa',
  },
  {
    id: 'cloud-storage',
    title: 'External File Storage',
    provider: 'Cloud storage',
    status: 'not connected',
    connectionState: 'Release artifacts stay local until a storage provider is linked.',
    actions: ['Connect provider', 'Choose bucket', 'Set retention', 'Test signed URL'],
    auditTrail: 'No active credential stored.',
    tone: '#1D9E75',
  },
  {
    id: 'crash-collector',
    title: 'Crash Report Ingest',
    provider: 'Diagnostics provider',
    status: 'sandbox token',
    connectionState: 'Developer panel can ingest crash groups but cannot publish releases.',
    actions: ['Disconnect sandbox', 'Promote token request', 'Review data policy', 'Export sample event'],
    auditTrail: 'Sandbox token expires in seven days.',
    tone: '#f472b6',
  },
];
