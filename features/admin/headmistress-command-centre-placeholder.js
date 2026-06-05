import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const COMMAND_MODULES = [
  {
    id: "platform-overview",
    label: "Platform Overview",
    icon: "👑",
    description: "High-level view of users, Mistresses, Subs, revenue, content, live rooms, disputes, reports, and feature health.",
  },
  {
    id: "moderation-queue",
    label: "Moderation Queue",
    icon: "🛡️",
    description: "Review reported content, profiles, messages, inventory, stickers, rooms, and risky or policy-sensitive actions.",
  },
  {
    id: "approval-centre",
    label: "Approval Centre",
    icon: "✅",
    description: "Approve or reject verification, payout, content, marketplace, plugin, badge, and trust-badge actions.",
  },
  {
    id: "money-oversight",
    label: "Money Oversight",
    icon: "💰",
    description: "Review Top-Up exceptions, Earnings Vault payouts, reserves, refunds, disputes, and ledger anomalies.",
  },
  {
    id: "plugin-controls",
    label: "Plugin Controls",
    icon: "🧩",
    description: "Enable, disable, configure, audit, and report on installed platform plugins and add-ons.",
  },
  {
    id: "user-roles-permissions",
    label: "User Roles + Permissions",
    icon: "🔐",
    description: "Manage Headmistress, Mistress, Sub, admin, moderator, support, and system access permissions.",
  },
  {
    id: "analytics-reports",
    label: "Analytics + Reports",
    icon: "📊",
    description: "View revenue, engagement, content, live, payments, support, marketplace, badges, and SMM performance.",
  },
  {
    id: "compliance-centre",
    label: "Compliance Centre",
    icon: "⚖️",
    description: "Consent logs, age gates, risk flags, platform rules, audit history, restrictions, and legal review queues.",
  },
  {
    id: "support-disputes",
    label: "Support + Disputes",
    icon: "🎧",
    description: "Handle member support, urgent threads, supplier issues, order disputes, payout issues, and escalation workflows.",
  },
];

const ADMIN_ACTIONS = [
  "Approve",
  "Reject",
  "Request More Info",
  "Escalate",
  "Suspend",
  "Restore",
  "Hide / Disable",
  "Mark Resolved",
  "Send Warning",
  "Audit History",
  "Export Report",
  "Open Related Record",
];

const REVIEW_QUEUES = [
  "ID verification",
  "Financial verification",
  "Mistress payout approval",
  "Top-up exception review",
  "Content moderation",
  "Inventory compliance review",
  "Sticker / badge review",
  "Live room reports",
  "Support urgent threads",
  "Dispute and refund review",
  "Plugin install/config review",
  "SMM connection/security review",
];

const COMMAND_STATUSES = [
  "New",
  "Pending",
  "Needs Review",
  "Urgent",
  "Approved",
  "Rejected",
  "Escalated",
  "Resolved",
  "Disabled",
  "Archived",
];

