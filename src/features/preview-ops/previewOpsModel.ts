export type PreviewOpsTab = 'playbook' | 'readiness' | 'security' | 'shutdown';

export type TunnelPlaybookStep = {
  id: string;
  title: string;
  phase: string;
  command: string;
  status: string;
  owner: string;
  checklist: string[];
  tone: string;
};

export type EnvironmentServiceStatus = {
  id: string;
  label: string;
  endpoint: string;
  state: 'ready' | 'needs check' | 'blocked' | 'external';
  detail: string;
  evidence: string[];
  tone: string;
};

export type SecurePreviewGuard = {
  id: string;
  title: string;
  risk: string;
  guardrail: string;
  requiredBeforePublic: string[];
  tone: string;
};

export type ShutdownRunbookItem = {
  id: string;
  title: string;
  trigger: string;
  action: string;
  confirmation: string;
  tone: string;
};

export type PreviewOpsMetric = {
  label: string;
  value: string;
  detail: string;
  tone: string;
};

export const PREVIEW_OPS_TABS: Array<{ id: PreviewOpsTab; label: string }> = [
  { id: 'playbook', label: 'Tunnel Playbook' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'security', label: 'Secure Preview' },
  { id: 'shutdown', label: 'Shutdown' },
];

export const PREVIEW_OPS_METRICS: PreviewOpsMetric[] = [
  {
    label: 'Tunnel Steps',
    value: '5',
    detail: 'Named tunnel, ingress, service, metrics and logs',
    tone: '#38bdf8',
  },
  {
    label: 'Readiness Checks',
    value: '6',
    detail: 'API, frontend, websocket, tunnel, database and payments',
    tone: '#1D9E75',
  },
  {
    label: 'Public Guards',
    value: '4',
    detail: 'Secrets, auth, data and shutdown requirements',
    tone: '#f5c542',
  },
  {
    label: 'Stop Actions',
    value: '4',
    detail: 'Tunnel, services, logs and access revocation',
    tone: '#f472b6',
  },
];

export const TUNNEL_PLAYBOOK_STEPS: TunnelPlaybookStep[] = [
  {
    id: 'named-tunnel',
    title: 'Create Named Tunnel',
    phase: 'identity',
    command: 'cloudflared tunnel create mistress-x-preview',
    status: 'operator gated',
    owner: 'Admin ops',
    checklist: ['Confirm account context', 'Store tunnel ID in local notes', 'Do not commit credentials', 'Record owner and expiry window'],
    tone: '#38bdf8',
  },
  {
    id: 'ingress-rules',
    title: 'Define Ingress Rules',
    phase: 'routing',
    command: 'cloudflared tunnel route dns mistress-x-preview preview.example.test',
    status: 'draft mapping',
    owner: 'Admin ops',
    checklist: ['Map frontend host', 'Map API host', 'Block private admin routes when public', 'Add fallback 404 service'],
    tone: '#c084fc',
  },
  {
    id: 'service-install',
    title: 'Install Local Service',
    phase: 'runtime',
    command: 'cloudflared service install',
    status: 'local only',
    owner: 'Machine owner',
    checklist: ['Install only on trusted machine', 'Document service name', 'Confirm startup type', 'Keep uninstall command nearby'],
    tone: '#1D9E75',
  },
  {
    id: 'metrics-log',
    title: 'Enable Metrics and Logs',
    phase: 'observability',
    command: 'cloudflared tunnel --metrics localhost:49312 run mistress-x-preview',
    status: 'monitoring queued',
    owner: 'Admin ops',
    checklist: ['Capture metrics port', 'Tail local logs', 'Track request volume', 'Pin error count before sharing link'],
    tone: '#f5c542',
  },
  {
    id: 'share-window',
    title: 'Open Preview Window',
    phase: 'share',
    command: 'share only after readiness and secure-preview guards pass',
    status: 'approval required',
    owner: 'Headmistress/Admin',
    checklist: ['Set expiry time', 'Share with named recipients', 'Avoid production secrets', 'Schedule shutdown reminder'],
    tone: '#f472b6',
  },
];

