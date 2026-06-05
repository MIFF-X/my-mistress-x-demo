export type AiProviderTeamTab = 'providers' | 'capabilities' | 'routing' | 'analytics';

export type AiProviderFamily = 'GPT' | 'Gemini' | 'Grok' | 'RouteLLM' | 'Local';
export type AiProviderMode = 'hosted' | 'local' | 'router';
export type AiProviderCostTier = 'low' | 'medium' | 'high' | 'variable';

export type AiProviderTelemetry = {
  requests: string;
  tokens: string;
  cost: string;
  latency: string;
  successRate: string;
};

export type AiProviderTeamProvider = {
  id: string;
  name: string;
  family: AiProviderFamily;
  mode: AiProviderMode;
  status: 'policy ready' | 'approval required' | 'sandbox' | 'private lane';
  costTier: AiProviderCostTier;
  privacy: 'hosted' | 'private' | 'hybrid';
  primaryUse: string;
  routingRule: string;
  capabilities: string[];
  telemetry: AiProviderTelemetry;
  notes: string[];
  tone: string;
};

export type AiCapabilityLabel = {
  id: string;
  label: string;
  detail: string;
  providers: string[];
  policy: string;
  tone: string;
};

export type AiRoutingPolicy = {
  id: string;
  title: string;
  trigger: string;
  primaryProvider: string;
  fallbackProvider: string;
  approvalRule: string;
  telemetry: string;
  checklist: string[];
  tone: string;
};

export type AiUsageMetric = {
  label: string;
  value: string;
  detail: string;
  tone: string;
};

export type AiProviderUsageRow = {
  provider: string;
  requests: string;
  tokens: string;
  cost: string;
  latency: string;
  status: string;
  tone: string;
};

export const AI_PROVIDER_TEAM_TABS: Array<{ id: AiProviderTeamTab; label: string }> = [
  { id: 'providers', label: 'Provider Switcher' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'routing', label: 'Routing Rules' },
  { id: 'analytics', label: 'Usage Analytics' },
];

export const AI_PROVIDER_TEAM_METRICS: AiUsageMetric[] = [
  {
    label: 'Provider Lanes',
    value: '5',
    detail: 'Hosted, router and local options',
    tone: '#8b5cf6',
  },
  {
    label: 'Capability Labels',
    value: '7',
    detail: 'Coding, image, routing, local, hosted, private and cost',
    tone: '#38bdf8',
  },
  {
    label: 'Route Policies',
    value: '4',
    detail: 'Approval, fallback and audit handoffs',
    tone: '#f5c542',
  },
  {
    label: 'Cost Window',
    value: '$426',
    detail: 'Projected provider spend this week',
    tone: '#1D9E75',
  },
];

