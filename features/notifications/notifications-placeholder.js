import { createCard } from "../ui/card.js";
import { createButton } from "../ui/button.js";

export const placeholderNotifications = [
  { id: "n-1", type: "wallet", title: "Top-up received", body: "Wallet balance updated.", urgent: false },
  { id: "n-2", type: "chat", title: "New paid message", body: "A paid message is waiting.", urgent: true },
  { id: "n-3", type: "live", title: "Live show soon", body: "A followed room starts in 10 minutes.", urgent: false },
];

export function createNotificationsPlaceholder({ notifications = placeholderNotifications, onOpen } = {}) {
  const wrap = document.createElement("section");
  wrap.className = "mx-page mx-stack";

  wrap.appendChild(
    createCard({
      eyebrow: "Notifications",
      title: "Bell / alerts placeholder",
      description: "Notification shell for wallet events, chat unlocks, gifts, PPV, live shows, goals, tasks, and calendar reminders.",
      icon: "🔔",
    }),
  );

  const list = document.createElement("div");
  list.className = "mx-stack";
  notifications.forEach((item) => {
    list.appendChild(
      createCard({
        eyebrow: item.urgent ? "Urgent" : item.type,
        title: item.title,
        description: item.body,
        icon: item.urgent ? "⚠️" : "🔔",
        variant: item.urgent ? "warning" : "default",
        actions: [createButton({ label: "Open", variant: item.urgent ? "gold" : "secondary", onClick: () => onOpen?.(item) })],
      }),
    );
  });

  wrap.appendChild(list);
  return wrap;
}
