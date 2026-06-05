import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const SMM_MODULES = [
  {
    id: "website-linking",
    label: "Website Linking + Authorization",
    icon: "🔗",
    description: "Connect websites with URL, OAuth, API token, authorization status, linked accounts, and site detail screens.",
  },
  {
    id: "plugin-management",
    label: "Plug-In Management",
    icon: "🧩",
    description: "Install, configure, remove, connect, and manage SMM plugins from a central marketplace-style dashboard.",
  },
  {
    id: "content-distribution",
    label: "Content Distribution",
    icon: "📣",
    description: "Pull latest posts/products and schedule social publishing to X, Instagram, Reddit, Telegram, and other channels.",
  },
  {
    id: "blogger-seo",
    label: "Blogger / SEO Publishing",
    icon: "📝",
    description: "Create, manage, and optimize Blogspot/Blogger content for SEO, traffic growth, ad revenue, and platform promotion.",
  },
  {
    id: "communication-hub",
    label: "Communication Hub",
    icon: "💬",
    description: "Unified inbox for email, WhatsApp, Telegram, Microsoft Teams, supplier messages, and customer/member support.",
  },
  {
    id: "order-fulfilment",
    label: "Order Fulfilment / Operations",
    icon: "📦",
    description: "Bulk order processing, supplier order placement, totals, fulfilment status, and manual/automated workflows.",
  },
  {
    id: "supplier-disputes",
    label: "Supplier Messaging + Disputes",
    icon: "⚠️",
    description: "Supplier message templates, wrong/missing/customization dispute tracking, status updates, and resolved states.",
  },
  {
    id: "ad-revenue",
    label: "Google Ad Revenue",
    icon: "💸",
    description: "AdSense/Ad Manager revenue summaries, linked domains, blog performance, and monthly revenue reporting.",
  },
  {
    id: "analytics-reporting",
    label: "Analytics + Reporting",
    icon: "📊",
    description: "Website analytics, engagement, conversions, campaign performance, revenue reports, and plugin performance visibility.",
  },
];

const CONNECTED_CHANNELS = [
  "X",
  "Instagram",
  "Reddit",
  "Telegram",
  "Blogger / Blogspot",
  "Email Accounts",
  "WhatsApp",
  "Microsoft Teams",
  "Google AdSense / Ad Manager",
];

const STATUS_BADGES = [
  "Authorized",
  "Pending",
  "Disconnected",
  "Active",
  "Needs Configure",
  "Urgent",
  "Resolved",
  "Scheduled",
  "Published",
  "Failed",
];

const CORE_PLUGINS = [
  "Content Puller",
  "Social Poster",
  "Blogger Manager",
  "Email Accounts",
  "Instant Messengers",
  "Google Ad Revenue",
  "Supplier Fulfilment",
  "Dispute Tracker",
  "Analytics Reporter",
];