export const AI_PROVIDER_TEAM_PROVIDERS: AiProviderTeamProvider[] = [
  {
    id: 'gpt-studio-lead',
    name: 'GPT Studio Lead',
    family: 'GPT',
    mode: 'hosted',
    status: 'policy ready',
    costTier: 'high',
    privacy: 'hosted',
    primaryUse: 'Long-form product planning, code review briefs and admin assistant drafts.',
    routingRule: 'Use for complex reasoning after policy checks and prompt redaction.',
    capabilities: ['coding', 'planning', 'analysis', 'hosted', 'high cost'],
    telemetry: {
      requests: '1,284',
      tokens: '8.7M',
      cost: '$212.40',
      latency: '2.4s',
      successRate: '98%',
    },
    notes: ['Require prompt redaction for private notes.', 'Route expensive batch work through approval queue.', 'Log output reviews into Abacus audit trail.'],
    tone: '#c084fc',
  },
  {
    id: 'gemini-research-desk',
    name: 'Gemini Research Desk',
    family: 'Gemini',
    mode: 'hosted',
    status: 'sandbox',
    costTier: 'medium',
    privacy: 'hosted',
    primaryUse: 'Research summaries, multimodal intake notes and document triage.',
    routingRule: 'Use for source-heavy analysis when artifact review is enabled.',
    capabilities: ['research', 'image', 'document review', 'hosted', 'medium cost'],
    telemetry: {
      requests: '642',
      tokens: '3.9M',
      cost: '$86.10',
      latency: '3.1s',
      successRate: '96%',
    },
    notes: ['Keep source citations attached to generated summaries.', 'Block direct use on unredacted identity files.', 'Escalate OCR failures to manual review.'],
    tone: '#38bdf8',
  },
  {
    id: 'grok-social-pulse',
    name: 'Grok Social Pulse',
    family: 'Grok',
    mode: 'hosted',
    status: 'approval required',
    costTier: 'medium',
    privacy: 'hosted',
    primaryUse: 'Trend-aware copy drafts, campaign hooks and social listening prompts.',
    routingRule: 'Use only when campaign context has creator approval.',
    capabilities: ['trend copy', 'social context', 'hosted', 'approval', 'medium cost'],
    telemetry: {
      requests: '218',
      tokens: '1.1M',
      cost: '$39.75',
      latency: '2.8s',
      successRate: '93%',
    },
    notes: ['Keep generated social copy in draft state.', 'Require creator approval before publishing.', 'Add campaign source and rate tracking.'],
    tone: '#f472b6',
  },
  {
    id: 'routellm-cost-router',
    name: 'RouteLLM Cost Router',
    family: 'RouteLLM',
    mode: 'router',
    status: 'policy ready',
    costTier: 'variable',
    privacy: 'hybrid',
    primaryUse: 'Cost-aware routing, fallback selection and low-risk batch classification.',
    routingRule: 'Choose the cheapest approved provider for simple, repeatable tasks.',
    capabilities: ['routing', 'fallback', 'cost tier', 'hosted', 'hybrid'],
    telemetry: {
      requests: '2,908',
      tokens: '5.4M',
      cost: '$64.80',
      latency: '1.6s',
      successRate: '97%',
    },
    notes: ['Record provider chosen for every routed request.', 'Fallback to GPT Studio Lead when confidence drops.', 'Attach cost savings to admin analytics.'],
    tone: '#1D9E75',
  },
  {
    id: 'local-private-runner',
    name: 'Local Private Runner',
    family: 'Local',
    mode: 'local',
    status: 'private lane',
    costTier: 'low',
    privacy: 'private',
    primaryUse: 'Private drafts, redaction passes, offline classification and safe local experiments.',
    routingRule: 'Prefer for private or sensitive prep before a hosted provider sees context.',
    capabilities: ['local', 'private', 'classification', 'redaction', 'low cost'],
    telemetry: {
      requests: '984',
      tokens: '2.2M',
      cost: '$23.00',
      latency: '4.9s',
      successRate: '91%',
    },
    notes: ['Keep model files and logs out of commits.', 'Use for redaction and policy preflight.', 'Escalate low-confidence outputs to hosted review.'],
    tone: '#f5c542',
  },
];

export const AI_CAPABILITY_LABELS: AiCapabilityLabel[] = [
  {
    id: 'coding',
    label: 'Coding',
    detail: 'Implementation plans, code review summaries and test failure triage.',
    providers: ['GPT Studio Lead'],
    policy: 'Allowed for repo code and synthetic fixtures. Secrets are redacted first.',
    tone: '#c084fc',
  },
  {
    id: 'image',
    label: 'Image',
    detail: 'Visual artifact intake, screenshots and multimodal UI analysis.',
    providers: ['Gemini Research Desk'],
    policy: 'Allowed for screenshots and design references after identity checks.',
    tone: '#38bdf8',
  },
  {
    id: 'routing',
    label: 'Routing',
    detail: 'Automatic provider selection, fallback and low-risk classification.',
    providers: ['RouteLLM Cost Router'],
    policy: 'Allowed when route decisions are logged with provider and reason.',
    tone: '#1D9E75',
  },
  {
    id: 'local',
    label: 'Local',
    detail: 'Private local preprocessing and offline draft lanes.',
    providers: ['Local Private Runner'],
    policy: 'Preferred for sensitive prep before hosted provider handoff.',
    tone: '#f5c542',
  },
  {
    id: 'hosted',
    label: 'Hosted',
    detail: 'Cloud provider lanes with stronger reasoning or research capacity.',
    providers: ['GPT Studio Lead', 'Gemini Research Desk', 'Grok Social Pulse'],
    policy: 'Allowed only after product policy, role and data classification checks.',
    tone: '#60a5fa',
  },
  {
    id: 'private',
    label: 'Private',
    detail: 'Redaction, safety pass and private draft handling.',
    providers: ['Local Private Runner', 'RouteLLM Cost Router'],
    policy: 'Use for private records, notes and provider preflight.',
    tone: '#2dd4bf',
  },
  {
    id: 'cost-tier',
    label: 'Cost Tier',
    detail: 'Low, medium, high and variable budget labels for admin forecasting.',
    providers: ['RouteLLM Cost Router', 'GPT Studio Lead', 'Gemini Research Desk', 'Grok Social Pulse', 'Local Private Runner'],
    policy: 'High-cost providers require budget and approval annotations.',
    tone: '#fb7185',
  },
];

