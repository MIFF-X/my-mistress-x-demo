import { createButton } from "./button.js";

export function createModal({
  title = "Modal title",
  description = "",
  content = null,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  closeOnBackdrop = true,
} = {}) {
  const backdrop = document.createElement("div");
  backdrop.className = "mx-modal-backdrop";
  backdrop.setAttribute("role", "presentation");

  const dialog = document.createElement("section");
  dialog.className = "mx-modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "mx-modal-title");

  const header = document.createElement("header");
  header.className = "mx-modal__header";
  header.innerHTML = `<h2 id="mx-modal-title">${title}</h2>${description ? `<p>${description}</p>` : ""}`;

  const body = document.createElement("div");
  body.className = "mx-modal__body";
  if (content instanceof HTMLElement) {
    body.appendChild(content);
  } else if (typeof content === "string") {
    body.innerHTML = content;
  }

  const footer = document.createElement("footer");
  footer.className = "mx-modal__footer";

  const close = () => {
    backdrop.remove();
  };

  const cancelButton = createButton({
    label: cancelLabel,
    variant: "secondary",
    onClick: () => {
      if (typeof onCancel === "function") onCancel();
      close();
    },
  });

  const confirmButton = createButton({
    label: confirmLabel,
    variant: "gold",
    onClick: () => {
      if (typeof onConfirm === "function") onConfirm();
      close();
    },
  });

  footer.appendChild(cancelButton);
  footer.appendChild(confirmButton);

  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);
  backdrop.appendChild(dialog);

  if (closeOnBackdrop) {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) close();
    });
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && document.body.contains(backdrop)) close();
    },
    { once: true },
  );

  return { element: backdrop, open: () => document.body.appendChild(backdrop), close };
}

const modalStyles = document.createElement("style");
modalStyles.textContent = `
  .mx-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: grid;
    place-items: center;
    padding: var(--mx-space-5);
    background: rgba(0, 0, 0, 0.68);
    backdrop-filter: blur(10px);
  }

  .mx-modal {
    width: min(100%, 620px);
    max-height: min(86vh, 760px);
    overflow: auto;
    border: 1px solid var(--mx-border-strong);
    border-radius: var(--mx-radius-xl);
    background: var(--mx-surface);
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
  }

  .mx-modal__header,
  .mx-modal__body,
  .mx-modal__footer {
    padding: var(--mx-space-5);
  }

  .mx-modal__header {
    border-bottom: 1px solid var(--mx-border);
  }

  .mx-modal__header h2 {
    margin: 0;
    font-size: var(--mx-text-xl);
  }

  .mx-modal__header p {
    margin: var(--mx-space-2) 0 0;
    color: var(--mx-text-muted);
  }

  .mx-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--mx-space-2);
    border-top: 1px solid var(--mx-border);
  }
`;

document.head.appendChild(modalStyles);