export function createSmmCommandCenterPlaceholder({ onBack, onLinkWebsite } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "SMM / Multi-Site Command Plugin",
      title: "SMM Command Center",
      description:
        "Multi-site social media and commerce control platform for website linking, plugin management, content posting, Blogger/SEO, inboxes, orders, supplier disputes, ad revenue, and analytics.",
      icon: "📣",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "SMM feature outline captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Modules", value: String(SMM_MODULES.length), helper: "Publishing, inbox, fulfilment, revenue, analytics", icon: "🧩", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Connected Channels", value: String(CONNECTED_CHANNELS.length), helper: "Social, email, Blogger, ads, messaging", icon: "🔗", progress: 60 }));
  stats.appendChild(createStatCard({ label: "OAuth/API Wiring", value: "Pending", helper: "Secure connection backend needed", icon: "🔐", progress: 0 }));
  shell.appendChild(stats);

  const websiteUrl = createFormField({ label: "Website URL", placeholder: "https://example-site.com" });
  const authMethod = createFormField({
    label: "Authorization method",
    type: "select",
    options: [
      { label: "OAuth", value: "oauth" },
      { label: "API token", value: "api-token" },
      { label: "Manual setup placeholder", value: "manual" },
    ],
  });
  const accountType = createFormField({
    label: "Account/channel type",
    type: "select",
    options: CONNECTED_CHANNELS,
  });
  const status = createFormField({
    label: "Connection status",
    type: "select",
    options: ["Authorized", "Pending", "Disconnected"],
  });
  const note = createFormField({ label: "Connection note", placeholder: "Supplier site / blog / social channel / shop account" });
  const submit = createButton({ label: "Link Website Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Website linking test form",
      description: "This is a non-connecting placeholder. It captures the multi-site connection flow before real OAuth, token storage, account sync, and publishing backend wiring are added.",
      fields: [websiteUrl, authMethod, accountType, status, note],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onLinkWebsite?.({
      websiteUrl: websiteUrl.control.value,
      authMethod: authMethod.control.value,
      accountType: accountType.control.value,
      status: status.control.value,
      note: note.control.value,
    });
  });
  shell.appendChild(form);

  const moduleGrid = document.createElement("div");
  moduleGrid.className = "mx-grid mx-grid--cards";
  SMM_MODULES.forEach((module) => {
    moduleGrid.appendChild(
      createCard({
        eyebrow: "SMM Module",
        title: module.label,
        description: module.description,
        icon: module.icon,
        meta: module.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Command Modules",
      title: "SMM systems feeding systems",
      description: "The SMM app is a separate but linked command center that feeds blogs, websites, social accounts, suppliers, revenue, analytics, and the core platform funnel.",
      icon: "🧩",
    }),
  );
  shell.appendChild(moduleGrid);

  const pluginGrid = document.createElement("div");
  pluginGrid.className = "mx-grid mx-grid--cards";
  CORE_PLUGINS.forEach((plugin) => {
    pluginGrid.appendChild(
      createCard({
        eyebrow: "SMM Plugin",
        title: plugin,
        description: "Placeholder plugin slot for connect, configure, manage, status, and reporting actions.",
        icon: "🧩",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Plugin Marketplace",
      title: "SMM plugin management",
      description: "Add, configure, connect, manage, remove, and report on SMM plugins from a modular marketplace-style area.",
      icon: "🧩",
    }),
  );
  shell.appendChild(pluginGrid);

  const channelGrid = document.createElement("div");
  channelGrid.className = "mx-grid mx-grid--cards";
  CONNECTED_CHANNELS.forEach((channel) => {
    channelGrid.appendChild(
      createCard({
        eyebrow: "Connected Channel",
        title: channel,
        description: "Placeholder channel for future OAuth/API token connection, posting, inbox, analytics, revenue, or support workflow.",
        icon: "🔗",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Connected Accounts",
      title: "Social, email, blog, messaging, and ad accounts",
      description: "Each linked website can manage multiple connected accounts from a dedicated detail screen.",
      icon: "🔗",
    }),
  );
  shell.appendChild(channelGrid);

  const statusGrid = document.createElement("div");
  statusGrid.className = "mx-grid mx-grid--cards";
  STATUS_BADGES.forEach((badge) => {
    statusGrid.appendChild(
      createCard({
        eyebrow: "Status Badge",
        title: badge,
        description: "Placeholder status badge for quick admin UX across publishing, support, orders, disputes, revenue, and connections.",
        icon: "🏷️",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Admin UX",
      title: "Status badges and quick actions",
      description: "SMM screens need visible status badges and quick actions like Manage, Configure, Connect, Open Inbox, View Reports, Publish, Resolve, and Retry.",
      icon: "⚡",
    }),
  );
  shell.appendChild(statusGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Security Rule",
      title: "OAuth/API tokens must be stored securely",
      description:
        "Real SMM connections need encrypted token storage, permission scopes, revocation, audit logs, rate-limit handling, and platform-policy checks before auto-posting or syncing data.",
      icon: "🔐",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "SMM command center data path",
      description:
        "Admin links website → OAuth/API token is verified → connected accounts sync → content queue pulls posts/products → publishing jobs schedule/send → inbox/order/dispute events update → ad revenue and analytics feed reports.",
      icon: "📒",
    }),
  );

  return shell;
}
