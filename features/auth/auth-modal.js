import { createAuthScreen } from "./auth-screen.js";

function ensureAuthModalStyles() {
  if (document.getElementById("mx-auth-modal-styles")) return;

  const styles = document.createElement("style");
  styles.id = "mx-auth-modal-styles";
  styles.textContent = `
    .mx-auth-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--mx-z-modal);
      display: grid;
      place-items: center;
      padding: var(--mx-space-5);
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(10px);
    }

    .mx-auth-modal {
      position: relative;
      width: min(100%, 560px);
      max-height: min(88vh, 760px);
      overflow: auto;
      border: 1px solid var(--mx-border-strong);
      border-radius: var(--mx-radius-xl);
      background: var(--mx-surface);
      box-shadow: var(--mx-shadow-hard);
    }

    .mx-auth-modal__close {
      position: absolute;
      top: var(--mx-space-3);
      right: var(--mx-space-3);
      z-index: 1;
      width: 2.25rem;
      height: 2.25rem;
      border: 1px solid var(--mx-border);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--mx-text);
      font-size: var(--mx-text-lg);
      line-height: 1;
    }

    .mx-auth-modal .auth-screen {
      padding: var(--mx-space-6);
    }

    .mx-auth-modal .auth-screen h1 {
      margin-top: 0;
      padding-right: var(--mx-space-8);
    }
  `;

  document.head.appendChild(styles);
}

export function createAuthModal({
  mode = "login",
  routeFactories = {},
  closeOnBackdrop = true,
  onClose,
} = {}) {
  ensureAuthModalStyles();

  const backdrop = document.createElement("div");
  backdrop.className = "mx-auth-modal-backdrop";
  backdrop.setAttribute("role", "presentation");

  const dialog = document.createElement("section");
  dialog.className = "mx-auth-modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", mode === "register" ? "Create Mistress-X account" : "Login to Mistress-X");

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "mx-auth-modal__close";
  closeButton.setAttribute("aria-label", "Close auth modal");
  closeButton.textContent = "x";

  const close = () => {
    if (backdrop.isConnected) backdrop.remove();
    if (typeof onClose === "function") onClose();
  };

  closeButton.addEventListener("click", close);

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

  dialog.appendChild(closeButton);

  const content = document.createElement("div");
  content.className = "mx-auth-modal__content";
  content.appendChild(createAuthScreen({
    mode,
    routeFactories,
    appElement: content,
    onAuthenticated: close,
  }));

  dialog.appendChild(content);
  backdrop.appendChild(dialog);

  return {
    element: backdrop,
    open: () => document.body.appendChild(backdrop),
    close,
  };
}

export function openAuthModal(options = {}) {
  const modal = createAuthModal(options);
  modal.open();
  return modal;
}
