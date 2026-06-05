import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const TOP_UP_METHODS = [
  {
    id: "card",
    label: "Card Top-Up",
    icon: "💳",
    status: "planned",
    description: "Credit/debit card top-up provider slot. Real processor wiring comes later.",
  },
  {
    id: "google-pay",
    label: "Google Pay",
    icon: "G",
    status: "planned",
    description: "Fast wallet top-up method for supported devices and browsers.",
  },
  {
    id: "apple-pay",
    label: "Apple Pay",
    icon: "",
    status: "planned",
    description: "Apple Pay top-up method for supported Apple devices and browsers.",
  },
  {
    id: "payid-transfer",
    label: "PayID Bank Transfer",
    icon: "🏦",
    status: "planned",
    description: "Australian PayID transfer option with manual or semi-automated verification workflow.",
  },
  {
    id: "manual-verification",
    label: "Manual Payment Verification",
    icon: "🧾",
    status: "planned",
    description: "Admin-reviewed top-up pathway for bank transfer screenshots, references, and exceptions.",
  },
  {
    id: "stripe-creator-addon",
    label: "Stripe Creator Monetisation Add-On",
    icon: "⚡",
    status: "optional add-on",
    description: "Optional creator-economy payment route where supported and compliant.",
  },
  {
    id: "adult-friendly-processor-addon",
    label: "Adult-Friendly Processor Add-On",
    icon: "🔞",
    status: "optional add-on",
    description: "Alternative processor slot for adult-platform compatible payment providers.",
  },
];

export function createTopUpPaymentOptionsPlaceholder({ onBack, onSubmitTopUp } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Money In Plugin",
      title: "Top-Up Payment Options",
      description:
        "Money-in plugin for Sub/user wallet top-ups. This keeps payment entry separate from Mistress cashout, reduces confusion, and lets the platform support multiple providers without changing the wallet ledger flow.",
      icon: "💰",
      actions: [
        createButton({ label: "Back", variant: "secondary", onClick: onBack }),
      ],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Name and architecture approved", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Money Direction", value: "In", helper: "Sub/user adds funds to wallet", icon: "⬇️", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Provider Wiring", value: "Pending", helper: "Card, Google Pay, PayID, processors", icon: "🔌", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Ledger Wiring", value: "Pending", helper: "Wallet balance + transaction records", icon: "📒", progress: 0 }));
  shell.appendChild(stats);

  const amount = createFormField({
    label: "Top-up amount",
    type: "number",
    placeholder: "25",
    helper: "Placeholder only. Real min/max limits, fees, and currency rules come from backend config.",
  });
  const method = createFormField({
    label: "Payment method",
    type: "select",
    options: TOP_UP_METHODS.map((item) => ({ label: item.label, value: item.id })),
  });
  const reference = createFormField({
    label: "Reference / note",
    placeholder: "Optional transfer reference or admin note",
  });
  const submit = createButton({ label: "Create Top-Up Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Top-up test form",
      description: "This is a non-payment placeholder. It captures the UI flow before real processor and ledger wiring are added.",
      fields: [amount, method, reference],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSubmitTopUp?.({
      amount: amount.control.value,
      method: method.control.value,
      reference: reference.control.value,
    });
  });
  shell.appendChild(form);

  const methodGrid = document.createElement("div");
  methodGrid.className = "mx-grid mx-grid--cards";
  TOP_UP_METHODS.forEach((item) => {
    methodGrid.appendChild(
      createCard({
        eyebrow: item.status,
        title: item.label,
        description: item.description,
        icon: item.icon,
        meta: item.id,
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Provider Slots",
      title: "Supported top-up method placeholders",
      description: "Each method stays modular so payment providers can be enabled, disabled, reviewed, or replaced without rewriting the wallet system.",
      icon: "🔌",
    }),
  );
  shell.appendChild(methodGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Top-up ledger path",
      description:
        "Sub/user chooses method → payment provider or manual review creates pending transaction → admin/provider confirms → wallet balance updates → ledger record becomes source of truth.",
      icon: "📒",
    }),
  );

  return shell;
}