export const ENVIRONMENT_SERVICE_STATUSES: EnvironmentServiceStatus[] = [
  {
    id: 'frontend',
    label: 'Frontend Web',
    endpoint: 'http://localhost:8082',
    state: 'ready',
    detail: 'Expo web preview responds locally before any tunnel is opened.',
    evidence: ['HTTP 200', 'Dashboard route renders', 'Static assets served'],
    tone: '#38bdf8',
  },
  {
    id: 'api',
    label: 'Local API',
    endpoint: 'http://localhost:4000',
    state: 'needs check',
    detail: 'API readiness should confirm health, auth and CORS before sharing.',
    evidence: ['GET /health', 'Auth demo login', 'CORS origin allowlist'],
    tone: '#d4af37',
  },
  {
    id: 'websocket',
    label: 'WebSocket',
    endpoint: 'ws://localhost:4000/socket',
    state: 'needs check',
    detail: 'Live chat, game overlays and notifications need socket readiness before public preview.',
    evidence: ['Connect event', 'Auth handshake', 'Reconnect policy'],
    tone: '#c084fc',
  },
  {
    id: 'tunnel',
    label: 'Tunnel',
    endpoint: 'cloudflared named tunnel',
    state: 'blocked',
    detail: 'Public link stays blocked until secure preview guards pass.',
    evidence: ['Named tunnel ID', 'Ingress config', 'Metrics listener'],
    tone: '#f472b6',
  },
  {
    id: 'database',
    label: 'Database',
    endpoint: 'local or staging database',
    state: 'needs check',
    detail: 'Preview should use demo-safe data, not uncontrolled production records.',
    evidence: ['Migration state', 'Seed data marker', 'Backup note'],
    tone: '#1D9E75',
  },
  {
    id: 'payments',
    label: 'Payment Provider',
    endpoint: 'Stripe/test provider',
    state: 'external',
    detail: 'Payment flows must stay in test mode with fake cards and clear copy.',
    evidence: ['Test keys only', 'Webhook secret present', 'No live charges'],
    tone: '#60a5fa',
  },
];

export const SECURE_PREVIEW_GUARDS: SecurePreviewGuard[] = [
  {
    id: 'secrets',
    title: 'Secrets Boundary',
    risk: 'Local `.env` files, provider tokens or tunnel credentials could leak if copied into docs or logs.',
    guardrail: 'Show only redacted readiness labels in the dashboard and keep secrets in local secret stores.',
    requiredBeforePublic: ['Redact logs', 'Verify no secrets in committed files', 'Confirm test provider credentials', 'Keep tunnel token off-screen'],
    tone: '#f5c542',
  },
  {
    id: 'auth',
    title: 'Authentication Gate',
    risk: 'A public tunnel can expose unfinished admin and creator routes to anyone with the link.',
    guardrail: 'Require demo login, role checks and an explicit recipient list before sharing.',
    requiredBeforePublic: ['Demo account enabled', 'Admin-only routes checked', 'Password reset disabled for preview', 'Recipient list recorded'],
    tone: '#f472b6',
  },
  {
    id: 'data',
    title: 'Demo Data Only',
    risk: 'Real user, payment, message or moderation data should not be visible in a temporary preview.',
    guardrail: 'Use seeded or anonymized records and mark unsafe panels as blocked.',
    requiredBeforePublic: ['Seed marker visible', 'No production export loaded', 'Private notes hidden', 'Audit data scrubbed'],
    tone: '#1D9E75',
  },
  {
    id: 'expiry',
    title: 'Expiry and Shutdown',
    risk: 'Temporary public URLs can outlive the review window if no one owns shutdown.',
    guardrail: 'Every preview gets an owner, end time, stop command and post-preview access check.',
    requiredBeforePublic: ['Owner assigned', 'End time set', 'Stop command ready', 'Post-preview check scheduled'],
    tone: '#38bdf8',
  },
];

export const SHUTDOWN_RUNBOOK: ShutdownRunbookItem[] = [
  {
    id: 'stop-tunnel',
    title: 'Stop Tunnel',
    trigger: 'Review window ends or unexpected traffic appears.',
    action: 'Stop the cloudflared process or service and confirm the public URL no longer responds.',
    confirmation: 'Public preview URL returns unavailable.',
    tone: '#f472b6',
  },
  {
    id: 'revoke-access',
    title: 'Revoke Temporary Access',
    trigger: 'External reviewer access is no longer needed.',
    action: 'Rotate preview passwords, remove temporary recipients and expire shared links.',
    confirmation: 'Demo-only access list is empty or reset.',
    tone: '#f5c542',
  },
  {
    id: 'collect-logs',
    title: 'Collect Logs',
    trigger: 'Preview is closed or an incident needs review.',
    action: 'Save redacted tunnel, API and frontend error summaries into the run record.',
    confirmation: 'No secrets or private data remain in the log excerpt.',
    tone: '#38bdf8',
  },
  {
    id: 'reset-services',
    title: 'Reset Local Services',
    trigger: 'Public route has been closed.',
    action: 'Return local API, websocket, frontend and worker processes to normal dev mode.',
    confirmation: 'Local-only URLs respond and public tunnel is offline.',
    tone: '#1D9E75',
  },
];
