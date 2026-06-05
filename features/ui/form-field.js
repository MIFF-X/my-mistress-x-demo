export function createFormField({
  id,
  name,
  label = "Field label",
  type = "text",
  value = "",
  placeholder = "",
  helper = "",
  error = "",
  required = false,
  options = [],
  rows = 4,
  onInput,
  onChange,
} = {}) {
  const fieldId = id || `mx-field-${Math.random().toString(36).slice(2)}`;
  const wrapper = document.createElement("label");
  wrapper.className = `mx-form-field${error ? " mx-form-field--error" : ""}`;
  wrapper.setAttribute("for", fieldId);

  const labelEl = document.createElement("span");
  labelEl.className = "mx-form-field__label";
  labelEl.textContent = required ? `${label} *` : label;
  wrapper.appendChild(labelEl);

  let control;
  if (type === "textarea") {
    control = document.createElement("textarea");
    control.rows = rows;
  } else if (type === "select") {
    control = document.createElement("select");
    options.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.value = option.value ?? option.label ?? option;
      optionEl.textContent = option.label ?? option.value ?? option;
      control.appendChild(optionEl);
    });
  } else {
    control = document.createElement("input");
    control.type = type;
  }

  control.id = fieldId;
  control.name = name || fieldId;
  control.value = value;
  control.placeholder = placeholder;
  control.required = required;
  control.className = "mx-form-field__control";

  if (helper || error) {
    const messageId = `${fieldId}-message`;
    control.setAttribute("aria-describedby", messageId);
    if (error) control.setAttribute("aria-invalid", "true");
  }

  if (typeof onInput === "function") control.addEventListener("input", onInput);
  if (typeof onChange === "function") control.addEventListener("change", onChange);

  wrapper.appendChild(control);

  if (helper || error) {
    const message = document.createElement("span");
    message.id = `${fieldId}-message`;
    message.className = error ? "mx-form-field__error" : "mx-form-field__helper";
    message.textContent = error || helper;
    wrapper.appendChild(message);
  }

  return { wrapper, control };
}

export function createFormSection({ title, description = "", fields = [], actions = [] } = {}) {
  const section = document.createElement("section");
  section.className = "mx-form-section";

  const header = document.createElement("header");
  header.className = "mx-form-section__header";
  header.innerHTML = `<h3>${title}</h3>${description ? `<p>${description}</p>` : ""}`;
  section.appendChild(header);

  const body = document.createElement("div");
  body.className = "mx-form-section__body";
  fields.forEach((field) => body.appendChild(field.wrapper || field));
  section.appendChild(body);

  if (actions.length) {
    const footer = document.createElement("footer");
    footer.className = "mx-form-section__footer";
    actions.forEach((action) => footer.appendChild(action));
    section.appendChild(footer);
  }

  return section;
}

const formFieldStyles = document.createElement("style");
formFieldStyles.textContent = `
  .mx-form-field {
    display: flex;
    flex-direction: column;
    gap: var(--mx-space-2);
  }

  .mx-form-field__label {
    color: var(--mx-text);
    font-size: var(--mx-text-sm);
    font-weight: 800;
  }

  .mx-form-field__control {
    width: 100%;
    min-height: 2.9rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--mx-border);
    border-radius: var(--mx-radius-md);
    background: rgba(255, 255, 255, 0.06);
    color: var(--mx-text);
    outline: none;
    transition: border-color var(--mx-transition), box-shadow var(--mx-transition), background var(--mx-transition);
  }

  textarea.mx-form-field__control {
    min-height: 7rem;
    resize: vertical;
  }

  .mx-form-field__control::placeholder {
    color: var(--mx-text-soft);
  }

  .mx-form-field__control:focus {
    border-color: var(--mx-gold);
    box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.12);
    background: rgba(255, 255, 255, 0.09);
  }

  .mx-form-field__helper,
  .mx-form-field__error {
    font-size: var(--mx-text-xs);
  }

  .mx-form-field__helper {
    color: var(--mx-text-muted);
  }

  .mx-form-field__error {
    color: #ff9a78;
  }

  .mx-form-field--error .mx-form-field__control {
    border-color: rgba(216, 90, 48, 0.72);
  }

  .mx-form-section {
    display: flex;
    flex-direction: column;
    gap: var(--mx-space-5);
    padding: var(--mx-space-5);
    border: 1px solid var(--mx-border);
    border-radius: var(--mx-radius-lg);
    background: rgba(255, 255, 255, 0.045);
  }

  .mx-form-section__header h3 {
    margin: 0;
  }

  .mx-form-section__header p {
    margin: var(--mx-space-2) 0 0;
    color: var(--mx-text-muted);
  }

  .mx-form-section__body {
    display: grid;
    gap: var(--mx-space-4);
  }

  .mx-form-section__footer {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--mx-space-2);
  }
`;

document.head.appendChild(formFieldStyles);
