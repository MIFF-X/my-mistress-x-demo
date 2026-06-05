export type PluginOperationStatus = 'ready' | 'scaffold' | 'review' | 'provider';

export type PluginOperationFlow = {
  id: string;
  title: string;
  badge: string;
  description: string;
  status: PluginOperationStatus;
  tone: string;
  checklist: string[];
};

export type PluginManifestRequirement = {
  id: string;
  label: string;
  description: string;
  requiredFor: string;
  tone: string;
};

export type PluginCategoryPage = {
  id: string;
  title: string;
  description: string;
  examples: string[];
  tone: string;
};

export type PluginReloadEvent = {
  id: string;
  title: string;
  description: string;
  route: string;
  tone: string;
};

export const PLUGIN_OPERATION_FLOWS: PluginOperationFlow[] = [
  {
    id: 'create',
    title: 'Create',
    badge: 'NEW',
    description: 'Admin or Headmistress creates a registry entry, pricing shell, category, screenshots and launch notes.',
    status: 'ready',
    tone: '#d4af37',
    checklist: ['Name and id', 'Category', 'Pricing mode', 'Screenshots', 'Launch notes'],
  },
  {
    id: 'add',
    title: 'Add',
    badge: 'ADD',
    description: 'Attach a plugin from an approved source or upload queue after manifest and license checks pass.',
    status: 'review',
    tone: '#60a5fa',
    checklist: ['Source review', 'License check', 'Manifest parse', 'Security intake', 'Admin note'],
  },
  {
    id: 'install',
    title: 'Install',
    badge: 'INSTALL',
    description: 'Grant entitlement, run capability checks, apply route guards and emit a reload-safe installed event.',
    status: 'scaffold',
    tone: '#1D9E75',
    checklist: ['Entitlement', 'Permissions', 'Route guard', 'Reload event', 'Receipt'],
  },
  {
    id: 'update',
    title: 'Update',
    badge: 'UPDATE',
    description: 'Stage version updates with changelog, compatibility notes, rollback plan and user-visible update badge.',
    status: 'provider',
    tone: '#f97316',
    checklist: ['Version bump', 'Changelog', 'Compatibility', 'Rollback', 'Update badge'],
  },
  {
    id: 'configure',
    title: 'Configure',
    badge: 'CONFIG',
    description: 'Expose safe settings, role limits, billing options, schedule windows and addon controls.',
    status: 'ready',
    tone: '#c084fc',
    checklist: ['Settings form', 'Role limits', 'Billing controls', 'Calendar window', 'Addon rules'],
  },
  {
    id: 'rate',
    title: 'Rate',
    badge: 'RATE',
    description: 'Collect ratings, comments, support signals and quality flags without exposing private user data.',
    status: 'scaffold',
    tone: '#f472b6',
    checklist: ['Rating', 'Comment', 'Support signal', 'Report link', 'Privacy filter'],
  },
  {
    id: 'remove',
    title: 'Remove',
    badge: 'REMOVE',
    description: 'Disable access, preserve audit history, protect receipts and show rollback or reinstall paths.',
    status: 'review',
    tone: '#ef4444',
    checklist: ['Disable entitlement', 'Audit event', 'Receipt safety', 'Data retention', 'Reinstall path'],
  },
];

