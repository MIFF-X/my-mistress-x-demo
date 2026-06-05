import { createButton } from "../ui/button.js";
import { createCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

export function createProfilePlaceholder({ profile = {}, onSave } = {}) {
  const displayName = createFormField({ label: "Display name", value: profile.displayName || "", placeholder: "Lady Noir / loyal_sub_01" });
  const persona = createFormField({ label: "Persona / profile intro", type: "textarea", value: profile.persona || "", placeholder: "Short controlled profile intro." });
  const tags = createFormField({ label: "Bubble tags", value: (profile.tags || []).join(", "), helper: "Comma-separated placeholder until the persistent tag editor is wired." });
  const visibility = createFormField({
    label: "Visibility",
    type: "select",
    options: ["Public preview", "Private / paywall", "Keeper-only", "Hidden"],
  });
  const save = createButton({ label: "Save Profile Placeholder", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createCard({
      eyebrow: "Profile System",
      title: "Profile preview",
      description: "Placeholder for Mistress/Sub profile identity, tags, and private-access presentation rules.",
      icon: "👤",
    }),
  );
  form.appendChild(
    createFormSection({
      title: "Profile fields",
      description: "Ready for profile DB/API wiring and role-specific profile surfaces.",
      fields: [displayName, persona, tags, visibility],
      actions: [save],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (typeof onSave === "function") {
      onSave({
        displayName: displayName.control.value,
        persona: persona.control.value,
        tags: tags.control.value.split(",").map((tag) => tag.trim()).filter(Boolean),
        visibility: visibility.control.value,
      });
    }
  });

  return form;
}
