import { createButton } from "../ui/button.js";
import { createCard } from "../ui/card.js";
import { createFormField, createFormSection } from "../ui/form-field.js";

export function createRegisterPlaceholder({ onStartOnboarding } = {}) {
  const displayName = createFormField({
    label: "Display name",
    placeholder: "Choose a public display name",
    required: true,
  });
  const role = createFormField({
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Mistress", value: "MISTRESS" },
      { label: "Sub", value: "SUB" },
      { label: "Headmistress / Admin", value: "HEADMISTRESS" },
    ],
  });
  const consent = createFormField({
    label: "I confirm this is an 18+ app flow placeholder",
    type: "checkbox",
    required: true,
  });
  const submit = createButton({ label: "Start Onboarding", variant: "gold", type: "submit" });

  const form = document.createElement("form");
  form.className = "mx-stack";
  form.appendChild(
    createCard({
      eyebrow: "Onboarding Placeholder",
      title: "Account setup shell",
      description: "Temporary role/profile setup surface. Real registration, verification, and session storage are handled by the auth system when mounted.",
      icon: "✨",
    }),
  );
  form.appendChild(
    createFormSection({
      title: "Starter profile",
      description: "Non-sensitive placeholder fields only. No demo credentials are stored here.",
      fields: [displayName, role, consent],
      actions: [submit],
    }),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onStartOnboarding?.({
      displayName: displayName.control.value,
      role: role.control.value,
      confirmedAdultFlow: consent.control.checked,
    });
  });

  return form;
}
