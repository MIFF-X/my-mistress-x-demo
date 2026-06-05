export function createButton({
  label = "Button",
  variant = "primary",
  size = "md",
  type = "button",
  icon = "",
  disabled = false,
  ariaLabel,
  onClick,
} = {}) {
  const button = document.createElement("button");
  button.type = type;
  button.className = `mx-button mx-button--${variant} mx-button--${size}`;
  button.disabled = disabled;
  if (ariaLabel) button.setAttribute("aria-label", ariaLabel);

  if (icon) {
    const iconSpan = document.createElement("span");
    iconSpan.className = "mx-button__icon";
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.textContent = icon;
    button.appendChild(iconSpan);
  }

  const labelSpan = document.createElement("span");
  labelSpan.textContent = label;
  button.appendChild(labelSpan);

  if (typeof onClick === "function") button.addEventListener("click", onClick);

  return button;
}

export function createButtonRow(buttons = []) {
  const row = document.createElement("div");
  row.className = "mx-button-row";
  buttons.forEach((button) => row.appendChild(button));
  return row;
}

const buttonStyles = document.createElement("style");
buttonStyles.textContent = `
  .mx-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--mx-space-2);
    min-height: 2.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid transparent;
    border-radius: var(--mx-radius-md);
    font-weight: 800;
    line-height: 1;
    text-decoration: none;
    transition: transform var(--mx-transition), border-color var(--mx-transition), background var(--mx-transition), box-shadow var(--mx-transition), color var(--mx-transition);
  }

  .mx-button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .mx-button--primary {
    background: linear-gradient(135deg, var(--mx-purple), var(--mx-rose));
    color: #fff;
    box-shadow: 0 12px 28px rgba(139, 30, 90, 0.28);
  }

  .mx-button--gold {
    background: linear-gradient(135deg, var(--mx-gold), #f5dd88);
    color: #130d07;
    box-shadow: var(--mx-shadow-gold);
  }

  .mx-button--secondary {
    border-color: var(--mx-border);
    background: rgba(255, 255, 255, 0.06);
    color: var(--mx-text);
  }

  .mx-button--ghost {
    background: transparent;
    color: var(--mx-text-muted);
  }

  .mx-button--danger {
    background: rgba(216, 90, 48, 0.14);
    border-color: rgba(216, 90, 48, 0.36);
    color: #ff9a78;
  }

  .mx-button--sm {
    min-height: 2.15rem;
    padding: 0.5rem 0.7rem;
    font-size: var(--mx-text-xs);
  }

  .mx-button--lg {
    min-height: 3.25rem;
    padding: 0.95rem 1.35rem;
    font-size: var(--mx-text-lg);
  }

  .mx-button-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--mx-space-2);
  }
`;

document.head.appendChild(buttonStyles);