export const AI_ROUTING_POLICIES: AiRoutingPolicy[] = [
  {
    id: 'private-first',
    title: 'Private First',
    trigger: 'Private notes, identity evidence, payment context or moderation records are present.',
    primaryProvider: 'Local Private Runner',
    fallbackProvider: 'GPT Studio Lead after redaction',
    approvalRule: 'Hosted fallback needs admin approval and redaction evidence.',
    telemetry: 'Log sensitivity class, redaction pass and final provider.',
    checklist: ['Classify data sensitivity', 'Run local redaction', 'Attach approval record', 'Store provider audit event'],
    tone: '#f5c542',
  },
  {
    id: 'cost-guard',
    title: 'Cost Guard',
    trigger: 'Batch jobs, repeated classifications or simple summaries exceed budget threshold.',
    primaryProvider: 'RouteLLM Cost Router',
    fallbackProvider: 'Gemini Research Desk',
    approvalRule: 'High-cost fallback needs daily spend cap confirmation.',
    telemetry: 'Track provider selected, projected cost and estimated savings.',
    checklist: ['Estimate token window', 'Choose allowed provider', 'Record fallback reason', 'Surface cost in admin analytics'],
    tone: '#1D9E75',
  },
  {
    id: 'research-lane',
    title: 'Research Lane',
    trigger: 'External docs, screenshots or multimodal artifacts need synthesis.',
    primaryProvider: 'Gemini Research Desk',
    fallbackProvider: 'GPT Studio Lead',
    approvalRule: 'Source-sensitive files need OCR review and citation attachment.',
    telemetry: 'Track artifact count, source coverage and review state.',
    checklist: ['Attach source notes', 'Confirm OCR quality', 'Flag missing citations', 'Queue human review if source text is weak'],
    tone: '#38bdf8',
  },
  {
    id: 'campaign-draft',
    title: 'Campaign Draft',
    trigger: 'Creator asks for social copy, growth hooks or audience-facing campaign variants.',
    primaryProvider: 'Grok Social Pulse',
    fallbackProvider: 'GPT Studio Lead',
    approvalRule: 'Creator must approve final campaign copy before publishing.',
    telemetry: 'Track draft count, channel, approval state and conversion result.',
    checklist: ['Mark output as draft', 'Attach campaign owner', 'Record approval state', 'Send conversion metrics back to analytics'],
    tone: '#f472b6',
  },
];

export const AI_PROVIDER_USAGE_ROWS: AiProviderUsageRow[] = [
  {
    provider: 'RouteLLM Cost Router',
    requests: '2,908',
    tokens: '5.4M',
    cost: '$64.80',
    latency: '1.6s',
    status: 'saving budget',
    tone: '#1D9E75',
  },
  {
    provider: 'GPT Studio Lead',
    requests: '1,284',
    tokens: '8.7M',
    cost: '$212.40',
    latency: '2.4s',
    status: 'high reasoning',
    tone: '#c084fc',
  },
  {
    provider: 'Local Private Runner',
    requests: '984',
    tokens: '2.2M',
    cost: '$23.00',
    latency: '4.9s',
    status: 'private prep',
    tone: '#f5c542',
  },
  {
    provider: 'Gemini Research Desk',
    requests: '642',
    tokens: '3.9M',
    cost: '$86.10',
    latency: '3.1s',
    status: 'artifact review',
    tone: '#38bdf8',
  },
  {
    provider: 'Grok Social Pulse',
    requests: '218',
    tokens: '1.1M',
    cost: '$39.75',
    latency: '2.8s',
    status: 'approval queue',
    tone: '#f472b6',
  },
];
