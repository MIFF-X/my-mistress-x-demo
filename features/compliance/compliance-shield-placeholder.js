import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const COMPLIANCE_MODULES = [
  {
    id: "age-gate",
    label: "Age Gate + Entry Controls",
    icon: "🔞",
    description: "Entry checks, age-gate status, region rules, blocked states, and platform access warnings.",
  },
  {
    id: "consent-ledger",
    label: "Consent Ledger",
    icon: "✅",
    description: "Explicit opt-in records for screen share, live participation, recording, replay, visibility, and profile display.",
  },
  {
    id: "marketplace-restrictions",
    label: "Marketplace Restrictions",
    icon: "🛍️",
    description: "Allowed/prohibited product category rules, shipping review, physical item review, and admin blocks.",
  },
  {
    id: "payment-compliance",
    label: "Payment + Payout Compliance",
    icon: "💰",
    description: "Top-up exceptions, payout approvals, reserve rules, refund/dispute review, and provider compliance checks.",
  },
  {
    id: "content-review",
    label: "Content + Media Review",
    icon: "🎬",
    description: "PPV, live replay, uploads, reports, moderation status, takedowns, archive blocks, and visibility controls.",
  },
  {
    id: "communication-safety",
    label: "Communication Safety",
    icon: "💬",
    description: "Chat/report handling, block states, escalation queues, safety notices, and consent-aware communication rules.",
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    icon: "📒",
    description: "Immutable actor, action, timestamp, affected record, reason, and status history for sensitive actions.",
  },
  {
    id: "policy-rules",
    label: "Policy Rules Engine",
    icon: "⚖️",
    description: "Central rules for allowed/disallowed behaviours, launch checks, plugin restrictions, and admin decision support.",
  },
  {
    id: "safety-review-queue",
    label: "Safety Review Queue",
    icon: "🛡️",
    description: "Queue for anything needing compliance review before public release, sale, payout, automation, or visibility.",
  },
];

const REVIEW_TYPES = [
  "Age gate issue",
  "Consent record review",
  "Content/report review",
  "Live/replay review",
  "Marketplace item review",
  "Payment/payout exception",
  "Refund/dispute review",
  "SMM authorization review",
  "Plugin launch review",
  "Policy update review",
  "Audit log investigation",
  "Legal/admin escalation",
];

const SAFETY_RULES = [
  "Age-gated entry before restricted areas",
  "Visible, opt-in, revocable consent for screen share, recording, replay, and public display",
  "No hidden surveillance or invisible tracking workflows",
  "Marketplace items must pass allowed-category and shipping review",
  "Payment and payout exceptions require admin review and audit logs",
  "Reported content or users enter moderation queues with status history",
  "Admin actions require role permissions and immutable audit logs",
  "Automation must respect platform policies, consent, and revocation state",
  "Sensitive plugin launches require compliance review before public release",
  "Public humiliation/shame-style visibility must be opt-in, moderated, and reversible where required",
];

const COMPLIANCE_STATUSES = [
  "Draft",
  "Needs Review",
  "Blocked",
  "Approved Placeholder",
  "Approved With Limits",
  "Escalated",
  "Resolved",
  "Archived",
];