export const PLUGIN_MANIFEST_REQUIREMENTS: PluginManifestRequirement[] = [
  {
    id: 'identity',
    label: 'Identity',
    description: 'Unique id, name, version, author, description and support contact.',
    requiredFor: 'Create and update',
    tone: '#d4af37',
  },
  {
    id: 'entry',
    label: 'Entry',
    description: 'Frontend entry point, API routes, runtime keys and safe fallback state.',
    requiredFor: 'Install',
    tone: '#60a5fa',
  },
  {
    id: 'permissions',
    label: 'Permissions',
    description: 'Role access, billing actions, wallet usage, content access and admin-only surfaces.',
    requiredFor: 'Route guard',
    tone: '#c084fc',
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Screenshots, icon, preview copy and marketplace category imagery.',
    requiredFor: 'Marketplace listing',
    tone: '#f472b6',
  },
  {
    id: 'docs',
    label: 'Docs',
    description: 'README, setup notes, user-facing behavior, admin controls and rollback instructions.',
    requiredFor: 'Review',
    tone: '#1D9E75',
  },
  {
    id: 'tests',
    label: 'Tests',
    description: 'Manifest validation, route access checks, billing fixtures and install/remove smoke tests.',
    requiredFor: 'Release',
    tone: '#f97316',
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Free, freemium, fixed price, subscription bundle, addon or custom quote settings.',
    requiredFor: 'Purchase',
    tone: '#a3e635',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'License review, permissions review, upload provenance and privacy notes.',
    requiredFor: 'Approval',
    tone: '#ef4444',
  },
];

export const PLUGIN_CATEGORY_PAGES: PluginCategoryPage[] = [
  {
    id: 'live',
    title: 'Live Shows and Paid Calls',
    description: 'Live show controls, paid call providers, watch rooms, ticketed access and replay unlocks.',
    examples: ['Live show plugin', 'Timed video room', 'Watch With Mistress'],
    tone: '#ef4444',
  },
  {
    id: 'monetization',
    title: 'Monetization Core',
    description: 'Tip jars, tribute-to-access timers, PPV unlocks, goal boosters and receipt add-ons.',
    examples: ['Tip jar icon pack', 'Tribute timer', 'Goal booster'],
    tone: '#d4af37',
  },
  {
    id: 'chat',
    title: 'Chat and Messaging',
    description: 'Paid chat enhancements, message filters, request queues, canned replies and moderation helpers.',
    examples: ['Paid highlight chat', 'Request queue', 'Slow mode'],
    tone: '#ff0055',
  },
  {
    id: 'monitoring',
    title: 'Monitoring Grid',
    description: 'Creator, admin and safety panels for activity, provider health, audit trails and room incidents.',
    examples: ['Room monitor', 'Webhook health', 'Audit feed'],
    tone: '#60a5fa',
  },
  {
    id: 'rewards',
    title: 'Rewards and Punishment Log',
    description: 'Stickers, ranks, task streaks, awards, forfeits and recognition hooks.',
    examples: ['Task streaks', 'Sticker unlocks', 'Rank rewards'],
    tone: '#c084fc',
  },
  {
    id: 'growth',
    title: 'Growth and Social',
    description: 'Calendar sync, avatar customizer, academy content, global prize pools and social integrations.',
    examples: ['Calendar sync', 'Academy module', 'Social share'],
    tone: '#1D9E75',
  },
];

export const PLUGIN_RELOAD_EVENTS: PluginReloadEvent[] = [
  {
    id: 'installed',
    title: 'plugin.installed',
    description: 'Refresh widget registry, route availability and entitlement state after a plugin install.',
    route: '/plugins/:pluginId/enable',
    tone: '#1D9E75',
  },
  {
    id: 'updated',
    title: 'plugin.updated',
    description: 'Show update badge, reload safe UI chunks and keep previous settings available for rollback.',
    route: '/admin/plugin-actions/:id/marketplace-settings',
    tone: '#f97316',
  },
  {
    id: 'disabled',
    title: 'plugin.disabled',
    description: 'Hide route entry points, keep receipts and write an audit event for the disabled entitlement.',
    route: '/plugins/:pluginId/disable',
    tone: '#ef4444',
  },
  {
    id: 'suggestion',
    title: 'plugin.suggestion.created',
    description: 'Notify admin queue when a user requests a plugin, addon or paid custom build.',
    route: '/plugins/suggestions',
    tone: '#d4af37',
  },
];

export function getPluginOperationStatusLabel(status: PluginOperationStatus) {
  if (status === 'ready') return 'ready';
  if (status === 'review') return 'review';
  if (status === 'provider') return 'provider needed';
  return 'scaffold';
}
