import { createButton } from "../ui/button.js";
import { createCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

export function createSettingsPlaceholder({ onSave } = {}) {
  const theme = createFormField({
    label: "Theme",
    type: "select",
    options: ["Dark", "Light", "System", "House colours"],
  });
  const textSize = createFormField({
    label: "Text size",
    type: "select",
    options: ["Small", "Default", "Large", "Extra large"],
  });
  const layout = createFormField({
    label: "Layout",
    type: "select",
    options: ["Grid", "List", "Compact cards", "Dashboard widgets"],
  });
  const language = createFormField({ label: "Language", placeholder: "Auto-detect" });
  const save = createButton({ label: "Save Settings", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-page mx-stack";
  form.appendChild(
    createCard({
      eyebrow: "Settings",
      title: "Theme, accessibility, and layout placeholder",
      description: "Starter settings surface for dark mode, text size, translation, layout views, dashboard widgets, and House identity themes.",
      icon: "⚙️",
    }),
  );
  form.appendChild(
    createFormSection({
      title: "Display settings",
      description: "Ready for persistent user settings and role-specific defaults.",
      fields: [theme, textSize, layout, language],
      actions: [save],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSave?.({ theme: theme.control.value, textSize: textSize.control.value, layout: layout.control.value, language: language.control.value });
  });

  return form;
}
