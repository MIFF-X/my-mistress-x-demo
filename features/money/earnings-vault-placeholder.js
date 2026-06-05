import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

const CASHOUT_METHODS = [
  {
    id: "bank-account",
    label: "Bank Account Cashout",
    icon: "🏦",
    status: "planned",
    description: "Standard bank payout profile for Mistress earnings withdrawals.",
  },
  {
    id: "payid-cashout",
    label: "PayID Cashout",
    icon: "🇦🇺",
    status: "planned",
    description: "Australian PayID payout pathway for supported Mistress payout profiles.",
  },
  {
    id: "stripe-connect-payout",
    label: "Stripe Connect Payout",
    icon: "⚡",
    status: "optional add-on",
    description: "Optional Stripe Connect payout route where supported and compliant.",
  },
  {
    id: "adult-friendly-processor-payout",
    label: "Adult-Friendly Processor Payout",
    icon: "🔞",
    status: "optional add-on",
    description: "Alternative adult-platform compatible payout provider slot.",
  },
  {
    id: "manual-bank-payout",
    label: "Manual Bank Payout",
    icon: "🧾",
    status: "planned",
    description: "Admin-reviewed manual payout path for weekly batches, exceptions, and processor fallbacks.",
  },
];

const VAULT_CONTROLS = [
  "Available balance",
  "Pending balance",
  "Dispute reserve",
  "Weekly payout batch",
  "Admin approval status",
  "Payout history",
  "Bank / PayID payout profile",
  "Processor payout profile",
];

export function createEarningsVaultPlaceholder({ onBack, onRequestPayout } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Money Out Plugin",
      title: "Earnings Vault",
      description:
        "Money-out plugin for Mistress earnings, payout profiles, cashout requests, admin approval, reserve handling, payout batches, and payout history.",
      icon: "👛",
      actions: [
        createButton({ label: "Back", variant: "secondary", onClick: onBack }),
      ],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugin Status", value: "Locked", helper: "Name and architecture approved", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Money Direction", value: "Out", helper: "Mistress cashout and payout management", icon: "⬆️", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Payout Wiring", value: "Pending", helper: "Bank, PayID, Stripe, processor, manual batch", icon: "🔌", progress: 0 }));
  stats.appendChild(createStatCard({ label: "Reserve Logic", value: "Pending", helper: "Disputes, holds, approvals, weekly batches", icon: "🛡️", progress: 0 }));
  shell.appendChild(stats);

  const amount = createFormField({
    label: "Cashout amount",
    type: "number",
    placeholder: "100",
    helper: "Placeholder only. Real available balance, fees, reserves, and minimum payout rules come from backend config.",
  });
  const method = createFormField({
    label: "Cashout method",
    type: "select",
    options: CASHOUT_METHODS.map((item) => ({ label: item.label, value: item.id })),
  });
  const note = createFormField({
    label: "Payout note",
    placeholder: "Optional admin/payout note",
  });
  const submit = createButton({ label: "Create Payout Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createFormSection({
      title: "Cashout request test form",
      description: "This is a non-payment placeholder. It captures the Mistress payout workflow before real provider, admin, and ledger wiring are added.",
      fields: [amount, method, note],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onRequestPayout?.({
      amount: amount.control.value,
      method: method.control.value,
      note: note.control.value,
    });
  });
  shell.appendChild(form);

  const controlGrid = document.createElement("div");
  controlGrid.className = "mx-grid mx-grid--cards";
  VAULT_CONTROLS.forEach((control) => {
    controlGrid.appendChild(
      createCard({
        eyebrow: "Vault Control",
        title: control,
        description: "Placeholder for future ledger, payout, admin, and reserve state.",
        icon: "🔐",
      }),
    );
  });
  shell.appendChild(
    createCard({
      eyebrow: "Vault Controls",
      title: "Earnings and payout management placeholders",
      description: "The Earnings Vault separates creator cashout management from user top-ups, with admin approval and reserve logic kept visible.",
      icon: "👛",
    }),
  );
  shell.appendChild(controlGrid);

  const methodGrid = document.createElement("div");
  methodGrid.className = "mx-grid mx-grid--cards";
  CASHOUT_METHODS.forEach((item) => {
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
      eyebrow: "Payout Slots",
      title: "Supported cashout method placeholders",
      description: "Each payout method stays modular so payout providers can be enabled, disabled, reviewed, or replaced without rewriting the earnings ledger.",
      icon: "🔌",
    }),
  );
  shell.appendChild(methodGrid);

  shell.appendChild(
    createCard({
      eyebrow: "Backend Flow",
      title: "Earnings Vault ledger path",
      description:
        "Mistress earnings accrue from purchases → platform split and reserve rules apply → available balance updates → Mistress requests payout → admin/provider approves → payout batch completes → ledger and payout history become source of truth.",
      icon: "📒",
    }),
  );

  return shell;
}
