import { createButton } from "../ui/button.js";
import { createCard } from "../ui/card.js";

export function createLoginPlaceholder({ onContinueAsRole } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Entry Placeholder",
      title: "Role entry shell",
      description: "Temporary app-branch entry surface. Real authentication will be wired through the existing auth module, not fake demo credentials.",
      icon: "🔐",
    }),
  );

  const roleGrid = document.createElement("div");
  roleGrid.className = "mx-grid mx-grid--cards";

  [
    { role: "MISTRESS", label: "Continue as Mistress", icon: "👑" },
    { role: "SUB", label: "Continue as Sub", icon: "🐾" },
    { role: "HEADMISTRESS", label: "Continue as Headmistress", icon: "🛡️" },
  ].forEach((item) => {
    roleGrid.appendChild(
      createCard({
        eyebrow: item.role,
        title: item.label,
        description: "Placeholder only — used to test screen flow before the real auth/session bridge is mounted.",
        icon: item.icon,
        actions: [
          createButton({
            label: "Enter",
            variant: "gold",
            onClick: () => onContinueAsRole?.(item.role),
          }),
        ],
      }),
    );
  });

  shell.appendChild(roleGrid);
  return shell;
}