export function createHeadmistressCommandCentrePlaceholder({ onBack, onCreateReviewItem } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Admin / Headmistress Plugin",
      title: "Headmistress Command Centre",
      description:
        "Central oversight surface for moderation, approvals, payouts, disputes, plugin controls, reports, compliance queues, support, and platform health.",
      icon: "👑",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Admin command-centre requirements captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Command Modules", value: String(COMMAND_MODULES.length), helper: "Oversight, moderation, money, compliance", icon: "👑", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Review Queues", value: String(REVIEW_QUEUES.length), helper: "Approvals and escalations", icon: "🛡️", progress: 60 }));
  stats.appendChild(createStatCard({ label: "Backend Admin APIs", value: "Pending", helper: "Permissions, queues, audit logs", icon: "🗄️", progress: 0 }));
  shell.appendChild(stats);

  const title = createFormField({ label: "Review item title", placeholder: "Payout approval / content report / plugin config review" });
  const queue = createFormField({
    label: "Review queue",
    type: "select",
    options: REVIEW_QUEUES,
  });
  const priority = createFormField({
    label: "Priority",
    type: "select",
    options: ["Low", "Normal", "High", "Urgent"],
  });
  const status = createFormField({
    label: "Status",
    type: "select",
    options: COMMAND_STATUSES,
  });
  const owner = createFormField({ label: "Assigned to", placeholder: "Headmistress / moderator / support / finance" });
  const note = createFormField({ label: "Admin note", placeholder: "Internal review note placeholder" });
  const submit = createButton({ label: "Create Review Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Command-centre review test form",
      description: "This is a non-saving placeholder. It captures queue and review structure before permissions, moderation, approval, audit, and reporting backend wiring are added.",
      fields: [title, queue, priority, status, owner, note],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onCreateReviewItem?.({
      title: title.control.value,
      queue: queue.control.value,
      priority: priority.control.value,
      status: status.control.value,
      owner: owner.control.value,
      note: note.control.value,
    });
  });
  shell.appendChild(form);

  const moduleGrid = document.createElement("div");
  moduleGrid.className = "mx-grid mx-grid--cards";
  COMMAND_MODULES.forEach((module) => {
    moduleGrid.appendChild(
      createCard({
        eyebrow: "Command Module",
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
      title: "Headmistress control surfaces",
      description: "The command centre should see every system feeding every other system: money, live, content, inventory, badges, SMM, support, and compliance.",
      icon: "👑",
    }),
  );
  shell.appendChild(moduleGrid);

  const queueGrid = document.createElement("div");
  queueGrid.className = "mx-grid mx-grid--cards";
  REVIEW_QUEUES.forEach((queueName) => {
    queueGrid.appendChild(
      createCard({
        eyebrow: "Review Queue",
        title: queueName,
        description: "Placeholder queue for future admin permissions, filters, status badges, action buttons, escalation, and audit logs.",
        icon: "📋",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Review Queues",
      title: "All approvals and escalations in one place",
      description: "Each queue should support filters, role permissions, quick actions, notes, related records, status history, and exportable reports.",
      icon: "🛡️",
    }),
  );
  shell.appendChild(queueGrid);

  const actionGrid = document.createElement("div");
  actionGrid.className = "mx-grid mx-grid--cards";
  ADMIN_ACTIONS.forEach((action) => {
    actionGrid.appendChild(
      createCard({
        eyebrow: "Admin Action",
        title: action,
        description: "Placeholder action for future queue item workflow, permission checks, audit logging, notifications, and status changes.",
        icon: "⚡",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Quick Actions",
      title: "Admin decision controls",
      description: "Every command-centre action must check role permissions, write an audit log, notify relevant users where needed, and update related plugin records.",
      icon: "⚡",
    }),
  );
  shell.appendChild(actionGrid);

  const statusGrid = document.createElement("div");
  statusGrid.className = "mx-grid mx-grid--cards";
  COMMAND_STATUSES.forEach((statusName) => {
    statusGrid.appendChild(
      createCard({
        eyebrow: "Command Status",
        title: statusName,
        description: "Placeholder status badge for moderation, approvals, support, payouts, plugin config, compliance, and reporting workflows.",
        icon: "🏷️",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Status System",
      title: "Queue status badges",
      description: "Status badges should be consistent across all admin queues so the Headmistress can scan the platform quickly.",
      icon: "🏷️",
    }),
  );
  shell.appendChild(statusGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Security Rule",
      title: "Admin actions must be permissioned and audited",
      description:
        "Every command-centre action needs role checks, immutable audit logs, timestamps, actor IDs, affected records, reason notes, and rollback/review support where relevant.",
      icon: "🔐",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Headmistress command-centre data path",
      description:
        "Plugin/user/event creates review item → item enters queue → Headmistress/admin reviews related records → action updates source plugin → audit log is written → notifications/reports/analytics update.",
      icon: "📒",
    }),
  );

  return shell;
}