export function createComplianceShieldPlaceholder({ onBack, onCreateReview } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Compliance Plugin",
      title: "Compliance Shield",
      description:
        "Central compliance and safety review layer for age gates, consent logs, restricted actions, marketplace controls, payment exceptions, reporting, audit history, and policy rules.",
      icon: "🛡️",
      actions: [createButton({ label: "Back", variant: "secondary", onClick: onBack })],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Compliance layer captured", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Modules", value: String(COMPLIANCE_MODULES.length), helper: "Consent, policy, audit, review", icon: "🛡️", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Review Types", value: String(REVIEW_TYPES.length), helper: "Queues and escalation paths", icon: "📋", progress: 60 }));
  stats.appendChild(createStatCard({ label: "Backend Rules", value: "Pending", helper: "Permissions, audit, status history", icon: "🗄️", progress: 0 }));
  shell.appendChild(stats);

  const title = createFormField({ label: "Compliance review title", placeholder: "Marketplace item review / consent check / payout exception" });
  const reviewType = createFormField({
    label: "Review type",
    type: "select",
    options: REVIEW_TYPES,
  });
  const status = createFormField({
    label: "Compliance status",
    type: "select",
    options: COMPLIANCE_STATUSES,
  });
  const riskLevel = createFormField({
    label: "Risk level",
    type: "select",
    options: ["Low", "Medium", "High", "Escalate"],
  });
  const relatedPlugin = createFormField({ label: "Related plugin / record", placeholder: "PPV / Live / Inventory / SMM / Payout / Profile" });
  const note = createFormField({ label: "Compliance note", placeholder: "Internal safety/admin note placeholder" });
  const submit = createButton({ label: "Create Compliance Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Compliance review test form",
      description: "This is a non-saving placeholder. It captures compliance review structure before real policy rules, audit logs, moderation, status history, and admin wiring are added.",
      fields: [title, reviewType, status, riskLevel, relatedPlugin, note],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onCreateReview?.({
      title: title.control.value,
      reviewType: reviewType.control.value,
      status: status.control.value,
      riskLevel: riskLevel.control.value,
      relatedPlugin: relatedPlugin.control.value,
      note: note.control.value,
    });
  });
  shell.appendChild(form);

  const moduleGrid = document.createElement("div");
  moduleGrid.className = "mx-grid mx-grid--cards";
  COMPLIANCE_MODULES.forEach((module) => {
    moduleGrid.appendChild(
      createCard({
        eyebrow: "Compliance Module",
        title: module.label,
        description: module.description,
        icon: module.icon,
        meta: module.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Compliance Modules",
      title: "Safety layer across every plugin",
      description: "Compliance Shield should connect to live, PPV, inventory, payments, SMM, badges, profiles, chat, admin, and reporting.",
      icon: "🛡️",
    }),
  );
  shell.appendChild(moduleGrid);

  const reviewGrid = document.createElement("div");
  reviewGrid.className = "mx-grid mx-grid--cards";
  REVIEW_TYPES.forEach((type) => {
    reviewGrid.appendChild(
      createCard({
        eyebrow: "Review Type",
        title: type,
        description: "Placeholder review queue type for future status, assignment, escalation, notes, related records, and audit history.",
        icon: "📋",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Review Queues",
      title: "Compliance review categories",
      description: "Every sensitive platform action needs a clear path for review, decision, audit, escalation, and final status.",
      icon: "📋",
    }),
  );
  shell.appendChild(reviewGrid);

  const ruleGrid = document.createElement("div");
  ruleGrid.className = "mx-grid mx-grid--cards";
  SAFETY_RULES.forEach((rule) => {
    ruleGrid.appendChild(
      createCard({
        eyebrow: "Safety Rule",
        title: rule,
        description: "Placeholder policy rule for future enforcement, warnings, blocked states, moderation queues, admin approvals, and audit logs.",
        icon: "✅",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Safety Rules",
      title: "Allowed and blocked behaviour map",
      description: "These rules convert raw ideas into safe, opt-in, permissioned, auditable, and reviewable platform workflows.",
      icon: "⚖️",
    }),
  );
  shell.appendChild(ruleGrid);

  const statusGrid = document.createElement("div");
  statusGrid.className = "mx-grid mx-grid--cards";
  COMPLIANCE_STATUSES.forEach((statusName) => {
    statusGrid.appendChild(
      createCard({
        eyebrow: "Compliance Status",
        title: statusName,
        description: "Placeholder status for review queues, launch checks, plugin rules, reports, items, content, or account states.",
        icon: "🏷️",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Status System",
      title: "Compliance status badges",
      description: "Compliance status should be consistent across plugin launch checks, marketplace review, payment exceptions, moderation, and reports.",
      icon: "🏷️",
    }),
  );
  shell.appendChild(statusGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Launch Rule",
      title: "Sensitive features need safety review before launch",
      description:
        "Any plugin that touches age-gated access, payments, payouts, live participation, public visibility, marketplace goods, consent records, or automated posting should be review-gated before public release.",
      icon: "🚦",
    }),
  );

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Compliance Shield data path",
      description:
        "Plugin or user action triggers review → policy rules classify risk → compliance item enters queue → admin decision writes audit log → source plugin is approved, limited, blocked, escalated, or archived → reports and command centre update.",
      icon: "📒",
    }),
  );

  return shell;
}
