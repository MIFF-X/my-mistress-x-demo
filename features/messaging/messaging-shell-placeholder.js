import { createButton } from "../ui/button.js";
import { createCard } from "../ui/card.js";
import { createFormField } from "../ui/form-field.js";

export function createMessagingShellPlaceholder({ messages = [], onSend, onUnlock } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Messaging",
      title: "Paid chat shell placeholder",
      description: "Starter chat layout for free messages, paid messages, unlock gates, gifts, notes, and future real-time WebSocket wiring.",
      icon: "💬",
      actions: [createButton({ label: "Unlock Chat", variant: "gold", onClick: onUnlock })],
    }),
  );

  const thread = document.createElement("div");
  thread.className = "mx-message-thread";
  const safeMessages = messages.length ? messages : [
    { from: "Mistress", body: "Private-access chat placeholder ready." },
    { from: "System", body: "Wallet unlocks, gifts, and paid messages wire here." },
  ];

  safeMessages.forEach((message) => {
    const row = document.createElement("article");
    row.className = "mx-message";
    row.innerHTML = `<strong>${message.from}</strong><p>${message.body}</p>`;
    thread.appendChild(row);
  });

  const input = createFormField({ label: "Message", placeholder: "Type message..." });
  const send = createButton({ label: "Send", variant: "gold" });
  const paid = createButton({ label: "Send Paid", variant: "secondary" });

  const composer = document.createElement("div");
  composer.className = "mx-message-composer";
  composer.appendChild(input.wrapper);
  composer.appendChild(send);
  composer.appendChild(paid);

  send.addEventListener("click", () => onSend?.({ type: "FREE", message: input.control.value }));
  paid.addEventListener("click", () => onSend?.({ type: "PAID", message: input.control.value }));

  shell.appendChild(thread);
  shell.appendChild(composer);
  return shell;
}

const messagingStyles = document.createElement("style");
messagingStyles.textContent = `
  .mx-message-thread {
    display: grid;
    gap: var(--mx-space-3);
    padding: var(--mx-space-4);
    border: 1px solid var(--mx-border);
    border-radius: var(--mx-radius-lg);
    background: rgba(255, 255, 255, 0.04);
  }

  .mx-message {
    max-width: 72ch;
    padding: var(--mx-space-3);
    border-radius: var(--mx-radius-md);
    background: rgba(255, 255, 255, 0.06);
  }

  .mx-message p {
    margin: var(--mx-space-1) 0 0;
    color: var(--mx-text-muted);
  }

  .mx-message-composer {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--mx-space-3);
    align-items: end;
  }

  @media (max-width: 760px) {
    .mx-message-composer {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(messagingStyles);
